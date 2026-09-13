"use client";

import { useEffect, useRef } from "react";
import { NEGOCIO } from "@/shared/config/negocio";
import { LANDING } from "../data/landing";

/*
  HERO CON SCROLL-SCRUB
  ---------------------------------------------------------------
  La seccion mide 340vh. Adentro, un bloque `sticky` se queda quieto
  mientras el scroll avanza, y ese avance mueve el `currentTime` del
  video. El usuario siente que esta controlando la escena con el dedo.

  POR QUE EL VIDEO ESTA RECODIFICADO
  El mp4 que salio de Veo traia UN keyframe en 240 frames (medido con
  ffprobe). Para pintar el frame 137 el navegador tenia que decodificar
  desde el 0: el scrub temblaba entero. Los de `public/hero/` tienen
  240/240 keyframes, asi que cualquier punto se pinta al instante. Eso es
  lo que cuesta el peso: todo-keyframes no comprime entre frames.

  POR QUE EL VIDEO NO ES EL LCP
  El elemento que Lighthouse mide es el <img> del poster: 92 KB en AVIF,
  con fetchPriority alto. El video no se descarga hasta que la pagina
  termino de cargar. Asi el hero pinta rapido y el scrub llega despues,
  que es cuando el usuario recien empieza a bajar.
*/

/**
 * Suavizado del scrub, expresado como "cuanto se acerca al objetivo en un
 * frame de 60 Hz". Mas bajo = mas pegado al dedo, mas nervioso.
 *
 * No se aplica tal cual: se reescala por el tiempo transcurrido (ver el
 * bucle). Si se aplicara por frame, en una pantalla de 120 Hz el scrub
 * correria al doble de velocidad que en una de 60 — el mismo gesto daria
 * dos sensaciones distintas segun el telefono.
 */
const SUAVIZADO_60HZ = 0.12;
/** Por debajo de esto no vale la pena pedir un seek. */
const TOLERANCIA_S = 0.015;
/**
 * Salto a partir del cual no se suaviza, se corta seco. Pasa al recargar la
 * pagina a media pista, o al volver de un ancla con el navegador restaurando
 * el scroll: suavizar un salto de ocho segundos es ver el video correr solo.
 */
const SALTO_SECO_S = 1.5;
/**
 * Colchon contra el final del video. MEDIDO, no por si acaso.
 *
 * Con el scroll al fondo del hero el objetivo daba `duration` exacto: el
 * elemento marcaba `ended: true` y pintaba NEGRO. El ultimo frame —que es
 * justo el remate, la pizza llegando a la mesa— no se veia nunca. 60 ms
 * son poco menos de dos frames a 24 fps: alcanza para no tocar el borde y
 * no se nota.
 */
const FIN_SEGURO_S = 0.06;

export function HeroScroll() {
  const { marca, titulo, bloques } = LANDING.hero;

  const pistaRef = useRef<HTMLDivElement>(null);
  const marcoRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const pista = pistaRef.current;
    const marco = marcoRef.current;
    const video = videoRef.current;
    if (!pista || !marco || !video) return;

    const movimientoReducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /*
      Con movimiento reducido el video NO se descarga. No es solo no
      animarlo: son 4 MB que esa persona no pidio. Queda el poster y el
      primer bloque de texto, que el CSS ya deja visible.
    */
    if (movimientoReducido) return;

    let cancelado = false;

    /* ---------- carga diferida del video ---------- */
    const cargarVideo = () => {
      if (cancelado) return;
      /*
        DOS ESCALONES, y el corte esta en 768 px.

        La version anterior servia 960 en escritorio mientras el poster era de
        1280: se veia un poster nitido y, al arrancar el video, la calidad
        BAJABA. En un monitor de 1920 ese 960 se estira al doble.

        Medido con SSIM contra el original de Veo:
          960 CRF28 (lo que habia)  4,1 MB  0,912
          720 CRF25                 3,6 MB  0,902  <- peor: la resolucion
                                                      pesa mas que el CRF
          1280 CRF27                6,4 MB  0,942
          1280 CRF26 (escritorio)   7,1 MB  0,948
          960  CRF25 (movil)        5,3 MB  0,932

        El peso extra no toca el LCP: el video no se descarga hasta despues
        del evento `load`, y con movimiento reducido no se descarga nunca.
      */
      const angosto = window.matchMedia("(max-width: 768px)").matches;
      video.src = angosto ? "/hero/chef-960.mp4" : "/hero/chef-1280.mp4";
      video.load();
    };

    const programarCarga = () => {
      /*
        Safari no tenia `requestIdleCallback` hasta hace poco. Se lee como
        variable y no con `"x" in window` a proposito: el tipo de lib.dom
        lo declara siempre presente, asi que el `in` le dice a TypeScript
        que el `else` es inalcanzable y el fallback no compila.
      */
      const enReposo: typeof window.requestIdleCallback | undefined =
        window.requestIdleCallback;
      if (enReposo) enReposo(cargarVideo, { timeout: 2000 });
      else window.setTimeout(cargarVideo, 200);
    };

    if (document.readyState === "complete") programarCarga();
    else window.addEventListener("load", programarCarga, { once: true });

    const alCargarDatos = () => {
      marco.dataset.videoListo = "true";
    };
    video.addEventListener("loadeddata", alCargarDatos);

    /* ---------- el bucle del scrub ---------- */
    let rafId = 0;
    let corriendo = false;
    let tiempoSuave = 0;
    let ultimoT = -1;
    let ultimoSello = 0;

    const progreso = () => {
      const rect = pista.getBoundingClientRect();
      const recorrido = rect.height - window.innerHeight;
      if (recorrido <= 0) return 0;
      const avance = -rect.top / recorrido;
      return Math.min(1, Math.max(0, avance));
    };

    const marco3 = bloques.length;

    const pintar = (sello: number) => {
      /*
        Segundos reales desde el frame anterior, con techo de 50 ms. Sin el
        techo, volver a una pestaña que estuvo en segundo plano daria un
        delta de varios segundos y el video pegaria un brinco.
      */
      const dt = ultimoSello ? Math.min(0.05, (sello - ultimoSello) / 1000) : 0;
      ultimoSello = sello;

      const t = progreso();

      // Las variables CSS solo se escriben si cambio algo perceptible.
      if (Math.abs(t - ultimoT) > 0.001) {
        marco.style.setProperty("--t", String(t));
        ultimoT = t;

        /*
          Que bloque de texto toca. Se reparte el recorrido en tantas
          franjas como bloques haya; el ultimo se queda fijo al final
          para que el CTA no parpadee justo cuando el usuario llega.
        */
        const activo = Math.min(marco3 - 1, Math.floor(t * marco3));
        for (let i = 0; i < marco3; i++) {
          const el = marco.querySelector<HTMLElement>(
            `[data-bloque="${i}"]`,
          );
          if (el) el.dataset.activo = String(i === activo);
        }
      }

      // El seek, solo si el video ya tiene metadatos.
      if (video.readyState >= 1 && Number.isFinite(video.duration)) {
        const objetivo = Math.min(
          t * video.duration,
          video.duration - FIN_SEGURO_S,
        );

        if (Math.abs(objetivo - tiempoSuave) > SALTO_SECO_S) {
          tiempoSuave = objetivo;
        } else {
          /*
            Suavizado exponencial reescalado por el tiempo real. `k` es la
            fraccion del camino que se recorre en ESTE frame: en 60 Hz da
            SUAVIZADO_60HZ y en 120 Hz da la mitad por frame, o sea lo mismo
            por segundo. Con dt = 0 (primer frame) k = 0 y no se mueve nada.
          */
          const k = 1 - Math.pow(1 - SUAVIZADO_60HZ, dt * 60);
          tiempoSuave += (objetivo - tiempoSuave) * k;
        }

        if (
          !video.seeking &&
          Math.abs(video.currentTime - tiempoSuave) > TOLERANCIA_S
        ) {
          video.currentTime = tiempoSuave;
        }
      }

      rafId = window.requestAnimationFrame(pintar);
    };

    /*
      El bucle solo corre con el hero en pantalla. Dejarlo vivo mientras
      el usuario lee el menu es bateria tirada y le cuesta al INP.
    */
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting && !corriendo) {
          corriendo = true;
          // Frame limpio: sin esto, el delta arrastraria todo el rato que
          // el hero estuvo fuera de pantalla.
          ultimoSello = 0;
          rafId = window.requestAnimationFrame(pintar);
        } else if (!entrada.isIntersecting && corriendo) {
          corriendo = false;
          window.cancelAnimationFrame(rafId);
        }
      },
      { threshold: 0 },
    );
    observador.observe(pista);

    /* ---------- parallax de puntero ---------- */
    const alMoverPuntero = (e: PointerEvent) => {
      // Un dedo en una pantalla tactil no es un puntero que "flota".
      if (e.pointerType !== "mouse") return;
      const px = e.clientX / window.innerWidth - 0.5;
      const py = e.clientY / window.innerHeight - 0.5;
      marco.style.setProperty("--px", px.toFixed(3));
      marco.style.setProperty("--py", py.toFixed(3));
    };
    marco.addEventListener("pointermove", alMoverPuntero);

    return () => {
      cancelado = true;
      observador.disconnect();
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("load", programarCarga);
      video.removeEventListener("loadeddata", alCargarDatos);
      marco.removeEventListener("pointermove", alMoverPuntero);
    };
  }, [bloques.length]);

  return (
    <div id="inicio" className="hero-pista" ref={pistaRef}>
      <div className="hero-marco" ref={marcoRef}>
        {/*
          El LCP. Va en <img> normal y no en next/image a proposito: es un
          archivo fijo, ya dimensionado y ya en AVIF. next/image le
          agregaria un pase de optimizacion que no necesita.
        */}
        <picture>
          <source srcSet="/hero/poster.avif" type="image/avif" />
          <img
            src="/hero/poster.webp"
            alt={`El chef de ${NEGOCIO.nombre} llevando una pizza recién salida del horno, en San Ramón`}
            className="hero-medio hero-poster"
            width={1280}
            height={720}
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        <video
          ref={videoRef}
          className="hero-medio"
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="hero-velo" />

        <div className="hero-capas">
          {bloques.map((bloque, i) => (
            <div
              key={bloque.id}
              className="hero-bloque"
              data-bloque={i}
              data-primero={i === 0 ? "true" : undefined}
              data-activo={i === 0 ? "true" : "false"}
            >
              <div
                className="hero-parallax mx-auto max-w-2xl"
                style={{ "--fuerza": "22px" } as React.CSSProperties}
              >
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-ambar">
                  {bloque.sobretitulo}
                </p>

                {i === 0 ? (
                  <h1 className="text-balance text-5xl leading-[0.95] text-white sm:text-7xl">
                    <span className="block text-ambar">{marca}</span>
                    <span className="block">{titulo}</span>
                  </h1>
                ) : (
                  <p className="text-balance font-display text-4xl font-black leading-tight text-white sm:text-6xl">
                    {bloque.titulo}
                  </p>
                )}

                <p className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-crema/85 sm:text-lg">
                  {i === 0 ? bloque.titulo + ". " + bloque.texto : bloque.texto}
                </p>

                {i === bloques.length - 1 && (
                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <a
                      href={NEGOCIO.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-rojo px-7 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-rojo-osc"
                    >
                      Pedir por WhatsApp
                    </a>
                    <a
                      href="#menu"
                      className="inline-flex items-center justify-center rounded-full border border-crema/30 px-7 py-3.5 text-sm font-semibold tracking-wide text-crema transition-colors hover:border-ambar hover:text-ambar"
                    >
                      Ver el menú
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="hero-indicador" aria-hidden="true" />
      </div>
    </div>
  );
}

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
 * VELOCIDAD MAXIMA a la que el video puede avanzar, en multiplos de su
 * velocidad natural. ESTO ES LO QUE HACE QUE SE VEA COMO REPRODUCCION Y NO
 * COMO SALTO.
 *
 * El problema: un tick de rueda mueve de golpe unos 100 px de scroll. Atado
 * punto por punto, eso son ~12 frames de video recorridos en un instante —
 * y 12 frames en un parpadeo el ojo no los lee como movimiento, los lee como
 * un corte. No faltaban frames: sobraba velocidad.
 *
 * Con este tope, un tick ya no salta: el video SE REPRODUCE hasta el punto
 * nuevo a una velocidad que el ojo sigue, y se detiene ahi. Si la persona
 * scrollea muy rapido el video se queda atras un momento y se pone al dia —
 * que llegue tarde es tolerable; que se vea cortado, no.
 *
 * 1,6x es el maximo que todavia se lee como reproduccion. Por encima vuelve
 * a sentirse acelerado.
 */
const VELOCIDAD_BASE = 1.6;
/**
 * Cuanta brecha se tolera antes de acelerar, en segundos de video.
 *
 * Por debajo de esto el video va a VELOCIDAD_BASE y se ve como reproduccion.
 * Por encima empieza a correr mas para alcanzar al scroll.
 */
const HOLGURA_S = 0.35;
/** Cuanto acelera por cada segundo de brecha que pasa de la holgura. */
const GANANCIA = 4;
/**
 * Techo absoluto. Sin el, un scroll muy rapido pediria velocidades de 20x y
 * volveriamos al corte que vinimos a arreglar.
 */
const VELOCIDAD_TECHO = 8;
/**
 * TELETRANSPORTE: cuanto puede saltar el SCROLL de un frame al siguiente
 * antes de que dejemos de suavizar y cortemos seco. Va en fraccion de la
 * pista (0 a 1).
 *
 * OJO CON LA DIFERENCIA, QUE COSTO UN BUG: esto mide el salto del SCROLL en
 * UN frame, no el tamaño de la brecha acumulada.
 *
 * La version anterior cortaba seco cuando la BRECHA entre el video y su
 * objetivo pasaba de 3 s. Suena parecido y no lo es: con el tope de
 * velocidad, scrollear rapido HACE que la brecha crezca —esa es justamente
 * la idea— asi que el corte se disparaba una y otra vez. Crecia, cortaba,
 * crecia, cortaba. El cliente lo describio como "se teletransporta de frame
 * a frame", y era exactamente eso.
 *
 * Un atraso acumulado y un salto real son cosas distintas. Un salto real
 * —recargar a media pista, volver de un ancla, arrastrar la barra de
 * scroll— mueve el scroll un monton EN UN SOLO FRAME. Eso es lo que se
 * detecta aqui. 25% de la pista en un frame no se alcanza ni scrolleando a
 * lo bestia.
 */
const TELETRANSPORTE_T = 0.25;
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

/** El chat arranca con el saludo escrito, no en blanco. */
const ENLACE_PEDIDO = `${NEGOCIO.whatsapp}?text=${encodeURIComponent(
  `Hola ${NEGOCIO.nombre}, quiero hacer un pedido.`,
)}`;

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

    /*
      MOVIMIENTO REDUCIDO: EL SCRUB SIGUE, LO QUE SE APAGA ES LO AUTOMATICO.

      Antes esto hacia `return` y el video no se descargaba siquiera. Suena
      prudente y es un error: quien tiene esa preferencia activada —en Windows
      la enciende tambien el ahorro de bateria— veia el poster fijo PARA
      SIEMPRE, sin ninguna señal de que faltaba algo. El cliente lo reporto
      como "scroleo y esta estatico", y tenia razon: parecia roto.

      La preferencia existe para evitar movimiento NO SOLICITADO. Un scrub no
      es eso: la persona controla cada frame con su propio dedo y se detiene
      en el instante en que deja de desplazarse. Lo que si es no solicitado es
      el parallax del puntero y el suavizado, que sigue moviendose un rato
      DESPUES de que uno solto. Eso es lo que se apaga.
    */
    const movimientoReducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let cancelado = false;

    /* ---------- carga diferida del video ---------- */
    const cargarVideo = () => {
      if (cancelado) return;
      /*
        DOS ESCALONES, y el corte esta en 768 px.

        La version anterior servia 960 en escritorio mientras el poster era de
        1280: se veia un poster nitido y, al arrancar el video, la calidad
        BAJABA. En un monitor de 1920 ese 960 se estira al doble.

        AHORA MISMO ESTAN A MAXIMA CALIDAD, A PROPOSITO Y DE FORMA TEMPORAL.
        El cliente pidio ver como queda sin mirar el peso. Son 14,7 MB y
        10,3 MB: HAY QUE REVISARLO antes de darlo por final.

        Medido con SSIM contra el original de Veo, y con el tiempo real de
        cada salto medido en el navegador (24 saltos por version):

          version                  peso    SSIM    salto mediano / p90
          960 CRF28 (la primera)   4,1 MB  0,912   —
          720 CRF25                3,6 MB  0,902   <- peor pese a mejor CRF
          1280 CRF26               7,1 MB  0,948   10,9 ms / 12,9 ms
          1280 CRF18 (HOY)        14,7 MB  0,980    7,3 ms /  8,6 ms
          1280 CRF14              20,9 MB  0,988    7,4 ms / 18,9 ms
          1280 CRF18 a 48 fps     24,7 MB  0,950   13,7 ms / 17,9 ms

        DOS COSAS QUE NO SE ESPERABAN:

        1. Mas calidad NO ralentiza el salto. CRF18 es el mas CONSISTENTE de
           todos (p90 de 8,6 ms, muy dentro de los 16,7 ms que dura un frame
           a 60 Hz). CRF14 tiene mejor mediana pero su p90 se va a 18,9 ms:
           por encima del presupuesto, o sea que tiembla.

        2. Interpolar a 48 fps con `minterpolate` es PEOR EN TODO: inventa
           los frames intermedios y pierde fidelidad (0,950), duplica el
           tiempo de salto y se pasa del presupuesto (p90 17,9 ms). Duplicar
           frames no da fluidez, la quita.

        El peso no toca el LCP: el video no se descarga hasta despues del
        evento `load`, y con movimiento reducido no se descarga nunca.
      */
      const angosto = window.matchMedia("(max-width: 768px)").matches;
      /*
        `preload = "auto"` ANTES del `src`.

        El atributo del marcado dice `none` para que el navegador no toque el
        archivo hasta que nosotros decidamos. Pero una vez decidido hay que
        cambiar la pista: con `none`, el navegador solo trae metadatos y cada
        salto del scroll dispara una peticion por rango. Con un archivo de
        14 MB eso se siente como que el video se traba.
      */
      video.preload = "auto";
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
    let tPrevio = -1;
    let ultimoSello = 0;

    const progreso = () => {
      const rect = pista.getBoundingClientRect();
      /*
        El recorrido se mide contra la ALTURA DEL PROPIO MARCO, no contra
        `window.innerHeight`.

        En el telefono `innerHeight` cambia mientras la barra del navegador
        se esconde y reaparece con el scroll. Si el divisor cambia a mitad
        del gesto, el mismo punto de scroll da un progreso distinto y el
        video pega un salto — justo mientras la persona esta desplazandose.
        El marco es un elemento del DOM: mide lo que mide, pase lo que pase
        con la barra.
      */
      const recorrido = rect.height - marco.offsetHeight;
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
      /*
        `ultimoT` solo se actualiza cuando el cambio es perceptible, asi que
        no sirve para detectar el salto de ESTE frame. Para eso va aparte.
      */
      const saltoDeScroll = tPrevio < 0 ? 1 : Math.abs(t - tPrevio);
      tPrevio = t;

      // Las variables CSS solo se escriben si cambio algo perceptible.
      if (Math.abs(t - ultimoT) > 0.001) {
        marco.style.setProperty("--t", String(t));
        ultimoT = t;

        /*
          Que bloque de texto toca. Se reparte el recorrido en tantas franjas
          como bloques haya, y el ultimo se queda fijo hasta el final para que
          el texto no parpadee al llegar al fondo. Los botones no entran en
          este reparto: se ven siempre.
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
        /*
          El objetivo NUNCA pasa de lo que ya se descargo.

          Pedirle al elemento un punto que todavia no tiene en el buffer lo
          deja congelado hasta que llegue ese trozo. Clavandolo al final de lo
          bufferado, el scrub se queda un poco atras mientras baja el archivo
          y se pone al dia solo — que se retrase es tolerable, que se congele
          no.
        */
        let tope = video.duration - FIN_SEGURO_S;
        for (let i = 0; i < video.buffered.length; i++) {
          if (video.buffered.start(i) <= 0.05) {
            tope = Math.min(tope, video.buffered.end(i) - 0.05);
            break;
          }
        }
        const objetivo = Math.max(0, Math.min(t * video.duration, tope));

        if (saltoDeScroll > TELETRANSPORTE_T) {
          // Salto real: no hay nada que reproducir, se pinta el destino.
          tiempoSuave = objetivo;
        } else {
          /*
            Suavizado exponencial reescalado por el tiempo real. `k` es la
            fraccion del camino que se recorre en ESTE frame: en 60 Hz da
            SUAVIZADO_60HZ y en 120 Hz da la mitad por frame, o sea lo mismo
            por segundo. Con dt = 0 (primer frame) k = 0 y no se mueve nada.
          */
          /*
            Con movimiento reducido el suavizado se anula: el video queda
            clavado al scroll y no sigue moviendose despues de soltar.
          */
          const k = movimientoReducido
            ? 1
            : 1 - Math.pow(1 - SUAVIZADO_60HZ, dt * 60);
          let paso = (objetivo - tiempoSuave) * k;

          /*
            EL TOPE DE VELOCIDAD. `dt` son segundos reales, asi que
            `permitida * dt` es cuanto video puede avanzar en este frame sin
            pasarse. Se aplica en los dos sentidos: subir y bajar se ven
            igual de fluidos.

            No se aplica con movimiento reducido: ahi la persona pidio
            explicitamente que nada se mueva por su cuenta, y este tope es
            justo eso — movimiento que sigue despues de soltar.
          */
          if (!movimientoReducido && dt > 0) {
            /*
              LA VELOCIDAD PERMITIDA CRECE CON LA BRECHA, de forma continua.

              Con un tope fijo de 1,6x, scrollear de golpe toda la pista
              dejaba al video reproduciendose SOLO durante seis segundos
              despues de que la persona ya se habia detenido. Con un corte
              seco, se teletransportaba. Ninguna de las dos.

              Asi: mientras la brecha es chica va a 1,6x y se lee como
              reproduccion; cuando se agranda acelera para alcanzar al
              scroll, sin discontinuidades. El techo evita volver al corte.
            */
            const brecha = Math.abs(objetivo - tiempoSuave);
            const permitida = Math.min(
              VELOCIDAD_TECHO,
              VELOCIDAD_BASE + Math.max(0, brecha - HOLGURA_S) * GANANCIA,
            );
            const maximo = permitida * dt;
            if (Math.abs(paso) > maximo) paso = Math.sign(paso) * maximo;
          }

          tiempoSuave += paso;
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

              </div>
            </div>
          ))}
        </div>

        {/*
          LOS BOTONES NO VIVEN DENTRO DE UN BLOQUE DE TEXTO.

          Antes estaban dentro del tercero, asi que solo aparecian al final
          del recorrido: quien se enganchaba con el video a mitad de camino no
          tenia donde tocar para pedir, y tenia que seguir bajando a ciegas
          hasta que aparecieran. La accion no puede depender de cuanto
          scrolleaste.

          Ahora son una capa propia, fija durante TODO el recorrido. Entran
          con una `@keyframes` y no con el observador —estan sobre el
          pliegue— por lo mismo que el texto del hero: el observador corre
          despues de hidratar y los dejaria invisibles hasta que llegue el
          JavaScript.
        */}
        <div className="hero-acciones">
          <a
            href={ENLACE_PEDIDO}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-rojo px-7 py-3.5 text-sm font-semibold tracking-wide text-white shadow-lg shadow-black/30 transition-colors hover:bg-rojo-osc"
          >
            Pedir por WhatsApp
          </a>
          <a
            href="#menu"
            className="inline-flex items-center justify-center rounded-full border border-crema/35 bg-negro/30 px-7 py-3.5 text-sm font-semibold tracking-wide text-crema backdrop-blur-sm transition-colors hover:border-ambar hover:text-ambar"
          >
            Ver el menú
          </a>
        </div>

        <div className="hero-indicador" aria-hidden="true" />
      </div>
    </div>
  );
}

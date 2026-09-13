import Image from "next/image";
import { Contenedor } from "@/shared/components/ui/Contenedor";
import { Revelar } from "@/shared/components/ui/Revelar";
import { LANDING } from "../data/landing";

/**
 * La promesa del local.
 *
 * Versión anterior: tres tarjetas iguales con un título arriba. Se veía a
 * plantilla. Esta es editorial: una sola afirmación grande que ocupa el
 * ancho, el personaje del logo como pieza gráfica y las cifras abajo con
 * peso tipográfico de verdad. Las cifras además hacen trabajo comercial —
 * "5 tamaños" y "16 porciones" responden la pregunta de cuánta pizza pedir.
 */
export function Promesa() {
  const { sobretitulo, titulo, texto, cifras } = LANDING.promesa;

  return (
    <section id="promesa" className="relative overflow-hidden bg-negro-2 py-20 sm:py-28">
      {/*
        El disco rojo del logo, gigante y casi invisible, como marca de agua.
        Es el único sitio donde el rojo cubre superficie grande, y lo hace a
        opacidad muy baja: sigue sin ser fondo de sección.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-rojo/10 blur-3xl"
      />

      <Contenedor className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
          <Revelar>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-ambar">
              {sobretitulo}
            </p>
            <h2 className="text-balance text-4xl leading-[1.05] text-crema sm:text-5xl lg:text-6xl">
              {titulo}
            </h2>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-humo sm:text-lg">
              {texto}
            </p>
          </Revelar>

          {/*
            El ancho maximo va AQUI, en el contenedor, y no en la imagen.

            Este div es un item de la grilla con `justify-self-center`, o sea
            que se encoge al tamaño de su contenido. Poner `w-full` en la
            imagen de adentro —100% del padre— deja al padre midiendose por el
            hijo y al hijo por el padre. Con un `max-width` en el contenedor la
            cadena se corta: el ancho sale de la grilla, no del contenido.
          */}
          <Revelar
            direccion="escala"
            className="w-full max-w-[300px] justify-self-center lg:max-w-[340px]"
          >
            {/*
              827 px de ancho: a 340 CSS px, una pantalla de 2x pide 680 y el
              archivo los tiene. No hay estiramiento.
            */}
            <Image
              src="/marca/logo-v2.webp"
              alt="Logo de Gordillo's Pizza, San Ramón"
              width={827}
              height={930}
              sizes="(max-width: 1024px) 55vw, 340px"
              className="h-auto w-full"
            />
          </Revelar>
        </div>

        <Revelar className="mt-16">
          <dl className="grid grid-cols-3 gap-4 border-t border-crema/10 pt-10">
            {cifras.map((c) => (
              <div key={c.id}>
                <dt className="sr-only">{c.etiqueta}</dt>
                <dd>
                  <span className="block font-display text-5xl font-black leading-none text-ambar sm:text-7xl">
                    {c.numero}
                  </span>
                  <span className="mt-2 block text-pretty text-xs leading-snug text-humo sm:text-sm">
                    {c.etiqueta}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Revelar>
      </Contenedor>
    </section>
  );
}

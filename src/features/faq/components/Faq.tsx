import { Contenedor } from "@/shared/components/ui/Contenedor";
import { Revelar } from "@/shared/components/ui/Revelar";
import { FAQ } from "../data/faq";

/**
 * Preguntas frecuentes.
 *
 * Existe por dos razones y las dos importan igual:
 *
 * 1. Le responde al cliente sin que tenga que escribir por WhatsApp.
 * 2. Es la sección que los buscadores y los asistentes de IA leen para
 *    responder "¿hasta qué hora abre Gordillo's?" o "¿cuánto vale una pizza
 *    en San Ramón?". El marcado `FAQPage` va en el JSON-LD, pero la respuesta
 *    tiene que estar TAMBIÉN en el texto visible: un dato que solo vive en el
 *    marcado y no en la página se ignora, y con razón.
 *
 * Va en `<details>` nativo, sin JavaScript. El contenido existe en el HTML
 * aunque esté plegado, así que se indexa igual y funciona sin hidratar.
 */
export function Faq() {
  return (
    <section id="preguntas" className="bg-negro py-20 sm:py-28">
      <Contenedor>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Revelar>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-ambar">
              Antes de que preguntes
            </p>
            <h2 className="text-balance text-4xl leading-[1.05] text-crema sm:text-5xl">
              {FAQ.titulo}
            </h2>
            <p className="mt-5 max-w-sm text-pretty leading-relaxed text-humo">
              {FAQ.texto}
            </p>
          </Revelar>

          <Revelar direccion="derecha">
            <div className="divide-y divide-crema/10 border-y border-crema/10">
              {FAQ.preguntas.map((p) => (
                <details key={p.id} name="faq" className="group py-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                    <h3 className="text-base font-semibold leading-snug text-crema transition-colors group-open:text-ambar sm:text-lg">
                      {p.pregunta}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-xl leading-none text-ambar transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-prose text-pretty text-sm leading-relaxed text-humo">
                    {p.respuesta}
                  </p>
                </details>
              ))}
            </div>
          </Revelar>
        </div>
      </Contenedor>
    </section>
  );
}

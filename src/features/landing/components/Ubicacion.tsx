import { Contenedor } from "@/shared/components/ui/Contenedor";
import { Revelar } from "@/shared/components/ui/Revelar";
import { NEGOCIO } from "@/shared/config/negocio";
import { LANDING } from "../data/landing";

export function Ubicacion() {
  const { sobretitulo, titulo, texto } = LANDING.ubicacion;
  const { lat, lng } = NEGOCIO.geo;

  return (
    <section id="ubicacion" className="bg-negro-2 py-20 sm:py-28">
      <Contenedor>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Revelar>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-ambar">
              {sobretitulo}
            </p>
            <h2 className="text-balance text-4xl leading-[1.05] text-crema sm:text-5xl">
              {titulo}
            </h2>
            <p className="mt-6 max-w-md text-pretty leading-relaxed text-humo">
              {texto}
            </p>

            <dl className="mt-10 space-y-6 text-sm">
              <div>
                <dt className="font-semibold uppercase tracking-widest text-crema/55">
                  Dirección
                </dt>
                <dd className="mt-1.5 max-w-sm leading-relaxed text-crema/90">
                  {NEGOCIO.direccion}
                </dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-widest text-crema/55">
                  Teléfono
                </dt>
                <dd className="mt-1.5">
                  <a
                    href={`tel:${NEGOCIO.telefonoE164}`}
                    className="font-display text-2xl font-black text-ambar hover:underline"
                  >
                    {NEGOCIO.telefono}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-widest text-crema/55">
                  Horario
                </dt>
                {/* No se promete lo que no sabemos: Google solo publica el cierre. */}
                <dd className="mt-1.5 text-crema/90">
                  Todos los días hasta las 9 p.m.
                </dd>
              </div>
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={NEGOCIO.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-rojo px-7 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-rojo-osc"
              >
                Escribinos por WhatsApp
              </a>
              <a
                href={NEGOCIO.enlaceMapa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-crema/25 px-7 py-3.5 text-sm font-semibold tracking-wide text-crema transition-colors hover:border-ambar hover:text-ambar"
              >
                Cómo llegar
              </a>
            </div>
          </Revelar>

          <Revelar direccion="derecha">
            {/*
              El mapa va en un iframe de Google sin llave de API y con
              `loading="lazy"`: está bajo el pliegue, así que no entra en la
              carga inicial y no le cuesta nada al LCP. Las coordenadas son las
              del pin real que mandó el cliente, no una búsqueda por nombre —
              buscar "Gordillo's Pizza" en Maps devuelve otros negocios.
            */}
            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-crema/10 bg-carbon">
              <iframe
                title={`Mapa de ${NEGOCIO.nombre} en ${NEGOCIO.ciudad}`}
                src={`https://maps.google.com/maps?q=${lat},${lng}&z=17&hl=es&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
          </Revelar>
        </div>
      </Contenedor>
    </section>
  );
}

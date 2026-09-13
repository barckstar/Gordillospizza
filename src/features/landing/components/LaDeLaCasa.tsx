import Image from "next/image";
import { Contenedor } from "@/shared/components/ui/Contenedor";
import { Revelar } from "@/shared/components/ui/Revelar";
import { PIZZAS, TAMANOS } from "@/features/menu/data/menu";
import { formatoColones } from "@/shared/lib/formatoColones";
import { LANDING } from "../data/landing";

/**
 * La pizza de la casa, a página completa.
 *
 * La landing NO importa componentes de la feature `menu` —una feature nunca
 * importa de otra—, pero sí sus DATOS ya validados. Si el id de landing.json
 * no existe en el menú, esto rompe el build en vez de renderizar un hueco.
 */
export function LaDeLaCasa() {
  const { sobretitulo, titulo, texto, pizzaId } = LANDING.casa;
  const pizza = PIZZAS.find((p) => p.id === pizzaId);
  if (!pizza) {
    throw new Error(
      `landing.json apunta a la pizza "${pizzaId}", que no existe en menu.json`,
    );
  }

  return (
    <section className="relative bg-negro">
      <div className="grid lg:grid-cols-2">
        <Revelar direccion="izquierda" className="relative min-h-[22rem] lg:min-h-[38rem]">
          <Image
            src={pizza.imagen}
            alt={`Pizza ${pizza.nombre}, la especialidad de Gordillo's Pizza en San Ramón`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {/*
            El degradado va hacia la derecha en escritorio y hacia abajo en
            teléfono: en los dos casos muere contra el fondo de la columna de
            texto, así que la foto no termina en un borde recto.
          */}
          <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-negro/10 lg:to-negro" />
        </Revelar>

        <div className="flex items-center py-16 sm:py-24">
          <Contenedor className="lg:pl-0">
            <Revelar direccion="derecha">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-ambar">
                {sobretitulo}
              </p>
              <h2 className="text-balance text-4xl leading-[1.05] text-crema sm:text-6xl">
                {titulo}
              </h2>
              <p className="mt-6 max-w-lg text-pretty leading-relaxed text-humo sm:text-lg">
                {texto}
              </p>

              <ul className="mt-8 flex flex-wrap gap-2">
                {pizza.ingredientes.map((ing) => (
                  <li
                    key={ing}
                    className="rounded-full border border-crema/15 px-3.5 py-1.5 text-xs font-medium text-crema/85"
                  >
                    {ing}
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-sm text-humo">
                De{" "}
                <span className="font-display text-2xl font-black text-ambar">
                  {formatoColones(pizza.precios[TAMANOS[0].id])}
                </span>{" "}
                la {TAMANOS[0].nombre.toLowerCase()} a{" "}
                <span className="font-display text-2xl font-black text-ambar">
                  {formatoColones(pizza.precios[TAMANOS[4].id])}
                </span>{" "}
                la {TAMANOS[4].nombre.toLowerCase()} de {TAMANOS[4].porciones}{" "}
                porciones.
              </p>

              <a
                href="#menu"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-rojo px-7 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-rojo-osc"
              >
                Ver las 19 pizzas
              </a>
            </Revelar>
          </Contenedor>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import type { Pizza } from "@/shared/types/menu";
import { PIZZAS, TAMANOS } from "../data/menu";
import { TarjetaPizza } from "./TarjetaPizza";
import { HojaPizza } from "./HojaPizza";
import { Adicionales } from "./Adicionales";
import { Contenedor } from "@/shared/components/ui/Contenedor";

/**
 * El menú completo, dentro de la misma página.
 *
 * No hay ruta `/menu`. El sitio es UNA sola página con secciones ancladas
 * —igual que ticoshot— y el menú es una de ellas: nadie tiene que salir del
 * sitio para ver los precios y volver para pedir.
 */

/** El "desde" de cada tarjeta sale de la pequeña. */
const TAMANO_MINIMO = TAMANOS[0].id;

/** Retraso entre tarjeta y tarjeta al entrar en pantalla. */
const ESCALON_S = 0.045;

export function SeccionMenu() {
  const [abierta, setAbierta] = useState<Pizza | null>(null);

  return (
    <section id="menu" className="relative bg-negro py-20 sm:py-28">
      <Contenedor>
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-ambar">
            El menú
          </p>
          <h2 className="text-balance text-4xl leading-[1.05] text-crema sm:text-6xl">
            Diecinueve pizzas.
            <br />
            <span className="text-humo">Cinco tamaños cada una.</span>
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-humo">
            Tocá la que querés y elegí el tamaño ahí mismo: de una pequeña de 4
            porciones a una extra de 16. El precio se arma solo y el pedido se
            va por WhatsApp.
          </p>
        </div>

        {/*
          `data-revelar` lo lee el ObservadorRevelado del layout y le pone
          `data-visible`; el escalonado y la animacion son CSS puro (ver
          `.menu-cascada` en globals.css). "una-vez" porque una cuadricula de
          19 tarjetas que se re-anima cada vez que se sube y se baja marea.
        */}
        <ul
          data-revelar="una-vez"
          className="menu-cascada mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
          {PIZZAS.map((pizza, i) => (
            <TarjetaPizza
              key={pizza.id}
              pizza={pizza}
              desde={pizza.precios[TAMANO_MINIMO]}
              destacada={i === 0}
              /* Tope a 8: con 19 pizzas la ultima entraria casi un segundo
                 tarde y eso ya no se lee como animacion sino como lentitud. */
              retraso={Math.min(i, 8) * ESCALON_S}
              onAbrir={() => setAbierta(pizza)}
            />
          ))}
        </ul>

        <Adicionales />
      </Contenedor>

      {/*
        `key` por pizza: cambiar de pizza REMONTA la hoja, así nace con su
        tamaño y cantidad iniciales sin necesidad de resetear nada a mano.
      */}
      {abierta && (
        <HojaPizza
          key={abierta.id}
          pizza={abierta}
          onCerrar={() => setAbierta(null)}
        />
      )}
    </section>
  );
}

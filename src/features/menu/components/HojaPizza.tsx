"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Pizza, IdTamano } from "@/shared/types/menu";
import { TAMANOS, TAMANO_INICIAL } from "../data/menu";
import { formatoColones } from "@/shared/lib/formatoColones";
import { useCarrito } from "@/shared/lib/carrito";
import { useModal } from "@/shared/lib/modal";

/**
 * La hoja donde se arma la pizza.
 *
 * Es EL paso del pedido: la tarjeta solo muestra el "desde", acá se elige el
 * tamaño y con eso queda fijado el precio.
 *
 * EN MÓVIL OCUPA LA PANTALLA ENTERA. Antes era una hoja pegada abajo con un
 * tope de 92svh, y ese 8% sobrante era una franja negra inútil arriba que
 * además dejaba el quinto tamaño cortado desde el primer momento. A partir de
 * `sm` vuelve a ser una tarjeta centrada, que es donde sí tiene sentido.
 */
/*
  SE REMONTA POR PIZZA, no se resetea.

  La versión anterior reseteaba tamaño y cantidad dentro de un `useEffect` que
  miraba `pizza`. Funcionaba, pero es el patrón que React 19 marca por
  provocar renders en cascada: la hoja se pintaba una vez con los valores
  viejos y otra con los nuevos.

  Quien la usa la monta con `key={pizza.id}`, así que cambiar de pizza destruye
  el componente y crea otro. El estado nace en su valor inicial por definición
  y el efecto desaparece. Por eso `pizza` acá ya no puede ser null.
*/
export function HojaPizza({
  pizza,
  onCerrar,
}: {
  pizza: Pizza;
  onCerrar: () => void;
}) {
  const { agregar, abrir } = useCarrito();
  const [tamano, setTamano] = useState<IdTamano>(TAMANO_INICIAL);
  const [cantidad, setCantidad] = useState(1);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  const { saliendo, pedirCierre, alTerminarAnimacion } = useModal(onCerrar);

  /*
    El foco va a la hoja recién abierta. Sin esto el lector de pantalla y el
    tabulador se quedan atrás, en la cuadrícula de pizzas.
  */
  useEffect(() => {
    cerrarRef.current?.focus();
  }, []);

  const elegido = TAMANOS.find((t) => t.id === tamano) ?? TAMANOS[0];
  const precioUnidad = pizza.precios[elegido.id];

  const agregarAlPedido = () => {
    agregar(
      {
        // El tamaño va DENTRO del id: la misma pizza en dos tamaños tiene que
        // poder convivir como dos líneas distintas del pedido.
        id: `${pizza.id}:${elegido.id}`,
        nombre: `Pizza ${pizza.nombre}`,
        detalle: `${elegido.nombre} · ${elegido.porciones} porciones`,
        precio: precioUnidad,
        imagen: pizza.imagen,
      },
      cantidad,
    );
    /*
      Se pide el cierre (que anima la salida) y se abre el pedido de una. El
      carrito va por encima en z-index, así que el usuario ve el pedido al
      instante mientras la hoja se encoge detrás.
    */
    pedirCierre();
    abrir();
  };

  return (
    <div
      data-saliendo={saliendo}
      className="fixed inset-0 z-[70] flex items-stretch justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={pedirCierre}
        className="modal-velo absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hoja-pizza-titulo"
        onAnimationEnd={alTerminarAnimacion}
        className="modal-panel relative w-full overflow-y-auto bg-negro-2 sm:max-h-[92svh] sm:max-w-lg sm:rounded-3xl sm:border sm:border-crema/10"
      >
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={pizza.imagen}
            alt={`Pizza ${pizza.nombre} de Gordillo's Pizza, San Ramón`}
            fill
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-negro-2 via-negro-2/30 to-transparent" />
          <button
            ref={cerrarRef}
            type="button"
            onClick={pedirCierre}
            aria-label="Cerrar"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg text-white backdrop-blur"
          >
            ×
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <h2
            id="hoja-pizza-titulo"
            className="font-display text-3xl font-black leading-tight text-crema"
          >
            {pizza.nombre}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-humo">
            {pizza.ingredientes.join(" · ")}
          </p>

          <fieldset className="mt-6">
            <legend className="text-xs font-semibold uppercase tracking-widest text-humo">
              Elegí el tamaño
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {TAMANOS.map((t) => {
                const activo = t.id === tamano;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTamano(t.id)}
                    aria-pressed={activo}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      activo
                        ? "border-rojo bg-rojo text-white"
                        : "border-crema/15 bg-carbon text-crema/80 hover:border-ambar/50"
                    }`}
                  >
                    <span className="block text-sm font-semibold">
                      {t.nombre}
                    </span>
                    <span
                      className={`block text-xs ${activo ? "text-white/75" : "text-humo"}`}
                    >
                      {t.porciones} porciones
                    </span>
                    <span
                      className={`mt-1 block font-display text-base font-black ${
                        activo ? "text-white" : "text-ambar"
                      }`}
                    >
                      {formatoColones(pizza.precios[t.id])}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-crema/15">
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                aria-label="Quitar una"
                className="h-11 w-11 text-xl text-crema disabled:opacity-30"
                disabled={cantidad <= 1}
              >
                −
              </button>
              <span
                className="w-8 text-center font-display text-lg font-black text-crema"
                aria-live="polite"
              >
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.min(20, c + 1))}
                aria-label="Agregar una"
                className="h-11 w-11 text-xl text-crema"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={agregarAlPedido}
              className="flex-1 rounded-full bg-rojo px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rojo-osc"
            >
              Agregar · {formatoColones(precioUnidad * cantidad)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

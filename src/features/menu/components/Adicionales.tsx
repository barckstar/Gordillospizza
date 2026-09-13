"use client";

import Image from "next/image";
import { ADICIONALES, BEBIDAS } from "../data/menu";
import type { Suelto } from "@/shared/types/menu";
import { formatoColones } from "@/shared/lib/formatoColones";
import { useCarrito } from "@/shared/lib/carrito";

/**
 * Adicionales y bebidas.
 *
 * EL ORDEN NO ES DECORATIVO: primero los adicionales —el borde de queso— y
 * después las bebidas. Lo pidió el cliente y tiene sentido de venta: el borde
 * se agrega a la pizza que la persona acaba de elegir, así que es la pregunta
 * natural justo después; la bebida viene sola.
 */

function Ficha({ suelto, retraso = 0 }: { suelto: Suelto; retraso?: number }) {
  const { agregar, abrir, cantidadDe } = useCarrito();
  const enPedido = cantidadDe(suelto.id);
  /* Sin precio confirmado no se puede pedir. Ver el tipo `Suelto`. */
  const sinPrecio = suelto.precio === null;

  return (
    <li
      style={
        retraso
          ? ({ "--revelar-retraso": `${retraso}s` } as React.CSSProperties)
          : undefined
      }
      className={`flex flex-col overflow-hidden rounded-2xl border bg-carbon ${
        sinPrecio ? "border-crema/10" : "border-crema/10 hover:border-ambar/40"
      }`}
    >
      {suelto.imagen ? (
        <div className="relative mx-auto mt-4 h-32 w-full">
          <Image
            src={suelto.imagen}
            alt={`${suelto.nombre} ${suelto.detalle}, disponible en Gordillo's Pizza, San Ramón`}
            fill
            sizes="160px"
            className="object-contain"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="mx-auto mt-4 flex h-32 w-full items-center justify-center text-5xl"
        >
          🧀
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h4 className="font-display text-base font-black leading-tight text-crema">
          {suelto.nombre}
        </h4>
        <p className="mt-1 flex-1 text-xs leading-relaxed text-humo">
          {suelto.detalle}
        </p>

        {sinPrecio ? (
          <p className="mt-3 rounded-full border border-crema/15 px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-humo">
            Precio por confirmar
          </p>
        ) : (
          <button
            type="button"
            onClick={() => {
              agregar({
                id: suelto.id,
                nombre: suelto.nombre,
                detalle: suelto.detalle,
                precio: suelto.precio as number,
                imagen: suelto.imagen ?? undefined,
              });
              abrir();
            }}
            className="mt-3 flex items-center justify-between gap-2 rounded-full bg-rojo px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-rojo-osc"
          >
            <span>
              {enPedido > 0 ? `Agregar otro (${enPedido})` : "Agregar"}
            </span>
            <span>{formatoColones(suelto.precio as number)}</span>
          </button>
        )}
      </div>
    </li>
  );
}

export function Adicionales() {
  return (
    <div id="adicionales" className="mt-16 scroll-mt-28">
      <h3 className="font-display text-2xl font-black text-crema sm:text-3xl">
        Adicionales y bebidas
      </h3>
      <p className="mt-2 text-sm text-humo">
        Las bebidas todavía no tienen precio confirmado por el local.
      </p>

      <ul
        data-revelar="una-vez"
        className="menu-cascada mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5"
      >
        {/* El borde de queso primero, siempre. */}
        {[...ADICIONALES, ...BEBIDAS].map((s, i) => (
          <Ficha key={s.id} suelto={s} retraso={i * 0.06} />
        ))}
      </ul>
    </div>
  );
}

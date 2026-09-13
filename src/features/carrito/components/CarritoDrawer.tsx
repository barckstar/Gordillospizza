"use client";

import Image from "next/image";
import { useCarrito } from "@/shared/lib/carrito";
import { useModal } from "@/shared/lib/modal";
import { formatoColones } from "@/shared/lib/formatoColones";

/**
 * El pedido.
 *
 * Se parte en dos componentes A PROPÓSITO: el de afuera decide si hay que
 * mostrarlo y el de adentro tiene los hooks. `useModal` bloquea el scroll del
 * fondo y se suscribe al teclado nada más montarse, así que no puede vivir en
 * un componente que existe también cuando el pedido está cerrado.
 */
export function CarritoDrawer({ onIrAlCheckout }: { onIrAlCheckout: () => void }) {
  const { abierto } = useCarrito();
  if (!abierto) return null;
  return <Panel onIrAlCheckout={onIrAlCheckout} />;
}

function Panel({ onIrAlCheckout }: { onIrAlCheckout: () => void }) {
  const { lineas, total, conteo, cambiarCantidad, quitar, vaciar, cerrar } =
    useCarrito();
  const { saliendo, pedirCierre, alTerminarAnimacion } = useModal(cerrar);

  return (
    <div
      data-saliendo={saliendo}
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label="Cerrar el pedido"
        onClick={pedirCierre}
        className="modal-velo absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pedido-titulo"
        onAnimationEnd={alTerminarAnimacion}
        className="modal-panel relative flex max-h-[92svh] w-full max-w-lg flex-col rounded-t-3xl border border-crema/10 bg-negro-2 sm:rounded-3xl"
      >
        <header className="flex items-center justify-between border-b border-crema/10 px-5 py-4">
          <h2
            id="pedido-titulo"
            className="font-display text-xl font-black text-crema"
          >
            Tu pedido{" "}
            <span className="text-humo">
              ({conteo} {conteo === 1 ? "artículo" : "artículos"})
            </span>
          </h2>
          <button
            type="button"
            onClick={pedirCierre}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-carbon text-lg text-crema transition-colors hover:bg-carbon-2"
          >
            ×
          </button>
        </header>

        {lineas.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-humo">
            Todavía no agregaste nada.
          </p>
        ) : (
          <ul className="flex-1 divide-y divide-crema/10 overflow-y-auto px-5">
            {lineas.map((l) => (
              <li key={l.item.id} className="flex gap-3 py-4">
                {l.item.imagen && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-carbon">
                    <Image
                      src={l.item.imagen}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight text-crema">
                    {l.item.nombre}
                  </p>
                  {l.item.detalle && (
                    <p className="mt-0.5 text-xs text-humo">{l.item.detalle}</p>
                  )}

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-crema/15">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(l.item.id, l.cantidad - 1)}
                        aria-label={`Quitar una ${l.item.nombre}`}
                        className="h-8 w-8 text-crema"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-crema">
                        {l.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(l.item.id, l.cantidad + 1)}
                        aria-label={`Agregar una ${l.item.nombre}`}
                        className="h-8 w-8 text-crema"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => quitar(l.item.id)}
                      className="text-xs text-humo underline underline-offset-2 hover:text-rojo-vivo"
                    >
                      Quitar
                    </button>
                  </div>
                </div>

                <p className="shrink-0 font-display text-base font-black text-ambar">
                  {formatoColones(l.item.precio * l.cantidad)}
                </p>
              </li>
            ))}
          </ul>
        )}

        <footer className="border-t border-crema/10 p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-sm uppercase tracking-widest text-humo">
              Total
            </span>
            <span className="font-display text-2xl font-black text-crema">
              {formatoColones(total)}
            </span>
          </div>

          {/*
            DOS SALIDAS EXPLÍCITAS, no solo la X.

            La X de arriba sigue estando, pero una X no dice a dónde lleva:
            quien acaba de agregar una pizza y quiere agregar otra tiene que
            deducir que cerrar el pedido lo devuelve al menú. Acá se dice con
            palabras. "Seguir ordenando" va primero y con menos peso visual,
            "Hacer pedido" es el camino principal y va en rojo.
          */}
          <div className="grid gap-2.5 sm:grid-cols-[1fr_1.3fr]">
            <button
              type="button"
              onClick={pedirCierre}
              className="rounded-full border border-crema/25 px-5 py-3.5 text-sm font-semibold text-crema transition-colors hover:border-ambar hover:text-ambar"
            >
              Seguir ordenando
            </button>
            <button
              type="button"
              onClick={onIrAlCheckout}
              disabled={lineas.length === 0}
              className="rounded-full bg-rojo px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rojo-osc disabled:opacity-40"
            >
              Hacer pedido
            </button>
          </div>

          {lineas.length > 0 && (
            <button
              type="button"
              onClick={vaciar}
              className="mt-3 w-full text-xs text-humo underline underline-offset-2 hover:text-rojo-vivo"
            >
              Vaciar el pedido
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

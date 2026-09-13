"use client";

import { useCarrito } from "@/shared/lib/carrito";
import { formatoColones } from "@/shared/lib/formatoColones";

/**
 * Pastilla flotante con el pedido.
 *
 * No se muestra con el pedido vacío: un botón que dice "₡0" no invita a nada
 * y encima le tapa contenido a quien apenas está mirando la carta.
 */
export function CarritoBoton() {
  const { conteo, total, abrir } = useCarrito();
  if (conteo === 0) return null;

  return (
    <button
      type="button"
      onClick={abrir}
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-sm items-center justify-between gap-4 rounded-full bg-rojo px-6 py-4 text-white shadow-2xl shadow-black/50 transition-colors hover:bg-rojo-osc sm:left-auto sm:right-6 sm:mx-0 sm:w-auto"
    >
      <span className="flex items-center gap-2.5 text-sm font-semibold">
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/25 px-1.5 text-xs font-bold">
          {conteo}
        </span>
        Ver el pedido
      </span>
      <span className="font-display text-lg font-black">
        {formatoColones(total)}
      </span>
    </button>
  );
}

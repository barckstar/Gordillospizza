import Image from "next/image";
import type { Pizza } from "@/shared/types/menu";
import { formatoColones } from "@/shared/lib/formatoColones";

/**
 * Tarjeta de pizza en la cuadrícula.
 *
 * No lleva precio único: lleva el "desde", que es el de la pequeña. El precio
 * de verdad se decide al elegir el tamaño, y eso pasa en la hoja que abre esta
 * tarjeta. Poner los cinco precios acá convertía el menú en una tabla.
 */
export function TarjetaPizza({
  pizza,
  desde,
  destacada = false,
  retraso = 0,
  onAbrir,
}: {
  pizza: Pizza;
  desde: number;
  destacada?: boolean;
  /** Segundos de retraso para la entrada escalonada. Lo calcula la seccion. */
  retraso?: number;
  onAbrir: () => void;
}) {
  return (
    <li
      style={
        retraso
          ? ({ "--revelar-retraso": `${retraso}s` } as React.CSSProperties)
          : undefined
      }
    >
      <button
        type="button"
        onClick={onAbrir}
        className={`group relative flex w-full flex-col overflow-hidden rounded-2xl border text-left transition-colors ${
          destacada
            ? "border-rojo/70 bg-carbon-2"
            : "border-crema/10 bg-carbon hover:border-ambar/50"
        }`}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-negro">
          <Image
            src={pizza.imagen}
            alt={`Pizza ${pizza.nombre} de Gordillo's Pizza, San Ramón`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* El degradado es lo que deja legible el nombre sobre la foto. */}
          <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/45 to-transparent" />

          {destacada && (
            <span className="absolute left-3 top-3 rounded-full bg-rojo px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              La de la casa
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 p-3.5">
            <h3 className="font-display text-lg font-black leading-tight text-white">
              {pizza.nombre}
            </h3>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3.5">
          <p className="flex-1 text-[13px] leading-relaxed text-humo">
            {pizza.ingredientes.join(" · ")}
          </p>
          <p className="mt-3 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-widest text-humo">
              desde
            </span>
            <span className="font-display text-xl font-black text-ambar">
              {formatoColones(desde)}
            </span>
          </p>
        </div>
      </button>
    </li>
  );
}

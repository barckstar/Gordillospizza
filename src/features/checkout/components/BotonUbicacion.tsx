"use client";

import { useState } from "react";
import { IconoMapa } from "@/shared/components/ui/Iconos";

type Estado = "inicial" | "buscando" | "listo" | "error";

/**
 * Captura la ubicación del cliente con `navigator.geolocation`.
 *
 * Es API del navegador: no cuesta nada, no pide llave y no suma dependencias.
 * Lo único que exige es HTTPS — funciona en localhost y en Vercel.
 *
 * NO se hace geocodificación inversa (coordenadas a nombre de calle) porque
 * eso sí requiere una API de pago. Tampoco hace falta: en Costa Rica las
 * direcciones son descriptivas, así que las señas que escribe el cliente MÁS
 * el punto exacto son mejor combinación que un nombre de calle. Por eso el
 * campo de dirección sigue siendo obligatorio aunque haya coordenadas.
 */
export function BotonUbicacion({
  onUbicacion,
  tieneUbicacion,
  onLimpiar,
}: {
  onUbicacion: (lat: number, lng: number) => void;
  tieneUbicacion: boolean;
  onLimpiar: () => void;
}) {
  const [estado, setEstado] = useState<Estado>("inicial");
  const [mensaje, setMensaje] = useState<string | null>(null);

  function pedirUbicacion() {
    if (!("geolocation" in navigator)) {
      setEstado("error");
      setMensaje("Tu navegador no permite compartir la ubicación.");
      return;
    }

    setEstado("buscando");
    setMensaje(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onUbicacion(pos.coords.latitude, pos.coords.longitude);
        setEstado("listo");
        setMensaje(null);
      },
      (err) => {
        setEstado("error");
        /*
          Cada motivo necesita una salida distinta. "No se pudo" a secas deja
          a la persona sin saber si reintentar, si revisar un permiso o si
          simplemente escribir las señas a mano.
        */
        setMensaje(
          err.code === err.PERMISSION_DENIED
            ? "No diste el permiso. Podés escribir las señas a mano."
            : err.code === err.TIMEOUT
              ? "La búsqueda tardó demasiado. Probá de nuevo o escribí las señas."
              : "No se pudo obtener la ubicación. Escribí las señas, por favor.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  if (tieneUbicacion) {
    return (
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-ambar/50 bg-ambar/10 px-3 py-2.5">
        <IconoMapa className="size-4 shrink-0 text-ambar" />
        <p className="flex-1 text-xs text-crema">
          Ubicación exacta lista. Se manda como enlace de mapa.
        </p>
        <button
          type="button"
          onClick={() => {
            onLimpiar();
            setEstado("inicial");
          }}
          className="shrink-0 text-xs text-humo underline transition-colors hover:text-rojo-vivo"
        >
          Quitar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={pedirUbicacion}
        disabled={estado === "buscando"}
        className="inline-flex items-center gap-2 rounded-xl border border-crema/20 px-3 py-2.5 text-xs text-crema transition-colors hover:border-ambar/60 hover:text-ambar disabled:opacity-60"
      >
        <IconoMapa className="size-4" />
        {estado === "buscando" ? "Buscando…" : "Usar mi ubicación exacta"}
      </button>

      {mensaje && (
        <p role="status" className="mt-2 text-xs text-humo">
          {mensaje}
        </p>
      )}
    </div>
  );
}

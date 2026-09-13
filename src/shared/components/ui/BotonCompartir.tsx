"use client";

import { useState } from "react";
import { NEGOCIO } from "@/shared/config/negocio";

/**
 * Botón de compartir.
 *
 * Usa la Web Share API cuando el dispositivo la tiene: en móvil abre la hoja
 * nativa del sistema, con WhatsApp, Instagram y todo lo que la persona tenga
 * instalado. Es gratis y no necesita ningún SDK.
 *
 * En escritorio casi ningún navegador la implementa, así que cae a copiar el
 * enlace al portapapeles y avisarlo. Y si hasta el portapapeles está
 * bloqueado —pasa en contextos sin HTTPS— abre WhatsApp Web con el enlace ya
 * escrito. **Nunca se queda sin hacer nada**: un botón que no reacciona se
 * lee como que el sitio está roto.
 */
export function BotonCompartir({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const destino =
      typeof window !== "undefined" ? window.location.href : NEGOCIO.sitio;
    const datos = {
      title: `${NEGOCIO.nombre} — ${NEGOCIO.ciudad}`,
      text: `${NEGOCIO.nombre}: ${NEGOCIO.promesa}. Mirá el menú.`,
      url: destino,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(datos);
        return;
      } catch {
        // La persona cancela la hoja nativa: no es un error, no se avisa nada.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(destino);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2200);
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${datos.text} ${destino}`)}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  }

  return (
    <button
      type="button"
      onClick={compartir}
      className={className}
      data-copiado={copiado}
    >
      {children}
      {/*
        `role="status"` para que el lector de pantalla anuncie el copiado.
        Sin esto, quien no ve la etiqueta no se entera de que paso algo.
      */}
      {copiado && (
        <span role="status" className="sr-only">
          Enlace copiado al portapapeles
        </span>
      )}
    </button>
  );
}

export function IconoCompartir({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

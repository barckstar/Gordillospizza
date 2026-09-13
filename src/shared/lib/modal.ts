"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnimationEvent } from "react";

/**
 * Lo que todo modal del sitio necesita: cerrar con animación, con Escape, y
 * congelar el fondo mientras está abierto.
 *
 * EL CIERRE NO ES INMEDIATO. Si al pulsar la X React desmontara el componente
 * en el acto, solo se vería la animación de entrada: la de salida no alcanza
 * a correr sobre algo que ya no existe. Por eso `pedirCierre` no cierra —
 * marca `saliendo`, quien lo usa pinta `data-saliendo="true"`, el CSS corre
 * la animación de salida y recién al terminar se llama a `onCerrar` de verdad.
 */
export function useModal(onCerrar: () => void) {
  const [saliendo, setSaliendo] = useState(false);

  const pedirCierre = useCallback(() => setSaliendo(true), []);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSaliendo(true);
    };
    document.addEventListener("keydown", alTeclear);

    // El fondo no se desplaza detrás de un modal abierto.
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = previo;
    };
  }, []);

  /*
    RED DE SEGURIDAD. `animationend` es quien cierra normalmente, pero si por
    lo que sea no llega —una animación interrumpida, la pestaña en segundo
    plano cuando el navegador no despacha el evento— el modal se quedaría
    trabado en pantalla, sin poder cerrarse ni con Escape. 420 ms es el doble
    de la animación de salida.
  */
  useEffect(() => {
    if (!saliendo) return;
    const t = window.setTimeout(onCerrar, 420);
    return () => window.clearTimeout(t);
  }, [saliendo, onCerrar]);

  const alTerminarAnimacion = useCallback(
    (e: AnimationEvent<HTMLElement>) => {
      // Solo la animación del propio panel, no la de algo que tenga dentro.
      if (saliendo && e.target === e.currentTarget) onCerrar();
    },
    [saliendo, onCerrar],
  );

  return { saliendo, pedirCierre, alTerminarAnimacion };
}

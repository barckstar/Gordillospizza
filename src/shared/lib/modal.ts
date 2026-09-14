"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnimationEvent } from "react";

/*
  BLOQUEO DEL SCROLL, CON CUENTA — no con "guardar y restaurar".

  La version anterior hacia que cada modal se guardara el `overflow` que
  encontro y lo devolviera al cerrarse. Con UN modal funciona. Con dos
  solapados se rompe, y en este sitio se solapan siempre:

    1. La hoja de la pizza esta abierta -> overflow: hidden, guarda ""
    2. Se toca "Agregar": la hoja empieza a SALIR (sigue montada 190 ms
       mientras se anima) y el pedido se abre a la vez
    3. El pedido monta, lee el overflow actual —que es "hidden"— y se lo
       guarda como "lo que habia antes"
    4. Se cierra el pedido y restaura "hidden"

    -> El body queda bloqueado PARA SIEMPRE. En movil, que es donde se pide
       comida, la persona no puede seguir desplazandose y solo recupera el
       sitio recargando. Reportado desde un telefono real.

  La solucion es que el estado del scroll no sea de cada modal sino del
  documento: se lleva una CUENTA de cuantos hay abiertos. El primero bloquea
  y guarda el valor original; el ultimo en cerrarse lo devuelve. Los del
  medio no tocan nada.
*/
let abiertos = 0;
let overflowOriginal = "";

function bloquearScroll() {
  if (abiertos === 0) {
    overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  abiertos += 1;
}

function liberarScroll() {
  // Nunca por debajo de cero: un desmontaje doble no puede dejar la cuenta
  // en negativo y con eso impedir que el proximo bloqueo funcione.
  abiertos = Math.max(0, abiertos - 1);
  if (abiertos === 0) {
    document.body.style.overflow = overflowOriginal;
  }
}

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
    bloquearScroll();

    return () => {
      document.removeEventListener("keydown", alTeclear);
      liberarScroll();
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

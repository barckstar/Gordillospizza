"use client";

import { useEffect, useRef, useState } from "react";

/** Desplazamiento minimo para reaccionar. Evita el temblor por micro-scroll. */
const UMBRAL_PX = 6;
/** Antes de esta altura el navbar siempre se ve, aunque se baje. */
const ALTURA_MINIMA_PX = 150;

/**
 * Oculta el navbar al bajar y lo devuelve al subir.
 *
 * Constante del esquema general de paginas web — ver D:\CLAUDE.md.
 * Mecanicas heredadas de mascontractorsllc.
 *
 * @param bloqueado Mientras sea true el navbar nunca se oculta. Se le pasa el
 *   estado del menu movil: si el menu esta desplegado y el navbar se va, el
 *   menu se va con el.
 */
export function useNavbarOculto(bloqueado = false): boolean {
  const [oculto, setOculto] = useState(false);
  const ultimoY = useRef(0);

  useEffect(() => {
    function alHacerScroll() {
      const y = window.scrollY;
      if (Math.abs(y - ultimoY.current) > UMBRAL_PX) {
        setOculto(y > ultimoY.current && y > ALTURA_MINIMA_PX);
        ultimoY.current = y;
      }
    }

    window.addEventListener("scroll", alHacerScroll, { passive: true });
    return () => window.removeEventListener("scroll", alHacerScroll);
  }, []);

  return oculto && !bloqueado;
}

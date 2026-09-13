import type { ReactNode } from "react";
import { Contenedor } from "./Contenedor";

/**
 * Seccion de la landing.
 *
 * `alterna` pinta el 30% de la paleta (carbon) en vez del 70% (negro).
 * El rojo NUNCA entra aca: no es fondo de seccion.
 */
export function Seccion({
  id,
  children,
  alterna = false,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  alterna?: boolean;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative py-20 sm:py-28 ${
        alterna ? "bg-negro-2" : "bg-negro"
      } ${className}`}
    >
      <Contenedor>{children}</Contenedor>
    </section>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";

type Variante = "solido" | "linea";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-200";

/*
  El rojo como FONDO con texto blanco da 5,48:1 y pasa AA. El mismo rojo
  como TEXTO sobre negro da 3,65:1 y no pasa — por eso la variante de
  linea usa crema y ambar, nunca rojo.
*/
const VARIANTES: Record<Variante, string> = {
  solido: "bg-rojo text-white hover:bg-rojo-osc",
  linea:
    "border border-crema/30 text-crema hover:border-ambar hover:text-ambar",
};

export function Boton({
  href,
  children,
  variante = "solido",
  externo = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variante?: Variante;
  externo?: boolean;
  className?: string;
}) {
  const clases = `${BASE} ${VARIANTES[variante]} ${className}`;

  if (externo) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={clases}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={clases}>
      {children}
    </Link>
  );
}

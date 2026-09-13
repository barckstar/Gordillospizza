import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

/*
  Revelado al entrar en pantalla — SIN JavaScript de por medio.

  Antes esto era Framer Motion (`motion`). El problema no era la animacion:
  era que `Revelar` llevaba "use client", y como lo usan Hero, Seccion,
  Destacados, SobreNosotros, PorQue, Resenas y Ofertas, TODA la landing
  —que es de servidor— terminaba dentro del arbol de hidratacion.
  Lighthouse lo media como 4.401 ms de "render delay" en el LCP.

  Ahora estos componentes son de SERVIDOR: solo pintan clases y variables
  CSS. Un unico observador de cliente (ObservadorRevelado, montado una vez
  en el layout) les pone `data-visible` cuando asoman. La animacion la hace
  CSS. Ver el bloque "Revelado al entrar en pantalla" en globals.css.

  NO volver a poner "use client" en este archivo.
*/

type Direccion = "abajo" | "izquierda" | "derecha" | "escala";

/** `style` de React no tipa variables CSS propias. */
type EstiloRevelar = CSSProperties & Record<`--${string}`, string>;

function clases(...partes: (string | false | undefined)[]) {
  return partes.filter(Boolean).join(" ");
}

/**
 * Revela su contenido cuando entra en pantalla.
 *
 * Por defecto anima al ENTRAR y al SALIR: el elemento vuelve a su estado
 * inicial cuando abandona la pantalla, asi que reaparece al volver a subir.
 * Con `unaVez` se puede fijar para que solo entre una vez.
 *
 * Solo anima transform y opacity. Con `prefers-reduced-motion` activo no
 * anima nada y el contenido aparece ya colocado — no basta con acortar la
 * duracion, hay que no moverlo. Eso lo resuelve globals.css.
 */
export function Revelar({
  children,
  direccion = "abajo",
  retraso = 0,
  unaVez = false,
  inmediato = false,
  className,
}: {
  children: ReactNode;
  direccion?: Direccion;
  /** Segundos. Util para escalonar elementos hermanos. */
  retraso?: number;
  /** true = no vuelve a animar al salir de pantalla. */
  unaVez?: boolean;
  /**
   * Anima al cargar la pagina, sin esperar al observador.
   *
   * SOLO para contenido SOBRE EL PLIEGUE. El observador vive en un
   * `useEffect`, o sea que corre despues de hidratar: si el hero dependiera
   * de el, su texto quedaria invisible hasta que llegue el JavaScript y
   * volveriamos a tener el render delay que vinimos a matar. Con `inmediato`
   * la animacion es una `@keyframes` que arranca en el primer pintado.
   */
  inmediato?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clases(
        "revelar",
        `revelar-${direccion}`,
        inmediato && "revelar-inmediato",
        className,
      )}
      /*
        Sin `data-revelar` el observador ni lo mira: `inmediato` es CSS puro.
      */
      data-revelar={inmediato ? undefined : unaVez ? "una-vez" : "repite"}
      style={
        retraso
          ? ({ "--revelar-retraso": `${retraso}s` } as EstiloRevelar)
          : undefined
      }
    >
      {children}
    </div>
  );
}

/**
 * Igual que Revelar, pero escalona a sus hijos directos.
 * Para grillas de tarjetas: entran una tras otra, no todas de golpe.
 *
 * El escalon es un `transition-delay` por hijo, y para calcularlo cada
 * `ItemCascada` necesita saber su posicion. Se la inyecta aqui con
 * `cloneElement` en vez de pedirsela a quien llama: asi las decenas de
 * `.map(...)` del sitio no cambian ni se pueden olvidar el indice.
 */
export function RevelarCascada({
  children,
  className,
  escalon = 0.09,
  unaVez = false,
}: {
  children: ReactNode;
  className?: string;
  escalon?: number;
  unaVez?: boolean;
}) {
  let indice = 0;
  const hijos = Children.map(children, (hijo) => {
    // Solo se clonan ItemCascada. Meterle `indice` a un <div> suelto
    // llegaria al DOM como atributo desconocido.
    if (!isValidElement(hijo) || hijo.type !== ItemCascada) return hijo;
    return cloneElement(hijo as ReactElement<{ indice?: number }>, {
      indice: indice++,
    });
  });

  return (
    <div
      className={clases("revelar-cascada", className)}
      data-revelar={unaVez ? "una-vez" : "repite"}
      style={{ "--revelar-escalon": `${escalon}s` } as EstiloRevelar}
    >
      {hijos}
    </div>
  );
}

/** Hijo de RevelarCascada. `indice` lo pone el padre; no hay que pasarlo. */
export function ItemCascada({
  children,
  className,
  indice = 0,
}: {
  children: ReactNode;
  className?: string;
  indice?: number;
}) {
  return (
    <div
      className={clases("revelar-item", className)}
      style={
        {
          "--revelar-retraso": `calc(${indice} * var(--revelar-escalon, 0.09s))`,
        } as EstiloRevelar
      }
    >
      {children}
    </div>
  );
}

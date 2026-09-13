"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * El unico JavaScript del revelado. Se monta UNA VEZ en el layout.
 *
 * Recorre todo lo que lleve `data-revelar` y le pone `data-visible` cuando
 * asoma en pantalla; el resto —opacidad, desplazamiento, escalonado— lo hace
 * CSS. Asi `Revelar` y compania siguen siendo componentes de servidor y la
 * landing entera se queda fuera del arbol de hidratacion.
 *
 * No devuelve marcado: no hay nada que pintar ni que hidratar mas alla de
 * este efecto.
 */
export function ObservadorRevelado() {
  /*
    Depende de la ruta A PROPOSITO. El layout no se vuelve a montar en una
    navegacion de cliente: al ir de / a /menu y volver, los elementos del
    inicio son NUEVOS y nadie los estaria observando. Se quedarian en
    opacidad 0 para siempre.
  */
  const ruta = usePathname();

  useEffect(() => {
    const objetivos =
      document.querySelectorAll<HTMLElement>("[data-revelar]");

    const mostrar = (el: HTMLElement) => {
      el.dataset.visible = "true";
    };

    // Navegador sin IntersectionObserver: se muestra todo de una. Nunca
    // dejar contenido en opacidad 0 esperando una API que no existe.
    if (!("IntersectionObserver" in window)) {
      objetivos.forEach(mostrar);
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          const el = entrada.target as HTMLElement;
          if (entrada.isIntersecting) {
            mostrar(el);
            if (el.dataset.revelar === "una-vez") observador.unobserve(el);
          } else if (el.dataset.revelar !== "una-vez") {
            el.dataset.visible = "false";
          }
        }
      },
      {
        /*
          `threshold: 0` y NO una fraccion. Es la misma leccion que costo la
          version con Framer Motion (alli era `amount: "some"`).

          Con 0.2 se exige que el 20% del elemento este visible. En un bloque
          mas alto que la pantalla —nueve ofertas apiladas en movil miden mas
          de 4000px— ese 20% supera la altura del viewport y la condicion no
          se cumple NUNCA: el contenido quedaba invisible para siempre.
          Con 0 dispara en cuanto asoma cualquier parte.
        */
        threshold: 0,
        // Un pelin de margen abajo para que no entre justo pegado al borde.
        rootMargin: "0px 0px -5% 0px",
      },
    );

    objetivos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [ruta]);

  return null;
}

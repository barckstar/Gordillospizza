import Image from "next/image";
import {
  IconoFacebook,
  IconoInstagram,
  IconoWhatsApp,
  IconoMapa,
} from "@/shared/components/ui/Iconos";
import {
  BotonCompartir,
  IconoCompartir,
} from "@/shared/components/ui/BotonCompartir";
import { NEGOCIO } from "@/shared/config/negocio";

/**
 * Barra lateral de redes, pegada al borde derecho.
 *
 * PERSONALIZADA, no una barra genérica pegada al costado. Un riel de iconos
 * grises igual en todos los sitios es exactamente lo que hace que una página
 * se vea hecha con plantilla; este lleva cuatro cosas que son de Gordillo's:
 *
 *  1. **El gordito remata el riel.** El sello redondo sale recortado del
 *     propio logo, así que la pieza superior es la marca y no un icono más.
 *  2. **En reposo los iconos van en ámbar**, el acento del sitio; al pasar el
 *     cursor cada uno toma EL COLOR DE SU RED — verde WhatsApp, magenta
 *     Instagram, azul Facebook. Se reconocen al instante sin dejar de
 *     pertenecer a la paleta mientras están quietos.
 *  3. **La etiqueta es roja**, la misma pastilla de todos los CTA del sitio,
 *     no un gris de sistema.
 *  4. **Entra deslizándose desde el borde** un segundo después de cargar, para
 *     no competir con el hero en el primer vistazo.
 *
 * OCULTA EN MÓVIL a propósito. A 375 px de ancho un riel fijo a la derecha
 * siempre termina tapando contenido — y acá encima chocaría con la pastilla
 * del pedido, que vive abajo. En móvil las redes siguen estando en el menú
 * hamburguesa y en el pie, así que no se pierde nada.
 *
 * Sigue siendo de SERVIDOR: el comportamiento es `:hover` de CSS. La única
 * pieza de cliente es el botón de compartir, que necesita la Web Share API —
 * y viaja solo, no arrastra la barra entera al árbol de hidratación.
 */

/*
  `etiqueta` es lo que anuncia el lector de pantalla y `nombre` lo que se ve
  al pasar el cursor. Van separados porque no siempre coinciden: la plantilla
  "<nombre> de Gordillo's Pizza" funciona para "WhatsApp" pero deja
  "Cómo llegar de Gordillo's Pizza", que no se entiende dicho en voz alta.

  `tono` es el color oficial de cada red. Va como variable CSS en línea y no
  como clase de Tailwind porque Tailwind genera sus clases leyendo el código
  fuente: un `hover:text-[${tono}]` armado dentro de un `.map` no existe en
  el momento de compilar y no produciría ninguna regla.
*/
const REDES = [
  {
    nombre: "WhatsApp",
    etiqueta: `Escribinos por WhatsApp al ${NEGOCIO.telefono}`,
    href: `${NEGOCIO.whatsapp}?text=${encodeURIComponent(
      `Hola ${NEGOCIO.nombre}, quiero hacer un pedido.`,
    )}`,
    tono: "#25D366",
    Icono: IconoWhatsApp,
  },
  {
    nombre: "Instagram",
    etiqueta: `Instagram de ${NEGOCIO.nombre}`,
    href: NEGOCIO.redes.instagram,
    tono: "#E1306C",
    Icono: IconoInstagram,
  },
  {
    nombre: "Facebook",
    etiqueta: `Facebook de ${NEGOCIO.nombre}`,
    href: NEGOCIO.redes.facebook,
    tono: "#1877F2",
    Icono: IconoFacebook,
  },
  {
    nombre: "Cómo llegar",
    etiqueta: `Cómo llegar a ${NEGOCIO.nombre} en ${NEGOCIO.ciudad}`,
    href: NEGOCIO.enlaceMapa,
    /* No es una red: se queda en el rojo de la marca. */
    tono: "#FF4A3D",
    Icono: IconoMapa,
  },
] as const;

/** La etiqueta que asoma desde la izquierda. Misma pastilla en los cinco. */
function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <span aria-hidden="true" className="barra-etiqueta">
      {children}
      <span className="barra-flecha" />
    </span>
  );
}

export function BarraSocial() {
  return (
    <div className="barra-social group/barra fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      <div className="barra-riel">
        {/*
          El gordito, recortado del logo. Es decorativo —el enlace al inicio ya
          está en el navbar— así que no es un enlace más ni entra al tabulador.
        */}
        <Image
          src="/marca/gordito-sello.webp"
          alt=""
          aria-hidden="true"
          width={256}
          height={256}
          className="barra-sello"
        />

        <ul className="flex flex-col gap-5">
          {REDES.map(({ nombre, etiqueta, href, tono, Icono }) => (
            <li key={nombre}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ "--tono": tono } as React.CSSProperties}
                className="barra-enlace group/enlace"
              >
                <span className="sr-only">{etiqueta}</span>
                <Icono className="size-6" />
                <Etiqueta>{nombre}</Etiqueta>
              </a>
            </li>
          ))}

          {/*
            Compartir cierra el riel, separado por una línea: no es una red,
            es una acción. Su tono es el crema del texto, no un color de marca
            ajena.
          */}
          <li className="mt-1 border-t border-ambar/20 pt-5">
            <BotonCompartir className="barra-enlace group/enlace">
              <span className="sr-only">
                Compartir el sitio de {NEGOCIO.nombre}
              </span>
              <IconoCompartir className="size-6" />
              <Etiqueta>Compartir</Etiqueta>
            </BotonCompartir>
          </li>
        </ul>
      </div>
    </div>
  );
}

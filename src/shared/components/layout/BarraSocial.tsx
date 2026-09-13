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
 * Encogida y semitransparente en reposo, a tamaño completo al pasar el cursor
 * por encima, con `origin-right` para que no se despegue del borde al escalar.
 *
 * OCULTA EN MÓVIL a propósito. A 375 px de ancho un riel fijo a la derecha
 * siempre termina tapando contenido — y acá encima chocaría con la pastilla
 * del pedido, que vive abajo. En móvil las redes siguen estando en el menú
 * hamburguesa y en el pie, así que no se pierde nada.
 *
 * Sigue siendo de SERVIDOR: el comportamiento de la barra es `:hover` de CSS.
 * La unica pieza de cliente es el boton de compartir, que necesita la Web
 * Share API — y viaja solo, no arrastra la barra entera al arbol de
 * hidratacion.
 */
/*
  `etiqueta` es lo que anuncia el lector de pantalla y `nombre` lo que se ve
  al pasar el cursor. Van separados porque no siempre coinciden: la plantilla
  "<nombre> de Gordillo's Pizza" funciona para "WhatsApp" pero deja
  "Cómo llegar de Gordillo's Pizza", que no se entiende dicho en voz alta.
*/
const REDES = [
  {
    nombre: "WhatsApp",
    etiqueta: `Escribinos por WhatsApp al ${NEGOCIO.telefono}`,
    href: `${NEGOCIO.whatsapp}?text=${encodeURIComponent(
      `Hola ${NEGOCIO.nombre}, quiero hacer un pedido.`,
    )}`,
    Icono: IconoWhatsApp,
  },
  {
    nombre: "Instagram",
    etiqueta: `Instagram de ${NEGOCIO.nombre}`,
    href: NEGOCIO.redes.instagram,
    Icono: IconoInstagram,
  },
  {
    nombre: "Facebook",
    etiqueta: `Facebook de ${NEGOCIO.nombre}`,
    href: NEGOCIO.redes.facebook,
    Icono: IconoFacebook,
  },
  {
    nombre: "Cómo llegar",
    etiqueta: `Cómo llegar a ${NEGOCIO.nombre} en ${NEGOCIO.ciudad}`,
    href: NEGOCIO.enlaceMapa,
    Icono: IconoMapa,
  },
] as const;

export function BarraSocial() {
  return (
    <div className="group/barra fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      <ul className="flex origin-right scale-90 flex-col gap-5 rounded-l-2xl border-y border-l border-ambar/25 bg-negro/75 p-3.5 opacity-80 shadow-[0_0_24px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 group-hover/barra:scale-100 group-hover/barra:opacity-100">
        {REDES.map(({ nombre, etiqueta, href, Icono }) => (
          <li key={nombre}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/enlace relative block rounded-full text-ambar transition-colors hover:text-crema"
            >
              <span className="sr-only">{etiqueta}</span>
              <Icono className="size-6" />

              {/* Etiqueta que asoma desde la izquierda al pasar el cursor. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-full top-1/2 mr-4 -translate-y-1/2 translate-x-3 whitespace-nowrap rounded bg-ambar px-3 py-1 text-xs font-bold uppercase tracking-wide text-negro opacity-0 shadow-lg transition-all duration-300 group-hover/enlace:translate-x-0 group-hover/enlace:opacity-100"
              >
                {nombre}
                <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-ambar" />
              </span>
            </a>
          </li>
        ))}

        {/*
          Compartir cierra la barra, separado por una linea: no es una red,
          es una accion. Reusa las mismas clases de etiqueta para que el
          comportamiento al pasar el cursor sea identico al de los enlaces.
        */}
        <li className="border-t border-ambar/20 pt-5">
          <BotonCompartir className="group/enlace relative block rounded-full text-ambar transition-colors hover:text-crema">
            <span className="sr-only">Compartir el sitio de {NEGOCIO.nombre}</span>
            <IconoCompartir className="size-6" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-full top-1/2 mr-4 -translate-y-1/2 translate-x-3 whitespace-nowrap rounded bg-ambar px-3 py-1 text-xs font-bold uppercase tracking-wide text-negro opacity-0 shadow-lg transition-all duration-300 group-hover/enlace:translate-x-0 group-hover/enlace:opacity-100 group-data-[copiado=true]/enlace:translate-x-0 group-data-[copiado=true]/enlace:opacity-100"
            >
              Compartir
              <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-ambar" />
            </span>
          </BotonCompartir>
        </li>
      </ul>
    </div>
  );
}

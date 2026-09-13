import { HeroScroll } from "@/features/landing/components/HeroScroll";
import { Promesa } from "@/features/landing/components/Promesa";
import { LaDeLaCasa } from "@/features/landing/components/LaDeLaCasa";
import { SeccionMenu } from "@/features/menu/components/SeccionMenu";
import { Faq } from "@/features/faq/components/Faq";
import { Ubicacion } from "@/features/landing/components/Ubicacion";

/**
 * LA PÁGINA. Una sola ruta, seis secciones ancladas.
 *
 * El menú NO es una ruta aparte: vive acá, como sección. Mismo criterio que
 * ticoshot. Quien entra ve el video, baja, elige la pizza, elige el tamaño y
 * manda el pedido sin cambiar nunca de página — el carrito y el checkout son
 * drawers, montados en el layout.
 *
 * Todo lo de acá es de SERVIDOR menos el hero (necesita el scroll) y el menú
 * (necesita abrir la hoja de tamaños).
 */
export default function Inicio() {
  return (
    <>
      <HeroScroll />
      <Promesa />
      <LaDeLaCasa />
      <SeccionMenu />
      <Faq />
      <Ubicacion />
    </>
  );
}

import { formatoColones } from "@/shared/lib/formatoColones";
import { NEGOCIO } from "@/shared/config/negocio";
import type { LineaCarrito } from "@/shared/types/carrito";
import { etiquetaMetodoPago, type DatosPedido } from "../schema";

/**
 * Margen seguro para el texto YA CODIFICADO que viaja dentro de la URL de
 * wa.me. Los navegadores aceptan más, pero WhatsApp en iOS trunca antes y lo
 * hace EN SILENCIO: el pedido llega incompleto y nadie se entera.
 */
export const LIMITE_SEGURO = 1500;

type MensajePedido = {
  texto: string;
  largoCodificado: number;
  excedeLimite: boolean;
};

export function construirMensaje(
  lineas: LineaCarrito[],
  datos: DatosPedido,
  totalPedido: number,
): MensajePedido {
  const partes: string[] = [`*PEDIDO — ${NEGOCIO.nombre}*`, ""];

  for (const l of lineas) {
    const detalle = l.item.detalle ? ` (${l.item.detalle})` : "";
    partes.push(
      `${l.cantidad}x ${l.item.nombre}${detalle}  ${formatoColones(
        l.item.precio * l.cantidad,
      )}`,
    );
    if (l.nota) partes.push(`   ${l.nota}`);
  }

  partes.push("", `*TOTAL: ${formatoColones(totalPedido)}*`, "");

  partes.push(
    `${datos.modalidad === "express" ? "Express" : "Retiro en el local"} · ${datos.nombre} · ${datos.telefono}`,
  );

  if (datos.modalidad === "express" && datos.direccion) {
    partes.push(datos.direccion);
    // El costo del express lo cobra el mensajero al llegar, no el local.
    // Decirlo evita el malentendido de que el total ya lo incluye.
    partes.push("El costo del express se coordina con el mensajero.");
  }

  partes.push(`Pago: ${etiquetaMetodoPago[datos.metodoPago]}`);
  if (datos.notas) partes.push(`Nota: ${datos.notas}`);

  const texto = partes.join("\n");
  const largoCodificado = encodeURIComponent(texto).length;

  return { texto, largoCodificado, excedeLimite: largoCodificado > LIMITE_SEGURO };
}

/** Abre WhatsApp con el pedido ya escrito. */
export function enviarPorWhatsApp(texto: string): void {
  const url = `${NEGOCIO.whatsapp}?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

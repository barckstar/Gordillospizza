/**
 * Una línea del pedido.
 *
 * AQUÍ ESTÁ LA DIFERENCIA CON 5TA AVENIDA. Allá una línea era un plato y el
 * plato traía su precio. Acá una pizza tiene CINCO precios, uno por tamaño:
 * lo que se pide no es "una Suprema", es "una Suprema intermedia". La misma
 * pizza en dos tamaños son DOS líneas distintas.
 *
 * Por eso el carrito no guarda la pizza: guarda un `ItemPedido`, que es la
 * variante ya resuelta con su precio fijo. El `id` lleva el tamaño dentro
 * (`suprema:inter`) y es lo que distingue una línea de otra.
 *
 * Guardar la copia y no una referencia también arregla localStorage: un
 * pedido a medias sobrevive a que cambie la carta sin quedar apuntando a un
 * precio que ya no existe.
 */
export type ItemPedido = {
  /** `pizzaId:tamanoId` para pizzas; el id suelto para bebidas y adicionales. */
  id: string;
  nombre: string;
  /** "Intermedia · 8 porciones", "600 ml". */
  detalle?: string;
  precio: number;
  imagen?: string;
};

export type LineaCarrito = {
  item: ItemPedido;
  cantidad: number;
  nota?: string;
};

export type AccionCarrito =
  | { tipo: "agregar"; item: ItemPedido; cantidad?: number }
  | { tipo: "cambiarCantidad"; id: string; cantidad: number }
  | { tipo: "quitar"; id: string }
  | { tipo: "ponerNota"; id: string; nota: string }
  | { tipo: "vaciar" };

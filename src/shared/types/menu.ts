export type IdTamano = "peq" | "med" | "inter" | "grd" | "extra";

export type Tamano = {
  id: IdTamano;
  nombre: string;
  porciones: number;
};

export type Pizza = {
  id: string;
  nombre: string;
  ingredientes: string[];
  precios: Record<IdTamano, number>;
  imagen: string;
};

/**
 * Adicional o bebida.
 *
 * `precio: null` significa **precio no confirmado por el cliente**, no gratis.
 * Un producto sin precio se muestra en la carta pero NO se puede agregar al
 * pedido: mandarle a alguien un WhatsApp con una línea sin monto es peor que
 * no ofrecerlo.
 */
export type Suelto = {
  id: string;
  nombre: string;
  detalle: string;
  precio: number | null;
  imagen: string | null;
};

import { z } from "zod";

export const METODOS_PAGO = ["efectivo", "sinpe"] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

/*
  Solo efectivo y Sinpe Móvil. Son los dos universales en Costa Rica y no
  requieren nada del local. NO se lista tarjeta: el cliente todavía no
  confirmó si tiene datáfono, y ofrecer un pago que no existe se descubre en
  la puerta, con la pizza en la mano.
*/
export const etiquetaMetodoPago: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  sinpe: "Sinpe Móvil",
};

export const MODALIDADES = ["retiro", "express"] as const;
export type Modalidad = (typeof MODALIDADES)[number];

/**
 * Teléfono de Costa Rica: ocho dígitos que empiezan en 2, 4, 6, 7 u 8.
 * Se valida de verdad porque es el único dato con el que el local puede
 * devolver la llamada si el pedido llega raro.
 */
const telefonoCR = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^[24678]\d{7}$/, "Escribí un teléfono de 8 dígitos"),
  );

export const esquemaPedido = z
  .object({
    nombre: z.string().trim().min(2, "¿Cómo te llamás?"),
    telefono: telefonoCR,
    modalidad: z.enum(MODALIDADES),
    direccion: z.string().trim().optional(),
    metodoPago: z.enum(METODOS_PAGO),
    notas: z.string().trim().max(280).optional(),
    /*
      Coordenadas del boton de ubicacion. OPCIONALES a proposito: son un
      extra sobre las señas escritas, no un reemplazo. Se validan los rangos
      porque una latitud de 200 no es un punto, es un dato corrupto que
      mandaria al mensajero a ningun lado.
    */
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  })
  /*
    Un express sin dirección es un pedido que no se puede entregar. Se
    comprueba acá y no en el componente para que la regla viva con el dato.
  */
  .refine(
    (d) => d.modalidad !== "express" || (d.direccion?.length ?? 0) >= 8,
    { path: ["direccion"], message: "Decinos a dónde lo llevamos" },
  );

export type DatosPedido = z.infer<typeof esquemaPedido>;

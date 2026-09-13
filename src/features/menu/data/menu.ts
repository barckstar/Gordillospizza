import { z } from "zod";
import datos from "./menu.json";

/*
  El esquema VALIDA DE VERDAD, no decora.

  `parse` corre al importar el modulo, o sea durante `next build`. Un precio
  escrito como texto, un id repetido o un tamaño que no existe rompen el
  build — que es donde uno quiere enterarse, no con el menu en blanco en el
  telefono de un cliente.
*/

const ID_TAMANOS = ["peq", "med", "inter", "grd", "extra"] as const;

const idLimpio = z
  .string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, "El id va en minusculas, numeros y guiones");

/** Colones. Entero y positivo: aca no existen los centimos. */
const precio = z.number().int("Los precios en colones son enteros").positive();

/** Ruta de imagen dentro de `public/`. Nunca una URL externa. */
const rutaImagen = z
  .string()
  .regex(/^\/[a-z0-9/-]+\.(webp|avif|png|jpg)$/, "Ruta de imagen invalida");

const esquemaTamano = z.object({
  id: z.enum(ID_TAMANOS),
  nombre: z.string().min(1),
  porciones: z.number().int().positive(),
});

const esquemaPizza = z.object({
  id: idLimpio,
  nombre: z.string().min(1),
  ingredientes: z.array(z.string().min(1)).min(1),
  precios: z.object({
    peq: precio,
    med: precio,
    inter: precio,
    grd: precio,
    extra: precio,
  }),
  imagen: rutaImagen,
});

const esquemaSuelto = z.object({
  id: idLimpio,
  nombre: z.string().min(1),
  detalle: z.string().min(1),
  /* null = pendiente de confirmar. Ver el tipo `Suelto`. */
  precio: precio.nullable(),
  imagen: rutaImagen.nullable(),
});

const esquemaMenu = z
  .object({
    fuente: z.string(),
    moneda: z.literal("CRC"),
    tamanos: z.array(esquemaTamano).length(5),
    pizzas: z.array(esquemaPizza).min(1),
    adicionales: z.array(esquemaSuelto).min(1),
    bebidas: z.array(esquemaSuelto),
    pendiente_del_cliente: z.array(z.string()),
  })
  /* Dos productos con el mismo id romperian el carrito en silencio. */
  .refine(
    (m) => {
      const ids = [
        ...m.pizzas.map((p) => p.id),
        ...m.adicionales.map((a) => a.id),
        ...m.bebidas.map((b) => b.id),
      ];
      return new Set(ids).size === ids.length;
    },
    { message: "Hay ids repetidos entre pizzas, adicionales y bebidas" },
  )
  /*
    Los precios tienen que subir con el tamaño. Si una mediana sale mas barata
    que una pequeña es un error de transcripcion del arte, no una oferta — y el
    selector de tamaño lo mostraria como si fuera cierto.
  */
  .refine(
    (m) =>
      m.pizzas.every((p) =>
        ID_TAMANOS.every(
          (t, i) => i === 0 || p.precios[t] > p.precios[ID_TAMANOS[i - 1]],
        ),
      ),
    { message: "Alguna pizza tiene un precio que no sube con el tamaño" },
  );

const menu = esquemaMenu.parse(datos);

export const TAMANOS = menu.tamanos;
export const PIZZAS = menu.pizzas;
/** Primero los adicionales (el borde de queso), despues las bebidas. */
export const ADICIONALES = menu.adicionales;
export const BEBIDAS = menu.bebidas;
export const PENDIENTE_DEL_CLIENTE = menu.pendiente_del_cliente;

/** La de la casa va primera en la carta y es la que se destaca. */
export const PIZZA_DE_LA_CASA = PIZZAS[0];

/** Para el "desde ₡X" de la landing. */
export const PRECIO_MINIMO = Math.min(...PIZZAS.map((p) => p.precios.peq));
export const PRECIO_MAXIMO = Math.max(...PIZZAS.map((p) => p.precios.extra));

/** Tamaño por defecto al abrir una pizza. Ni la de probar ni la de fiesta. */
export const TAMANO_INICIAL = "inter" as const;

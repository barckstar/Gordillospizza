import { z } from "zod";
import datos from "./faq.json";
import { NEGOCIO } from "@/shared/config/negocio";
import {
  PIZZAS,
  PRECIO_MINIMO,
  PRECIO_MAXIMO,
} from "@/features/menu/data/menu";
import { formatoColones } from "@/shared/lib/formatoColones";

/*
  LAS RESPUESTAS NO REPITEN NUMEROS A MANO.

  Un precio escrito dentro de una respuesta envejece el dia que el cliente
  suba la carta, y una pagina que se contradice a si misma es justo lo que
  hunde la confianza —y lo que hace que un buscador o una IA respondan mal—.
  Por eso el JSON lleva marcas como {{precioMin}} y los valores salen del menu
  ya validado, en el momento de renderizar.

  Si alguien escribe una marca que no existe, el `refine` de abajo rompe el
  build en vez de publicar un "{{precioMedio}}" literal en la pagina.
*/
const VALORES: Record<string, string> = {
  direccion: NEGOCIO.direccion,
  telefono: NEGOCIO.telefono,
  precioMin: formatoColones(PRECIO_MINIMO),
  precioMax: formatoColones(PRECIO_MAXIMO),
  pizzas: String(PIZZAS.length),
};

const MARCA = /\{\{(\w+)\}\}/g;

function resolver(texto: string): string {
  return texto.replace(MARCA, (_, clave: string) => VALORES[clave] ?? "");
}

const esquemaFaq = z.object({
  titulo: z.string().min(1),
  texto: z.string().min(1),
  preguntas: z
    .array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        /* Que termine en "?" no es cosmetico: asi es como la gente escribe la
           busqueda, y asi es como se indexa en el marcado de FAQPage. */
        pregunta: z.string().min(6).endsWith("?"),
        respuesta: z.string().min(20),
      }),
    )
    .min(3),
});

const faq = esquemaFaq
  .refine(
    (f) =>
      f.preguntas.every((p) =>
        [...p.respuesta.matchAll(MARCA)].every(([, clave]) => clave in VALORES),
      ),
    { message: "Hay una marca {{...}} en faq.json que no existe" },
  )
  .refine((f) => new Set(f.preguntas.map((p) => p.id)).size === f.preguntas.length, {
    message: "Hay ids repetidos en faq.json",
  })
  .parse(datos);

export const FAQ = {
  titulo: faq.titulo,
  texto: faq.texto,
  preguntas: faq.preguntas.map((p) => ({
    ...p,
    respuesta: resolver(p.respuesta),
  })),
};

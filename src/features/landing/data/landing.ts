import { z } from "zod";
import datos from "./landing.json";

const esquemaBloqueHero = z.object({
  id: z.string().min(1),
  sobretitulo: z.string().min(1),
  titulo: z.string().min(1),
  texto: z.string().min(1),
});

const esquemaLanding = z.object({
  hero: z.object({
    marca: z.string().min(1),
    titulo: z.string().min(1),
    /*
      Exactamente 3. Cada bloque ocupa un tercio del recorrido del video:
      camina, se acerca, entrega. Cambiar la cantidad acá sin tocar
      HeroScroll.tsx dejaría franjas de scroll sin texto.
    */
    bloques: z.array(esquemaBloqueHero).length(3),
  }),
  promesa: z.object({
    sobretitulo: z.string().min(1),
    titulo: z.string().min(1),
    texto: z.string().min(1),
    /* Tres cifras. Con cuatro la fila se parte feo en teléfono. */
    cifras: z
      .array(
        z.object({
          id: z.string().min(1),
          numero: z.string().min(1),
          etiqueta: z.string().min(1),
        }),
      )
      .length(3),
  }),
  casa: z.object({
    sobretitulo: z.string().min(1),
    titulo: z.string().min(1),
    texto: z.string().min(1),
    /** Tiene que existir en menu.json. Se comprueba en el componente. */
    pizzaId: z.string().min(1),
  }),
  ubicacion: z.object({
    sobretitulo: z.string().min(1),
    titulo: z.string().min(1),
    texto: z.string().min(1),
  }),
});

export const LANDING = esquemaLanding.parse(datos);

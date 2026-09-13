import { NEGOCIO } from "@/shared/config/negocio";
import {
  PIZZAS,
  TAMANOS,
  ADICIONALES,
  BEBIDAS,
  PRECIO_MINIMO,
  PRECIO_MAXIMO,
} from "@/features/menu/data/menu";
import { FAQ } from "@/features/faq/data/faq";
import { formatoColones } from "@/shared/lib/formatoColones";

/*
  /llms.txt — el sitio, en texto plano, para asistentes de IA.

  ES UNA RUTA GENERADA, NO UN ARCHIVO ESCRITO A MANO. Sale del mismo
  `menu.json` y del mismo `faq.json` que pintan la pagina, asi que no puede
  contradecirla: el dia que suban el precio de la Suprema, este archivo
  cambia solo. Un llms.txt estatico con precios viejos es peor que no tener
  ninguno — le da a la IA una respuesta equivocada con toda confianza.

  `force-static` para que se escriba durante `next build` y se sirva como un
  archivo cualquiera, sin funcion corriendo detras.
*/
export const dynamic = "force-static";

export function GET() {
  const tamanos = TAMANOS.map((t) => `${t.nombre} (${t.porciones} porciones)`);

  const filas = PIZZAS.map((p) => {
    const precios = TAMANOS.map(
      (t) => `${t.nombre} ${formatoColones(p.precios[t.id])}`,
    ).join(" · ");
    return `- **${p.nombre}** — ${p.ingredientes.join(", ")}.\n  ${precios}`;
  });

  const sueltos = [...ADICIONALES, ...BEBIDAS].map(
    (s) =>
      `- **${s.nombre}** (${s.detalle}) — ${
        s.precio === null
          ? "precio no confirmado, consultar al local"
          : formatoColones(s.precio)
      }`,
  );

  const preguntas = FAQ.preguntas.map(
    (p) => `### ${p.pregunta}\n${p.respuesta}`,
  );

  const texto = `# ${NEGOCIO.nombre}

> Pizzería en ${NEGOCIO.ciudad}, ${NEGOCIO.provincia}, ${NEGOCIO.pais}.
> ${NEGOCIO.promesa}. ${PIZZAS.length} pizzas, cinco tamaños, de 4 a 16 porciones.

## Datos del local

- **Nombre:** ${NEGOCIO.nombre}
- **Tipo:** ${NEGOCIO.categoria}
- **Dirección:** ${NEGOCIO.direccion}, ${NEGOCIO.ciudad}, ${NEGOCIO.provincia}, ${NEGOCIO.pais}, ${NEGOCIO.codigoPostal}
- **Coordenadas:** ${NEGOCIO.geo.lat}, ${NEGOCIO.geo.lng}
- **Cómo llegar:** ${NEGOCIO.enlaceMapa}
- **Teléfono y WhatsApp:** ${NEGOCIO.telefono} (${NEGOCIO.telefonoE164})
- **Pedidos por WhatsApp:** ${NEGOCIO.whatsapp}
- **Horario:** todos los días hasta las ${NEGOCIO.cierraA}. La hora de apertura no está publicada.
- **Formas de pago:** efectivo y Sinpe Móvil.
- **Entrega:** retiro en el local o express. El costo del express lo cobra el mensajero aparte.
- **Instagram:** ${NEGOCIO.redes.instagram}
- **Facebook:** ${NEGOCIO.redes.facebook}
- **Rango de precios:** ${formatoColones(PRECIO_MINIMO)} a ${formatoColones(PRECIO_MAXIMO)}

## Tamaños

${tamanos.map((t) => `- ${t}`).join("\n")}

Toda pizza se vende en los cinco tamaños. El precio cambia según el tamaño.

## Pizzas (${PIZZAS.length})

${filas.join("\n")}

## Adicionales y bebidas

${sueltos.join("\n")}

## Preguntas frecuentes

${preguntas.join("\n\n")}

---

Generado desde los datos del sitio en cada compilación, así que los precios de
este archivo son siempre los mismos que muestra la página.
`;

  return new Response(texto, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

import type {
  Restaurant,
  Menu,
  MenuItem,
  MenuSection,
  Offer,
  FAQPage,
  Question,
  Graph,
} from "schema-dts";
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

/*
  DATOS ESTRUCTURADOS — para Google y para los asistentes de IA.

  Van los tres en UN solo `@graph` y no en tres etiquetas sueltas: asi el
  Restaurant, el Menu y las preguntas quedan unidos por `@id` y quien lo lee
  entiende que el menu es DE ese local, no un menu suelto en internet.

  POR QUE ESTAN LOS 95 PRECIOS AQUI

  Un asistente que responde "¿cuanto vale una pizza en Gordillo's?" no ve la
  pagina como la ve una persona: lee el marcado. Si el marcado solo dice
  "priceRange: ₡3.300–₡16.000", la respuesta que da es un rango inutil. Con
  cada pizza y cada tamaño como una `Offer` propia puede responder "la
  Suprema grande cuesta ₡10.000", que es la pregunta de verdad.

  Son 19 pizzas x 5 tamaños. Salen del mismo `menu.json` que pinta la pagina,
  asi que NUNCA pueden contradecirla.

  LO QUE NO VA, y es deliberado:
  - `aggregateRating`: son 3,0 con 2 reseñas. Publicarlo haria que Google
    pinte tres estrellas en el resultado de busqueda — exactamente lo
    contrario de lo que este sitio viene a hacer. Ver NEGOCIO.googleCalificacion.
  - Las bebidas no llevan `offers`: todavia no tienen precio confirmado. Se
    listan como platos del menu sin oferta, que es la forma honesta de decir
    "existe, pregunte el precio".
*/

const ID_LOCAL = `${NEGOCIO.sitio}/#restaurante`;
const ID_MENU = `${NEGOCIO.sitio}/#menu`;

/** Una oferta por tamaño. Es lo que permite responder por un precio exacto. */
function ofertasDePizza(precios: Record<string, number>): Offer[] {
  return TAMANOS.map((t) => ({
    "@type": "Offer",
    name: `${t.nombre} · ${t.porciones} porciones`,
    price: String(precios[t.id]),
    priceCurrency: "CRC",
    availability: "https://schema.org/InStock",
  }));
}

function seccionPizzas(): MenuSection {
  return {
    "@type": "MenuSection",
    name: "Pizzas",
    description: `Las ${PIZZAS.length} pizzas de la carta, cada una en cinco tamaños: ${TAMANOS.map((t) => `${t.nombre} de ${t.porciones} porciones`).join(", ")}.`,
    hasMenuItem: PIZZAS.map<MenuItem>((p) => ({
      "@type": "MenuItem",
      name: `Pizza ${p.nombre}`,
      description: p.ingredientes.join(", "),
      image: `${NEGOCIO.sitio}${p.imagen}`,
      offers: ofertasDePizza(p.precios),
    })),
  };
}

function seccionSueltos(nombre: string, lista: typeof ADICIONALES): MenuSection {
  return {
    "@type": "MenuSection",
    name: nombre,
    hasMenuItem: lista.map<MenuItem>((s) => ({
      "@type": "MenuItem",
      name: s.nombre,
      description: s.detalle,
      ...(s.imagen ? { image: `${NEGOCIO.sitio}${s.imagen}` } : {}),
      ...(s.precio !== null
        ? {
            offers: {
              "@type": "Offer",
              price: String(s.precio),
              priceCurrency: "CRC",
              availability: "https://schema.org/InStock",
            } satisfies Offer,
          }
        : {}),
    })),
  };
}

export function JsonLdSitio() {
  const local: Restaurant = {
    "@type": "Restaurant",
    "@id": ID_LOCAL,
    name: NEGOCIO.nombre,
    description: `Pizzería en ${NEGOCIO.ciudad}, ${NEGOCIO.provincia}. ${NEGOCIO.promesa}. ${PIZZAS.length} pizzas en cinco tamaños, de 4 a 16 porciones.`,
    servesCuisine: ["Pizza", "Italiana"],
    url: NEGOCIO.sitio,
    telephone: NEGOCIO.telefonoE164,
    priceRange: `₡${PRECIO_MINIMO}–₡${PRECIO_MAXIMO}`,
    currenciesAccepted: "CRC",
    paymentAccepted: "Efectivo, Sinpe Móvil",
    image: `${NEGOCIO.sitio}/og.jpg`,
    logo: `${NEGOCIO.sitio}/marca/logo-v2.webp`,
    address: {
      "@type": "PostalAddress",
      streetAddress: NEGOCIO.direccion,
      addressLocality: NEGOCIO.ciudad,
      addressRegion: NEGOCIO.provincia,
      postalCode: NEGOCIO.codigoPostal,
      addressCountry: "CR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: NEGOCIO.geo.lat,
      longitude: NEGOCIO.geo.lng,
    },
    hasMap: NEGOCIO.enlaceMapa,
    /*
      Solo se declara la hora de CIERRE, que es el unico dato publicado. El
      horario de apertura sigue pendiente del cliente y aqui no se inventa:
      un horario falso en el marcado hace que Google diga "abierto" cuando
      esta cerrado.
    */
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "https://schema.org/Monday",
        "https://schema.org/Tuesday",
        "https://schema.org/Wednesday",
        "https://schema.org/Thursday",
        "https://schema.org/Friday",
        "https://schema.org/Saturday",
        "https://schema.org/Sunday",
      ],
      closes: NEGOCIO.cierraA,
    },
    acceptsReservations: "False",
    hasMenu: { "@id": ID_MENU },
    sameAs: [NEGOCIO.redes.instagram, NEGOCIO.redes.facebook],
  };

  const menu: Menu = {
    "@type": "Menu",
    "@id": ID_MENU,
    name: `Menú de ${NEGOCIO.nombre}`,
    inLanguage: "es-CR",
    hasMenuSection: [
      seccionPizzas(),
      seccionSueltos("Adicionales", ADICIONALES),
      seccionSueltos("Bebidas", BEBIDAS),
    ],
  };

  const preguntas: FAQPage = {
    "@type": "FAQPage",
    "@id": `${NEGOCIO.sitio}/#preguntas`,
    mainEntity: FAQ.preguntas.map<Question>((p) => ({
      "@type": "Question",
      name: p.pregunta,
      acceptedAnswer: { "@type": "Answer", text: p.respuesta },
    })),
  };

  const grafo: Graph = {
    "@context": "https://schema.org",
    "@graph": [local, menu, preguntas],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(grafo) }}
    />
  );
}

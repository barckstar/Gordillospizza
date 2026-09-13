import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { NEGOCIO } from "@/shared/config/negocio";
import { PIZZAS, PRECIO_MINIMO } from "@/features/menu/data/menu";
import { formatoColones } from "@/shared/lib/formatoColones";
import { Navbar } from "@/shared/components/layout/Navbar";
import { Footer } from "@/shared/components/layout/Footer";
import { BarraSocial } from "@/shared/components/layout/BarraSocial";
import { ObservadorRevelado } from "@/shared/components/ui/ObservadorRevelado";
import { JsonLdSitio } from "@/shared/lib/jsonLd";
import { CarritoProvider } from "@/shared/lib/carrito";
import { CarritoUI } from "./CarritoUI";

/*
  Dos familias, no más. La display recoge el serif del arte del menú que ya
  usa el cliente; la de texto es neutra para que los precios se lean sin
  pelear. `display: swap` para que el texto pinte aunque la fuente todavía
  esté viajando.
*/
const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--fuente-display",
  display: "swap",
});

const texto = Inter({
  subsets: ["latin"],
  variable: "--fuente-texto",
  display: "swap",
});

/*
  El titulo y la descripcion llevan LA CIUDAD y LO QUE SE VENDE, no un eslogan.
  Nadie busca "una nueva experiencia gastronomica": busca "pizza san ramon" y
  "pizza a domicilio san ramon". La descripcion ademas mete el telefono, que es
  lo unico que la mitad de la gente necesita del resultado de busqueda.
*/
export const metadata: Metadata = {
  metadataBase: new URL(NEGOCIO.sitio),
  title: `${NEGOCIO.nombre} — Pizza en San Ramón, Alajuela | Pedí por WhatsApp`,
  description: `Pizzería en San Ramón centro, contiguo a La Musi. ${NEGOCIO.promesa}: ${PIZZAS.length} pizzas en cinco tamaños, de 4 a 16 porciones, desde ${formatoColones(PRECIO_MINIMO)}. Retiro o express. Pedidos al ${NEGOCIO.telefono}.`,
  applicationName: NEGOCIO.nombre,
  keywords: [
    "pizza San Ramón",
    "pizzería San Ramón Alajuela",
    "pizza a domicilio San Ramón",
    "Gordillo's Pizza",
    "pizza Costa Rica",
    "masa fresca",
  ],
  authors: [{ name: NEGOCIO.nombre }],
  creator: NEGOCIO.nombre,
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: NEGOCIO.nombre,
    url: NEGOCIO.sitio,
    title: `${NEGOCIO.nombre} — Pizza en San Ramón`,
    description: `${NEGOCIO.promesa}. ${PIZZAS.length} pizzas, cinco tamaños, de 4 a 16 porciones.`,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 675,
        alt: `Pizza recién salida del horno en ${NEGOCIO.nombre}, San Ramón`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${NEGOCIO.nombre} — Pizza en San Ramón`,
    description: `${NEGOCIO.promesa}. ${PIZZAS.length} pizzas, cinco tamaños.`,
    images: ["/og.jpg"],
  },
  /*
    `max-image-preview: large` es lo que decide si Google muestra la foto
    grande del local en el resultado o una miniatura. Para un restaurante esa
    diferencia es la mitad de los clics.
  */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "restaurant",
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0A0807",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CR" className={`${display.variable} ${texto.variable}`}>
      <head>
        {/*
          El poster del hero es el elemento LCP y NO pasa por next/image —es un
          archivo fijo, ya dimensionado y ya en AVIF—, asi que Next no emite
          ninguna pista por el. Sin este preload el navegador no se entera de
          que existe hasta que termina de parsear el <picture>, que va despues
          del CSS y de las fuentes.

          `type="image/avif"` hace que solo lo descarguen los navegadores que
          entienden AVIF, que son los mismos que van a elegir esa fuente del
          <picture>. Los demas se quedan con el WebP y no bajan nada de mas.
        */}
        <link
          rel="preload"
          as="image"
          href="/hero/poster.avif"
          type="image/avif"
          fetchPriority="high"
        />
      </head>
      <body>
        {/*
          El proveedor del pedido envuelve TODO porque el menú agrega, el
          botón flotante cuenta y el checkout lee — y los tres viven en
          ramas distintas del árbol.
        */}
        <CarritoProvider>
          <a
            href="#menu"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-rojo focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
          >
            Saltar al menú
          </a>
          <Navbar />
          <BarraSocial />
          <main>{children}</main>
          <Footer />
          <CarritoUI />
        </CarritoProvider>
        <ObservadorRevelado />
        <JsonLdSitio />
      </body>
    </html>
  );
}

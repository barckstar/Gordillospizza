import type { MetadataRoute } from "next";
import { NEGOCIO } from "@/shared/config/negocio";

export default function robots(): MetadataRoute.Robots {
  /*
    Todo abierto, incluidos los rastreadores de IA. Para un negocio local que
    vive de que lo encuentren, que un asistente pueda leer el menu y responder
    "Gordillo's abre hasta las 9" es publicidad gratis, no una fuga.
  */
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${NEGOCIO.sitio}/sitemap.xml`,
    host: NEGOCIO.sitio,
  };
}

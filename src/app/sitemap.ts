import type { MetadataRoute } from "next";
import { NEGOCIO } from "@/shared/config/negocio";

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  /*
    UNA sola URL. El menu dejo de ser una ruta y paso a ser un ancla de `/`:
    listar `/menu` aqui mandaria a Google a un 404.
  */
  return [{ url: NEGOCIO.sitio, lastModified: ahora, priority: 1 }];
}

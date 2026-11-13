import type { MetadataRoute } from "next";
import { ARTICULOS } from "@/data/articulos";
import { ULTIMA_REVISION } from "@/data/reglas";
import { SITIO } from "@/lib/sitio";

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = ["", "/barranquilla", "/soledad", "/placa", "/aprende", ...ARTICULOS.map((a) => `/aprende/${a.slug}`)];
  return rutas.map((r) => ({ url: SITIO.url + r, lastModified: ULTIMA_REVISION }));
}

import type { MetadataRoute } from "next";
import { ARTICULOS } from "@/data/articulos";
import { ULTIMA_REVISION } from "@/data/reglas";
import { SITIO } from "@/lib/sitio";

export default function sitemap(): MetadataRoute.Sitemap {
  const pagina = (ruta: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly") => ({
    url: SITIO.url + ruta,
    lastModified: ULTIMA_REVISION,
    changeFrequency,
    priority,
  });
  return [
    pagina("", 1, "daily"),
    pagina("/barranquilla", 0.9, "weekly"),
    pagina("/soledad", 0.9, "weekly"),
    pagina("/placa", 0.8, "daily"),
    pagina("/aprende", 0.7, "weekly"),
    ...ARTICULOS.map((a) => pagina(`/aprende/${a.slug}`, 0.6, "monthly")),
  ];
}

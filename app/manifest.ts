import type { MetadataRoute } from "next";
import { SITIO } from "@/lib/sitio";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITIO.nombre} · Restricciones para motos`,
    short_name: SITIO.nombre,
    description: SITIO.descripcion,
    lang: "es-CO",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#020617",
    theme_color: "#020617",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

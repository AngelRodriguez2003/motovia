import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import MapaCargador from "@/components/MapaCargador";
import Nav from "@/components/Nav";
import JsonLd from "@/components/JsonLd";
import { og } from "@/lib/seo";
import { SITIO } from "@/lib/sitio";

export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: og({ url: "/" }) };

const sitio = [
  { "@context": "https://schema.org", "@type": "WebSite", name: SITIO.nombre, url: SITIO.url, inLanguage: "es-CO", description: SITIO.descripcion },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITIO.nombre,
    url: SITIO.url,
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    inLanguage: "es-CO",
    description: SITIO.descripcion,
    offers: { "@type": "Offer", price: 0, priceCurrency: "COP" },
    areaServed: [
      { "@type": "City", name: "Barranquilla", containedInPlace: { "@type": "AdministrativeArea", name: "Atlántico, Colombia" } },
      { "@type": "City", name: "Soledad", containedInPlace: { "@type": "AdministrativeArea", name: "Atlántico, Colombia" } },
    ],
  },
];

export default function Home() {
  return (
    <div className="flex h-full flex-col">
      <main className="relative flex-1">
        <JsonLd datos={sitio} />
        <h1 className="sr-only">Mapa de restricciones para motos en Barranquilla y Soledad</h1>
        <MapaCargador />
        <p className="sr-only">
          Consulta también las reglas por ciudad: <Link href="/barranquilla">Barranquilla</Link>,{" "}
          <Link href="/soledad">Soledad</Link>, y la <Link href="/aprende">guía para motociclistas</Link>.
        </p>
      </main>
      <Suspense><Nav /></Suspense>
    </div>
  );
}

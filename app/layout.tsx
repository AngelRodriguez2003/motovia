import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import RegistroSW from "@/components/RegistroSW";
import { SITIO } from "@/lib/sitio";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: {
    default: `Restricciones para motos en Barranquilla y Soledad hoy: mapa, pico y placa y parrillero | ${SITIO.nombre}`,
    template: `%s | ${SITIO.nombre}`,
  },
  description: SITIO.descripcion,
  applicationName: SITIO.nombre,
  category: "transporte",
  openGraph: { type: "website", locale: "es_CO", siteName: SITIO.nombre },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
  // Código de Google Search Console (opcional): NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full">
        {children}
        <RegistroSW />
      </body>
    </html>
  );
}

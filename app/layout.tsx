import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import RegistroSW from "@/components/RegistroSW";
import { SITIO } from "@/lib/sitio";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: { default: `${SITIO.nombre} · Restricciones para motos en Barranquilla y Soledad`, template: `%s · ${SITIO.nombre}` },
  description: SITIO.descripcion,
  applicationName: SITIO.nombre,
  openGraph: { type: "website", locale: "es_CO", siteName: SITIO.nombre },
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

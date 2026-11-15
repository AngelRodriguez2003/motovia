import type { Metadata } from "next";
import { og } from "@/lib/seo";
import Pagina from "@/components/Pagina";
import ConsultaPlaca from "@/components/ConsultaPlaca";

export const metadata: Metadata = {
  title: "Pico y placa motos Soledad hoy: consulta por tu placa",
  description: "Elige el último dígito de la placa de tu moto y mira si hoy tiene pico y placa en Soledad, y qué restricciones aplican ahora en Barranquilla.",
  alternates: { canonical: "/placa" },
  openGraph: og({ url: "/placa" }),
};

export default function Placa() {
  return (
    <Pagina titulo="¿Mi moto puede salir hoy?" intro="Elige tu ciudad y el último número de tu placa.">
      <ConsultaPlaca />
    </Pagina>
  );
}

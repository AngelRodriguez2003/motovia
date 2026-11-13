import type { Metadata } from "next";
import PaginaCiudad, { metadatosCiudad } from "@/components/PaginaCiudad";

export const metadata: Metadata = metadatosCiudad("barranquilla");

export default function Page() {
  return <PaginaCiudad municipio="barranquilla" />;
}

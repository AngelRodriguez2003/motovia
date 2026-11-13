import type { Metadata } from "next";
import PaginaCiudad, { metadatosCiudad } from "@/components/PaginaCiudad";

export const metadata: Metadata = metadatosCiudad("soledad");

export default function Page() {
  return <PaginaCiudad municipio="soledad" />;
}

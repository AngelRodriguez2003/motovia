import type { Metadata } from "next";
import Pagina from "@/components/Pagina";
import ConsultaPlaca from "@/components/ConsultaPlaca";

export const metadata: Metadata = {
  title: "Consulta por placa",
  description: "Escribe el último dígito de la placa de tu moto y mira si hoy tiene alguna medida en Barranquilla o Soledad.",
};

export default function Placa() {
  return (
    <Pagina titulo="¿Mi moto puede salir hoy?" intro="Elige tu ciudad y el último número de tu placa.">
      <ConsultaPlaca />
    </Pagina>
  );
}

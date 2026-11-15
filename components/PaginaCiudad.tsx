import Link from "next/link";
import Pagina from "@/components/Pagina";
import ReglaTarjeta from "@/components/ReglaTarjeta";
import { REGLAS, type Municipio } from "@/data/reglas";

export const CIUDADES: Record<Municipio, { nombre: string; intro: string }> = {
  barranquilla: {
    nombre: "Barranquilla",
    intro: "Horario nocturno, Centro, vías de Transmetro, Corredor Portuario, parrillero hombre y corredores con parrillero inscrito.",
  },
  soledad: {
    nombre: "Soledad",
    intro: "Pico y placa por dígito, restricción nocturna, tramos prohibidos del centro y medidas temporales de parrillero.",
  },
};

export const metadatosCiudad = (m: Municipio) => ({
  title: `Restricciones para motos en ${CIUDADES[m].nombre}`,
  description: `${CIUDADES[m].intro} Horarios, excepciones y decreto de cada medida.`,
});

export default function PaginaCiudad({ municipio }: { municipio: Municipio }) {
  const c = CIUDADES[municipio];
  return (
    <Pagina titulo={`Restricciones para motos en ${c.nombre}`} intro={c.intro}>
      {REGLAS.filter((r) => r.municipio === municipio).map((r) => <ReglaTarjeta key={r.id} regla={r} />)}
      <Link href="/" className="flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-yellow-300">Ver qué aplica ahora en el mapa</Link>
    </Pagina>
  );
}

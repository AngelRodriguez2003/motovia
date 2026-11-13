import Link from "next/link";
import Anuncio from "@/components/Anuncio";
import Pagina from "@/components/Pagina";
import ReglaTarjeta from "@/components/ReglaTarjeta";
import { REGLAS, type Municipio } from "@/data/reglas";

export const CIUDADES: Record<Municipio, { nombre: string; intro: string }> = {
  barranquilla: {
    nombre: "Barranquilla",
    intro: "Horario nocturno, Centro, corredores de Transmetro, corredor portuario y zona sin parrillero hombre.",
  },
  soledad: {
    nombre: "Soledad",
    intro: "Soledad tiene normas propias y expide medidas temporales. Aquí está lo que hemos podido documentar.",
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
      <Anuncio slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_APRENDE} />
    </Pagina>
  );
}

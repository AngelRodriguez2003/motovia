import type { Metadata } from "next";
import Link from "next/link";
import EstadoHoy from "@/components/EstadoHoy";
import JsonLd from "@/components/JsonLd";
import Pagina from "@/components/Pagina";
import ReglaTarjeta from "@/components/ReglaTarjeta";
import { PREGUNTAS } from "@/data/preguntas";
import { REGLAS, type Municipio } from "@/data/reglas";
import { ANIO, migas, og, preguntasFrecuentes } from "@/lib/seo";

export const CIUDADES: Record<Municipio, { nombre: string; intro: string; descripcion: string }> = {
  barranquilla: {
    nombre: "Barranquilla",
    intro: "Horario nocturno, Centro, vías de Transmetro, Corredor Portuario, parrillero hombre y corredores con parrillero inscrito.",
    descripcion:
      "Restricción nocturna de 11 p.m. a 5 a.m., parrillero hombre prohibido, parrillero inscrito, Centro, Transmetro y multas. Mapa, horarios, excepciones y decreto de cada medida.",
  },
  soledad: {
    nombre: "Soledad",
    intro: "Pico y placa por dígito, restricción nocturna, tramos prohibidos del centro y medidas temporales de parrillero.",
    descripcion:
      "Pico y placa de motos en Soledad por último dígito, restricción nocturna de 11 p.m. a 5 a.m., tramos prohibidos del centro, exentos y multas. Con mapa y consulta por placa.",
  },
};

export function metadatosCiudad(m: Municipio): Metadata {
  const titulo = `Restricciones para motos en ${CIUDADES[m].nombre} ${ANIO}: horarios, parrillero y zonas`;
  return {
    title: titulo,
    description: CIUDADES[m].descripcion,
    alternates: { canonical: `/${m}` },
    openGraph: og({ title: titulo, description: CIUDADES[m].descripcion, url: `/${m}` }),
  };
}

export default function PaginaCiudad({ municipio }: { municipio: Municipio }) {
  const c = CIUDADES[municipio];
  const preguntas = PREGUNTAS[municipio];
  const otra: Municipio = municipio === "barranquilla" ? "soledad" : "barranquilla";

  return (
    <Pagina titulo={`Restricciones para motos en ${c.nombre} (${ANIO})`} intro={c.intro}>
      <JsonLd datos={[migas([["Inicio", "/"], [c.nombre, `/${municipio}`]]), preguntasFrecuentes(preguntas)]} />
      <EstadoHoy municipio={municipio} nombre={c.nombre} />

      <h2 className="pt-2 text-xl font-extrabold text-slate-900">Todas las reglas vigentes</h2>
      {REGLAS.filter((r) => r.municipio === municipio).map((r) => <ReglaTarjeta key={r.id} regla={r} />)}

      <h2 className="pt-2 text-xl font-extrabold text-slate-900">Preguntas frecuentes</h2>
      <div className="space-y-3">
        {preguntas.map(({ q, a }) => (
          <section key={q} className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-base font-bold text-slate-900">{q}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-slate-800">{a}</p>
          </section>
        ))}
      </div>

      <nav aria-label="Sigue leyendo" className="grid gap-3 sm:grid-cols-2">
        <Link href={`/${otra}`} className="flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-3 text-center text-sm font-bold text-yellow-300">Reglas de {CIUDADES[otra].nombre}</Link>
        <Link href="/aprende" className="flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 px-3 text-center text-sm font-bold text-yellow-300">Guías para motociclistas</Link>
      </nav>
    </Pagina>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Anuncio from "@/components/Anuncio";
import Pagina from "@/components/Pagina";
import { ARTICULOS } from "@/data/articulos";

export const metadata: Metadata = {
  title: "Guía para motociclistas",
  description: "Explicaciones cortas de las restricciones para motos en Barranquilla y Soledad: horario nocturno, parrillero, centro, documentos y multas.",
};

export default function Aprende() {
  return (
    <Pagina titulo="Aprende las reglas" intro="Explicaciones cortas, sin lenguaje de decreto, para rodar tranquilo.">
      <ul className="space-y-3">
        {ARTICULOS.map((a) => (
          <li key={a.slug}>
            <Link href={`/aprende/${a.slug}`} className="block rounded-2xl border border-slate-200 bg-white p-4">
              <span className="block text-lg font-bold leading-tight text-slate-900">{a.titulo}</span>
              <span className="mt-1 block text-sm text-slate-700">{a.resumen}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-3">
        {[["/barranquilla", "Reglas de Barranquilla"], ["/soledad", "Reglas de Soledad"]].map(([h, t]) => (
          <Link key={h} href={h} className="flex min-h-14 items-center justify-center rounded-2xl bg-slate-950 px-3 text-center text-sm font-bold text-yellow-300">{t}</Link>
        ))}
      </div>
      <Anuncio slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_APRENDE} />
    </Pagina>
  );
}

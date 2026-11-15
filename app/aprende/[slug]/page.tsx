import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Pagina from "@/components/Pagina";
import ReglaTarjeta from "@/components/ReglaTarjeta";
import { ARTICULOS } from "@/data/articulos";
import { REGLAS } from "@/data/reglas";

export function generateStaticParams() {
  return ARTICULOS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/aprende/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = ARTICULOS.find((x) => x.slug === slug);
  return a ? { title: a.titulo, description: a.resumen } : {};
}

export default function Page({ params }: PageProps<"/aprende/[slug]">) {
  return (
    <Suspense>
      <Articulo params={params} />
    </Suspense>
  );
}

async function Articulo({ params }: Pick<PageProps<"/aprende/[slug]">, "params">) {
  const { slug } = await params;
  const a = ARTICULOS.find((x) => x.slug === slug);
  if (!a) notFound();
  const reglas = REGLAS.filter((r) => a.reglas?.includes(r.id));

  return (
    <Pagina titulo={a.titulo} intro={a.resumen}>
      {a.secciones.map((s) => (
        <section key={s.titulo} className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-bold text-slate-900">{s.titulo}</h2>
          {s.parrafos?.map((p) => <p key={p} className="mt-2 text-[15px] leading-relaxed text-slate-800">{p}</p>)}
          {s.lista && (
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-slate-800">
              {s.lista.map((l) => <li key={l}>{l}</li>)}
            </ul>
          )}
        </section>
      ))}

      {reglas.length > 0 && (
        <>
          <h2 className="pt-2 text-lg font-extrabold text-slate-900">La norma, en detalle</h2>
          {reglas.map((r) => <ReglaTarjeta key={r.id} regla={r} />)}
        </>
      )}

      <Link href="/" className="flex min-h-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-yellow-300">Ver en el mapa</Link>
      <Link href="/aprende" className="block text-center text-sm font-semibold text-sky-800 underline">← Todas las guías</Link>
    </Pagina>
  );
}

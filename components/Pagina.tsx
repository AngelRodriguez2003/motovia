import { Suspense } from 'react';
import Link from 'next/link';
import Nav from './Nav';
import { SITIO } from '@/lib/sitio';

/** Marco de las páginas de lectura: cabecera, contenido con scroll y navegación inferior. */
export default function Pagina({ titulo, intro, children }: { titulo: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <main className="flex-1 overflow-y-auto">
        <header className="bg-slate-950 px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] text-white">
          <div className="mx-auto max-w-2xl">
            <Link href="/" className="text-sm font-bold text-yellow-300">{SITIO.nombre}</Link>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight">{titulo}</h1>
            {intro && <p className="mt-2 text-[15px] text-slate-300">{intro}</p>}
          </div>
        </header>
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-5">{children}</div>
        <footer className="mx-auto max-w-2xl px-4 pb-8 text-xs text-slate-600">
          {SITIO.nombre} es una guía informativa hecha a partir de decretos y comunicados públicos. No es un sitio oficial ni
          reemplaza el texto del decreto: ante la duda, manda lo que diga la autoridad de tránsito.
        </footer>
      </main>
      <Suspense><Nav /></Suspense>
    </div>
  );
}

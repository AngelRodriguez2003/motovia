'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', texto: 'Mapa', d: 'M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Zm0 0v13m6-10.5v13' },
  { href: '/placa', texto: 'Mi placa', d: 'M3 7h18v10H3V7Zm4 3v4m3-4h2a1 1 0 0 1 0 2h-2v2h3m3-4h3l-2 4' },
  { href: '/aprende', texto: 'Aprende', d: 'M4 5.5c2.5-1 5.5-1 8 .5 2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5v-13Zm8 .5v13' },
];

export default function Nav() {
  const ruta = usePathname();
  return (
    <nav aria-label="Principal" className="z-30 flex shrink-0 border-t border-slate-800 bg-slate-950 pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map((i) => {
        const activo = i.href === '/' ? ruta === '/' : ruta.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={activo ? 'page' : undefined}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${activo ? 'text-yellow-300' : 'text-slate-300'}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={i.d} /></svg>
            {i.texto}
          </Link>
        );
      })}
    </nav>
  );
}

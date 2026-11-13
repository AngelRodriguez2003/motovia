'use client';

import { useEffect, useRef } from 'react';
import { CONTACTO_PUBLICIDAD } from '@/data/patrocinadores';

const CLIENTE = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * Banner discreto. Con NEXT_PUBLIC_ADSENSE_CLIENT y un `slot` muestra AdSense;
 * si no, un espacio propio que invita a anunciar. Nunca va encima del mapa.
 */
export default function Anuncio({ slot, className = '' }: { slot?: string; className?: string }) {
  const cargado = useRef(false);
  useEffect(() => {
    if (!CLIENTE || !slot || cargado.current) return;
    cargado.current = true;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle ?? []).push({});
    } catch {}
  }, [slot]);

  return (
    <aside aria-label="Publicidad" className={className}>
      <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">Publicidad</p>
      {CLIENTE && slot ? (
        <ins className="adsbygoogle block" data-ad-client={CLIENTE} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
      ) : (
        <a href={CONTACTO_PUBLICIDAD} className="flex min-h-20 items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <span><span className="font-semibold text-slate-900">Tu negocio aquí.</span> Talleres, CDA, cascos y repuestos.</span>
          <span className="shrink-0 font-semibold text-sky-800 underline">Anunciar</span>
        </a>
      )}
    </aside>
  );
}

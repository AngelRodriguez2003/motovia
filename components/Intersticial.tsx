'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PATROCINADORES, type Patrocinador } from '@/data/patrocinadores';
import { puedeMostrar } from '@/lib/intersticial';

const CLAVE = 'motovia:anuncio-visto';

/** Cuenta el tiempo con la pestaña visible y decide si toca mostrar el anuncio en una pausa natural. */
export function useIntersticial(siguiendoUbicacion: boolean) {
  const [anuncio, setAnuncio] = useState<Patrocinador | null>(null);
  const activo = useRef(0);

  useEffect(() => {
    let ultimo = Date.now();
    const id = setInterval(() => {
      const ahora = Date.now();
      if (document.visibilityState === 'visible') activo.current += ahora - ultimo;
      ultimo = ahora;
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /** Llamar en una pausa natural (p. ej. al cerrar una ficha). */
  const enPausa = useCallback(() => {
    let yaMostrado = true;
    try {
      yaMostrado = sessionStorage.getItem(CLAVE) === '1';
    } catch {}
    if (!puedeMostrar({ msActivo: activo.current, yaMostrado, siguiendoUbicacion, hayPatrocinador: PATROCINADORES.length > 0 })) return;
    try {
      sessionStorage.setItem(CLAVE, '1');
    } catch {}
    setAnuncio(PATROCINADORES[Math.floor(Math.random() * PATROCINADORES.length)]);
  }, [siguiendoUbicacion]);

  return { anuncio, enPausa, cerrar: () => setAnuncio(null) };
}

export default function Intersticial({ anuncio, onCerrar }: { anuncio: Patrocinador; onCerrar: () => void }) {
  const boton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    boton.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onCerrar]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="anuncio-titulo" className="fixed inset-0 z-50 flex flex-col bg-slate-950 p-6 text-white">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-slate-400">Publicidad · {anuncio.nombre}</span>
        <button ref={boton} onClick={onCerrar} className="min-h-11 rounded-full bg-white/10 px-4 text-sm font-semibold">Cerrar ✕</button>
      </div>
      <div className="mx-auto flex max-w-md flex-1 flex-col justify-center gap-4">
        <h2 id="anuncio-titulo" className="text-3xl font-extrabold leading-tight text-yellow-300">{anuncio.titulo}</h2>
        <p className="text-lg text-slate-200">{anuncio.texto}</p>
        <a href={anuncio.url} target="_blank" rel="noopener noreferrer sponsored" className="mt-2 flex min-h-12 items-center justify-center rounded-xl bg-yellow-300 px-5 text-base font-bold text-slate-950">{anuncio.cta}</a>
        <button onClick={onCerrar} className="min-h-11 text-sm text-slate-300 underline">Volver al mapa</button>
      </div>
    </div>
  );
}

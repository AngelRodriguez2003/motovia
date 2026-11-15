'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { REGLAS, type Municipio } from '@/data/reglas';
import { digitosDe, hora12, reglasActivas, semaforo, TEXTO_EFECTO } from '@/lib/motor';
import { COLOR_EFECTO } from './ReglaTarjeta';

const COLOR = { rojo: '#dc2626', amarillo: '#f59e0b', verde: '#16a34a' };

/** Resumen de lo que aplica en este momento en una ciudad. Se calcula en el navegador con la hora real. */
export default function EstadoHoy({ municipio, nombre }: { municipio: Municipio; nombre: string }) {
  const [ahora, setAhora] = useState<Date | null>(null);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAhora(new Date()));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!ahora) return null;
  const activas = reglasActivas(REGLAS, ahora).filter((a) => a.regla.municipio === municipio && a.efecto !== 'aviso');
  const fecha = ahora.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota' });

  return (
    <section aria-label={`Qué aplica ahora en ${nombre}`} className="rounded-2xl bg-slate-950 p-4 text-white">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <span aria-hidden className="size-3 rounded-full" style={{ background: COLOR[semaforo(activas)] }} />
        Ahora en {nombre}
      </h2>
      <p className="text-sm text-slate-300">{fecha}, {hora12(ahora)}</p>
      {activas.length === 0 ? (
        <p className="mt-2 text-sm">No hay restricciones activas registradas a esta hora.</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm">
          {activas.map(({ regla, efecto }) => (
            <li key={regla.id} className="flex items-start gap-2">
              <span aria-hidden className="mt-1 size-3 shrink-0 rounded-sm" style={{ background: COLOR_EFECTO[efecto] }} />
              <span>
                <span className="font-semibold">{regla.titulo}:</span>{' '}
                {efecto === 'pico-placa' ? `no circulan placas terminadas en ${digitosDe(regla, ahora).join(' y ')}` : TEXTO_EFECTO[efecto].toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link href="/" className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-yellow-300 text-sm font-bold text-slate-950">Ver en el mapa</Link>
    </section>
  );
}

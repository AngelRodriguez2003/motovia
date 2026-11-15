'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { REGLAS, type Municipio } from '@/data/reglas';
import { aplicaPlaca, hayPicoYPlaca, momentoColombia, personalizar, reglasActivas, TEXTO_EFECTO } from '@/lib/motor';
import { COLOR_EFECTO } from './ReglaTarjeta';

const CLAVE = 'motovia:placa';
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const CIUDADES: [Municipio, string][] = [['barranquilla', 'Barranquilla'], ['soledad', 'Soledad']];

type Guardado = { ciudad: Municipio; digito: number | null };

function leer(): Guardado {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) ?? '');
    if (g && (g.ciudad === 'barranquilla' || g.ciudad === 'soledad')) return g;
  } catch {}
  return { ciudad: 'barranquilla', digito: null };
}

export default function ConsultaPlaca() {
  const [datos, setDatos] = useState<Guardado | null>(null);
  const [hoy, setHoy] = useState<Date | null>(null);

  // localStorage y la hora solo existen en el navegador: se leen tras montar.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setDatos(leer());
      setHoy(new Date());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function cambiar(g: Guardado) {
    setDatos(g);
    try {
      localStorage.setItem(CLAVE, JSON.stringify(g));
    } catch {}
  }

  if (!datos || !hoy) return <p className="text-sm text-slate-600">Cargando…</p>;

  const { ciudad, digito } = datos;
  const nombre = CIUDADES.find(([c]) => c === ciudad)![1];
  const conPico = hayPicoYPlaca(REGLAS, ciudad);
  const semana = Array.from({ length: 7 }, (_, i) => new Date(hoy.getTime() + i * 86_400_000));
  const pico = REGLAS.find((r) => r.municipio === ciudad && r.digitos);
  const generales = personalizar(reglasActivas(REGLAS, hoy), hoy, digito).filter((a) => a.regla.municipio === ciudad && a.efecto !== 'aviso');

  return (
    <>
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
        <legend className="sr-only">Ciudad</legend>
        <div className="grid grid-cols-2 gap-2">
          {CIUDADES.map(([c, t]) => (
            <button key={c} onClick={() => cambiar({ ...datos, ciudad: c })} aria-pressed={ciudad === c}
              className={`min-h-12 rounded-xl text-sm font-bold ${ciudad === c ? 'bg-slate-950 text-yellow-300' : 'bg-slate-100 text-slate-800'}`}>{t}</button>
          ))}
        </div>
        <p className="mb-2 mt-4 text-sm font-semibold text-slate-900">Último número de la placa</p>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 10 }, (_, d) => (
            <button key={d} onClick={() => cambiar({ ...datos, digito: d })} aria-pressed={digito === d}
              className={`min-h-12 rounded-xl text-lg font-extrabold ${digito === d ? 'bg-yellow-300 text-slate-950 ring-2 ring-slate-950' : 'bg-slate-100 text-slate-800'}`}>{d}</button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-600">Se guarda solo en este teléfono.</p>
      </fieldset>

      {digito !== null && (
        <section aria-live="polite" className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-bold text-slate-900">Placa terminada en {digito} · {nombre}</h2>
          {conPico ? (
            <>
              <ul className="mt-3 divide-y divide-slate-100">
                {semana.map((d, i) => {
                  const r = aplicaPlaca(REGLAS, digito, d, ciudad);
                  return (
                    <li key={i} className="flex items-center justify-between py-2 text-sm">
                      <span className={i === 0 ? 'font-bold' : ''}>{i === 0 ? 'Hoy' : DIAS[momentoColombia(d).dia]}</span>
                      <span className="font-semibold" style={{ color: r.length ? COLOR_EFECTO.prohibido : '#15803d' }}>
                        {r.length ? 'No circula de 5 a.m. a 10 p.m.' : 'Puede circular'}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {pico?.advertencia && <p className="mt-3 text-xs font-medium text-amber-800">⚠ {pico.advertencia}</p>}
              <p className="mt-2 text-xs text-slate-600">Aparte del pico y placa, de 11 p.m. a 5 a.m. rige la restricción nocturna para todas las placas.</p>
            </>
          ) : (
            <p className="mt-2 text-[15px] leading-relaxed text-slate-800">
              En {nombre} las restricciones para motos no dependen del número de la placa: aplican por zona y por hora, iguales para todos.
            </p>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Lo que sí aplica ahora en {nombre}</h2>
        {generales.length === 0 ? (
          <p className="mt-2 text-sm text-slate-700">No hay restricciones activas registradas a esta hora.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {generales.map(({ regla, efecto }) => (
              <li key={regla.id} className="flex items-start gap-2 text-sm">
                <span aria-hidden className="mt-1 size-3 shrink-0 rounded-sm" style={{ background: COLOR_EFECTO[efecto] }} />
                <span><span className="font-semibold text-slate-900">{regla.titulo}:</span> {TEXTO_EFECTO[efecto].toLowerCase()}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/" className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-yellow-300">Ver en el mapa</Link>
      </section>
    </>
  );
}

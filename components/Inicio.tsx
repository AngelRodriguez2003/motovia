'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { REGLAS, ULTIMA_REVISION, type Efecto, type Municipio, type Regla } from '@/data/reglas';
import {
  digitosDe, duracion, fechaColombia, hora12, masGrave, momentoColombia, personalizar, proximoCambio,
  reglasActivas, reglasVigentes, semaforo, TEXTO_EFECTO, type Activa, type Nivel,
} from '@/lib/motor';
import { CERCA_M, ZONAS, esMunicipio, ubicar } from '@/lib/zonas';
import Mapa, { type EstadoZona } from './Mapa';
import ReglaTarjeta, { COLOR_EFECTO } from './ReglaTarjeta';

type Filtro = 'todo' | 'circulacion' | 'parrillero';

const ETIQUETA: Record<string, string> = {
  'baq-centro': 'Centro',
  'baq-parrillero-norte': 'Sin parrillero hombre',
  'baq-transmetro': 'Transmetro',
  'baq-inscrito': 'Parrillero inscrito',
  'sol-centro': 'Centro de Soledad',
  'baq-portuario': 'Corredor portuario',
  'baq-municipio': 'Barranquilla',
  'sol-municipio': 'Soledad',
};
const CIUDAD: Record<Municipio, string> = { barranquilla: 'Barranquilla', soledad: 'Soledad' };
const COLOR_NIVEL: Record<Nivel, string> = { rojo: '#dc2626', amarillo: '#f59e0b', verde: '#16a34a' };
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

const efectosPosibles = (r: Regla): Efecto[] => [...(r.franjas ?? []).map((f) => f.efecto), ...(r.efectoBase ? [r.efectoBase] : [])];
const pasaFiltro = (r: Regla, f: Filtro) =>
  f === 'todo' ||
  efectosPosibles(r).some((e) => (f === 'circulacion' ? e === 'prohibido' || e === 'pico-placa' : e.includes('parrillero')));

function ubicacionSimulada(): [number, number] | null {
  const q = new URLSearchParams(window.location.search);
  const [lat, lng] = [Number(q.get('lat')), Number(q.get('lng'))];
  return q.has('lat') && q.has('lng') && Number.isFinite(lat) && Number.isFinite(lng) ? [lng, lat] : null;
}

/** Último dígito de la placa guardado en "Mi placa" (o null). */
function placaGuardada(): number | null {
  try {
    const d = JSON.parse(localStorage.getItem('motovia:placa') ?? 'null')?.digito;
    return Number.isInteger(d) ? d : null;
  } catch {
    return null;
  }
}

export default function Inicio() {
  const [digito] = useState(placaGuardada);
  const [ahora, setAhora] = useState(() => new Date());
  const [simulada, setSimulada] = useState<Date | null>(null);
  const [panelHora, setPanelHora] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>('todo');
  const [zona, setZona] = useState<string | null>(null);
  const [pos, setPos] = useState<[number, number] | null>(ubicacionSimulada);
  const [siguiendo, setSiguiendo] = useState(false);
  const [errorGps, setErrorGps] = useState<string | null>(null);
  const vigia = useRef<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => () => {
    if (vigia.current !== null) navigator.geolocation.clearWatch(vigia.current);
  }, []);

  const cuando = simulada ?? ahora;
  const vigentes = useMemo(() => reglasVigentes(REGLAS, cuando), [cuando]);
  const activas = useMemo(() => personalizar(reglasActivas(REGLAS, cuando), cuando, digito), [cuando, digito]);
  const cambio = useMemo(() => proximoCambio(vigentes, cuando), [vigentes, cuando]);

  const estados = useMemo(() => {
    const out: Record<string, EstadoZona> = {};
    for (const z of ZONAS) {
      const id = z.properties.id;
      const deZona = vigentes.filter((r) => r.zona === id && pasaFiltro(r, filtro));
      const peor = masGrave(activas.filter((a) => deZona.includes(a.regla) && a.efecto !== 'aviso'));
      // Un municipio entero solo se pinta cuando la prohibición lo cubre todo.
      const activo = !!peor && (!esMunicipio(id) || peor.efecto === 'prohibido');
      out[id] = {
        color: COLOR_EFECTO[activo ? peor!.efecto : 'inactiva'],
        activo,
        oculto: deZona.length === 0,
        etiqueta: ETIQUETA[id] ?? '',
      };
    }
    return out;
  }, [vigentes, activas, filtro]);

  const cerrarFicha = useCallback(() => setZona(null), []);

  const alTocarZona = useCallback((id: string | null) => {
    setPanelHora(false);
    setZona(id);
  }, []);

  function alternarUbicacion() {
    if (siguiendo || pos) {
      if (vigia.current !== null) navigator.geolocation.clearWatch(vigia.current);
      vigia.current = null;
      setSiguiendo(false);
      setPos(null);
      return;
    }
    if (!navigator.geolocation) return setErrorGps('Tu navegador no permite usar la ubicación.');
    setErrorGps(null);
    setSiguiendo(true);
    vigia.current = navigator.geolocation.watchPosition(
      (p) => setPos([p.coords.longitude, p.coords.latitude]),
      () => {
        setSiguiendo(false);
        setErrorGps('No pudimos obtener tu ubicación. Revisa el permiso del navegador.');
      },
      { enableHighAccuracy: true, maximumAge: 10_000 },
    );
  }

  const aviso = useMemo(() => (pos ? avisoUbicacion(pos, activas) : null), [pos, activas]);
  const reglasZona = zona ? vigentes.filter((r) => r.zona === zona) : [];
  const m = momentoColombia(cuando);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Mapa estados={estados} seleccion={zona} ubicacion={pos} onZona={alTocarZona} />

      {/* Estado "ahora mismo" */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <section aria-label="Estado ahora" className="pointer-events-auto mx-auto w-full max-w-xl rounded-2xl bg-slate-950/95 p-3 text-white shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <ul className="min-w-0 flex-1 space-y-1.5">
              {(['barranquilla', 'soledad'] as Municipio[]).map((mun) => (
                <li key={mun} className="flex items-start gap-2 text-sm leading-tight">
                  <span aria-hidden className="mt-1 size-3 shrink-0 rounded-full" style={{ background: COLOR_NIVEL[semaforo(activas, mun)] }} />
                  <span><span className="font-bold">{CIUDAD[mun]}:</span> {fraseEstado(mun, activas, vigentes, cuando, digito)}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => { setPanelHora((v) => !v); setZona(null); }}
              aria-expanded={panelHora}
              className={`min-h-11 shrink-0 rounded-xl px-3 text-sm font-bold ${simulada ? 'bg-yellow-300 text-slate-950' : 'bg-white/10 text-white'}`}
            >
              {simulada ? `${DIAS[m.dia]} ${hora12(cuando)}` : `Ahora · ${hora12(cuando)}`}
            </button>
          </div>
          {cambio && (
            <p className="mt-2 border-t border-white/10 pt-2 text-xs text-slate-300">
              En {duracion(cuando, cambio.cuando)} ({hora12(cambio.cuando)}) en {CIUDAD[cambio.regla.municipio]}: {cambio.regla.titulo.toLowerCase()}{' → '}
              {cambio.efecto ? TEXTO_EFECTO[cambio.efecto].toLowerCase() : 'deja de aplicar'}
            </p>
          )}
          {panelHora && <PanelHora cuando={cuando} simulada={!!simulada} onElegir={(d, cerrar) => { setSimulada(d); if (cerrar) setPanelHora(false); }} />}
        </section>

        <div role="group" aria-label="Filtrar restricciones" className="pointer-events-auto mx-auto flex w-full max-w-xl gap-2 overflow-x-auto">
          {([['todo', 'Todo'], ['circulacion', 'Dónde no circular'], ['parrillero', 'Parrillero']] as [Filtro, string][]).map(([f, t]) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              aria-pressed={filtro === f}
              className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold shadow ${filtro === f ? 'border-slate-950 bg-slate-950 text-yellow-300' : 'border-slate-300 bg-white text-slate-800'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Leyenda + ubicación */}
      {!zona && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-3">
          <div className="flex items-end justify-between gap-3">
            <ul aria-label="Leyenda" className="pointer-events-auto space-y-1 rounded-xl bg-white/95 p-2.5 text-xs font-medium text-slate-800 shadow">
              {(['prohibido', 'sin-parrillero', 'sin-parrillero-hombre', 'parrillero-inscrito', 'inactiva'] as const).map((e) => (
                <li key={e} className="flex items-center gap-2">
                  <span aria-hidden className="size-3 rounded-sm" style={{ background: COLOR_EFECTO[e] }} />
                  {e === 'inactiva' ? 'No aplica a esta hora' : TEXTO_EFECTO[e]}
                </li>
              ))}
            </ul>
            <button
              onClick={alternarUbicacion}
              aria-pressed={!!pos || siguiendo}
              aria-label={pos || siguiendo ? 'Dejar de mostrar mi ubicación' : 'Mostrar mi ubicación'}
              className={`pointer-events-auto flex size-14 items-center justify-center rounded-full shadow-lg ${pos || siguiendo ? 'bg-sky-700 text-white' : 'bg-white text-slate-900'}`}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="3.5" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
              </svg>
            </button>
          </div>
          {(aviso || errorGps || (siguiendo && !pos)) && (
            <div role="status" className="pointer-events-auto mx-auto w-full max-w-xl rounded-2xl bg-white p-3 text-sm shadow-lg" style={{ borderLeft: `6px solid ${aviso?.color ?? '#64748b'}` }}>
              {errorGps ?? (aviso ? (
                <button className="w-full text-left" disabled={!aviso.zona} onClick={() => aviso.zona && setZona(aviso.zona)}>
                  <span className="block font-bold text-slate-900">{aviso.titulo}</span>
                  <span className="text-slate-700">{aviso.detalle}{aviso.zona ? ' · Ver detalle' : ''}</span>
                </button>
              ) : 'Buscando tu ubicación…')}
            </div>
          )}
          <p className="pointer-events-auto mx-auto rounded-xl bg-white/90 px-3 py-1 text-center text-[11px] leading-snug text-slate-700 shadow">
            Guía informativa · revisada el {ULTIMA_REVISION.split('-').reverse().join('/')} · no reemplaza el decreto oficial
            <br />
            Mapa ©{' '}
            <a className="underline" href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> ©{' '}
            <a className="underline" href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> ©{' '}
            <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
          </p>
        </div>
      )}

      {/* Ficha */}
      {zona && (
        <section aria-label={`Restricciones en ${ETIQUETA[zona] ?? 'la zona'}`} className="absolute inset-x-0 bottom-0 z-20 mx-auto flex max-h-[72%] w-full max-w-xl flex-col rounded-t-3xl bg-slate-100 shadow-2xl">
          <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
            <h2 className="text-base font-extrabold text-slate-900">{ETIQUETA[zona] ?? 'Zona'}</h2>
            <button onClick={cerrarFicha} className="min-h-11 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white">Cerrar ✕</button>
          </header>
          <div className="space-y-3 overflow-y-auto px-4 pb-4">
            {reglasZona.length === 0 && <p className="rounded-2xl bg-white p-4 text-sm text-slate-700">No tenemos restricciones vigentes registradas para esta zona.</p>}
            {reglasZona.map((r) => <ReglaTarjeta key={r.id} regla={r} efecto={activas.find((a) => a.regla === r)?.efecto ?? null} />)}
          </div>
        </section>
      )}

    </div>
  );
}

function fraseEstado(mun: Municipio, activas: Activa[], vigentes: Regla[], cuando: Date, digito: number | null): string {
  const propias = activas.filter((a) => a.regla.municipio === mun);
  const total = propias.find((a) => a.efecto === 'prohibido' && esMunicipio(a.regla.zona));
  if (total) {
    const fin = proximoCambio([total.regla], cuando);
    const hasta = fin ? ` hasta las ${hora12(fin.cuando)}` : '';
    return total.regla.digitos ? `tu placa (${digito}) tiene pico y placa${hasta || '.'}` : `no se puede circular en moto${hasta || '.'}`;
  }
  const partes: string[] = [];
  const pico = propias.find((a) => a.efecto === 'pico-placa');
  if (pico) partes.push(`pico y placa para placas terminadas en ${digitosDe(pico.regla, cuando).join(' y ')}`);
  const n = propias.filter((a) => a.efecto !== 'aviso' && a.efecto !== 'pico-placa').length;
  if (n) partes.push(`${n} ${n === 1 ? 'zona o vía con restricción' : 'zonas o vías con restricción'}`);
  if (partes.length) return `puedes circular, con ${partes.join(' y ')}.`;
  const sinConfirmar = vigentes.some((r) => r.municipio === mun && !r.verificado);
  return `sin restricciones activas registradas${sinConfirmar ? ' (datos por confirmar)' : ''}.`;
}

function PanelHora({ cuando, simulada, onElegir }: { cuando: Date; simulada: boolean; onElegir: (d: Date | null, cerrar: boolean) => void }) {
  const { fecha, minutos } = momentoColombia(cuando);
  const hhmm = `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      <p className="mb-2 text-xs text-slate-300">¿Vas a salir más tarde? Mira cómo queda el mapa a otra hora.</p>
      <div className="flex flex-wrap gap-2">
        {[['06:00', '6 a.m.'], ['12:00', '12 m.'], ['19:00', '7 p.m.'], ['23:00', '11 p.m.']].map(([h, t]) => (
          <button key={h} onClick={() => onElegir(fechaColombia(fecha, h), true)} className="min-h-10 rounded-full bg-white/10 px-3.5 text-sm font-semibold">{t}</button>
        ))}
        <label className="flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-3.5 text-sm font-semibold">
          <span className="sr-only">Fecha y hora</span>
          <input
            type="datetime-local"
            value={`${fecha}T${hhmm}`}
            onChange={(e) => {
              const [f, h] = e.target.value.split('T');
              if (f && h) onElegir(fechaColombia(f, h.slice(0, 5)), false);
            }}
            className="bg-transparent text-white [color-scheme:dark]"
          />
        </label>
        {simulada && <button onClick={() => onElegir(null, true)} className="min-h-10 rounded-full bg-yellow-300 px-3.5 text-sm font-bold text-slate-950">Volver a ahora</button>}
      </div>
    </div>
  );
}

type Aviso = { titulo: string; detalle: string; color: string; zona: string | null };

function avisoUbicacion(pos: [number, number], activas: Activa[]): Aviso {
  const cerca = ubicar(pos);
  const efectoEn = (id: string) => masGrave(activas.filter((a) => a.regla.zona === id && a.efecto !== 'aviso'));

  const dentro = cerca
    .filter((c) => c.dentro)
    .map((c) => ({ c, a: efectoEn(c.id) }))
    .filter((x): x is { c: (typeof cerca)[number]; a: Activa } => !!x.a && (!esMunicipio(x.c.id) || x.a.efecto === 'prohibido'));
  const peor = masGrave(dentro.map((x) => x.a));
  if (peor) {
    return { titulo: `Estás en: ${ETIQUETA[peor.regla.zona] ?? peor.regla.titulo}`, detalle: TEXTO_EFECTO[peor.efecto], color: COLOR_EFECTO[peor.efecto], zona: peor.regla.zona };
  }

  const proxima = cerca
    .filter((c) => !c.dentro && !esMunicipio(c.id) && c.metros <= CERCA_M && efectoEn(c.id))
    .sort((a, b) => a.metros - b.metros)[0];
  if (proxima) {
    const a = efectoEn(proxima.id)!;
    return { titulo: `A ${Math.round(proxima.metros / 10) * 10} m: ${ETIQUETA[proxima.id] ?? a.regla.titulo}`, detalle: TEXTO_EFECTO[a.efecto], color: COLOR_EFECTO[a.efecto], zona: proxima.id };
  }

  const ciudad = cerca.find((c) => c.dentro && esMunicipio(c.id));
  return ciudad
    ? { titulo: 'Aquí no hay restricciones activas ahora', detalle: `Estás en ${ETIQUETA[ciudad.id]}.`, color: '#16a34a', zona: null }
    : { titulo: 'Estás fuera de Barranquilla y Soledad', detalle: 'Por ahora solo cubrimos estas dos ciudades.', color: '#64748b', zona: null };
}

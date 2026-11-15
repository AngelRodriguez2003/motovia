// Motor de reglas: funciones puras. Todo se evalúa en hora de Colombia (UTC-5, sin horario de verano).
import type { Efecto, Franja, Municipio, Regla } from '@/data/reglas';

export type Momento = {
  /** YYYY-MM-DD */
  fecha: string;
  /** 0 = domingo … 6 = sábado */
  dia: number;
  /** minutos desde medianoche */
  minutos: number;
};

const COL_OFFSET_MS = -5 * 60 * 60 * 1000;

export function momentoColombia(d: Date): Momento {
  const c = new Date(d.getTime() + COL_OFFSET_MS);
  return {
    fecha: c.toISOString().slice(0, 10),
    dia: c.getUTCDay(),
    minutos: c.getUTCHours() * 60 + c.getUTCMinutes(),
  };
}

/** Construye un Date real a partir de una fecha y hora de Colombia. */
export function fechaColombia(fecha: string, hhmm: string): Date {
  return new Date(`${fecha}T${hhmm}:00-05:00`);
}

const aMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const diaAnterior = (m: Momento): Momento => {
  const d = new Date(`${m.fecha}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return { fecha: d.toISOString().slice(0, 10), dia: (m.dia + 6) % 7, minutos: m.minutos };
};

const enVigencia = (r: Regla, fecha: string) =>
  fecha >= r.vigencia.desde && (!r.vigencia.hasta || fecha <= r.vigencia.hasta);

/**
 * ¿La franja cubre este momento? Una franja que cruza la medianoche pertenece
 * al día en que EMPIEZA: su tramo de madrugada se evalúa contra el día anterior.
 */
function franjaActiva(r: Regla, f: Franja, m: Momento): boolean {
  const [ini, fin] = [aMin(f.desde), aMin(f.hasta)];
  const diaOk = (x: Momento) => enVigencia(r, x.fecha) && (!f.dias || f.dias.includes(x.dia));
  if (ini <= fin) return diaOk(m) && m.minutos >= ini && m.minutos < fin;
  if (m.minutos >= ini) return diaOk(m);
  if (m.minutos < fin) return diaOk(diaAnterior(m));
  return false;
}

/** Efecto de una regla en un momento dado, o null si no aplica. */
export function efectoDe(r: Regla, m: Momento): Efecto | null {
  for (const f of r.franjas ?? []) if (franjaActiva(r, f, m)) return f.efecto;
  if (r.efectoBase && enVigencia(r, m.fecha)) return r.efectoBase;
  return null;
}

export type Activa = { regla: Regla; efecto: Efecto };

export function reglasActivas(reglas: Regla[], d: Date): Activa[] {
  const m = momentoColombia(d);
  return reglas.flatMap((regla) => {
    const efecto = efectoDe(regla, m);
    return efecto ? [{ regla, efecto }] : [];
  });
}

/** Reglas que hoy están publicadas (vigentes), apliquen o no a esta hora. */
export function reglasVigentes(reglas: Regla[], d: Date): Regla[] {
  const m = momentoColombia(d);
  return reglas.filter((r) => enVigencia(r, m.fecha) || efectoDe(r, m) !== null);
}

const PESO: Record<Efecto, number> = {
  prohibido: 4,
  'pico-placa': 3,
  'sin-parrillero': 2,
  'sin-parrillero-hombre': 2,
  'parrillero-inscrito': 1,
  aviso: 0,
};

export type Nivel = 'rojo' | 'amarillo' | 'verde';

/** Semáforo general: rojo si hay una prohibición que cubre un municipio entero. */
export function semaforo(activas: Activa[], municipio?: Municipio): Nivel {
  const propias = activas.filter((a) => !municipio || a.regla.municipio === municipio);
  if (propias.some((a) => a.efecto === 'prohibido' && a.regla.zona.endsWith('-municipio'))) return 'rojo';
  if (propias.some((a) => PESO[a.efecto] > 0)) return 'amarillo';
  return 'verde';
}

export const masGrave = (activas: Activa[]): Activa | undefined =>
  [...activas].sort((a, b) => PESO[b.efecto] - PESO[a.efecto])[0];

/** Próximo instante (en pasos de 1 min, hasta 48 h) en que cambia el efecto de alguna regla. */
export function proximoCambio(reglas: Regla[], d: Date): { cuando: Date; regla: Regla; efecto: Efecto | null } | null {
  const base = Math.floor(d.getTime() / 60000) * 60000;
  const actual = reglas.map((r) => efectoDe(r, momentoColombia(new Date(base))));
  for (let i = 1; i <= 48 * 60; i++) {
    const t = new Date(base + i * 60000);
    const m = momentoColombia(t);
    for (let j = 0; j < reglas.length; j++) {
      const e = efectoDe(reglas[j], m);
      if (e !== actual[j]) return { cuando: t, regla: reglas[j], efecto: e };
    }
  }
  return null;
}

/** Pico y placa: reglas por dígito que aplican a esta placa en este día. */
export function aplicaPlaca(reglas: Regla[], digito: number, d: Date, municipio: Municipio): Regla[] {
  const m = momentoColombia(d);
  return reglas.filter(
    (r) => r.municipio === municipio && r.digitos && enVigencia(r, m.fecha) && (r.digitos[m.dia] ?? []).includes(digito),
  );
}

/** Dígitos con pico y placa en la fecha dada (vacío si ese día no hay). */
export function digitosDe(r: Regla, d: Date): number[] {
  return r.digitos?.[momentoColombia(d).dia] ?? [];
}

/**
 * Ajusta el pico y placa a la placa del usuario: si su dígito está restringido, para él
 * es una prohibición; si no lo está, la regla no le aplica. Sin dígito, se deja igual.
 */
export function personalizar(activas: Activa[], d: Date, digito: number | null): Activa[] {
  if (digito === null) return activas;
  return activas.flatMap((a) => {
    if (a.efecto !== 'pico-placa') return [a];
    return digitosDe(a.regla, d).includes(digito) ? [{ ...a, efecto: 'prohibido' as const }] : [];
  });
}

export const hayPicoYPlaca = (reglas: Regla[], municipio: Municipio) =>
  reglas.some((r) => r.municipio === municipio && r.digitos);

export function duracion(desde: Date, hasta: Date): string {
  const min = Math.max(0, Math.round((hasta.getTime() - desde.getTime()) / 60000));
  if (min < 1) return 'menos de 1 min';
  const h = Math.floor(min / 60);
  return h ? `${h} h ${min % 60 ? `${min % 60} min` : ''}`.trim() : `${min} min`;
}

export function hora12(d: Date): string {
  const { minutos } = momentoColombia(d);
  const h = Math.floor(minutos / 60);
  const mm = String(minutos % 60).padStart(2, '0');
  return `${h % 12 || 12}:${mm} ${h < 12 ? 'a.m.' : 'p.m.'}`;
}

export const TEXTO_EFECTO: Record<Efecto, string> = {
  prohibido: 'Prohibido circular',
  'sin-parrillero': 'Solo sin parrillero',
  'sin-parrillero-hombre': 'Sin parrillero hombre',
  'parrillero-inscrito': 'Parrillero solo inscrito',
  'pico-placa': 'Pico y placa',
  aviso: 'Ten en cuenta',
};

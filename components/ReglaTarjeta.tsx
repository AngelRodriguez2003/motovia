import type { Efecto, Regla } from '@/data/reglas';
import { TEXTO_EFECTO } from '@/lib/motor';

export const COLOR_EFECTO: Record<Efecto | 'inactiva', string> = {
  prohibido: '#dc2626',
  'sin-parrillero': '#ea580c',
  'sin-parrillero-hombre': '#7c3aed',
  aviso: '#0369a1',
  inactiva: '#64748b',
};

const fechaLarga = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Ficha educativa de una regla. `efecto` = cómo aplica en el momento consultado (null = no aplica a esa hora). */
export default function ReglaTarjeta({ regla, efecto }: { regla: Regla; efecto?: Efecto | null }) {
  const color = COLOR_EFECTO[efecto ?? 'inactiva'];
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-800">
      {efecto !== undefined && (
        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ background: color }}>
          {efecto ? TEXTO_EFECTO[efecto] : 'No aplica a esta hora'}
        </p>
      )}
      <h3 className="text-lg font-bold leading-tight text-slate-900">{regla.titulo}</h3>
      <p className="mt-1.5 text-[15px] leading-snug">{regla.resumen}</p>

      {regla.franjas && regla.franjas.length > 0 && (
        <dl className="mt-3 text-sm">
          <dt className="font-semibold text-slate-900">Horario</dt>
          {regla.franjas.map((f) => (
            <dd key={f.desde + f.hasta}>
              {hora(f.desde)} a {hora(f.hasta)}: {TEXTO_EFECTO[f.efecto].toLowerCase()}
              {regla.efectoBase && ` · resto del día: ${TEXTO_EFECTO[regla.efectoBase].toLowerCase()}`}
            </dd>
          ))}
        </dl>
      )}

      {regla.excepciones.length > 0 && (
        <div className="mt-3 text-sm">
          <p className="font-semibold text-slate-900">Excepciones</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {regla.excepciones.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </div>
      )}

      {regla.multa && (
        <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-sm text-amber-950">
          <span className="font-semibold">Si te paran: </span>{regla.multa}
        </p>
      )}
      {regla.porque && (
        <p className="mt-3 text-sm text-slate-600"><span className="font-semibold text-slate-900">¿Por qué existe? </span>{regla.porque}</p>
      )}

      <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
        Fuente:{' '}
        <a className="font-medium text-sky-800 underline" href={regla.fuente.url} target="_blank" rel="noopener noreferrer">{regla.fuente.decreto}</a>
        {' · '}Vigente desde el {fechaLarga(regla.vigencia.desde)}{regla.vigencia.hasta ? ` hasta el ${fechaLarga(regla.vigencia.hasta)}` : ''}
        {' · '}Revisado el {fechaLarga(regla.revisadoEl)}
      </p>
      {!regla.verificado && (
        <p className="mt-1.5 text-xs font-medium text-amber-800">
          ⚠ Pendiente de verificar contra el decreto oficial. Úsalo como guía, no como prueba.
        </p>
      )}
    </article>
  );
}

function hora(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h < 12 ? 'a.m.' : 'p.m.'}`;
}

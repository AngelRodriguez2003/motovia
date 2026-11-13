import { describe, expect, it } from 'vitest';
import { REGLAS } from '@/data/reglas';
import { aplicaPlaca, efectoDe, fechaColombia, momentoColombia, proximoCambio, reglasActivas, semaforo } from './motor';

const regla = (id: string) => REGLAS.find((r) => r.id === id)!;
const en = (fecha: string, hhmm: string) => fechaColombia(fecha, hhmm);
const efecto = (id: string, fecha: string, hhmm: string) => efectoDe(regla(id), momentoColombia(en(fecha, hhmm)));

describe('hora de Colombia', () => {
  it('convierte desde UTC', () => {
    expect(momentoColombia(new Date('2026-11-13T04:30:00Z'))).toEqual({ fecha: '2026-11-12', dia: 4, minutos: 23 * 60 + 30 });
  });
});

describe('restricción nocturna de Barranquilla', () => {
  it('empieza a las 11:00 p.m. en punto', () => {
    expect(efecto('baq-nocturna', '2026-11-12', '22:59')).toBeNull();
    expect(efecto('baq-nocturna', '2026-11-12', '23:00')).toBe('prohibido');
  });
  it('termina a las 5:00 a.m. en punto', () => {
    expect(efecto('baq-nocturna', '2026-11-13', '04:59')).toBe('prohibido');
    expect(efecto('baq-nocturna', '2026-11-13', '05:00')).toBeNull();
  });
  it('la madrugada del día siguiente al fin de vigencia sigue cubierta; la noche siguiente no', () => {
    expect(efecto('baq-nocturna', '2027-11-01', '02:00')).toBe('prohibido');
    expect(efecto('baq-nocturna', '2027-11-01', '23:30')).toBeNull();
  });
  it('pone el semáforo en rojo', () => {
    expect(semaforo(reglasActivas(REGLAS, en('2026-11-12', '23:30')), 'barranquilla')).toBe('rojo');
    expect(semaforo(reglasActivas(REGLAS, en('2026-11-12', '10:00')), 'barranquilla')).toBe('amarillo');
  });
});

describe('centro', () => {
  it('de 6 a.m. a 7 p.m. se entra sin parrillero; fuera de eso está prohibido', () => {
    expect(efecto('baq-centro', '2026-11-12', '05:59')).toBe('prohibido');
    expect(efecto('baq-centro', '2026-11-12', '06:00')).toBe('sin-parrillero');
    expect(efecto('baq-centro', '2026-11-12', '18:59')).toBe('sin-parrillero');
    expect(efecto('baq-centro', '2026-11-12', '19:00')).toBe('prohibido');
  });
});

describe('medidas temporales', () => {
  it('Halloween en Soledad solo rige esa noche', () => {
    expect(efecto('sol-halloween-2026', '2026-10-31', '17:59')).toBeNull();
    expect(efecto('sol-halloween-2026', '2026-10-31', '20:00')).toBe('sin-parrillero');
    expect(efecto('sol-halloween-2026', '2026-11-01', '05:30')).toBe('sin-parrillero');
    expect(efecto('sol-halloween-2026', '2026-11-01', '06:00')).toBeNull();
    expect(efecto('sol-halloween-2026', '2026-11-01', '20:00')).toBeNull();
    expect(efecto('sol-halloween-2026', '2026-10-31', '03:00')).toBeNull();
  });
  it('parrillero hombre vence con el año', () => {
    expect(efecto('baq-parrillero-hombre', '2026-12-31', '12:00')).toBe('sin-parrillero-hombre');
    expect(efecto('baq-parrillero-hombre', '2027-01-01', '12:00')).toBeNull();
  });
});

describe('próximo cambio', () => {
  it('a las 8:45 p.m. el siguiente cambio es la nocturna a las 11 p.m.', () => {
    const c = proximoCambio(REGLAS, en('2026-11-12', '20:45'))!;
    expect(c.regla.id).toBe('baq-nocturna');
    expect(c.efecto).toBe('prohibido');
    expect(c.cuando.getTime()).toBe(en('2026-11-12', '23:00').getTime());
  });
});

describe('placa', () => {
  it('sin reglas por dígito no aplica nada', () => {
    expect(aplicaPlaca(REGLAS, 4, en('2026-11-12', '10:00'), 'soledad')).toEqual([]);
  });
  it('aplica el dígito del día', () => {
    const pyp = { ...regla('sol-general'), id: 'x', digitos: { 4: [2, 4] } };
    expect(aplicaPlaca([pyp], 4, en('2026-11-12', '10:00'), 'soledad')).toHaveLength(1);
    expect(aplicaPlaca([pyp], 5, en('2026-11-12', '10:00'), 'soledad')).toHaveLength(0);
    expect(aplicaPlaca([pyp], 4, en('2026-11-13', '10:00'), 'soledad')).toHaveLength(0);
  });
});

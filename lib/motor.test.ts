import { describe, expect, it } from 'vitest';
import { REGLAS } from '@/data/reglas';
import { aplicaPlaca, digitosDe, efectoDe, fechaColombia, momentoColombia, personalizar, proximoCambio, reglasActivas, semaforo } from './motor';

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
  it('está prohibido a toda hora (los tramos diurnos son excepción, no regla)', () => {
    expect(efecto('baq-centro', '2026-11-12', '03:00')).toBe('prohibido');
    expect(efecto('baq-centro', '2026-11-12', '12:00')).toBe('prohibido');
  });
});

describe('Soledad', () => {
  it('pico y placa: lunes a viernes de 5 a.m. a 10 p.m.', () => {
    expect(efecto('sol-pico-placa', '2026-11-13', '04:59')).toBeNull(); // viernes
    expect(efecto('sol-pico-placa', '2026-11-13', '05:00')).toBe('pico-placa');
    expect(efecto('sol-pico-placa', '2026-11-13', '21:59')).toBe('pico-placa');
    expect(efecto('sol-pico-placa', '2026-11-13', '22:00')).toBeNull();
    expect(efecto('sol-pico-placa', '2026-11-14', '12:00')).toBeNull(); // sábado
  });
  it('dígitos por día', () => {
    const r = regla('sol-pico-placa');
    expect(digitosDe(r, en('2026-11-09', '10:00'))).toEqual([1, 3]); // lunes
    expect(digitosDe(r, en('2026-11-13', '10:00'))).toEqual([9, 0]); // viernes
    expect(digitosDe(r, en('2026-11-15', '10:00'))).toEqual([]); // domingo
    expect(aplicaPlaca(REGLAS, 9, en('2026-11-13', '10:00'), 'soledad')).toHaveLength(1);
    expect(aplicaPlaca(REGLAS, 9, en('2026-11-13', '10:00'), 'barranquilla')).toHaveLength(0);
  });
  it('con la placa del usuario: su dígito es prohibición, los demás quedan libres', () => {
    const viernes = en('2026-11-13', '10:00');
    const activas = reglasActivas(REGLAS, viernes);
    expect(semaforo(activas, 'soledad')).toBe('amarillo');
    expect(semaforo(personalizar(activas, viernes, 9), 'soledad')).toBe('rojo');
    expect(personalizar(activas, viernes, 5).some((a) => a.regla.id === 'sol-pico-placa')).toBe(false);
  });
  it('restricción nocturna de 11 p.m. a 5 a.m.', () => {
    expect(efecto('sol-nocturna', '2026-11-14', '22:59')).toBeNull();
    expect(efecto('sol-nocturna', '2026-11-14', '23:00')).toBe('prohibido');
    expect(efecto('sol-nocturna', '2026-11-15', '04:59')).toBe('prohibido');
  });
});

describe('parrillero inscrito', () => {
  it('rige las 24 horas y no pone el semáforo en rojo', () => {
    expect(efecto('baq-inscrito', '2026-11-12', '03:00')).toBe('parrillero-inscrito');
    expect(efecto('baq-inscrito', '2026-11-12', '15:00')).toBe('parrillero-inscrito');
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
    const c = proximoCambio(REGLAS.filter((r) => r.municipio === 'barranquilla'), en('2026-11-12', '20:45'))!;
    expect(c.regla.id).toBe('baq-nocturna');
    expect(c.efecto).toBe('prohibido');
    expect(c.cuando.getTime()).toBe(en('2026-11-12', '23:00').getTime());
  });
});

describe('placa', () => {
  it('Barranquilla no tiene pico y placa de motos', () => {
    expect(aplicaPlaca(REGLAS, 4, en('2026-11-12', '10:00'), 'barranquilla')).toEqual([]);
  });
});

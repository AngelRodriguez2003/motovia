import { describe, expect, it } from 'vitest';
import { puedeMostrar } from './intersticial';

const base = { msActivo: 200_000, yaMostrado: false, siguiendoUbicacion: false, hayPatrocinador: true };

describe('anuncio de pantalla completa', () => {
  it('no aparece antes del tiempo mínimo', () => {
    expect(puedeMostrar({ ...base, msActivo: 179_999 }, 180_000)).toBe(false);
    expect(puedeMostrar({ ...base, msActivo: 180_000 }, 180_000)).toBe(true);
  });
  it('solo una vez por sesión', () => {
    expect(puedeMostrar({ ...base, yaMostrado: true }, 180_000)).toBe(false);
  });
  it('nunca con la ubicación en seguimiento', () => {
    expect(puedeMostrar({ ...base, siguiendoUbicacion: true }, 180_000)).toBe(false);
  });
  it('sin patrocinadores no hay anuncio', () => {
    expect(puedeMostrar({ ...base, hayPatrocinador: false }, 180_000)).toBe(false);
  });
});

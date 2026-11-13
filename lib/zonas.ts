import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { lineString, point } from '@turf/helpers';
import { pointToLineDistance } from '@turf/point-to-line-distance';
import datos from '@/data/zonas/zonas.json';

type Pos = [number, number];
export type Zona = {
  type: 'Feature';
  properties: { id: string };
  geometry: { type: 'Polygon'; coordinates: Pos[][] } | { type: 'MultiLineString'; coordinates: Pos[][] };
};

export const ZONAS = (datos as unknown as { features: Zona[] }).features;

export const esMunicipio = (id: string) => id.endsWith('-municipio');
export const esVia = (z: Zona) => z.geometry.type === 'MultiLineString';

/** Distancia a la que se considera que estás "sobre" una vía (m). */
export const SOBRE_VIA_M = 35;
/** Distancia para avisar que una zona está cerca (m). */
export const CERCA_M = 300;

export type Cercania = { id: string; dentro: boolean; metros: number };

/** Para cada zona: si el punto está dentro (o sobre la vía) y a cuántos metros queda. */
export function ubicar(lngLat: Pos, zonas: Zona[] = ZONAS): Cercania[] {
  const p = point(lngLat);
  return zonas.map((z) => {
    const lineas = z.geometry.coordinates.filter((l) => l.length > 1);
    const metros = Math.min(...lineas.map((l) => pointToLineDistance(p, lineString(l), { units: 'meters' })));
    if (z.geometry.type === 'Polygon') {
      const dentro = booleanPointInPolygon(p, z.geometry);
      return { id: z.properties.id, dentro, metros: dentro ? 0 : metros };
    }
    return { id: z.properties.id, dentro: metros <= SOBRE_VIA_M, metros };
  });
}

'use client';

import { useEffect, useRef } from 'react';
import { Map as MapLibre, Marker, setWorkerUrl, type GeoJSONSource } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ZONAS, esMunicipio, esVia } from '@/lib/zonas';

setWorkerUrl('/maplibre-gl-worker.mjs');

export type EstadoZona = { color: string; activo: boolean; oculto: boolean; etiqueta: string };

type Props = {
  estados: Record<string, EstadoZona>;
  seleccion: string | null;
  ubicacion: [number, number] | null;
  onZona: (id: string | null) => void;
};

const CENTRO: [number, number] = [-74.806, 10.975];

function coleccion(estados: Props['estados'], seleccion: string | null) {
  return {
    type: 'FeatureCollection' as const,
    features: ZONAS.map((z) => {
      const e = estados[z.properties.id];
      return {
        ...z,
        properties: {
          id: z.properties.id,
          clase: esMunicipio(z.properties.id) ? 'mun' : esVia(z) ? 'via' : 'zona',
          color: e?.color ?? '#94a3b8',
          activo: !!e?.activo,
          oculto: !e || e.oculto,
          sel: seleccion === z.properties.id,
          etiqueta: e?.etiqueta ?? '',
        },
      };
    }),
  };
}

export default function Mapa({ estados, seleccion, ubicacion, onZona }: Props) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapLibre | null>(null);
  const marcador = useRef<Marker | null>(null);
  const centrado = useRef(false);
  const alTocar = useRef(onZona);
  const datos = useRef(coleccion(estados, seleccion));

  useEffect(() => {
    alTocar.current = onZona;
  }, [onZona]);

  useEffect(() => {
    const m = new MapLibre({
      container: caja.current!,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: CENTRO,
      zoom: 11.4,
      minZoom: 9,
      maxBounds: [[-75.25, 10.6], [-74.4, 11.3]],
      // La atribución del mapa se muestra en la interfaz (Inicio.tsx) para que no tape la leyenda.
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    m.touchZoomRotate.disableRotation();
    mapa.current = m;

    // 'style.load' llega antes que 'load' (no espera las teselas), así las zonas aparecen de inmediato.
    m.once('style.load', () => {
      const visible = ['!', ['get', 'oculto']] as never;
      const de = (clase: string) => ['all', ['==', ['get', 'clase'], clase], visible] as never;
      const opacidad = (on: number, off: number) => ['case', ['get', 'activo'], on, off] as never;

      m.addSource('zonas', { type: 'geojson', data: datos.current as never });
      m.addLayer({ id: 'mun-relleno', type: 'fill', source: 'zonas', filter: de('mun'), paint: { 'fill-color': ['get', 'color'], 'fill-opacity': opacidad(0.16, 0) } });
      m.addLayer({ id: 'mun-borde', type: 'line', source: 'zonas', filter: ['==', ['get', 'clase'], 'mun'], paint: { 'line-color': '#475569', 'line-width': 1.2, 'line-dasharray': [3, 2] } });
      m.addLayer({ id: 'zona-relleno', type: 'fill', source: 'zonas', filter: de('zona'), paint: { 'fill-color': ['get', 'color'], 'fill-opacity': opacidad(0.3, 0.1) } });
      m.addLayer({ id: 'zona-borde', type: 'line', source: 'zonas', filter: de('zona'), paint: { 'line-color': ['get', 'color'], 'line-width': ['case', ['get', 'sel'], 4, 2] } });
      m.addLayer({ id: 'via-fondo', type: 'line', source: 'zonas', filter: de('via'), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 15, 11] } });
      m.addLayer({ id: 'via', type: 'line', source: 'zonas', filter: de('via'), layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': ['interpolate', ['linear'], ['zoom'], 10, ['case', ['get', 'sel'], 4, 2.5], 15, ['case', ['get', 'sel'], 9, 6]] } });
      m.addLayer({
        id: 'zona-nombre', type: 'symbol', source: 'zonas', filter: de('zona'), minzoom: 11,
        layout: { 'text-field': ['get', 'etiqueta'], 'text-font': ['Noto Sans Bold'], 'text-size': 12, 'text-max-width': 8 },
        paint: { 'text-color': '#0f172a', 'text-halo-color': '#ffffff', 'text-halo-width': 1.6 },
      });

      m.on('click', (e) => {
        const r = 10;
        const caja: [[number, number], [number, number]] = [[e.point.x - r, e.point.y - r], [e.point.x + r, e.point.y + r]];
        const f = m.queryRenderedFeatures(caja, { layers: ['via', 'zona-relleno'] })[0]
          ?? m.queryRenderedFeatures(e.point, { layers: ['mun-relleno'] })[0];
        alTocar.current((f?.properties?.id as string) ?? null);
      });
    });

    return () => {
      m.remove();
      mapa.current = null;
      marcador.current = null;
      centrado.current = false;
    };
  }, []);

  useEffect(() => {
    datos.current = coleccion(estados, seleccion);
    const src = mapa.current?.getSource('zonas') as GeoJSONSource | undefined;
    src?.setData(datos.current as never);
  }, [estados, seleccion]);

  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    if (!ubicacion) {
      marcador.current?.remove();
      marcador.current = null;
      centrado.current = false;
      return;
    }
    if (!marcador.current) {
      const el = document.createElement('div');
      el.className = 'punto-ubicacion';
      marcador.current = new Marker({ element: el }).setLngLat(ubicacion).addTo(m);
    } else marcador.current.setLngLat(ubicacion);
    if (!centrado.current) {
      centrado.current = true;
      m.flyTo({ center: ubicacion, zoom: 14.5 });
    }
  }, [ubicacion]);

  // MapLibre fuerza `position: relative` en su contenedor; por eso el tamaño lo da el div exterior.
  return (
    <div className="absolute inset-0">
      <div ref={caja} className="h-full w-full" role="application" aria-label="Mapa de restricciones para motos" />
    </div>
  );
}

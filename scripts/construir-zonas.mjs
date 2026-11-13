// Genera data/zonas/zonas.json. Uso: npm run zonas
// Vías: teselas vectoriales de OpenFreeMap (datos de OpenStreetMap). Límites municipales: Nominatim.
// Las zonas son una APROXIMACIÓN trazada sobre las vías que nombra cada decreto.
import { writeFileSync } from 'node:fs';
import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader } from 'pbf';

const BB = { sur: 10.85, oeste: -74.95, norte: 11.12, este: -74.72 };
const Z = 14;
const UA = { 'User-Agent': 'zonas-builder/0.1' };

const tx = (lon) => Math.floor(((lon + 180) / 360) * 2 ** Z);
const ty = (lat) => Math.floor(((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * 2 ** Z);

const plantilla = (await (await fetch('https://tiles.openfreemap.org/planet', { headers: UA })).json()).tiles[0];
const teselas = [];
for (let x = tx(BB.oeste); x <= tx(BB.este); x++) for (let y = ty(BB.norte); y <= ty(BB.sur); y++) teselas.push([x, y]);
console.log(`descargando ${teselas.length} teselas z${Z}…`);

/** nombre de vía → lista de líneas [[lon, lat], …] */
const porNombre = new Map();
const buses = [];
const lineas = (f, x, y) => {
  const g = f.toGeoJSON(x, y, Z).geometry;
  return g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
};
async function tesela([x, y]) {
  const r = await fetch(plantilla.replace('{z}', Z).replace('{x}', x).replace('{y}', y), { headers: UA });
  if (!r.ok) return;
  const t = new VectorTile(new PbfReader(new Uint8Array(await r.arrayBuffer())));
  const nombres = t.layers.transportation_name;
  for (let i = 0; i < (nombres?.length ?? 0); i++) {
    const f = nombres.feature(i);
    const n = f.properties.name;
    if (!n) continue;
    if (!porNombre.has(n)) porNombre.set(n, []);
    porNombre.get(n).push(...lineas(f, x, y));
  }
  const vias = t.layers.transportation;
  for (let i = 0; i < (vias?.length ?? 0); i++) {
    const f = vias.feature(i);
    if (f.properties.class === 'busway') buses.push(...lineas(f, x, y));
  }
}
for (let i = 0; i < teselas.length; i += 8) await Promise.all(teselas.slice(i, i + 8).map(tesela));

// Añade un punto cada ~15 m para que los cruces entre vías se ubiquen con precisión.
function densificar(l) {
  const out = [];
  for (let i = 0; i < l.length - 1; i++) {
    const n = Math.max(1, Math.round(metros(l[i], l[i + 1]) / 15));
    for (let k = 0; k < n; k++) out.push([l[i][0] + ((l[i + 1][0] - l[i][0]) * k) / n, l[i][1] + ((l[i + 1][1] - l[i][1]) * k) / n]);
  }
  out.push(l.at(-1));
  return out;
}
const vias = (re) => {
  const out = [...porNombre].filter(([n]) => new RegExp(re).test(n)).flatMap(([, ls]) => ls).filter((l) => l.length > 1).map(densificar);
  if (!out.length) throw new Error(`sin geometría para ${re}`);
  return out;
};

async function limite(nombre) {
  const u = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(nombre)}&state=Atl%C3%A1ntico&country=Colombia&format=jsonv2&polygon_geojson=1&polygon_threshold=0.0003&limit=5`;
  const rs = await (await fetch(u, { headers: UA })).json();
  const g = rs.find((r) => r.osm_type === 'relation' && r.type === 'administrative')?.geojson;
  if (!g) throw new Error(`sin límite para ${nombre}`);
  await new Promise((s) => setTimeout(s, 1100)); // política de uso de Nominatim: 1 consulta por segundo
  const anillos = g.type === 'Polygon' ? [g.coordinates[0]] : g.coordinates.map((p) => p[0]);
  const mayor = anillos.sort((a, b) => b.length - a.length)[0];
  console.log(`límite ${nombre}: ${mayor.length} puntos`);
  return mayor;
}

const d2 = (a, b) => {
  const kx = Math.cos((a[1] * Math.PI) / 180);
  return ((a[0] - b[0]) * kx) ** 2 + (a[1] - b[1]) ** 2;
};
const metros = (a, b) => Math.sqrt(d2(a, b)) * 111320;

// Punto de cruce (aprox.) entre dos vías: par de vértices más cercano.
function cruce(A, B, nombre) {
  let best = [Infinity, null];
  for (const la of A) for (const a of la) for (const lb of B) for (const b of lb) {
    const d = d2(a, b);
    if (d < best[0]) best = [d, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]];
  }
  console.log(`cruce ${nombre}: ${best[1].map((n) => n.toFixed(5))} (separación ${(Math.sqrt(best[0]) * 111320).toFixed(0)} m)`);
  return best[1];
}

// Traza una vía entre dos puntos: proyecta sus vértices sobre el eje desde→hasta,
// los agrupa en tramos de ~80 m y promedia cada grupo (así una doble calzada queda como una sola línea).
function cadena(lineas, desde, hasta) {
  const kx = Math.cos((desde[1] * Math.PI) / 180);
  const [ex, ey] = [(hasta[0] - desde[0]) * kx, hasta[1] - desde[1]];
  const largo2 = ex * ex + ey * ey;
  const largo = Math.sqrt(largo2) * 111320;
  const grupos = new Map();
  for (const p of lineas.flat()) {
    const [px, py] = [(p[0] - desde[0]) * kx, p[1] - desde[1]];
    const t = (px * ex + py * ey) / largo2;
    const desvio = (Math.abs(px * ey - py * ex) / Math.sqrt(largo2)) * 111320;
    if (t <= 0.01 || t >= 0.99 || desvio > largo * 0.45) continue;
    const k = Math.floor((t * largo) / 80);
    const g = grupos.get(k) ?? [0, 0, 0];
    grupos.set(k, [g[0] + p[0], g[1] + p[1], g[2] + 1]);
  }
  const medio = [...grupos].sort((a, b) => a[0] - b[0]).map(([, g]) => [g[0] / g[2], g[1] / g[2]]);
  return simplificar([desde, ...medio, hasta], 30);
}

// Douglas-Peucker en metros.
function simplificar(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = distSeg(pts[i], a, b);
    if (d > max) { max = d; idx = i; }
  }
  if (max <= tol) return [a, b];
  return [...simplificar(pts.slice(0, idx + 1), tol).slice(0, -1), ...simplificar(pts.slice(idx), tol)];
}
function distSeg(p, a, b) {
  const kx = Math.cos((p[1] * Math.PI) / 180) * 111320, ky = 111320;
  const [px, py, ax, ay, bx, by] = [p[0] * kx, p[1] * ky, a[0] * kx, a[1] * ky, b[0] * kx, b[1] * ky];
  const l2 = (bx - ax) ** 2 + (by - ay) ** 2;
  const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2)) : 0;
  return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)));
}

const r5 = (c) => (typeof c[0] === 'number' ? [+c[0].toFixed(5), +c[1].toFixed(5)] : c.map(r5));
const feat = (id, type, coordinates) => ({ type: 'Feature', properties: { id }, geometry: { type, coordinates: r5(coordinates) } });

const cl30 = vias('^Avenida Calle 30$'), cr46 = vias('^Avenida Carrera 46$'), cr38 = vias('^(Avenida )?Carrera 38$');
const cl45 = vias('^Avenida Murillo$'), cl72 = vias('^Calle 72$'), cr65 = vias('^Carrera 65$');
const circ = vias('^Avenida Circunvalar$'), portuaria = vias('^(Corredor Portuario|Avenida Portuaria)$');
// Si las teselas no traen carriles de bus, las troncales de Transmetro son Murillo y Olaya Herrera (Cra 46).
const transmetro = buses.length ? buses : [...cl45, ...cr46];
console.log(`carriles de bus: ${buses.length} tramos`);

// Centro: Calle 30 – Cra 46 – Murillo (Cl 45) – Cra 38
const centro = [cruce(cl30, cr46, 'Cl30×Cr46'), cruce(cl45, cr46, 'Cl45×Cr46'), cruce(cl45, cr38, 'Cl45×Cr38'), cruce(cl30, cr38, 'Cl30×Cr38')];
centro.push(centro[0]);

// Parrillero hombre: Calle 72 – Cra 38 – Circunvalar – Cra 65
const a = cruce(cl72, cr38, 'Cl72×Cr38');
const b = cruce(cl72, cr65, 'Cl72×Cr65');
const c = cruce(cr65, circ, 'Cr65×Circunvalar');
const d = cruce(cr38, circ, 'Cr38×Circunvalar');
const parrillero = [a, b, ...cadena(cr65, b, c).slice(1), ...cadena(circ, c, d).slice(1), ...cadena(cr38, d, a).slice(1)];
if (parrillero.at(-1) !== a) parrillero.push(a);

const fc = {
  type: 'FeatureCollection',
  generado: new Date().toISOString().slice(0, 10),
  fuente: '© OpenStreetMap · OpenMapTiles',
  features: [
    feat('baq-municipio', 'Polygon', [await limite('Barranquilla')]),
    feat('sol-municipio', 'Polygon', [await limite('Soledad')]),
    feat('baq-centro', 'Polygon', [centro]),
    feat('baq-parrillero-norte', 'Polygon', [parrillero]),
    feat('baq-transmetro', 'MultiLineString', transmetro.map((l) => simplificar(l, 8))),
    feat('baq-portuario', 'MultiLineString', portuaria.map((l) => simplificar(l, 8))),
  ],
};
writeFileSync(new URL('../data/zonas/zonas.json', import.meta.url), JSON.stringify(fc));
console.log('OK', fc.features.map((f) => `${f.properties.id}:${JSON.stringify(f.geometry.coordinates).length}b`).join(' '));

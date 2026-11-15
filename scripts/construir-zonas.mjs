// Genera data/zonas/zonas.json. Uso: npm run zonas
// Vías: teselas vectoriales de OpenFreeMap (datos de OpenStreetMap). Límites municipales: Nominatim.
// Las zonas son una APROXIMACIÓN trazada sobre las vías que nombra cada decreto.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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
// ZONAS_CACHE=<archivo.json> guarda las vías descargadas para no repetir la descarga al ajustar el script.
const CACHE = process.env.ZONAS_CACHE;
if (CACHE && existsSync(CACHE)) {
  const c = JSON.parse(readFileSync(CACHE, 'utf8'));
  for (const [n, ls] of c.porNombre) porNombre.set(n, ls);
  buses.push(...c.buses);
} else {
  for (let i = 0; i < teselas.length; i += 8) await Promise.all(teselas.slice(i, i + 8).map(tesela));
  if (CACHE) writeFileSync(CACHE, JSON.stringify({ porNombre: [...porNombre], buses }));
}

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
// `caja` = [oeste, sur, este, norte] limita la búsqueda (hay muchas "Calle 17" en la región).
const vias = (re, caja) => {
  const dentro = (p) => !caja || (p[0] >= caja[0] && p[1] >= caja[1] && p[0] <= caja[2] && p[1] <= caja[3]);
  const out = [...porNombre]
    .filter(([n]) => new RegExp(re).test(n))
    .flatMap(([, ls]) => ls)
    .filter((l) => l.length > 1 && l.some(dentro))
    .map(densificar);
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

// Recorta una vía al tramo entre dos puntos, conservando su trazado real.
function recorte(lineas, desde, hasta) {
  const kx = Math.cos((desde[1] * Math.PI) / 180);
  const [ex, ey] = [(hasta[0] - desde[0]) * kx, hasta[1] - desde[1]];
  const largo2 = ex * ex + ey * ey;
  const largo = Math.sqrt(largo2) * 111320;
  const ok = (p) => {
    const [px, py] = [(p[0] - desde[0]) * kx, p[1] - desde[1]];
    const t = (px * ex + py * ey) / largo2;
    const desvio = (Math.abs(px * ey - py * ex) / Math.sqrt(largo2)) * 111320;
    return t >= 0 && t <= 1 && desvio <= Math.max(120, largo * 0.45);
  };
  const out = [];
  for (const l of lineas) {
    let actual = [];
    for (const p of l) {
      if (ok(p)) actual.push(p);
      else { if (actual.length > 1) out.push(actual); actual = []; }
    }
    if (actual.length > 1) out.push(actual);
  }
  return out;
}
/** Igual que `recorte`, pero pasando por puntos intermedios (para vías curvas como la Circunvalar). */
const recortePor = (lineas, puntos) => puntos.slice(1).flatMap((p, i) => recorte(lineas, puntos[i], p));

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

const cl30 = vias('^Avenida Calle 30$'), cl30todo = vias('^(Avenida )?Calle 30$'), cr46 = vias('^Avenida Carrera 46$'), cr38 = vias('^(Avenida )?Carrera 38$');
const cl45 = vias('^Avenida Murillo$'), cl72 = vias('^Calle 72$'), cr65 = vias('^Carrera 65$');
const circ = vias('^Avenida Circunvalar$'), portuaria = vias('^(Corredor Portuario|Avenida Portuaria)$');

// Centro: Calle 30 – Cra 46 – Murillo (Cl 45) – Cra 38
const c1 = cruce(cl30, cr46, 'Cl30×Cr46'), c2 = cruce(cl45, cr46, 'Cl45×Cr46');
const c3 = cruce(cl45, cr38, 'Cl45×Cr38'), c4 = cruce(cl30, cr38, 'Cl30×Cr38');
const centro = [c1, c2, c3, c4, c1];

// Parrillero hombre: Calle 72 – Cra 38 – Circunvalar – Cra 65
const a = cruce(cl72, cr38, 'Cl72×Cr38');
const b = cruce(cl72, cr65, 'Cl72×Cr65');
const c = cruce(cr65, circ, 'Cr65×Circunvalar');
const d = cruce(cr38, circ, 'Cr38×Circunvalar');
const parrillero = [a, b, ...cadena(cr65, b, c).slice(1), ...cadena(circ, c, d).slice(1), ...cadena(cr38, d, a).slice(1)];
if (parrillero.at(-1) !== a) parrillero.push(a);

// Transmetro (prohibido): Murillo entre la Cra 1 (Av. Las Torres) y la Cra 46; Cra 46 entre calles 30 y 74.
// De la Cra 1 hacia Soledad la Murillo ya no está en la lista del decreto.
const cr1 = vias('^Carrera 1$', [-74.81, 10.925, -74.795, 10.935]);
const finMurillo = cruce(cl45, cr1, 'Murillo×Cr1');
const cl74 = vias('^Calle 74$', [-74.83, 10.99, -74.79, 11.01]);
const transmetro = [
  ...recorte(cl45, c2, finMurillo),
  ...recorte(cr46, c1, cruce(cr46, cl74, 'Cr46×Cl74')),
];

// Corredores donde el parrillero debe estar inscrito (24 h).
const cordialidad = vias('^Avenida de La Cordialidad$');
const via40 = vias('^Vía 40$'), rio = vias('^Avenida del Río$');
const salida46 = vias('^Salida a Avenida Carrera 46$');
const ESTE = [-74.80, 10.955, -74.755, 10.995];
const cl4 = vias('^Calle 4$', ESTE), cr30 = vias('^Carrera 30$', ESTE), cl6 = vias('^Calle 6$', ESTE);
const pCirc = [
  cruce(circ, cl45, 'Circunvalar×Murillo'),
  cruce(circ, cordialidad, 'Circunvalar×Cordialidad'),
  d,
  cruce(circ, salida46, 'Circunvalar×Cr46'),
  cruce(circ, via40, 'Circunvalar×Vía40'),
];
const cl4x38 = cruce(cl4, cr38, 'Cl4×Cr38'), cl4x30 = cruce(cl4, cr30, 'Cl4×Cr30');
const inscrito = [
  ...recorte(cl4, cl4x38, cl4x30),
  ...recorte(cr30, cl4x30, cruce(cl6, cr30, 'Cl6×Cr30')),
  ...recorte(cl30todo, cruce(cl30todo, circ, 'Cl30×Circunvalar'), c4),
  ...recorte(cordialidad, pCirc[1], cruce(cordialidad, cl45, 'Cordialidad×Murillo')),
  // La Cra 38 entre calles 30 y 45 (c4→c3) es borde del Centro: allí manda la prohibición del Centro,
  // así que no se dibuja como corredor para no dar a entender que se puede pasar.
  ...recorte(cr38, cl4x38, c4), ...recorte(cr38, c3, a), ...recorte(cr38, a, d),
  ...recortePor(circ, pCirc),
  ...via40,
  ...rio,
];

// Centro de Soledad: calles 17 a 19 entre carreras 18 y 21.
const SOL = [-74.79, 10.895, -74.74, 10.935];
const s17 = vias('^Calle 17$', SOL), s19 = vias('^Calle 19$', SOL), s18k = vias('^Carrera 18$', SOL), s21k = vias('^Carrera 21$', SOL);
const sc = [cruce(s17, s18k, 'Sol Cl17×Cr18'), cruce(s17, s21k, 'Sol Cl17×Cr21'), cruce(s19, s21k, 'Sol Cl19×Cr21'), cruce(s19, s18k, 'Sol Cl19×Cr18')];
sc.push(sc[0]);

const fino = (ls) => ls.map((l) => simplificar(l, 8)).filter((l) => l.length > 1);

const fc = {
  type: 'FeatureCollection',
  generado: new Date().toISOString().slice(0, 10),
  fuente: '© OpenStreetMap · OpenMapTiles',
  features: [
    feat('baq-municipio', 'Polygon', [await limite('Barranquilla')]),
    feat('sol-municipio', 'Polygon', [await limite('Soledad')]),
    feat('baq-centro', 'Polygon', [centro]),
    feat('baq-parrillero-norte', 'Polygon', [parrillero]),
    feat('sol-centro', 'Polygon', [sc]),
    // El orden importa: lo último se dibuja encima.
    feat('baq-inscrito', 'MultiLineString', fino(inscrito)),
    feat('baq-transmetro', 'MultiLineString', fino(transmetro)),
    feat('baq-portuario', 'MultiLineString', fino(portuaria)),
  ],
};
writeFileSync(new URL('../data/zonas/zonas.json', import.meta.url), JSON.stringify(fc));
console.log('OK', fc.features.map((f) => `${f.properties.id}:${JSON.stringify(f.geometry.coordinates).length}b`).join(' '));

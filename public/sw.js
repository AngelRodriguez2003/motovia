// Service worker mínimo: páginas con red primero (y copia para cuando no hay señal),
// estáticos y teselas del mapa con caché primero.
const CACHE = 'motovia-v1';
const TESELAS = 'motovia-mapa-v1';
const MAX_TESELAS = 400;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => ![CACHE, TESELAS].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function recortar(nombre, max) {
  const c = await caches.open(nombre);
  const ks = await c.keys();
  await Promise.all(ks.slice(0, Math.max(0, ks.length - max)).map((k) => c.delete(k)));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const propio = url.origin === self.location.origin;
  const esMapa = url.hostname.endsWith('openfreemap.org');
  if (!propio && !esMapa) return;

  const inmutable = esMapa || url.pathname.startsWith('/_next/static/');

  if (!inmutable) {
    // Red primero; si no hay señal, la última copia guardada.
    e.respondWith(
      fetch(req)
        .then((r) => {
          if (r.ok) {
            const copia = r.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return r;
        })
        .catch(() => caches.match(req).then((r) => r ?? (req.mode === 'navigate' ? caches.match('/') : Response.error()))),
    );
    return;
  }

  const nombre = esMapa ? TESELAS : CACHE;
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ??
        fetch(req).then((r) => {
          if (r.ok) {
            const copia = r.clone();
            caches.open(nombre).then((c) => c.put(req, copia)).then(() => esMapa && recortar(TESELAS, MAX_TESELAS));
          }
          return r;
        }),
    ),
  );
});

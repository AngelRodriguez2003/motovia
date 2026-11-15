// URL pública del sitio. Orden de prioridad:
// 1. NEXT_PUBLIC_SITE_URL, si se define (por ejemplo, al conectar un dominio propio).
// 2. El dominio de producción que Vercel asigna al proyecto (se actualiza solo si cambia).
// 3. localhost, en desarrollo.
// Solo se usa en el servidor (metadatos, sitemap, robots); no importar desde componentes de cliente.
const dominioVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITIO = {
  nombre: 'MotoVía',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? (dominioVercel ? `https://${dominioVercel}` : 'http://localhost:3000')).replace(/\/$/, ''),
  descripcion:
    'Mapa actualizado de restricciones para motos en Barranquilla y Soledad: pico y placa de hoy, restricción nocturna, parrillero hombre, zonas y vías prohibidas, multas y qué dice cada decreto.',
};

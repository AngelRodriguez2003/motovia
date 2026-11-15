import { ULTIMA_REVISION } from '@/data/reglas';
import { SITIO } from './sitio';

/** Año de la última revisión de las reglas: va en los títulos porque la gente busca "… 2026". */
export const ANIO = ULTIMA_REVISION.slice(0, 4);

export const url = (ruta: string) => SITIO.url + ruta;

export const migas = (pasos: [nombre: string, ruta: string][]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: pasos.map(([name, ruta], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url(ruta) })),
});

export const preguntasFrecuentes = (preguntas: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: preguntas.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

export const articulo = (titulo: string, descripcion: string, ruta: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: titulo,
  description: descripcion,
  inLanguage: 'es-CO',
  dateModified: ULTIMA_REVISION,
  mainEntityOfPage: url(ruta),
  publisher: { '@type': 'Organization', name: SITIO.nombre, url: SITIO.url },
});

/**
 * Open Graph de una página. Next reemplaza el bloque entero (no lo fusiona con el del layout),
 * así que aquí se repiten los campos comunes y la imagen para compartir.
 */
export const og = (extra: { title?: string; description?: string; url: string; type?: 'website' | 'article' }) => ({
  type: 'website' as const,
  locale: 'es_CO',
  siteName: SITIO.nombre,
  images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${SITIO.nombre}: restricciones para motos en Barranquilla y Soledad` }],
  ...extra,
});

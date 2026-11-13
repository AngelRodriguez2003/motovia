// Patrocinadores directos para el anuncio de pantalla completa.
// Con la lista vacía el anuncio no aparece nunca.

export type Patrocinador = {
  id: string;
  nombre: string;
  titulo: string;
  texto: string;
  cta: string;
  url: string;
};

export const CONTACTO_PUBLICIDAD = 'mailto:hola@motovia.co?subject=Quiero%20anunciar%20en%20MotoV%C3%ADa';

export const PATROCINADORES: Patrocinador[] = [
  {
    // Anuncio propio mientras no haya patrocinadores. Reemplázalo por uno real.
    id: 'casa',
    nombre: 'MotoVía',
    titulo: '¿Tienes un taller, CDA o tienda de cascos?',
    texto: 'Este espacio lo ven motociclistas de Barranquilla y Soledad justo cuando planean su ruta. Puede ser tuyo.',
    cta: 'Quiero anunciar aquí',
    url: CONTACTO_PUBLICIDAD,
  },
];

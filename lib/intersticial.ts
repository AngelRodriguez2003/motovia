// Reglas del anuncio de pantalla completa. Pensadas para no estorbar:
// una vez por sesión, solo tras un rato de uso real y nunca con el GPS en seguimiento.

export const MS_MINIMO = Number(process.env.NEXT_PUBLIC_INTERSTICIAL_MS ?? 3 * 60 * 1000);

export type EstadoAnuncio = {
  /** Tiempo con la pestaña visible, en ms. */
  msActivo: number;
  yaMostrado: boolean;
  siguiendoUbicacion: boolean;
  hayPatrocinador: boolean;
};

export function puedeMostrar(e: EstadoAnuncio, minimo = MS_MINIMO): boolean {
  return e.hayPatrocinador && !e.yaMostrado && !e.siguiendoUbicacion && e.msActivo >= minimo;
}

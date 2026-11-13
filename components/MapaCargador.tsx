'use client';

import dynamic from 'next/dynamic';

const Inicio = dynamic(() => import('./Inicio'), {
  ssr: false,
  loading: () => <p className="flex h-full items-center justify-center text-sm text-slate-600">Cargando el mapa…</p>,
});

export default function MapaCargador() {
  return <Inicio />;
}

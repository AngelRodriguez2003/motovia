import { Suspense } from "react";
import Link from "next/link";
import MapaCargador from "@/components/MapaCargador";
import Nav from "@/components/Nav";

export default function Home() {
  return (
    <div className="flex h-full flex-col">
      <main className="relative flex-1">
        <h1 className="sr-only">Mapa de restricciones para motos en Barranquilla y Soledad</h1>
        <MapaCargador />
        <p className="sr-only">
          Consulta también las reglas por ciudad: <Link href="/barranquilla">Barranquilla</Link>,{" "}
          <Link href="/soledad">Soledad</Link>, y la <Link href="/aprende">guía para motociclistas</Link>.
        </p>
      </main>
      <Suspense><Nav /></Suspense>
    </div>
  );
}

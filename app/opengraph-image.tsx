import { ImageResponse } from "next/og";
import { SITIO } from "@/lib/sitio";

// Imagen que se muestra al compartir el sitio en WhatsApp, Facebook, X, etc.
export const alt = "MotoVía: restricciones para motos en Barranquilla y Soledad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORES = ["#dc2626", "#ea580c", "#7c3aed", "#0f766e"];

export default function Imagen() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#020617", color: "#fff", padding: 72 }}>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#fde047" }}>{SITIO.nombre}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>¿Por dónde puedo andar en moto hoy?</div>
          <div style={{ display: "flex", fontSize: 36, color: "#cbd5e1", marginTop: 24 }}>Barranquilla y Soledad · mapa, pico y placa, parrillero y horarios</div>
        </div>
        <div style={{ display: "flex" }}>
          {COLORES.map((c) => (
            <div key={c} style={{ width: 150, height: 18, borderRadius: 9, background: c, marginRight: 16 }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}

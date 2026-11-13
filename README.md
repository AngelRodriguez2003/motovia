# MotoVía

Mapa de restricciones para motos en Barranquilla y Soledad: qué aplica ahora, dónde y por qué.

## Uso

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # pruebas del motor de reglas
npm run build
```

## Cómo actualizar los datos

- **Reglas** (`data/reglas.ts`): horarios, vigencias, excepciones y fuente de cada medida. Cuando salga un decreto, edita o agrega la regla, cambia `revisadoEl` y despliega. Pon `verificado: true` solo después de leer el texto oficial.
- **Zonas** (`data/zonas/zonas.json`): se generan con `npm run zonas` a partir de las vías de OpenStreetMap que nombra cada decreto. Son una aproximación; si un decreto cambia los límites, ajusta `scripts/construir-zonas.mjs`.
- **Guías** (`data/articulos.ts`) y **patrocinadores** (`data/patrocinadores.ts`).

## Publicidad

- Banner: `components/Anuncio.tsx`. Solo en fichas y páginas de lectura, nunca sobre el mapa.
- Pantalla completa: `components/Intersticial.tsx` + `lib/intersticial.ts`. Una vez por sesión, tras 3 min de uso, solo al cerrar una ficha y nunca con el GPS activo.
- Variables en `.env.example`.

## Pruebas manuales

`/?lat=10.981&lng=-74.781` simula una ubicación (ese punto queda dentro del Centro).

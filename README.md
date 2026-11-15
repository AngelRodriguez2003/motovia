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

El contexto normativo completo está en `docs/investigacion-normas-2026-11-13.md` (fuentes, dudas y contradicciones). Léelo antes de tocar las reglas.

- **Reglas** (`data/reglas.ts`): horarios, vigencias, excepciones y fuente de cada medida. Cuando salga un decreto, edita o agrega la regla, cambia `revisadoEl` y despliega. Pon `verificado: true` solo después de leer el texto oficial.
- **Zonas** (`data/zonas/zonas.json`): se generan con `npm run zonas` a partir de las vías de OpenStreetMap que nombra cada decreto. Son una aproximación; si un decreto cambia los límites, ajusta `scripts/construir-zonas.mjs`.
- **Guías** (`data/articulos.ts`).

## Pruebas manuales

`/?lat=10.981&lng=-74.781` simula una ubicación (ese punto queda dentro del Centro).

## Licencia

El código se publica bajo la [GNU General Public License v3.0](LICENSE).

Los datos geográficos de `data/zonas/zonas.json` derivan de [OpenStreetMap](https://www.openstreetmap.org/copyright) (© colaboradores de OpenStreetMap, licencia ODbL) y el mapa base usa OpenFreeMap y OpenMapTiles.

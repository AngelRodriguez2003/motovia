/** Datos estructurados (schema.org) para buscadores. */
export default function JsonLd({ datos }: { datos: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, '\\u003c') }}
    />
  );
}

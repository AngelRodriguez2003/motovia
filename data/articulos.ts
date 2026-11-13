// Guías cortas para motociclistas. Lenguaje simple, sin jerga legal.
// `reglas` enlaza cada guía con las reglas de data/reglas.ts que explica.

export type Articulo = {
  slug: string;
  titulo: string;
  resumen: string;
  secciones: { titulo: string; parrafos?: string[]; lista?: string[] }[];
  reglas?: string[];
};

export const ARTICULOS: Articulo[] = [
  {
    slug: 'restriccion-nocturna-barranquilla',
    titulo: 'Restricción nocturna de motos en Barranquilla',
    resumen: 'De 11:00 p.m. a 5:00 a.m. las motos no pueden circular en Barranquilla. Quiénes sí pueden y qué pasa si te paran.',
    secciones: [
      {
        titulo: 'Qué dice la medida',
        parrafos: [
          'Todos los días, entre las 11:00 p.m. y las 5:00 a.m., está restringida la circulación de motocicletas, motociclos, mototriciclos y motocarros en todo el Distrito de Barranquilla.',
          'No depende del día ni de la placa: aplica igual de lunes a domingo.',
        ],
      },
      {
        titulo: 'Quiénes sí pueden circular',
        lista: [
          'El propietario de la moto, si puede demostrarlo con la licencia de tránsito (tarjeta de propiedad) a su nombre.',
          'Acompañantes inscritos ante la Secretaría de Tránsito para esa moto.',
          'Motos de 500 cc o más y eléctricas de 11.000 W o más.',
          'Fuerza pública, organismos de socorro y quienes tengan permiso de circulación.',
        ],
      },
      {
        titulo: 'Consejo práctico',
        parrafos: [
          'Si tu turno termina cerca de las 11 p.m., calcula el trayecto completo: la restricción aplica aunque te falten tres cuadras. Lleva siempre la tarjeta de propiedad original.',
        ],
      },
    ],
    reglas: ['baq-nocturna'],
  },
  {
    slug: 'parrillero-en-barranquilla',
    titulo: 'Parrillero en Barranquilla: dónde y a quién puedes llevar',
    resumen: 'Hay zonas donde no se puede llevar parrillero hombre, zonas donde no se puede llevar a nadie y pasajeros que no pueden ir en moto en ninguna parte.',
    secciones: [
      {
        titulo: 'Tres reglas distintas que la gente confunde',
        lista: [
          'Parrillero hombre: prohibido dentro del cuadrante Calle 72 – Carrera 38 – Carrera 65 – Circunvalar.',
          'Centro: de 6:00 a.m. a 7:00 p.m. puedes entrar, pero solo, sin ningún parrillero.',
          'En toda la ciudad: no pueden ir de parrilleros las mujeres embarazadas ni los menores de 12 años.',
        ],
      },
      {
        titulo: 'Cómo leerlo en el mapa',
        parrafos: [
          'El morado marca la zona sin parrillero hombre y el naranja las zonas donde debes ir solo. Toca cualquier zona para ver el horario y las excepciones.',
        ],
      },
    ],
    reglas: ['baq-parrillero-hombre', 'baq-centro', 'baq-pasajeros'],
  },
  {
    slug: 'centro-y-vias-prohibidas',
    titulo: 'El Centro, Transmetro y el corredor portuario',
    resumen: 'Las tres zonas de Barranquilla donde una moto no puede transitar libremente, y cómo rodearlas.',
    secciones: [
      {
        titulo: 'Centro',
        parrafos: [
          'El cuadrante entre la Calle 30, la Carrera 46, la Avenida Murillo (Calle 45) y la Carrera 38 está cerrado para motos. La excepción es de día: de 6:00 a.m. a 7:00 p.m. puedes entrar sin parrillero para llegar al comercio.',
        ],
      },
      {
        titulo: 'Corredores de Transmetro',
        parrafos: [
          'Por las troncales donde opera Transmetro (Murillo y Olaya Herrera) las motos tienen prohibido transitar. Cruzarlas en una intersección no es lo mismo que rodar por ellas: usa las vías paralelas.',
        ],
      },
      {
        titulo: 'Corredor portuario',
        parrafos: [
          'Es una vía de carga pesada hacia el puerto. La prohibición es permanente; solo se exceptúan las motos que escoltan carga con permiso.',
        ],
      },
    ],
    reglas: ['baq-centro', 'baq-transmetro', 'baq-portuario'],
  },
  {
    slug: 'documentos-y-equipo',
    titulo: 'Qué debes llevar siempre en la moto',
    resumen: 'Los documentos y el equipo que te pueden pedir en cualquier retén, en Barranquilla, Soledad o cualquier ciudad de Colombia.',
    secciones: [
      {
        titulo: 'Documentos',
        lista: [
          'Licencia de conducción vigente, de la categoría de tu moto (A1 hasta 125 cc, A2 para más de 125 cc).',
          'Licencia de tránsito (la "tarjeta de propiedad").',
          'SOAT vigente. Se acepta en formato digital.',
          'Revisión técnico-mecánica vigente, cuando tu moto ya esté obligada a hacerla.',
          'Tu documento de identidad.',
        ],
      },
      {
        titulo: 'Equipo',
        lista: [
          'Casco certificado, abrochado y de tu talla, para ti y para el parrillero.',
          'Luces encendidas todo el tiempo, también de día.',
          'Prendas reflectivas cuando ruedes de noche.',
          'Espejos, direccionales, pito y llantas en buen estado.',
        ],
      },
      {
        titulo: 'Ojo',
        parrafos: [
          'Los detalles (edad de la moto para la primera revisión, características del casco) cambian con resoluciones nacionales. Confírmalos en el RUNT o en el Ministerio de Transporte.',
        ],
      },
    ],
  },
  {
    slug: 'que-pasa-si-me-paran',
    titulo: 'Qué pasa si circulas por una zona u hora restringida',
    resumen: 'La infracción, la inmovilización y cómo evitar que una multa se vuelva más cara.',
    secciones: [
      {
        titulo: 'La infracción',
        parrafos: [
          'Transitar por sitios restringidos o en horas prohibidas por la autoridad es la infracción C14 del Código Nacional de Tránsito. Tiene multa y, además, inmovilización del vehículo.',
          'A la multa se suman la grúa y los días de patio, que suelen costar más que la multa misma.',
        ],
      },
      {
        titulo: 'Si te imponen el comparendo',
        lista: [
          'Pide que te indiquen qué decreto y qué zona u horario incumpliste.',
          'Tienes derecho a aceptar la infracción o a pedir audiencia para discutirla.',
          'Aceptar y hacer el curso en los primeros días da descuento sobre el valor de la multa.',
        ],
      },
      {
        titulo: 'Lo que esta app no es',
        parrafos: [
          'Es una guía para planear tu ruta. No es una prueba ante un agente ni asesoría legal. Cada ficha enlaza la fuente para que puedas leer la norma completa.',
        ],
      },
    ],
  },
];

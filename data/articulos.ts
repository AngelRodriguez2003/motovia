// Guías cortas para motociclistas. Lenguaje simple, sin jerga legal.
// Base: docs/investigacion-normas-2026-11-13.md.
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
    slug: 'barranquilla-vs-soledad',
    titulo: 'Barranquilla y Soledad: las reglas no son las mismas',
    resumen: 'Cruzas una calle y cambian las normas. Estas son las diferencias que más multas causan.',
    secciones: [
      {
        titulo: 'En Barranquilla',
        lista: [
          'No hay pico y placa para motos.',
          'Parrillero hombre prohibido las 24 horas en el cuadrante calle 72 – carrera 38 – carrera 65 – Circunvalar.',
          'En varias avenidas y en el norte el parrillero debe estar inscrito.',
          'De 11 p.m. a 5 a.m. solo circula el propietario en su moto.',
          'Centro, vías de Transmetro y Corredor Portuario están cerrados para motos.',
          'No pueden ir en moto menores de 12 años ni embarazadas.',
          'Quedan exentas de las reglas generales las motos de 500 cc o más.',
        ],
      },
      {
        titulo: 'En Soledad',
        lista: [
          'Sí hay pico y placa de motos por último dígito, de lunes a viernes de 5 a.m. a 10 p.m.',
          'No hay prohibición permanente de parrillero; solo medidas temporales en fechas especiales.',
          'De 11 p.m. a 5 a.m. no circulan motos, salvo exentos.',
          'Tramos prohibidos en el centro: calles 17 a 19 entre carreras 18 y 21.',
          'La exención por cilindraje empieza en 598 cc.',
        ],
      },
      {
        titulo: 'Quién manda en cada lado',
        parrafos: [
          'En Barranquilla, la Secretaría Distrital de Tránsito y Seguridad Vial. En Soledad, el Instituto de Tránsito (IMTTRASOL). Un permiso de una ciudad no sirve en la otra.',
        ],
      },
    ],
    reglas: ['baq-parrillero-hombre', 'sol-pico-placa'],
  },
  {
    slug: 'restriccion-nocturna-barranquilla',
    titulo: 'Restricción nocturna de motos: de 11 p.m. a 5 a.m.',
    resumen: 'Rige en Barranquilla y en Soledad, pero con excepciones distintas. Quién puede circular y qué debe llevar.',
    secciones: [
      {
        titulo: 'En Barranquilla',
        parrafos: [
          'Todos los días, entre las 11:00 p.m. y las 5:00 a.m., no pueden circular motocicletas, motociclos, mototriciclos ni motocarros.',
          'La excepción principal es el propietario: puede circular conduciendo su propia moto si muestra la licencia de tránsito (tarjeta de propiedad) a su nombre. Puede llevar acompañante solo si está inscrito.',
        ],
      },
      {
        titulo: 'En Soledad',
        parrafos: [
          'El horario es el mismo (antes de 2019 empezaba a las 10 p.m.). Aquí no existe la excepción del propietario: pueden circular los exentos del decreto local (fuerza pública, salud, mensajería, motos de 598 cc o más, y quien tenga permiso de IMTTRASOL).',
        ],
      },
      {
        titulo: 'Consejo práctico',
        parrafos: [
          'Si tu turno termina cerca de las 11 p.m., calcula el trayecto completo: la restricción aplica aunque te falten tres cuadras. Lleva siempre la tarjeta de propiedad original.',
        ],
      },
    ],
    reglas: ['baq-nocturna', 'sol-nocturna'],
  },
  {
    slug: 'parrillero-en-barranquilla',
    titulo: 'Parrillero en Barranquilla: a quién puedes llevar y por dónde',
    resumen: 'Tres reglas distintas que la gente confunde: parrillero hombre, parrillero inscrito y pasajeros prohibidos.',
    secciones: [
      {
        titulo: '1. Parrillero hombre: prohibido en el norte',
        parrafos: [
          'Dentro del cuadrante calle 72 – carrera 38 – carrera 65 – Circunvalar no se puede llevar parrillero hombre, a ninguna hora. Aplica aunque seas el dueño, aunque sea tu hijo y aunque esté inscrito. Tampoco importa el cilindraje.',
          'Parrillera mujer sí se puede llevar.',
        ],
      },
      {
        titulo: '2. Parrillero inscrito: avenidas principales y zona norte',
        parrafos: [
          'En la Circunvalar, la Cordialidad, la calle 30, la Vía 40, la carrera 38, la Hamburgo, la Avenida del Río y en las localidades Norte-Centro Histórico y Riomar, quien vaya de parrillero debe estar inscrito ante la Secretaría de Tránsito.',
        ],
      },
      {
        titulo: 'Cómo inscribir a tus acompañantes',
        lista: [
          'Lo hace el dueño, poseedor o tenedor de la moto en el portal de la Secretaría Distrital de Tránsito.',
          'Puedes incluir a tu cónyuge o compañero permanente, a tus hijos (de 12 años o más) y hasta ocho personas más.',
          'De cada uno se registra nombre y número de identificación.',
          'Solo se puede modificar una vez al mes, y hay una sola inscripción vigente por moto.',
          'No tienes que llevarla impresa: el agente la verifica en línea.',
        ],
      },
      {
        titulo: '3. Quiénes no pueden ir en moto',
        parrafos: ['Menores de 12 años y mujeres embarazadas, en ninguna parte de la ciudad, ni siquiera en motos de alto cilindraje.'],
      },
      {
        titulo: 'Domiciliarios',
        parrafos: ['No tienen una excepción general para llevar parrillero. Aplican las mismas reglas.'],
      },
    ],
    reglas: ['baq-parrillero-hombre', 'baq-inscrito', 'baq-pasajeros'],
  },
  {
    slug: 'centro-y-vias-prohibidas',
    titulo: 'El Centro, Transmetro y el Corredor Portuario',
    resumen: 'Las tres zonas de Barranquilla donde una moto no puede transitar, con sus límites exactos.',
    secciones: [
      {
        titulo: 'Centro',
        parrafos: [
          'El cuadrante entre las calles 30 y 45 y las carreras 38 y 46 está cerrado para motos, incluidas las vías del borde (menos la calle 30). Ni siquiera se puede empujar la moto.',
          'De 6:00 a.m. a 7:00 p.m. hay 11 tramos comerciales que sí se pueden usar, sin permiso y sin parrillero. Entre ellos: calle 45 entre carreras 45 y 46, carrera 46 entre calles 45 y 42, y calles 42, 43 y 44 entre carreras 41 y 38.',
          'Si vives, estudias o trabajas en el Centro, pide el permiso especial: es gratuito, personal y no permite parrillero.',
        ],
      },
      {
        titulo: 'Vías de Transmetro',
        parrafos: [
          'Prohibidas todos los días: la Avenida Murillo (calle 45) entre la carrera 1 y la carrera 46, y la carrera 46 entre las calles 30 y 74.',
          'Desde octubre de 2025 hay cámaras en el carril exclusivo. Leen la placa trasera, así que la multa llega aunque no te pare nadie.',
          'Cruzar de un lado a otro no es lo mismo que rodar por ellas: usa las vías paralelas.',
        ],
      },
      {
        titulo: 'Corredor Portuario',
        parrafos: [
          'Es una vía de carga pesada hacia el puerto. Las motos no pueden usar la calzada occidental entre las carreras 46 y 38, ni el corredor entre la carrera 38 y la Troncal del Caribe.',
        ],
      },
    ],
    reglas: ['baq-centro', 'baq-transmetro', 'baq-portuario'],
  },
  {
    slug: 'pico-y-placa-motos-soledad',
    titulo: 'Pico y placa de motos en Soledad',
    resumen: 'Qué placas no circulan cada día, a qué hora, quiénes están exentos y por qué hay que confirmarlo.',
    secciones: [
      {
        titulo: 'Los dígitos',
        lista: ['Lunes: 1 y 3', 'Martes: 2 y 4', 'Miércoles: 5 y 7', 'Jueves: 6 y 8', 'Viernes: 9 y 0', 'Sábados y domingos: no aplica'],
      },
      {
        titulo: 'El horario',
        parrafos: ['De 5:00 a.m. a 10:00 p.m., según el último número de la placa. Después, desde las 11 p.m., empieza la restricción nocturna para todas las placas.'],
      },
      {
        titulo: 'Exentos',
        lista: [
          'Fuerza pública, tránsito, socorro y personal de salud.',
          'Motos de 598 cc o más.',
          'Mensajería, servicios públicos y transporte de mercancía.',
          'Trabajadores de Transmetro, el aeropuerto y la Terminal, con uniforme y carné.',
          'Quien tenga permiso especial de IMTTRASOL (6 meses, sin parrillero).',
        ],
      },
      {
        titulo: 'Por qué debes confirmarlo',
        parrafos: [
          'La medida viene del Decreto 288 de 2017. No encontramos una norma que la derogue, pero las fuentes públicas se contradicen: una dice que solo aplica en el centro y otra que incluye los sábados. Además, en 2025 el Instituto de Tránsito anunció que estudiaba eliminarla.',
          'Ante la duda, llama a IMTTRASOL (calle 63 n.º 13-71, C. C. Nuestro Atlántico).',
        ],
      },
    ],
    reglas: ['sol-pico-placa'],
  },
  {
    slug: 'documentos-y-equipo',
    titulo: 'Qué debes llevar siempre en la moto',
    resumen: 'Los documentos y el equipo que te pueden pedir en cualquier retén, en Barranquilla, Soledad o cualquier ciudad de Colombia.',
    secciones: [
      {
        titulo: 'Documentos',
        lista: [
          'Licencia de conducción vigente: A1 para motos de hasta 125 cc, A2 para más de 125 cc.',
          'Licencia de tránsito (la "tarjeta de propiedad").',
          'SOAT vigente. En 2026: menos de 100 cc, $256.200; de 100 a 200 cc, $343.300; más de 200 cc, $761.400.',
          'Revisión técnico-mecánica vigente, cuando tu moto ya esté obligada a hacerla.',
        ],
      },
      {
        titulo: 'Equipo y conducta',
        lista: [
          'Casco certificado y bien abrochado, para ti y para el parrillero.',
          'Luces encendidas todo el tiempo.',
          'No circules por andenes, ciclorrutas ni carriles exclusivos, y no zigzaguees entre carros.',
          'Velocidad urbana: 50 km/h, salvo que la señal diga otra cosa.',
        ],
      },
      {
        titulo: '¿Placa en el casco y el chaleco?',
        parrafos: ['No encontramos una norma vigente en Barranquilla ni en Soledad que la exija en 2026. Si te la piden, pregunta qué norma lo ordena.'],
      },
      {
        titulo: 'Antes de salir',
        parrafos: ['Revisa en el SIMIT que no tengas comparendos pendientes y en el RUNT el estado de tu licencia y de la moto.'],
      },
    ],
  },
  {
    slug: 'que-pasa-si-me-paran',
    titulo: 'Multas 2026: cuánto cuesta cada infracción',
    resumen: 'Desde 2026 las multas se liquidan en UVB, no en salarios mínimos. Estos son los valores reales y lo que pasa con la moto.',
    secciones: [
      {
        titulo: 'Los valores de 2026',
        lista: [
          'C.14 — zona u hora restringida (parrillero prohibido, pico y placa, Transmetro, nocturna): $633.111 e inmovilización.',
          'C.24 — sin casco o mal puesto: cerca de $633.200 e inmovilización.',
          'D.02 — sin SOAT o sin licencia: $1.266.100 e inmovilización.',
          'D.12 — mototaxismo (servicio no autorizado): cerca de $1.266.100 e inmovilización.',
          'Tipo B (por ejemplo, permiso vencido): $337.627.',
        ],
      },
      {
        titulo: 'Desconfía de otras cifras',
        parrafos: [
          'Muchos sitios todavía calculan las multas con el salario mínimo y publican valores más altos. Desde 2026 se usa la UVB ($12.110).',
        ],
      },
      {
        titulo: 'Si te inmovilizan la moto',
        lista: [
          'Va a patios. Para sacarla debes pagar o resolver el comparendo, y pagar grúa y parqueadero.',
          'Necesitas la licencia de tránsito, tu licencia de conducción vigente y el SOAT.',
          'Si pagas pronto y haces el curso, hay descuento del 50 % o del 25 % según el momento.',
        ],
      },
      {
        titulo: 'Fotomultas',
        parrafos: [
          'Barranquilla es una de las ciudades con más cámaras del país, y Soledad tiene cámaras en el carril Solo Bus de la Murillo. Antes de pagar o impugnar, revisa en el listado de la Agencia Nacional de Seguridad Vial que la cámara tenga autorización vigente.',
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

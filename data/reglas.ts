// Reglas de circulación para motos. Actualizar aquí cuando salga un decreto nuevo.
// Base: docs/investigacion-normas-2026-11-13.md (leerlo antes de cambiar algo).
// `verificado` solo pasa a true cuando se contrastó contra el texto oficial del decreto
// (no contra una nota de prensa ni un sitio agregador).

export type Municipio = 'barranquilla' | 'soledad';
export type Tipo = 'circulacion' | 'parrillero' | 'via' | 'placa' | 'pasajeros';
export type Efecto =
  | 'prohibido'
  | 'sin-parrillero'
  | 'sin-parrillero-hombre'
  | 'parrillero-inscrito'
  | 'pico-placa'
  | 'aviso';

export type Franja = {
  /** 0 = domingo … 6 = sábado. Sin `dias` = todos los días. */
  dias?: number[];
  /** "HH:MM" en hora de Colombia. Si `hasta` < `desde`, cruza la medianoche. */
  desde: string;
  hasta: string;
  efecto: Efecto;
};

export type Regla = {
  id: string;
  municipio: Municipio;
  tipo: Tipo;
  /** id de la geometría en data/zonas/zonas.json */
  zona: string;
  titulo: string;
  resumen: string;
  /** Efecto cuando ninguna franja aplica. `null` = la regla solo rige dentro de sus franjas. */
  efectoBase: Efecto | null;
  franjas?: Franja[];
  /** Fechas ISO (YYYY-MM-DD), ambas inclusive. */
  vigencia: { desde: string; hasta?: string };
  /** Pico y placa: día de la semana → últimos dígitos restringidos. */
  digitos?: Record<number, number[]>;
  /** Detalles que conviene saber (tramos, trámites, matices). */
  detalles?: string[];
  excepciones: string[];
  multa?: string;
  /** Texto corto que explica el porqué de la medida (parte educativa). */
  porque?: string;
  /** Dudas o contradicciones entre fuentes que el usuario debe conocer. */
  advertencia?: string;
  fuente: { decreto: string; url: string };
  verificado: boolean;
  revisadoEl: string;
};

/** Infracción C.14, liquidada en UVB desde 2026 (52,28 UVB × $12.110). */
export const MULTA_C14 =
  'Infracción C.14 (transitar por sitios u horas restringidas): $633.111 en 2026 (52,28 UVB) más inmovilización de la moto. A eso se suman grúa y patios.';

const REVISADO = '2026-11-13';

const FUENTE_1610 = {
  decreto: 'Decreto Distrital 1610 de 2026 (prorroga el 0703 de 2025)',
  url: 'https://mascolombia.com/barranquilla-motos-decreto-1610/',
};
const FUENTE_0049 = {
  decreto: 'Decreto Distrital 0049 de 2026',
  url: 'https://www.elheraldo.co/atlantico/2026/02/04/restriccion-a-circulacion-de-parrillero-hombre-en-barranquilla-por-24-horas-estas-son-las-zonas/',
};
const FUENTE_288 = {
  decreto: 'Decreto Municipal 288 de 2017',
  url: 'https://www.grupor5.com/pico-y-placa/soledad',
};

const VIGENCIA_1610 = { desde: '2025-11-01', hasta: '2027-10-31' };

const EXENTAS_BAQ =
  'Motos de 500 cc o más y eléctricas de 11.000 W o más (pero no las exime del parrillero hombre, de Transmetro ni de la regla de menores y embarazadas).';

const EXENTOS_SOLEDAD = [
  'Fuerza Pública, Policía Judicial, agentes de tránsito y organismos de seguridad.',
  'Organismos de socorro y personal de salud.',
  'Motos de 598 cc o más.',
  'Mensajería, servicios públicos, telecomunicaciones y transporte de mercancía.',
  'Escoltas, vigilantes y trabajadores de Transmetro, el aeropuerto y la Terminal, con uniforme y carné.',
  'Quien tenga el permiso especial de IMTTRASOL (dura 6 meses y no permite parrillero).',
];

export const REGLAS: Regla[] = [
  // ───────────────────────────── Barranquilla ─────────────────────────────
  {
    id: 'baq-nocturna',
    municipio: 'barranquilla',
    tipo: 'circulacion',
    zona: 'baq-municipio',
    titulo: 'Restricción nocturna',
    resumen:
      'De 11:00 p.m. a 5:00 a.m., todos los días, no pueden circular motos, motocarros ni mototriciclos en Barranquilla. Solo puede hacerlo el propietario conduciendo su propia moto.',
    efectoBase: null,
    franjas: [{ desde: '23:00', hasta: '05:00', efecto: 'prohibido' }],
    vigencia: VIGENCIA_1610,
    detalles: [
      'El propietario debe mostrar la licencia de tránsito (tarjeta de propiedad) a su nombre.',
      'Puede llevar un acompañante solo si está inscrito ante la Secretaría de Tránsito.',
      'De día (5:01 a.m. a 10:59 p.m.) un acompañante inscrito sí puede conducir la moto y llevar a otra persona de la misma lista.',
    ],
    excepciones: [
      'Propietario de la moto, con su licencia de tránsito.',
      EXENTAS_BAQ,
      'Fuerza Pública, organismos de seguridad, tránsito y socorro.',
    ],
    multa: MULTA_C14,
    porque: 'La Alcaldía la sustenta en la siniestralidad vial y los delitos cometidos en moto durante la madrugada.',
    fuente: FUENTE_1610,
    verificado: false,
    revisadoEl: REVISADO,
  },
  {
    id: 'baq-centro',
    municipio: 'barranquilla',
    tipo: 'circulacion',
    zona: 'baq-centro',
    titulo: 'Centro de Barranquilla',
    resumen:
      'Está prohibido circular en moto dentro del cuadrante de las calles 30 a 45 y las carreras 38 a 46. Tampoco se puede empujar la moto ni caminar al lado de ella.',
    efectoBase: 'prohibido',
    vigencia: VIGENCIA_1610,
    detalles: [
      'La prohibición incluye las vías del borde (carrera 38, carrera 46 y calle 45). La única vía del borde por la que sí se puede pasar es la calle 30.',
      'De 6:00 a.m. a 7:00 p.m. se pueden usar, sin permiso y sin parrillero, 11 tramos comerciales. Por ejemplo: calle 45 entre carreras 45 y 46, carrera 46 entre calles 45 y 42, y calles 42, 43 y 44 entre carreras 41 y 38.',
      'Si necesitas entrar seguido (vives, estudias o trabajas allí) existe un permiso especial gratuito, personal y sin parrillero. Se pide ante la Secretaría de Tránsito con carta, cédula, certificación laboral o de estudio, licencia, SOAT y tecnomecánica al día.',
      'Los permisos que vencían el 31 de octubre de 2026 valen hasta el 31 de diciembre de 2026.',
    ],
    excepciones: [
      EXENTAS_BAQ,
      'Quien tenga el permiso especial del Centro.',
      'Fuerza Pública, tránsito, socorro, escoltas, supervisores de vigilancia uniformados.',
      'Periodistas y notificadores judiciales carnetizados, sin acompañante.',
    ],
    multa: MULTA_C14,
    porque: 'Es la zona comercial con más peatones de la ciudad.',
    advertencia: 'El mapa pinta el cuadrante completo; los 11 tramos permitidos de día no están dibujados uno por uno.',
    fuente: FUENTE_1610,
    verificado: false,
    revisadoEl: REVISADO,
  },
  {
    id: 'baq-transmetro',
    municipio: 'barranquilla',
    tipo: 'via',
    zona: 'baq-transmetro',
    titulo: 'Vías de Transmetro',
    resumen:
      'Prohibido transitar en moto, todos los días, por la Avenida Murillo (calle 45) entre la carrera 1 (Av. Las Torres) y la carrera 46, y por la carrera 46 entre las calles 30 y 74.',
    efectoBase: 'prohibido',
    vigencia: VIGENCIA_1610,
    detalles: [
      'Hay cámaras de fotodetección en el carril exclusivo desde octubre de 2025 (por ejemplo en las estaciones Esthercita Forero y Arenosa). Leen la placa trasera, así que sí multan motos.',
      'Cruzar la Murillo de un lado a otro solo se permite sin acompañante o con uno inscrito.',
      'De la carrera 1 hacia Soledad la Murillo ya no está en la lista, pero el carril "Solo Bus" sigue siendo exclusivo de Transmetro.',
    ],
    excepciones: [
      'Fuerza Pública, tránsito, socorro y escoltas en servicio.',
      'En la Murillo: escoltas de vehículos de valores en servicio, sin acompañante y con permiso.',
      'Las motos de alto cilindraje NO están exentas aquí.',
    ],
    multa: MULTA_C14,
    porque: 'Los carriles exclusivos y los cruces de las estaciones concentran choques entre buses y motos.',
    fuente: FUENTE_1610,
    verificado: false,
    revisadoEl: REVISADO,
  },
  {
    id: 'baq-portuario',
    municipio: 'barranquilla',
    tipo: 'via',
    zona: 'baq-portuario',
    titulo: 'Corredor Portuario',
    resumen:
      'Las motos no pueden usar, a ninguna hora, la calzada occidental (sentido norte-sur) entre las carreras 46 y 38, ni el corredor entre la carrera 38 y la Troncal del Caribe (carrera 9).',
    efectoBase: 'prohibido',
    vigencia: VIGENCIA_1610,
    excepciones: [
      'Escoltas de carga uniformados, con carné y sin acompañante.',
      'Motocarros exclusivos de mercancía con conductor uniformado y carné.',
    ],
    multa: MULTA_C14,
    porque: 'Es una vía de tractomulas hacia el puerto, con puntos ciegos y poca berma.',
    advertencia: 'El trazo del mapa es aproximado: muestra el corredor, no distingue calzadas.',
    fuente: FUENTE_1610,
    verificado: false,
    revisadoEl: REVISADO,
  },
  {
    id: 'baq-inscrito',
    municipio: 'barranquilla',
    tipo: 'parrillero',
    zona: 'baq-inscrito',
    titulo: 'Corredores con parrillero inscrito',
    resumen:
      'En estas avenidas puedes circular, pero si llevas parrillero debe estar inscrito ante la Secretaría de Tránsito. Aplica las 24 horas.',
    efectoBase: 'parrillero-inscrito',
    vigencia: VIGENCIA_1610,
    detalles: [
      'Corredores: Av. Hamburgo (calle 4) entre carreras 38 y 30; carrera 30 entre calles 6 y 4; calle 30 entre la Circunvalar y la carrera 38; Av. Cordialidad entre la Circunvalar y la calle 45; carrera 38 entre la calle 4 y la Circunvalar; Circunvalar entre la calle 45 y la Vía 40; Vía 40 entre la Circunvalar y la calle 30; y toda la Avenida del Río.',
      'Ojo con la carrera 38 entre las calles 30 y 45: ese tramo es borde del Centro y ahí manda la prohibición del Centro, no esta regla.',
      'La inscripción también es obligatoria en las localidades Norte-Centro Histórico y Riomar (salvo La Playa). Esas zonas aún no están dibujadas en el mapa.',
      'Cómo inscribir: lo hace el dueño, poseedor o tenedor en el portal de la Secretaría Distrital de Tránsito. Puede incluir al cónyuge, a los hijos (de 12 años o más) y hasta ocho personas más, con nombre y número de identificación.',
      'Solo se permite una modificación al mes y una inscripción vigente por moto. No hay que llevarla impresa: se verifica en línea.',
      'Cruzar la calle 30 se permite incluso con acompañante no inscrito. Cruzar la Cordialidad, la Murillo o la Circunvalar, solo sin acompañante o con uno inscrito.',
    ],
    excepciones: [EXENTAS_BAQ],
    multa: MULTA_C14,
    porque: 'Busca que quien va de parrillero sea alguien identificable y cercano al dueño de la moto.',
    fuente: FUENTE_1610,
    verificado: false,
    revisadoEl: REVISADO,
  },
  {
    id: 'baq-parrillero-hombre',
    municipio: 'barranquilla',
    tipo: 'parrillero',
    zona: 'baq-parrillero-norte',
    titulo: 'Parrillero hombre prohibido',
    resumen:
      'En el cuadrante calle 72 – carrera 38 – carrera 65 – Circunvalar (sin incluir la Circunvalar) no se puede llevar parrillero hombre, las 24 horas.',
    efectoBase: 'sin-parrillero-hombre',
    vigencia: { desde: '2026-01-01', hasta: '2026-12-31' },
    detalles: [
      'Aplica aunque el conductor sea el dueño y aunque el parrillero sea su hijo o esté inscrito.',
      'Cubre motos, motocarros, cuatrimotos, mototriciclos y vehículos eléctricos livianos de cualquier cilindraje.',
      'Sí se puede llevar parrillera mujer; si pasas por un corredor de parrillero inscrito, ella debe estar inscrita.',
      'Vence el 31 de diciembre de 2026. Se ha prorrogado cada año desde 2020, pero la prórroga de 2027 aún no existe.',
    ],
    excepciones: ['No tiene excepción por propiedad de la moto ni por cilindraje.'],
    multa: MULTA_C14,
    porque: 'Medida de seguridad contra el hurto y el sicariato en moto en el norte de la ciudad.',
    advertencia: 'El borde hacia la carrera 65 es aproximado: esa carrera no llega hasta la Circunvalar.',
    fuente: FUENTE_0049,
    verificado: false,
    revisadoEl: REVISADO,
  },
  {
    id: 'baq-pasajeros',
    municipio: 'barranquilla',
    tipo: 'pasajeros',
    zona: 'baq-municipio',
    titulo: 'Quiénes no pueden ir en moto',
    resumen:
      'En ninguna parte de Barranquilla pueden ir en moto, ni conduciendo ni de acompañantes, los menores de 12 años y las mujeres embarazadas.',
    efectoBase: 'aviso',
    vigencia: VIGENCIA_1610,
    detalles: ['Vale también para motos de alto cilindraje.', 'Los motocarros solo pueden llevar mercancía, nunca pasajeros.'],
    excepciones: [],
    multa: MULTA_C14,
    porque: 'Son los pasajeros con mayor riesgo de lesión grave en una caída.',
    fuente: FUENTE_1610,
    verificado: false,
    revisadoEl: REVISADO,
  },

  // ─────────────────────────────── Soledad ───────────────────────────────
  {
    id: 'sol-pico-placa',
    municipio: 'soledad',
    tipo: 'placa',
    zona: 'sol-municipio',
    titulo: 'Pico y placa de motos',
    resumen:
      'De lunes a viernes, de 5:00 a.m. a 10:00 p.m., no circulan en Soledad las motos según el último dígito de la placa: lunes 1 y 3, martes 2 y 4, miércoles 5 y 7, jueves 6 y 8, viernes 9 y 0.',
    efectoBase: null,
    franjas: [{ dias: [1, 2, 3, 4, 5], desde: '05:00', hasta: '22:00', efecto: 'pico-placa' }],
    digitos: { 1: [1, 3], 2: [2, 4], 3: [5, 7], 4: [6, 8], 5: [9, 0] },
    vigencia: { desde: '2017-07-06' },
    detalles: [
      'Cubre motocicletas, motociclos, ciclomotores, mototriciclos, tricimotos y cuatrimotos.',
      'Soledad no se acogió al pico y placa departamental del Atlántico: tiene el suyo.',
      'El "Día sin moto" del día 30 de cada mes fue eliminado (Decreto 0021).',
    ],
    excepciones: EXENTOS_SOLEDAD,
    multa: MULTA_C14,
    advertencia:
      'Sin confirmar con el texto oficial. Un sitio dice que solo aplica en el centro y otro que incluye los sábados; aquí asumimos todo el municipio, de lunes a viernes. En agosto de 2025 IMTTRASOL anunció que estudiaba eliminarlo, pero no hay decreto que lo derogue. Confírmalo con IMTTRASOL.',
    fuente: FUENTE_288,
    verificado: false,
    revisadoEl: REVISADO,
  },
  {
    id: 'sol-nocturna',
    municipio: 'soledad',
    tipo: 'circulacion',
    zona: 'sol-municipio',
    titulo: 'Restricción nocturna',
    resumen: 'De 11:00 p.m. a 5:00 a.m., todos los días, no pueden circular motos, mototriciclos, cuatrimotos ni motocarros en Soledad.',
    efectoBase: null,
    franjas: [{ desde: '23:00', hasta: '05:00', efecto: 'prohibido' }],
    vigencia: { desde: '2019-07-26' },
    detalles: ['Hasta 2019 empezaba a las 10:00 p.m.; algunos sitios todavía publican esa hora.'],
    excepciones: EXENTOS_SOLEDAD,
    multa: MULTA_C14,
    advertencia: 'Confirmada por prensa, no por el texto oficial. No sabemos con qué intensidad se controla en 2026.',
    fuente: {
      decreto: 'Decreto 288 de 2017, modificado por el Decreto 271 de 2019',
      url: 'https://www.elheraldo.co/barranquilla/amplian-horario-de-circulacion-de-motos-en-las-vias-de-soledad-654259',
    },
    verificado: false,
    revisadoEl: REVISADO,
  },
  {
    id: 'sol-centro',
    municipio: 'soledad',
    tipo: 'circulacion',
    zona: 'sol-centro',
    titulo: 'Centro de Soledad: tramos prohibidos',
    resumen: 'Las motos no pueden transitar por las calles 17, 18 y 19 entre carreras 18 y 21, ni por la carrera 19 entre calles 17 y 19.',
    efectoBase: 'prohibido',
    vigencia: { desde: '2017-07-06' },
    excepciones: EXENTOS_SOLEDAD,
    multa: MULTA_C14,
    advertencia: 'El mapa pinta el cuadrante que encierran esos tramos, no cada calle por separado.',
    fuente: FUENTE_288,
    verificado: false,
    revisadoEl: REVISADO,
  },
  {
    id: 'sol-general',
    municipio: 'soledad',
    tipo: 'parrillero',
    zona: 'sol-municipio',
    titulo: 'Parrillero y otras cosas a tener en cuenta',
    resumen:
      'En Soledad no hay prohibición permanente de parrillero, ni hombre ni mujer. Solo se expiden medidas temporales por fechas especiales (Halloween, diciembre, Carnaval, elecciones).',
    efectoBase: 'aviso',
    vigencia: { desde: '2026-01-01' },
    detalles: [
      'En la prolongación de la Murillo (calle 63) hay carril "Solo Bus" de Transmetro con cámaras. No lo invadas.',
      'Al cruzar a Barranquilla empiezan a regir las reglas de Barranquilla, que son más estrictas.',
      'Oficina de IMTTRASOL: calle 63 n.º 13-71, C. C. Nuestro Atlántico.',
    ],
    excepciones: [],
    fuente: { decreto: 'Alcaldía de Soledad / IMTTRASOL', url: 'https://www.soledad-atlantico.gov.co/' },
    verificado: false,
    revisadoEl: REVISADO,
  },
  {
    // Medida temporal ya vencida: sirve de ejemplo para cargar la próxima.
    id: 'sol-halloween-2026',
    municipio: 'soledad',
    tipo: 'parrillero',
    zona: 'sol-municipio',
    titulo: 'Parrillero prohibido en Halloween',
    resumen: 'Prohibido circular con parrillero en todo Soledad desde las 6:00 p.m. del 31 de octubre hasta las 6:00 a.m. del 1 de noviembre de 2026.',
    efectoBase: null,
    franjas: [{ desde: '18:00', hasta: '06:00', efecto: 'sin-parrillero' }],
    vigencia: { desde: '2026-10-31', hasta: '2026-10-31' },
    excepciones: [
      'Fuerza Pública, agentes de tránsito, organismos de socorro, personal de salud, vigilancia privada en servicio, personas con discapacidad y urgencias médicas.',
    ],
    multa: MULTA_C14,
    fuente: {
      decreto: 'Decreto Municipal 00136 de 2026',
      url: 'https://www.elheraldo.co/atlantico/2026/10/31/soledad-restringe-el-parrillero-en-moto-durante-la-celebracion-de-halloween/',
    },
    verificado: false,
    revisadoEl: REVISADO,
  },
];

export const ULTIMA_REVISION = REGLAS.map((r) => r.revisadoEl).sort().at(-1)!;

// Reglas de circulación para motos. Actualizar aquí cuando salga un decreto nuevo.
// Cada regla debe enlazar su fuente. `verificado` solo pasa a true cuando se
// contrastó contra el texto oficial del decreto (no contra una nota de prensa).

export type Municipio = 'barranquilla' | 'soledad';
export type Tipo = 'circulacion' | 'parrillero' | 'via' | 'placa' | 'pasajeros';
export type Efecto = 'prohibido' | 'sin-parrillero' | 'sin-parrillero-hombre' | 'aviso';

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
  excepciones: string[];
  multa?: string;
  /** Texto corto que explica el porqué de la medida (parte educativa). */
  porque?: string;
  fuente: { decreto: string; url: string };
  verificado: boolean;
  revisadoEl: string;
};

const MULTA_C14 =
  'Infracción C14 (transitar por sitios u horas restringidas): 15 salarios mínimos diarios e inmovilización de la moto.';

const FUENTE_BAQ = {
  decreto: 'Decreto Distrital 0703 de 2025 (prorrogado por el Decreto 1610 de 2026)',
  url: 'https://barranquilla.gov.co/transito/medidas-que-regulan-circulacion-de-motociclistas-continuan-vigentes-en-barranquilla-hasta-octubre-de-2026',
};

const EXENTAS = 'Motos de 500 cc o más y eléctricas de 11.000 W o más.';

export const REGLAS: Regla[] = [
  {
    id: 'baq-nocturna',
    municipio: 'barranquilla',
    tipo: 'circulacion',
    zona: 'baq-municipio',
    titulo: 'Restricción nocturna',
    resumen: 'No pueden circular motos, motocarros ni mototriciclos en toda Barranquilla entre las 11:00 p.m. y las 5:00 a.m., todos los días.',
    efectoBase: null,
    franjas: [{ desde: '23:00', hasta: '05:00', efecto: 'prohibido' }],
    vigencia: { desde: '2025-11-01', hasta: '2027-10-31' },
    excepciones: [
      'Propietario de la moto que acredite su condición ante la autoridad (tarjeta de propiedad a su nombre).',
      'Acompañante inscrito en el registro de la Secretaría de Tránsito.',
      EXENTAS,
      'Fuerza pública, organismos de socorro y demás casos con permiso de circulación.',
    ],
    multa: MULTA_C14,
    porque: 'La Alcaldía la sustenta en la siniestralidad vial y los delitos cometidos en moto durante la madrugada.',
    fuente: FUENTE_BAQ,
    verificado: false,
    revisadoEl: '2026-11-12',
  },
  {
    id: 'baq-centro',
    municipio: 'barranquilla',
    tipo: 'circulacion',
    zona: 'baq-centro',
    titulo: 'Centro de Barranquilla',
    resumen: 'En el cuadrante Calle 30 – Carrera 46 – Murillo (Calle 45) – Carrera 38 las motos están prohibidas. De 6:00 a.m. a 7:00 p.m. se puede entrar, pero sin parrillero.',
    efectoBase: 'prohibido',
    franjas: [{ desde: '06:00', hasta: '19:00', efecto: 'sin-parrillero' }],
    vigencia: { desde: '2025-11-01', hasta: '2027-10-31' },
    excepciones: [EXENTAS, 'Vehículos con permiso especial de circulación.'],
    multa: MULTA_C14,
    porque: 'Es la zona comercial con más peatones de la ciudad; la excepción diurna existe para que se pueda llegar al comercio.',
    fuente: FUENTE_BAQ,
    verificado: false,
    revisadoEl: '2026-11-12',
  },
  {
    id: 'baq-transmetro',
    municipio: 'barranquilla',
    tipo: 'via',
    zona: 'baq-transmetro',
    titulo: 'Corredores de Transmetro',
    resumen: 'Prohibido transitar en moto por las troncales por donde opera Transmetro (Murillo y Olaya Herrera), las 24 horas.',
    efectoBase: 'prohibido',
    vigencia: { desde: '2025-11-01', hasta: '2027-10-31' },
    excepciones: [
      'El decreto contempla franjas en las que se permite circular sin parrillero. Consulta el texto oficial: aún no las tenemos verificadas.',
      EXENTAS,
    ],
    multa: MULTA_C14,
    porque: 'Los carriles exclusivos y los cruces de las estaciones concentran choques entre buses y motos.',
    fuente: FUENTE_BAQ,
    verificado: false,
    revisadoEl: '2026-11-12',
  },
  {
    id: 'baq-portuario',
    municipio: 'barranquilla',
    tipo: 'via',
    zona: 'baq-portuario',
    titulo: 'Corredor portuario',
    resumen: 'Prohibido transitar en moto por el corredor portuario de forma permanente.',
    efectoBase: 'prohibido',
    vigencia: { desde: '2025-11-01', hasta: '2027-10-31' },
    excepciones: ['Motos que escoltan vehículos de carga en servicio, sin parrillero y con permiso de circulación.'],
    multa: MULTA_C14,
    porque: 'Es una vía de tractomulas hacia el puerto, con puntos ciegos y poca berma.',
    fuente: FUENTE_BAQ,
    verificado: false,
    revisadoEl: '2026-11-12',
  },
  {
    id: 'baq-parrillero-hombre',
    municipio: 'barranquilla',
    tipo: 'parrillero',
    zona: 'baq-parrillero-norte',
    titulo: 'Parrillero hombre prohibido',
    resumen: 'En el cuadrante Calle 72 – Carrera 38 – Carrera 65 – Circunvalar no se puede llevar parrillero hombre en moto, motocarro, cuatrimoto ni mototriciclo.',
    efectoBase: 'sin-parrillero-hombre',
    vigencia: { desde: '2026-01-01', hasta: '2026-12-31' },
    excepciones: ['Menores de edad y demás casos que señala el decreto. Consulta el texto oficial.'],
    multa: MULTA_C14,
    porque: 'Medida de seguridad contra el hurto y el sicariato en moto en el norte de la ciudad.',
    fuente: {
      decreto: 'Decreto Distrital 0049 de 2026',
      url: 'https://www.eltiempo.com/colombia/barranquilla/barranquilla-mantiene-la-prohibicion-del-parrillero-hombre-en-sectores-priorizados-de-la-ciudad-3529682',
    },
    verificado: false,
    revisadoEl: '2026-11-12',
  },
  {
    id: 'baq-pasajeros',
    municipio: 'barranquilla',
    tipo: 'pasajeros',
    zona: 'baq-municipio',
    titulo: 'Pasajeros que no pueden ir en moto',
    resumen: 'En Barranquilla no pueden ir como parrilleros las mujeres embarazadas ni los menores de 12 años.',
    efectoBase: 'aviso',
    vigencia: { desde: '2025-11-01', hasta: '2027-10-31' },
    excepciones: [],
    porque: 'Son los pasajeros con mayor riesgo de lesión grave en una caída.',
    fuente: FUENTE_BAQ,
    verificado: false,
    revisadoEl: '2026-11-12',
  },
  {
    id: 'sol-general',
    municipio: 'soledad',
    tipo: 'circulacion',
    zona: 'sol-municipio',
    titulo: 'Soledad: medidas por confirmar',
    resumen: 'Soledad tiene normas propias y suele expedir decretos temporales (por ejemplo, parrillero prohibido en Halloween). El pico y placa de motos que publican otros sitios no lo hemos podido confirmar con el decreto oficial.',
    efectoBase: 'aviso',
    vigencia: { desde: '2026-01-01' },
    excepciones: [],
    fuente: { decreto: 'Alcaldía de Soledad / IMTTRASOL', url: 'https://www.soledad-atlantico.gov.co/' },
    verificado: false,
    revisadoEl: '2026-11-12',
  },
  {
    // Ejemplo de medida temporal ya vencida: muestra cómo cargar la próxima.
    id: 'sol-halloween-2026',
    municipio: 'soledad',
    tipo: 'parrillero',
    zona: 'sol-municipio',
    titulo: 'Parrillero prohibido en Halloween',
    resumen: 'Prohibido circular con parrillero en todo Soledad desde las 6:00 p.m. del 31 de octubre hasta las 6:00 a.m. del 1 de noviembre de 2026.',
    efectoBase: null,
    franjas: [{ desde: '18:00', hasta: '06:00', efecto: 'sin-parrillero' }],
    vigencia: { desde: '2026-10-31', hasta: '2026-10-31' },
    excepciones: ['Fuerza pública, agentes de tránsito, organismos de socorro, personal de salud, vigilancia privada en servicio, personas con discapacidad y urgencias médicas.'],
    multa: MULTA_C14,
    fuente: {
      decreto: 'Decreto Municipal 00136 de 2026',
      url: 'https://www.elheraldo.co/atlantico/2026/10/31/soledad-restringe-el-parrillero-en-moto-durante-la-celebracion-de-halloween/',
    },
    verificado: false,
    revisadoEl: '2026-11-12',
  },
];

export const ULTIMA_REVISION = REGLAS.map((r) => r.revisadoEl).sort().at(-1)!;

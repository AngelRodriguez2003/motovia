// Preguntas frecuentes por ciudad, redactadas como la gente las busca en Google.
// Las respuestas deben coincidir con data/reglas.ts: si cambia una regla, revisa aquí también.
import type { Municipio } from './reglas';

export type Pregunta = { q: string; a: string };

export const PREGUNTAS: Record<Municipio, Pregunta[]> = {
  barranquilla: [
    {
      q: '¿A qué hora no pueden circular las motos en Barranquilla?',
      a: 'De 11:00 p.m. a 5:00 a.m., todos los días. En esa franja solo puede circular el propietario conduciendo su propia moto, mostrando la licencia de tránsito a su nombre, y con acompañante únicamente si está inscrito.',
    },
    {
      q: '¿Hay pico y placa para motos en Barranquilla?',
      a: 'No. En Barranquilla las restricciones para motos no dependen de la placa: aplican por zona y por hora. El pico y placa por dígito para motos es de Soledad.',
    },
    {
      q: '¿Dónde está prohibido el parrillero hombre en Barranquilla?',
      a: 'En el cuadrante entre la calle 72, la carrera 38, la carrera 65 y la Circunvalar, las 24 horas. Aplica aunque el conductor sea el dueño de la moto y aunque el parrillero sea su hijo. La parrillera mujer sí está permitida.',
    },
    {
      q: '¿Las motos pueden entrar al Centro de Barranquilla?',
      a: 'No. Está prohibido circular en moto en el cuadrante de las calles 30 a 45 y las carreras 38 a 46. De 6:00 a.m. a 7:00 p.m. se pueden usar 11 tramos comerciales sin parrillero, y existe un permiso especial gratuito para quien vive, estudia o trabaja allí.',
    },
    {
      q: '¿Las motos pueden transitar por la Murillo y la carrera 46?',
      a: 'No. Son vías de Transmetro y están prohibidas para motos todos los días: la Murillo (calle 45) entre la carrera 1 y la carrera 46, y la carrera 46 entre las calles 30 y 74. Hay cámaras de fotodetección.',
    },
    {
      q: '¿Cómo inscribo a mi parrillero en Barranquilla?',
      a: 'El dueño de la moto lo hace en el portal de la Secretaría Distrital de Tránsito y Seguridad Vial. Puede incluir a su cónyuge, a sus hijos de 12 años o más y hasta ocho personas más. Se permite una modificación al mes y no hay que llevar la inscripción impresa.',
    },
    {
      q: '¿Puedo llevar a un niño en la moto en Barranquilla?',
      a: 'Solo si tiene 12 años o más. Los menores de 12 años y las mujeres embarazadas no pueden ir en moto en ninguna parte de la ciudad.',
    },
    {
      q: '¿Cuánto es la multa por circular en zona u hora restringida?',
      a: 'Es la infracción C.14: $633.111 en 2026, más la inmovilización de la moto. A eso se suman la grúa y los patios.',
    },
  ],
  soledad: [
    {
      q: '¿Cómo es el pico y placa para motos en Soledad?',
      a: 'De lunes a viernes, de 5:00 a.m. a 10:00 p.m., según el último dígito de la placa: lunes 1 y 3, martes 2 y 4, miércoles 5 y 7, jueves 6 y 8, viernes 9 y 0. Sábados y domingos no aplica. Las fuentes públicas no coinciden en todos los detalles, así que conviene confirmarlo con el Instituto de Tránsito de Soledad.',
    },
    {
      q: '¿A qué hora no pueden circular las motos en Soledad?',
      a: 'De 11:00 p.m. a 5:00 a.m., todos los días, salvo los exentos del decreto local.',
    },
    {
      q: '¿Está prohibido el parrillero en Soledad?',
      a: 'No hay prohibición permanente de parrillero, ni hombre ni mujer. La Alcaldía solo expide medidas temporales en fechas especiales como Halloween, diciembre, Carnaval o elecciones.',
    },
    {
      q: '¿Qué motos están exentas del pico y placa en Soledad?',
      a: 'Fuerza pública, tránsito, socorro y personal de salud; motos de 598 cc o más; mensajería, servicios públicos y transporte de mercancía; y quien tenga el permiso especial del Instituto de Tránsito, que dura 6 meses y no permite parrillero.',
    },
    {
      q: '¿Por dónde no pueden pasar las motos en el centro de Soledad?',
      a: 'Por las calles 17, 18 y 19 entre las carreras 18 y 21, ni por la carrera 19 entre las calles 17 y 19.',
    },
    {
      q: '¿Cuánto es la multa por pico y placa de moto en Soledad?',
      a: 'Es la infracción C.14: $633.111 en 2026, más la inmovilización de la moto.',
    },
  ],
};

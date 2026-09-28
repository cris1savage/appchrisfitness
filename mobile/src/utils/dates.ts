export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/** Nombre del día actual con la semana empezando en lunes. */
export function diaDeHoy(date = new Date()) {
  return DIAS[(date.getDay() + 6) % 7];
}

/** Parsea 'YYYY-MM-DD' como fecha LOCAL (new Date('2026-09-19') la toma como UTC y puede mostrar el día anterior). */
export function parseLocalDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toIsoDate(y: number, monthIndex: number, d: number) {
  return `${y}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Orden de JavaScript getDay() y de day_of_week en la base de datos (0 = domingo) */
export const DIAS_DOMINGO_PRIMERO = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

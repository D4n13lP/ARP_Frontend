// El backend guarda las fechas en UTC (Postgres) y toLocaleString() sin
// timeZone usa la del navegador/SO de quien esté viendo la pantalla — si esa
// máquina no está en Ciudad de México, la fecha/hora mostrada no coincide con
// la de la tienda. Fijamos siempre America/Mexico_City sin importar dónde se
// abra la app.
export function formatDateTimeMX(value: string | Date | null | undefined): string {
  if (!value) return '';
  return new Date(value).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
}

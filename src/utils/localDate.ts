// src/utils/localDate.ts
// Helper para construir un "YYYY-MM-DD" de calendario en hora LOCAL del
// navegador (México, en esta terminal) al mandarlo al backend para columnas
// DATEONLY (transactionDate, deliveryDate, etc.). Usar
// new Date().toISOString().slice(0,10) aquí adelanta la fecha hasta 6 horas
// — un día calendario completo — respecto a la hora real del negocio entre
// las 18:00 y las 23:59, porque toISOString siempre da la fecha en UTC, sin
// importar el reloj local del equipo. Mismo patrón que ya usaba
// ClientHistory_Page.tsx antes de que este archivo existiera.
//
// OJO: esto es solo para columnas DATEONLY (sin hora). Las columnas
// "timestamp without time zone" de este proyecto (paymentDate,
// adjustmentDate, withdrawalDate) se siguen mandando como instante real
// (new Date().toISOString() normal) — el backend ya las convierte a hora de
// México solo al mostrarlas (ver formatDateTimeMX), y guardarlas aquí como
// hora local rompería esa conversión.
export function toLocalDateOnly(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

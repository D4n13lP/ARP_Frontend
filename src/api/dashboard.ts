import { http } from './http'
import { DashboardSchema, type Dashboard } from '../types'

// ventasPeriodDays: ventana (7 o 30) para USUARIOS CON MÁS VENTAS — el
// backend valida el valor por su cuenta, aquí solo se manda si se pidió.
export async function getDashboardMetrics(ventasPeriodDays?: number): Promise<Dashboard> {
  const { data } = await http.get('/dashboard', { params: ventasPeriodDays ? { ventasPeriodDays } : undefined })
  return DashboardSchema.parse(data)
}

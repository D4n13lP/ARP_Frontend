import { http } from './http'
import { DashboardSchema, type Dashboard } from '../types'

export async function getDashboardMetrics(): Promise<Dashboard> {
  const { data } = await http.get('/dashboard')
  return DashboardSchema.parse(data)
}

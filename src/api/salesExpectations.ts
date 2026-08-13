import { http } from './http'
import { SalesExpectationSchema, type SalesExpectation } from '../types'

export async function getSalesExpectations(filters?: { prodCode?: string }): Promise<SalesExpectation[]> {
  const { data } = await http.get('/sales-expectations', { params: filters })
  return SalesExpectationSchema.array().parse(data)
}

export async function createSalesExpectation(payload: { prodCode: string; timeunitID: string; quantity: number; periodLength?: number }): Promise<SalesExpectation> {
  const { data } = await http.post('/sales-expectations', payload)
  return SalesExpectationSchema.parse(data)
}

export async function updateSalesExpectation(expectationID: string, payload: { timeunitID?: string; quantity?: number; periodLength?: number }): Promise<SalesExpectation> {
  const { data } = await http.put(`/sales-expectations/${expectationID}`, payload)
  return SalesExpectationSchema.parse(data)
}

export async function deleteSalesExpectation(expectationID: string): Promise<void> {
  await http.delete(`/sales-expectations/${expectationID}`)
}

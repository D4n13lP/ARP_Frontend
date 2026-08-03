import { http } from './http'

export async function createSalesExpectation(payload: { prodCode: string; timeunitID: string; quantity: number }): Promise<void> {
  await http.post('/sales-expectations', payload)
}

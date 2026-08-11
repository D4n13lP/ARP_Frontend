import { http } from './http'
import { TransDiscountSchema, type TransDiscount } from '../types'

export async function getTransDiscounts(): Promise<TransDiscount[]> {
  const { data } = await http.get('/trans-discounts')
  return TransDiscountSchema.array().parse(data)
}

export async function updateTransDiscount(transDiscountID: string, payload: Partial<TransDiscount>): Promise<TransDiscount> {
  const { data } = await http.put(`/trans-discounts/${transDiscountID}`, payload)
  return TransDiscountSchema.parse(data)
}

// Solo por si t1/t2 aún no existen en la BD (siembra defensiva) — en el uso
// normal ya vienen creados y esta pantalla solo actualiza su percent.
export async function createTransDiscount(payload: Pick<TransDiscount, 'type' | 'percent'>): Promise<TransDiscount> {
  const { data } = await http.post('/trans-discounts', payload)
  return TransDiscountSchema.parse(data)
}

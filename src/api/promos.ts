import { http } from './http'
import { PromoSchema, type Promo } from '../types'

export async function getPromos(): Promise<Promo[]> {
  const { data } = await http.get('/promos')
  return PromoSchema.array().parse(data)
}

export async function createPromo(discountPercentage: number): Promise<Promo> {
  const { data } = await http.post('/promos', { discountPercentage })
  return PromoSchema.parse(data)
}

export async function updatePromo(discountID: string, payload: Partial<Promo>): Promise<Promo> {
  const { data } = await http.put(`/promos/${discountID}`, payload)
  return PromoSchema.parse(data)
}

import { http } from './http'
import { TransDiscountSchema, type TransDiscount } from '../types'

export async function getTransDiscounts(): Promise<TransDiscount[]> {
  const { data } = await http.get('/trans-discounts')
  return TransDiscountSchema.array().parse(data)
}

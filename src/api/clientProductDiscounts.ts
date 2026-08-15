import { http } from './http'
import { ClientProductDiscountSchema, type ClientProductDiscount } from '../types'

export async function getClientProductDiscounts(clientCode: string): Promise<ClientProductDiscount[]> {
  const { data } = await http.get('/client-product-discounts', { params: { clientCode } })
  return ClientProductDiscountSchema.array().parse(data)
}

// Crea o actualiza (upsert por clientCode+prodCode) el descuento de un
// cliente sobre un producto.
export async function saveClientProductDiscount(payload: { clientCode: string; prodCode: string; discountPercentage: number }): Promise<ClientProductDiscount> {
  const { data } = await http.post('/client-product-discounts', payload)
  return ClientProductDiscountSchema.parse(data)
}

export async function deleteClientProductDiscount(clientProductDiscountID: string): Promise<void> {
  await http.delete(`/client-product-discounts/${clientProductDiscountID}`)
}

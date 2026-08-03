import { http } from './http'
import { ProductUnitSchema, type ProductUnit } from '../types'

export async function getProductUnits(): Promise<ProductUnit[]> {
  const { data } = await http.get('/product-units')
  return ProductUnitSchema.array().parse(data)
}

export async function createProductUnit(produnitName: string): Promise<ProductUnit> {
  const { data } = await http.post('/product-units', { produnitName })
  return ProductUnitSchema.parse(data)
}

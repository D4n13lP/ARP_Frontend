import { http } from './http'
import { WarehouseSchema, type Warehouse } from '../types'

export async function getWarehouses(): Promise<Warehouse[]> {
  const { data } = await http.get('/warehouses')
  return WarehouseSchema.array().parse(data)
}

export async function createWarehouse(payload: Partial<Warehouse>): Promise<Warehouse> {
  const { data } = await http.post('/warehouses', payload)
  return WarehouseSchema.parse(data)
}

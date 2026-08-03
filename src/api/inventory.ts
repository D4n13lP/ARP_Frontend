import { http } from './http'
import { InventorySchema, type Inventory } from '../types'

export async function getInventories(): Promise<Inventory[]> {
  const { data } = await http.get('/inventories')
  return InventorySchema.array().parse(data)
}

export async function createInventory(payload: { prodCode: string; whID: string; quantity: number; inventoryName?: string }): Promise<Inventory> {
  const { data } = await http.post('/inventories', payload)
  return InventorySchema.parse(data)
}

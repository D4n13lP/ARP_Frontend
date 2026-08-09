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

// Protegido en el backend: admin, o vendedor con canEdit activado para el
// módulo 'inventory'. Si cambia la cantidad o el almacén (whID), el backend
// registra el ajuste/transferencia automáticamente en el historial (ver
// InventoryAdjustment).
export async function updateInventory(inventoryID: string, payload: { quantity?: number; whID?: string; description?: string }): Promise<Inventory> {
  const { data } = await http.put(`/inventories/${inventoryID}`, payload)
  return InventorySchema.parse(data)
}

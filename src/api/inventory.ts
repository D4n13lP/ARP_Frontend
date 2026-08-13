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

// Mueve stock de un producto hacia OTRO almacén (a diferencia de updateInventory,
// que reasigna toda la fila). mode 'transfer' resta de sourceWhID y suma en
// destinationWhID (queda en Historial de transferencias); mode 'ingresar' solo
// suma en destinationWhID, sin tocar ningún origen (queda en Historial de
// ajustes). sourceWhID puede ir null si el producto todavía no tenía almacén
// asignado (fila "virtual" en la tabla) — ahí solo 'ingresar' tiene sentido.
export async function transferInventory(payload: {
  prodCode: string;
  sourceWhID: string | null;
  destinationWhID: string;
  quantity: number;
  mode: 'transfer' | 'ingresar';
}): Promise<void> {
  await http.post('/inventories/transfer', payload)
}

// Borra el registro de inventario (producto+almacén) por completo — se usa
// en Inventory.tsx, solo habilitado en el frontend cuando la cantidad es 0.
export async function deleteInventory(inventoryID: string): Promise<void> {
  await http.delete(`/inventories/${inventoryID}`)
}

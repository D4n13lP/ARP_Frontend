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

// El backend rechaza el borrado (400) si el almacén todavía tiene productos
// en "inventory" — en el frontend el botón "Eliminar" ya se oculta en ese
// caso, esto es el respaldo del lado del servidor.
export async function deleteWarehouse(whID: string): Promise<void> {
  await http.delete(`/warehouses/${whID}`)
}

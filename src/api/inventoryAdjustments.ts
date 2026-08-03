import { http } from './http'
import { InventoryAdjustmentSchema, type InventoryAdjustment } from '../types'

export async function getInventoryAdjustments(): Promise<InventoryAdjustment[]> {
  const { data } = await http.get('/inventory-adjustments')
  return InventoryAdjustmentSchema.array().parse(data)
}

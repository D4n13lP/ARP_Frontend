import { http } from './http'
import { CourierSchema, type Courier } from '../types'

export async function getCouriers(): Promise<Courier[]> {
  const { data } = await http.get('/couriers')
  return CourierSchema.array().parse(data)
}

export async function createCourier(courierName: string): Promise<Courier> {
  const { data } = await http.post('/couriers', { courierName })
  return CourierSchema.parse(data)
}

export async function deleteCourier(courierID: string): Promise<void> {
  await http.delete(`/couriers/${courierID}`)
}

import { http } from './http'
import { TimeUnitSchema, type TimeUnit } from '../types'

export async function getTimeUnits(): Promise<TimeUnit[]> {
  const { data } = await http.get('/time-units')
  return TimeUnitSchema.array().parse(data)
}

export async function createTimeUnit(timeunitName: string): Promise<TimeUnit> {
  const { data } = await http.post('/time-units', { timeunitName })
  return TimeUnitSchema.parse(data)
}

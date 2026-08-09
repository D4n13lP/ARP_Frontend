import { http } from './http'
import { ModuleSchema, type Module } from '../types'

export async function getModules(): Promise<Module[]> {
  const { data } = await http.get('/modules')
  return ModuleSchema.array().parse(data)
}

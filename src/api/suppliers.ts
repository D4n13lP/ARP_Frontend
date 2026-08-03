import { http } from './http'
import { SupplierSchema, type Supplier } from '../types'

export async function getSuppliers(): Promise<Supplier[]> {
  const { data } = await http.get('/suppliers')
  return SupplierSchema.array().parse(data)
}

export async function getSupplierById(suppCode: string): Promise<Supplier> {
  const { data } = await http.get(`/suppliers/${suppCode}`)
  return SupplierSchema.parse(data)
}

export async function createSupplier(payload: Partial<Supplier>): Promise<Supplier> {
  const { data } = await http.post('/suppliers', payload)
  return SupplierSchema.parse(data)
}

export async function updateSupplier(suppCode: string, payload: Partial<Supplier>): Promise<Supplier> {
  const { data } = await http.put(`/suppliers/${suppCode}`, payload)
  return SupplierSchema.parse(data)
}

export async function deleteSupplier(suppCode: string): Promise<void> {
  await http.delete(`/suppliers/${suppCode}`)
}

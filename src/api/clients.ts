import { http } from './http'
import { ClientSchema, type Client } from '../types'

export async function getClients(): Promise<Client[]> {
  const { data } = await http.get('/clients')
  return ClientSchema.array().parse(data)
}

export async function getClientById(clientCode: string): Promise<Client> {
  const { data } = await http.get(`/clients/${clientCode}`)
  return ClientSchema.parse(data)
}

export async function createClient(payload: Partial<Client>): Promise<Client> {
  const { data } = await http.post('/clients', payload)
  return ClientSchema.parse(data)
}

export async function updateClient(clientCode: string, payload: Partial<Client>): Promise<Client> {
  const { data } = await http.put(`/clients/${clientCode}`, payload)
  return ClientSchema.parse(data)
}

export async function deleteClient(clientCode: string): Promise<void> {
  await http.delete(`/clients/${clientCode}`)
}

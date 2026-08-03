import { http } from './http'
import { DestAccountSchema, type DestAccount } from '../types'

export async function getDestAccounts(): Promise<DestAccount[]> {
  const { data } = await http.get('/dest-accounts')
  return DestAccountSchema.array().parse(data)
}

export async function createDestAccount(payload: Partial<DestAccount>): Promise<DestAccount> {
  const { data } = await http.post('/dest-accounts', payload)
  return DestAccountSchema.parse(data)
}

export async function deleteDestAccount(clabe: string): Promise<void> {
  await http.delete(`/dest-accounts/${clabe}`)
}

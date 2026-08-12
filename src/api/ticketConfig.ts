import { http } from './http'
import { TicketConfigSchema, type TicketConfig } from '../types'

// Cualquier usuario autenticado (lo necesita para imprimir el ticket).
export async function getTicketConfig(): Promise<TicketConfig> {
  const { data } = await http.get('/ticket-config')
  return TicketConfigSchema.parse(data)
}

// Protegido en el backend: solo admin (ver EditTicketConfig_Page).
export async function updateTicketConfig(payload: TicketConfig): Promise<TicketConfig> {
  const { data } = await http.put('/ticket-config', payload)
  return TicketConfigSchema.parse(data)
}

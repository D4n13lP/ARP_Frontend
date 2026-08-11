import { http } from './http'
import { TotalCashSchema, type TotalCash } from '../types'

export async function getTotalCash(): Promise<TotalCash[]> {
  const { data } = await http.get('/total-cash')
  return TotalCashSchema.array().parse(data)
}

// Registra un retiro de efectivo (Retiros_Page). ownUserID/adminUserID van
// como el usuario en sesión: la pantalla no tiene un paso de aprobación
// separado por otro admin, es autoservicio para quien tenga acceso a la vista.
export async function createWithdrawal(payload: {
  ownUserID: string;
  adminUserID: string;
  withdrawalAmount: number;
  withdrawalDate: string;
}): Promise<TotalCash> {
  const { data } = await http.post('/total-cash', payload)
  return TotalCashSchema.parse(data)
}

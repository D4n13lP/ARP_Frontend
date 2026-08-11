import { http } from './http'
import { PaymentHistorySchema, type PaymentHistory } from '../types'

// Usado por Retiros_Page para sumar el efectivo real recibido (paymentMethod
// 'cash') y calcular el saldo disponible en caja.
export async function getPaymentHistories(): Promise<PaymentHistory[]> {
  const { data } = await http.get('/payment-histories')
  return PaymentHistorySchema.array().parse(data)
}

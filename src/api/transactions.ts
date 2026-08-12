import { http } from './http'
import { SaleTransactionSchema, type SaleTransaction, TransactionSchema, type Transaction } from '../types'

export interface SaleItemPayload {
  inventoryID: string;
  quantity: number;
  discountPercent?: number; // 0-100
}

export interface CreateSalePayload {
  clientCode?: string | null;
  newClient?: { clientName: string; clientPhone1?: string; RFC?: string };
  items: SaleItemPayload[];
  paymentMethod: 'cash' | 'digital';
  destAccountClabe?: string | null;
  transDiscountID?: string | null;
  delivery: {
    enTienda: boolean;
    address?: string | null;
    inmediata: boolean;
    dispatchDateI?: string | null;
    dispatchDateF?: string | null;
    courierID?: string | null;
  };
  shippingCost?: number;
}

// Protegido en el backend: admin, o vendedor con canCreate activado para el
// módulo 'register-sale'. Descuenta inventario y crea todo lo relacionado
// (transacción, renglones, pago...) en una sola transacción de BD — ver
// createSale en transaction.controller.ts.
export async function createSale(payload: CreateSalePayload): Promise<SaleTransaction> {
  const { data } = await http.post('/transactions/sale', payload)
  return SaleTransactionSchema.parse(data)
}

export interface CreateOrderPayload {
  clientCode?: string | null;
  newClient?: { clientName: string; clientPhone1?: string; RFC?: string };
  items: SaleItemPayload[];
  // A diferencia de la venta, el pedido puede quedar sin ningún pago todavía
  // (depositAmount 0 u omitido) — en ese caso paymentMethod/destAccountClabe
  // tampoco hacen falta.
  depositAmount?: number;
  paymentMethod?: 'cash' | 'digital';
  destAccountClabe?: string | null;
  transDiscountID?: string | null;
  delivery: {
    enTienda: boolean;
    address?: string | null;
    inmediata: boolean;
    dispatchDateI?: string | null;
    dispatchDateF?: string | null;
    courierID?: string | null;
  };
  shippingCost?: number;
}

// Igual que createSale pero para RegisterOrder_Page — ver createOrder en
// transaction.controller.ts. Permiso: módulo 'register-order'.
export async function createOrder(payload: CreateOrderPayload): Promise<SaleTransaction> {
  const { data } = await http.post('/transactions/order', payload)
  return SaleTransactionSchema.parse(data)
}

// GET /transactions con filtros opcionales — usado por UpdateOrder_Page
// (transType=order, status=pending), OrdersReports_Page (transType=order,
// todas; el rango de fechas se filtra en el cliente), ClientHistory_Page
// (clientCode; el backend agrega ahí el detalle de productos de cada compra)
// y SalesReport_Page (includePayments; el backend agrega ahí el historial de
// pagos con la cuenta destino, para mostrar la forma de pago de cada venta).
export async function getTransactions(filters?: { transType?: 'sale' | 'order'; status?: 'pending' | 'completed'; clientCode?: string; includePayments?: boolean }): Promise<Transaction[]> {
  const { data } = await http.get('/transactions', { params: filters })
  return TransactionSchema.array().parse(data)
}

export async function getTransactionById(transactionID: string): Promise<Transaction> {
  const { data } = await http.get(`/transactions/${transactionID}`)
  return TransactionSchema.parse(data)
}

// Protegido: admin, o vendedor con canEdit en 'update-order'. Se usa para
// marcar el estado de la entrega (status: 'pending' | 'completed').
export async function updateTransactionStatus(transactionID: string, payload: { status: 'pending' | 'completed'; deliveryDate?: string | null }): Promise<Transaction> {
  const { data } = await http.put(`/transactions/${transactionID}`, payload)
  return TransactionSchema.parse(data)
}

// "Abonar importe" en OrderDetail_Page — mismo permiso que updateTransactionStatus.
export async function addPayment(transactionID: string, payload: { paymentAmount: number; paymentMethod: 'cash' | 'digital'; destAccountClabe?: string | null }): Promise<Transaction> {
  const { data } = await http.post(`/transactions/${transactionID}/payments`, payload)
  return TransactionSchema.parse(data)
}

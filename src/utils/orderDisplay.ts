import type { Transaction } from '../types';

// Helpers compartidos por UpdateOrder_Page / OrderDetail_Page / OrdersReports_Page
// para mostrar los mismos datos de una transacción de forma consistente.

// Las columnas DATEONLY (transactionDate, deliveryDate, dispatchDateI/F) ya
// vienen como "YYYY-MM-DD" del backend — reacomodar el string a mano evita
// cualquier lío de zona horaria de parsear con `new Date(...)`.
export function formatDateOnly(iso?: string | null): string {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatDeliveryDate(order: Pick<Transaction, 'deliveryDate' | 'dispatchDateI' | 'dispatchDateF'>): string {
  if (order.deliveryDate) return formatDateOnly(order.deliveryDate);
  if (order.dispatchDateI) return `${formatDateOnly(order.dispatchDateI)} hasta ${formatDateOnly(order.dispatchDateF)}`;
  return '-';
}

export function getEstadoEntregaLabel(status: Transaction['status']): string {
  return status === 'completed' ? 'Entregado' : 'Pendiente entrega';
}

export function getVendedorName(order: Pick<Transaction, 'users'>): string {
  return order.users?.[0]?.userName || '-';
}

export function getRepartidorName(order: Pick<Transaction, 'couriers'>): string {
  return order.couriers?.[0]?.courierName || '-';
}

export function getLugarEntrega(order: Pick<Transaction, 'deliveryLocation'>): string {
  return order.deliveryLocation || 'En tienda';
}

export function getImporteACuenta(order: Pick<Transaction, 'finalAmount' | 'outstandingAmount'>): number {
  return order.finalAmount - order.outstandingAmount;
}

export function getClienteNombre(order: Pick<Transaction, 'client'>): string {
  return order.client?.clientName || 'Cliente no registrado';
}

export function formatMoney(val: number): string {
  return `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

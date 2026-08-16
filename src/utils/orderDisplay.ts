import type { Transaction } from '../types';
import type { TicketData } from '../components/TicketPrintModal';

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

// Reconstruye el ticket original de una venta/pedido ya registrado, a partir
// de lo que trae Transaction (sin volver a pedirle nada más al backend) —
// usado por el botón "Reimprimir ticket" en OrderDetail_Page/SalesReport_Page.
// El pago más antiguo (payments[]) es el que se registró al momento de crear
// la transacción (venta: importe completo; pedido: el anticipo, si lo hubo,
// puede no existir si fue "Sin anticipo") — ver processTransaction en el
// backend, que crea ese PaymentHistory ahí mismo si paymentAmount > 0.
export function buildTicketDataFromTransaction(order: Transaction, tipo: 'venta' | 'pedido'): TicketData {
  const details = order.details || [];
  const subtotalBruto = details.reduce((sum, d) => sum + Number(d.unitPrice) * d.quantity, 0);
  const subtotalConDescuento = details.reduce((sum, d) => sum + Number(d.subtotal), 0);
  const costoEnvio = Math.max(0, order.finalAmount - subtotalConDescuento);

  const payments = order.payments || [];
  const primerPago = payments.length > 0
    ? [...payments].sort((a, b) => {
        const ta = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const tb = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
        return ta - tb;
      })[0]
    : null;

  const totalPago = tipo === 'venta' ? order.finalAmount : Number(primerPago?.paymentAmount || 0);
  const destAccountAlias = primerPago?.destAccount?.accountAlias;
  const formaPago = primerPago?.paymentMethod === 'cash'
    ? 'Efectivo'
    : (destAccountAlias ? `Transferencia / tarjeta — ${destAccountAlias}` : 'Transferencia / tarjeta');
  const tipoPago = tipo === 'pedido' && totalPago <= 0 ? 'Sin anticipo' : formaPago;

  // Transaction no guarda hora, solo transactionDate (DATEONLY) — cuando hay
  // un pago (venta siempre; pedido solo si hubo anticipo) se usa su hora
  // real; si no, se aproxima al mediodía CDMX del día registrado.
  const fecha = primerPago?.paymentDate
    ? new Date(primerPago.paymentDate)
    : new Date(`${order.transactionDate}T12:00:00-06:00`);

  return {
    tipo,
    folio: order.folio ?? order.transactionID,
    fecha,
    vendedor: getVendedorName(order),
    cliente: getClienteNombre(order),
    domicilio: tipo === 'pedido' ? getLugarEntrega(order) : undefined,
    fechaEntrega: tipo === 'pedido' ? formatDeliveryDate(order) : undefined,
    items: details.map((item) => ({
      nombre: item.product?.productName || '',
      cantidad: item.quantity,
      precio: item.unitPrice,
      importe: item.subtotal,
    })),
    subtotal: subtotalBruto,
    descuento: subtotalBruto - subtotalConDescuento,
    costoEnvio,
    total: order.finalAmount,
    anticipo: tipo === 'pedido' ? totalPago : undefined,
    restante: tipo === 'pedido' ? Math.max(0, order.finalAmount - totalPago) : undefined,
    tipoPago,
    totalPago,
    metodoPagoEsEfectivo: totalPago > 0 && primerPago?.paymentMethod === 'cash',
  };
}

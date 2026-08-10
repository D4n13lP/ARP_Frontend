import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getTransactionById, updateTransactionStatus, addPayment } from '../api/transactions';
import { getDestAccounts } from '../api/destAccounts';
import { getErrorMessage } from '../utils/errorMessage';
import { formatDateOnly, formatDeliveryDate, getVendedorName, getRepartidorName, getLugarEntrega, getImporteACuenta, formatMoney } from '../utils/orderDisplay';
import type { DestAccount, Transaction } from '../types';

export default function OrderDetail_Page() {
  const navigate = useNavigate();
  const { transactionID } = useParams();

  const [order, setOrder] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [destAccounts, setDestAccounts] = useState<DestAccount[]>([]);

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'digital' | ''>('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [addingPayment, setAddingPayment] = useState(false);

  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'completed'>('pending');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDestAccounts().then(setDestAccounts).catch(() => {});
  }, []);

  useEffect(() => {
    if (!transactionID) return;
    setLoading(true);
    getTransactionById(transactionID)
      .then((data) => {
        setOrder(data);
        setDeliveryStatus(data.status);
      })
      .catch((error) => alert(getErrorMessage(error, 'No se pudo cargar el pedido.')))
      .finally(() => setLoading(false));
  }, [transactionID]);

  const handleAddPayment = async () => {
    if (!order) return;
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      alert('Ingresa un importe válido.');
      return;
    }
    if (!paymentMethod) {
      alert('Selecciona la forma de pago.');
      return;
    }
    if (paymentMethod === 'digital' && !destinationAccount) {
      alert('Selecciona una cuenta destino.');
      return;
    }
    if (amount > order.outstandingAmount) {
      alert(`El abono no puede ser mayor al importe pendiente (${formatMoney(order.outstandingAmount)}).`);
      return;
    }

    setAddingPayment(true);
    try {
      const updated = await addPayment(order.transactionID, {
        paymentAmount: amount,
        paymentMethod,
        destAccountClabe: paymentMethod === 'digital' ? destinationAccount : null,
      });
      setOrder(updated);
      setPaymentAmount('');
      setPaymentMethod('');
      setDestinationAccount('');
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo registrar el abono.'));
    } finally {
      setAddingPayment(false);
    }
  };

  const handleSave = async () => {
    if (!order) return;
    if (deliveryStatus === 'completed' && order.outstandingAmount > 0) {
      alert('No puedes marcar el pedido como Entregado mientras tenga un importe pendiente de cobrar.');
      return;
    }
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await updateTransactionStatus(order.transactionID, {
        status: deliveryStatus,
        deliveryDate: deliveryStatus === 'completed' ? today : order.deliveryDate,
      });
      alert('Pedido actualizado exitosamente.');
      navigate(-1);
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo actualizar el pedido.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">

      {/* Header */}
      <div className="w-full max-w-7xl mb-8 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-20">
        {/* Back Button and Logo (Left) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-6">
          <img
            src={logoEmpresa}
            alt="Logo Empresa"
            className="h-20 w-auto object-contain"
          />
          <button
            onClick={() => navigate(-1)}
            className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-6 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
          >
            Atras
          </button>
        </div>

        {/* Title Centered with Icon */}
        <div className="flex items-center gap-4 text-[#e2694b]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Pedidos
          </h1>
          <Receipt size={45} strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="text-2xl font-medium text-gray-800 mb-10 text-center">
        Actualización de pedidos
      </h2>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : !order ? (
        <p className="text-gray-500">No se encontró el pedido.</p>
      ) : (
      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-12 mt-4 px-4">

        {/* Left Column: Display Information */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Folio:</span>
            <span className="text-gray-600">{order.folio}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Fecha de orden:</span>
            <span className="text-gray-600">{formatDateOnly(order.transactionDate)}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Fecha de entrega:</span>
            <span className="text-gray-600">{formatDeliveryDate(order)}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Cliente:</span>
            <span className="text-gray-600">{order.client?.clientName || 'Cliente no registrado'}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Teléfono Cliente:</span>
            <span className="text-gray-600">{order.client?.clientPhone1 || '-'}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">RFC Cliente:</span>
            <span className="text-gray-600">{order.client?.RFC || '-'}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Vendedor:</span>
            <span className="text-gray-600">{getVendedorName(order)}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Repartidor:</span>
            <span className="text-gray-600">{getRepartidorName(order)}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Lugar de entrega:</span>
            <span className="text-gray-600">{getLugarEntrega(order)}</span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-6">
            <span className="text-gray-800 font-medium">Estado del pago:</span>
            <span className="text-gray-600">{order.outstandingAmount > 0 ? 'Pendiente' : 'Pagado'}</span>
          </div>

          <div className="w-full mb-6">
            <table className="w-full border-collapse text-sm text-center text-gray-700 border border-gray-300">
              <thead className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-300 text-xs">
                <tr>
                  <th className="px-3 py-3 border-r border-gray-300 align-middle text-left">Productos(s)</th>
                  <th className="px-3 py-3 border-r border-gray-300 align-middle">Cantidad</th>
                  <th className="px-3 py-3 border-r border-gray-300 align-middle">Precio</th>
                  <th className="px-3 py-3 align-middle">Suma</th>
                </tr>
              </thead>
              <tbody>
                {order.details?.map((item) => (
                  <tr key={item.transDetailID} className="border-b border-gray-200">
                    <td className="px-3 py-3 text-left border-r border-gray-200">{item.product?.productName}</td>
                    <td className="px-3 py-3 border-r border-gray-200">{item.quantity}</td>
                    <td className="px-3 py-3 border-r border-gray-200">{formatMoney(item.unitPrice)}</td>
                    <td className="px-3 py-3">{formatMoney(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center text-lg mt-2 text-gray-800">
            Importe total {formatMoney(order.finalAmount)}
          </div>
        </div>

        {/* Right Column: Update Forms */}
        <div className="flex-1 flex flex-col pl-0 lg:pl-10">
          <h3 className="text-gray-800 font-medium mb-4">Historial de pagos</h3>
          <div className="w-full mb-6">
            <table className="w-full border-collapse text-sm text-left text-gray-700 border border-gray-300">
              <thead className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-300 text-xs">
                <tr>
                  <th className="w-1/3 px-2 py-3 border-r border-gray-300">Cobró</th>
                  <th className="w-1/3 px-2 py-3 border-r border-gray-300">Importe</th>
                  <th className="w-1/3 px-2 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {order.payments && order.payments.length > 0 ? order.payments.map((payment) => (
                  <tr key={payment.pymntHistryID} className="border-b border-gray-200 hover:bg-gray-50 h-10">
                    <td className="px-2 py-2 border-r border-gray-200">{payment.collectedBy?.userName || '-'}</td>
                    <td className="px-2 py-2 border-r border-gray-200">{formatMoney(payment.paymentAmount)}</td>
                    <td className="px-2 py-2">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' }) : '-'}</td>
                  </tr>
                )) : (
                  <tr className="h-10">
                    <td colSpan={3} className="px-4 py-2 text-gray-400 italic text-center">Sin pagos registrados todavía.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            <span className="text-gray-800">Anticipo: {formatMoney(getImporteACuenta(order))}</span>
            <span className="text-gray-800">Pendiente: {formatMoney(order.outstandingAmount)}</span>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 font-bold text-sm">Selecciona la forma de pago</label>
              <select
                title="Selecciona forma de pago"
                value={paymentMethod}
                disabled={order.outstandingAmount <= 0}
                onChange={(e) => {
                  const value = e.target.value as 'cash' | 'digital' | '';
                  setPaymentMethod(value);
                  if (value === 'cash') setDestinationAccount('');
                }}
                className="w-full border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:border-[#3ab0e2] text-gray-700 bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Selecciona forma de pago</option>
                <option value="cash">Efectivo</option>
                <option value="digital">Transferencia / tarjeta</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-900 font-bold text-sm">Cuenta destino</label>
              <select
                title="Seleccionar cuenta"
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                disabled={paymentMethod !== 'digital'}
                className="w-full border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:border-[#3ab0e2] text-gray-700 bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Seleccionar cuenta</option>
                {destAccounts.map(account => (
                  <option key={account.clabe} value={account.clabe}>
                    {account.accountAlias || account.bank || account.clabe}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10 items-end">
            <div className="flex flex-col gap-2">
               <label className="text-gray-900 font-bold text-sm">Abonar importe al pedido</label>
            </div>
            <div className="flex flex-col items-end gap-3">
              <input
                type="number"
                placeholder="Importe"
                min={0}
                max={order.outstandingAmount}
                disabled={order.outstandingAmount <= 0}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-32 border border-gray-400 rounded py-1.5 px-3 text-sm focus:outline-none focus:border-[#3ab0e2] text-gray-800 disabled:bg-gray-100"
              />
              <button
                onClick={handleAddPayment}
                disabled={addingPayment || order.outstandingAmount <= 0}
                className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-6 py-2 rounded transition-colors text-sm cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingPayment ? 'Abonando...' : order.outstandingAmount <= 0 ? 'Ya está pagado' : 'Abonar importe'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 pb-4">
             <div className="flex items-center gap-4">
               <label className="text-gray-800 text-sm">Estado de la entrega</label>
               <select
                 title="Estado de la entrega"
                 value={deliveryStatus}
                 onChange={(e) => setDeliveryStatus(e.target.value as 'pending' | 'completed')}
                 className="w-32 border border-gray-400 rounded py-1 px-3 text-sm focus:outline-none focus:border-[#3ab0e2] text-gray-800 bg-white"
               >
                 <option value="pending">Pendiente</option>
                 <option value="completed" disabled={order.outstandingAmount > 0}>
                   Entregado{order.outstandingAmount > 0 ? ' (importe pendiente)' : ''}
                 </option>
               </select>
             </div>

             <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded transition-colors text-sm cursor-pointer font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
          </div>

        </div>
      </div>
      )}
    </div>
  );
}

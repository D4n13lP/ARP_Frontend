import { useEffect, useState } from 'react';
import { CustomSelect, type SaleSummaryData } from './SaleSummary';
import { useAppStore } from '../stores/useAppStore';
import { getDestAccounts } from '../api/destAccounts';
import type { DestAccount } from '../types';

export interface OrderPayment {
  depositAmount: number;
  paymentMethod: string; // '' si no lleva anticipo
  destAccountClabe: string | null;
}

interface OrderReviewProps {
  orderData: SaleSummaryData;
  onRegister: (payment: OrderPayment) => void;
  submitting?: boolean;
}

export default function OrderReview({ orderData, onRegister, submitting = false }: OrderReviewProps) {
  const authUser = useAppStore((state) => state.authUser);

  const [aplicarPagoParcial, setAplicarPagoParcial] = useState(false);
  const [anticipo, setAnticipo] = useState<string>('');
  const [formaPago, setFormaPago] = useState(''); // 'cash' | 'digital'
  const [cuentaDestino, setCuentaDestino] = useState(''); // clabe

  const [destAccounts, setDestAccounts] = useState<DestAccount[]>([]);
  useEffect(() => {
    getDestAccounts().then(setDestAccounts).catch(() => {});
  }, []);

  const formasPagoOptions = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Transferencia / tarjeta', value: 'digital' },
  ];
  const cuentasDestinoOptions = destAccounts.map((acc) => ({
    label: `${acc.accountAlias || acc.bank || 'Cuenta'} · ${acc.clabe}`,
    value: acc.clabe,
  }));

  // Función para formato moneda
  const formatMoney = (val: number) => `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalFinal = orderData.totales?.final || 0;

  const anticipoNum = aplicarPagoParcial ? Math.min(Math.max(parseFloat(anticipo) || 0, 0), totalFinal) : 0;
  const importePendiente = Math.max(0, totalFinal - anticipoNum);

  const handleClickRegistrar = () => {
    if (aplicarPagoParcial && anticipoNum > 0) {
      if (!formaPago) {
        alert('Selecciona la forma de pago del anticipo.');
        return;
      }
      if (formaPago === 'digital' && !cuentaDestino) {
        alert('Selecciona la cuenta destino del anticipo.');
        return;
      }
    }
    onRegister({
      depositAmount: anticipoNum,
      paymentMethod: anticipoNum > 0 ? formaPago : '',
      destAccountClabe: (anticipoNum > 0 && formaPago === 'digital') ? cuentaDestino : null,
    });
  };

  return (
    <div className="w-full mt-10 animate-fade-in max-w-6xl mx-auto text-sm text-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Lado izquierdo: Resumen del Pedido */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2"><span className="font-bold w-32">Folio</span> <span className="text-gray-500 italic">Se asignará al confirmar</span></div>
            <div className="flex gap-2"><span className="font-bold w-32">Fecha de orden:</span> <span>{new Date().toLocaleDateString('es-MX', { month: '2-digit', day: '2-digit', year: 'numeric', timeZone: 'America/Mexico_City' })}</span></div>
            <div className="flex gap-2"><span className="font-bold w-32">Fecha de entrega:</span> <span>{orderData.entrega?.inmediata ? 'Inmediata' : (orderData.entrega?.dispatchDateI ? `${orderData.entrega.dispatchDateI} hasta ${orderData.entrega.dispatchDateF || '-'}` : '-')}</span></div>
            <div className="flex gap-2"><span className="font-bold w-32">Cliente:</span> <span>{orderData.cliente ? orderData.cliente.clientName : 'Cliente no registrado'}</span></div>
            <div className="flex gap-2"><span className="font-bold w-32">Vendedor:</span> <span>{authUser?.userName || '-'}</span></div>
            <div className="flex gap-2"><span className="font-bold w-32">Repartidor:</span> <span>{orderData.entrega?.courierName || '-'}</span></div>
            <div className="flex gap-2">
               <span className="font-bold w-32">Lugar de entrega:</span>
               <span>{orderData.entrega?.enTienda ? 'En tienda' : (orderData.entrega?.address || '-')}</span>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="overflow-hidden border border-gray-300 rounded">
            <table className="w-full text-center text-xs">
              <thead className="bg-[#f2f2f2] border-b border-gray-300">
                <tr>
                  <th className="py-2.5 px-3 font-bold border-r border-gray-300 text-left">Productos(s)</th>
                  <th className="py-2.5 px-3 font-bold border-r border-gray-300">Cantidad</th>
                  <th className="py-2.5 px-3 font-bold border-r border-gray-300">Unidad</th>
                  <th className="py-2.5 px-3 font-bold border-r border-gray-300">Precio</th>
                  <th className="py-2.5 px-3 font-bold">Suma</th>
                </tr>
              </thead>
              <tbody>
                {orderData.cartItems && orderData.cartItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 last:border-0 bg-white">
                    <td className="py-2.5 px-3 border-r border-gray-200 text-left">{item.nombre}</td>
                    <td className="py-2.5 px-3 border-r border-gray-200">{item.cantidad}</td>
                    <td className="py-2.5 px-3 border-r border-gray-200">{item.unidad || '—'}</td>
                    <td className="py-2.5 px-3 border-r border-gray-200">${item.precio.toFixed(2)}</td>
                    <td className="py-2.5 px-3">${item.suma.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-6 font-bold mt-2">
            <div className="flex gap-2">
              <span className="w-32">Total con envio:</span>
              <span>{formatMoney(totalFinal)}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-32">Forma de pago:</span>
              <span className="font-normal">{aplicarPagoParcial && anticipoNum > 0 ? (formasPagoOptions.find((o) => o.value === formaPago)?.label || '-') : 'Sin anticipo'}</span>
            </div>
          </div>
        </div>

        {/* Lado derecho: Pagos y Confirmación */}
        <div className="flex flex-col pt-16 gap-8 text-sm">

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="font-bold">Aplicar pago parcial</span>
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 accent-sky-500 cursor-pointer"
                checked={aplicarPagoParcial}
                onChange={(e) => {
                  setAplicarPagoParcial(e.target.checked);
                  if (!e.target.checked) {
                    setAnticipo('');
                    setFormaPago('');
                    setCuentaDestino('');
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="font-medium w-48">Ingresa la cantidad de anticipo:</span>
              <input
                type="number"
                min={0}
                max={totalFinal}
                disabled={!aplicarPagoParcial}
                value={anticipo}
                onChange={(e) => setAnticipo(e.target.value)}
                className={`border h-8 px-2 w-32 rounded shadow-sm focus:outline-none focus:border-sky-500 ${!aplicarPagoParcial ? 'bg-gray-100 border-gray-200' : 'border-gray-400 bg-white'}`}
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="font-medium w-48">Importe pendiente:</span>
              <span className="font-normal">{formatMoney(importePendiente)}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
             <div className="flex flex-col gap-2">
                <span className="font-bold text-gray-900">Selecciona la forma de pago</span>
                <CustomSelect
                  label="Selecciona forma de pago"
                  options={formasPagoOptions}
                  value={formaPago}
                  onChange={setFormaPago}
                  disabled={!aplicarPagoParcial || anticipoNum <= 0}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-bold text-gray-900">Cuenta destino</span>
                <CustomSelect
                  label="Seleccionar cuenta"
                  options={cuentasDestinoOptions}
                  value={formaPago === 'cash' ? '' : cuentaDestino}
                  onChange={setCuentaDestino}
                  disabled={!aplicarPagoParcial || anticipoNum <= 0 || formaPago !== 'digital'}
                />
              </div>
          </div>

          <div className="flex justify-end mt-12 w-full max-w-[36rem]">
            <button
              onClick={handleClickRegistrar}
              disabled={submitting}
              className="bg-[#3ab0e2] hover:bg-sky-500 text-white font-medium py-2 px-6 rounded shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Registrando...' : 'Registrar pedido'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

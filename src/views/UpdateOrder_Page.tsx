import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getTransactions } from '../api/transactions';
import { getErrorMessage } from '../utils/errorMessage';
import { formatDateOnly, formatDeliveryDate, getEstadoEntregaLabel, getVendedorName, getClienteNombre, getLugarEntrega, getImporteACuenta, formatMoney } from '../utils/orderDisplay';
import type { Transaction } from '../types';

export default function UpdateOrder_Page() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransactions({ transType: 'order', status: 'pending' })
      .then(setOrders)
      .catch((error) => alert(getErrorMessage(error, 'No se pudieron cargar los pedidos pendientes.')))
      .finally(() => setLoading(false));
  }, []);

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

      {/* Subtitle */}
      <h2 className="text-2xl font-medium text-gray-800 mb-8 mt-4 text-center">
        Actualización de pedidos
      </h2>

      {/* Results Table Section */}
      <div className="w-full max-w-7xl overflow-x-auto mt-4 px-2">
        <table className="w-full border-collapse text-sm text-center text-gray-700 border border-gray-300">
          <thead className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-300 uppercase text-xs">
            <tr>
              <th className="px-3 py-4 border-r border-gray-300 align-middle">Folio</th>
              <th className="px-3 py-4 border-r border-gray-300 align-middle">Fecha pedido</th>
              <th className="px-3 py-4 border-r border-gray-300 align-middle">Fecha entrega</th>
              <th className="px-3 py-4 border-r border-gray-300 align-middle">Estado</th>
              <th className="px-3 py-4 border-r border-gray-300 align-middle">Cliente</th>
              <th className="px-3 py-4 border-r border-gray-300 align-middle">Vendedor</th>
              <th className="px-3 py-4 border-r border-gray-300 align-middle w-24">Importe total final</th>
              <th className="px-3 py-4 border-r border-gray-300 align-middle w-24">Importe a cuenta</th>
              <th className="px-3 py-4 border-r border-gray-300 align-middle w-24">Importe pendiente</th>
              <th className="px-3 py-4 border-r border-gray-300 align-middle w-64">Lugar de entrega</th>
              <th className="px-3 py-4 align-middle"></th>
            </tr>
          </thead>
          <tbody>
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={11} className="py-8 text-gray-400 italic">
                  No hay pedidos pendientes de entrega.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.transactionID} className="border-b border-gray-200 hover:bg-gray-50 transition-colors h-24">
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.folio}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{formatDateOnly(order.transactionDate)}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{formatDeliveryDate(order)}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{getEstadoEntregaLabel(order.status)}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{getClienteNombre(order)}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{getVendedorName(order)}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{formatMoney(order.finalAmount)}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{formatMoney(getImporteACuenta(order))}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{formatMoney(order.outstandingAmount)}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle text-xs whitespace-pre-wrap">{getLugarEntrega(order)}</td>
                <td className="px-3 py-3 align-middle">
                  <button
                    onClick={() => navigate(`/orders/detail/${order.transactionID}`)}
                    className="text-gray-700 hover:text-[#e2694b] text-sm cursor-pointer transition-colors font-medium underline"
                  >
                    Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

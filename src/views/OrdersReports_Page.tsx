import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getTransactions } from '../api/transactions';
import { getErrorMessage } from '../utils/errorMessage';
import { formatDateOnly, formatDeliveryDate, getEstadoEntregaLabel, getVendedorName, getClienteNombre, getLugarEntrega, getImporteACuenta, formatMoney } from '../utils/orderDisplay';
import type { Transaction } from '../types';

export default function OrdersReports_Page() {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [orders, setOrders] = useState<Transaction[]>([]);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert('Por favor selecciona la fecha de inicio y la fecha de fin.');
      return;
    }

    // Validación de rango de fechas
    if (startDate > endDate) {
      alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }

    setGenerating(true);
    try {
      const all = await getTransactions({ transType: 'order' });
      // transactionDate es "YYYY-MM-DD": comparar como texto es seguro y
      // evita cualquier lío de zona horaria al construir un Date.
      const enRango = all.filter((o) => o.transactionDate && o.transactionDate >= startDate && o.transactionDate <= endDate);
      setOrders(enRango);
      setReportGenerated(true);
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo generar el reporte.'));
    } finally {
      setGenerating(false);
    }
  };

  const calculateTotal = () => orders.reduce((sum, order) => sum + order.finalAmount, 0);

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">

      {/* Header */}
      <div className="w-full max-w-7xl mb-8 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-20 max-lg:portrait:flex-col max-lg:portrait:gap-4">
        {/* Back Button and Logo (Left) — en celular vertical se saca del
            position:absolute para que no se encime con el título de abajo. */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-6 max-lg:portrait:static max-lg:portrait:translate-y-0 max-lg:portrait:self-start">
          <img
            src={logoEmpresa}
            alt="Logo Empresa"
            className="h-20 w-auto object-contain max-lg:portrait:hidden"
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

      <div className="w-full max-w-7xl flex flex-col items-center">
        <h2 className="text-xl md:text-2xl font-medium text-gray-800 mb-8 mt-4 text-center">
          {reportGenerated ? 'Pedidos del periodo' : 'Selecciona un periodo para generar reporte'}
        </h2>

        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-12 mb-8 w-full max-w-3xl">

          {/* Pickers */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <label className="w-12 font-medium text-gray-800">Inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setReportGenerated(false); // resetea si se cambia la fecha
                }}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#3ab0e2] text-gray-700 bg-white"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="w-12 font-medium text-gray-800">Fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setReportGenerated(false); // resetea si se cambia la fecha
                }}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#3ab0e2] text-gray-700 bg-white"
              />
            </div>
          </div>

          {/* Action & Stats */}
          <div className="flex flex-col gap-4 mt-2">
            <button
              onClick={handleGenerateReport}
              disabled={reportGenerated || generating}
              className={`px-8 py-2 rounded text-sm w-fit transition-colors shadow-sm font-medium ${
                reportGenerated
                  ? 'bg-[#a3aac0] text-white cursor-default shadow-none'
                  : 'bg-[#3ab0e2] hover:bg-sky-400 text-white cursor-pointer disabled:opacity-60'
              }`}
            >
              {generating ? 'Generando...' : 'Generar reporte'}
            </button>

            {reportGenerated && (
              <div className="flex flex-col text-sm text-gray-800 gap-3 mt-4 font-medium">
                <span>{orders.length} pedidos en el periodo</span>
                <span>Importe total del periodo: {formatMoney(calculateTotal())}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Table Section — escritorio/tablet (>= md), intacta */}
        {reportGenerated && (
          <div className="w-full overflow-x-auto mt-6 px-2 animate-fade-in hidden md:block">
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
                  <th className="px-3 py-4 border-r border-gray-300 align-middle w-48">Lugar de entrega</th>
                  <th className="px-3 py-4 align-middle"></th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-8 text-gray-400 italic">
                      No hay pedidos en ese periodo.
                    </td>
                  </tr>
                ) : orders.map((order) => (
                  <tr key={order.transactionID} className="border-b border-gray-200 hover:bg-gray-50 transition-colors h-16">
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
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tarjetas — celulares (< md). Mismos datos que la tabla. */}
        {reportGenerated && (
          <div className="w-full mt-6 px-2 animate-fade-in md:hidden flex flex-col gap-3">
            {orders.length === 0 ? (
              <p className="text-center text-gray-400 italic py-8">No hay pedidos en ese periodo.</p>
            ) : orders.map((order) => (
              <div key={order.transactionID} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{getClienteNombre(order)}</h3>
                    <span className="text-xs text-gray-500">Folio {order.folio}</span>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700">
                    {getEstadoEntregaLabel(order.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <div><span className="text-gray-500 block mb-0.5">Fecha pedido</span><span className="font-semibold text-gray-800">{formatDateOnly(order.transactionDate)}</span></div>
                  <div><span className="text-gray-500 block mb-0.5">Fecha entrega</span><span className="font-semibold text-gray-800">{formatDeliveryDate(order)}</span></div>
                  <div><span className="text-gray-500 block mb-0.5">Vendedor</span><span className="font-semibold text-gray-800">{getVendedorName(order)}</span></div>
                  <div><span className="text-gray-500 block mb-0.5">Importe total</span><span className="font-semibold text-gray-800">{formatMoney(order.finalAmount)}</span></div>
                  <div><span className="text-gray-500 block mb-0.5">Importe a cuenta</span><span className="font-semibold text-gray-800">{formatMoney(getImporteACuenta(order))}</span></div>
                  <div><span className="text-gray-500 block mb-0.5">Importe pendiente</span><span className="font-semibold text-gray-800">{formatMoney(order.outstandingAmount)}</span></div>
                  <div className="col-span-2"><span className="text-gray-500 block mb-0.5">Lugar de entrega</span><span className="font-semibold text-gray-800 whitespace-pre-wrap">{getLugarEntrega(order)}</span></div>
                </div>
                <button
                  onClick={() => navigate(`/orders/detail/${order.transactionID}`)}
                  className="w-full py-2 bg-gray-50 text-gray-700 font-medium text-xs rounded-lg active:bg-gray-100 cursor-pointer"
                >
                  Ver detalles
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

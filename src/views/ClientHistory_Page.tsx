import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { History } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getClientById } from '../api/clients';
import { getTransactions } from '../api/transactions';
import { getErrorMessage } from '../utils/errorMessage';
import { formatDateOnly, formatMoney } from '../utils/orderDisplay';
import type { Client, Transaction } from '../types';

type Periodo = 'Último mes' | 'Últimos 3 meses' | 'Últimos 6 meses' | 'Último año';

// "Hoy - N meses" como "YYYY-MM-DD" en hora local (no UTC, para no correr el
// día) — se compara como texto contra transactionDate, igual que en
// OrdersReports_Page/SalesReport_Page.
function fechaHaceMeses(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const PERIODO_MESES: Record<Periodo, number> = {
  'Último mes': 1,
  'Últimos 3 meses': 3,
  'Últimos 6 meses': 6,
  'Último año': 12,
};

export default function ClientHistory_Page() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [period, setPeriod] = useState<Periodo>('Últimos 3 meses');
  const [clientData, setClientData] = useState<Client | null>(null);
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getClientById(id),
      getTransactions({ clientCode: id }),
    ])
      .then(([client, transactions]) => {
        setClientData(client);
        setPurchases(transactions);
      })
      .catch((error) => alert(getErrorMessage(error, 'No se pudo cargar el historial del cliente.')))
      .finally(() => setLoading(false));
  }, [id]);

  const cutoff = fechaHaceMeses(PERIODO_MESES[period]);
  const displayedPurchases = purchases.filter((p) => p.transactionDate && p.transactionDate >= cutoff);

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-6xl mb-10 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-20 max-lg:portrait:flex-col max-lg:portrait:gap-4">
        {/* en celular vertical se saca del position:absolute para que no se
            encime con el título de abajo. */}
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
            Historial de compras
          </h1>
          <History size={45} strokeWidth={1.5} />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Cargando...</p>
      ) : (
        <div className="w-full max-w-6xl flex flex-col gap-8 px-4">

          {/* Client Info Table — escritorio/tablet (>= md), intacta */}
          <div className="w-full border border-gray-300 rounded overflow-hidden shadow-sm hidden md:block">
            <table className="w-full text-center text-sm md:text-base border-collapse text-gray-800">
              <thead className="text-white font-semibold" style={{ backgroundColor: '#5d0e00' }}>
                <tr>
                  <th className="py-2 px-4 border-r border-white/20">ID Cliente</th>
                  <th className="py-2 px-4 border-r border-white/20">Nombre</th>
                  <th className="py-2 px-4 border-r border-white/20">RFC</th>
                  <th className="py-2 px-4 border-r border-white/20">Teléfono 1</th>
                  <th className="py-2 px-4 border-r border-white/20">Teléfono 2</th>
                  <th className="py-2 px-4">Correo electrónico</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr>
                  <td className="py-3 px-4 border-r border-gray-300 font-mono text-xs">{clientData?.clientCode || id || 'N/A'}</td>
                  <td className="py-3 px-4 border-r border-gray-300">{clientData?.clientName || 'Desconocido'}</td>
                  <td className="py-3 px-4 border-r border-gray-300">{clientData?.RFC || 'N/A'}</td>
                  <td className="py-3 px-4 border-r border-gray-300">{clientData?.clientPhone1 || 'N/A'}</td>
                  <td className="py-3 px-4 border-r border-gray-300">{clientData?.clientPhone2 || '-'}</td>
                  <td className="py-3 px-4">{clientData?.email || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tarjeta — celulares (< md) */}
          <div className="w-full border border-gray-300 rounded-xl shadow-sm p-4 md:hidden space-y-3" style={{ backgroundColor: '#fdf6f0' }}>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">{clientData?.clientName || 'Desconocido'}</h3>
              <span className="text-xs text-gray-500 font-mono">{clientData?.clientCode || id || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-2.5 rounded-lg border border-gray-200">
              <div><span className="text-gray-500 block mb-0.5">RFC</span><span className="font-semibold text-gray-800">{clientData?.RFC || 'N/A'}</span></div>
              <div><span className="text-gray-500 block mb-0.5">Teléfono 1</span><span className="font-semibold text-gray-800">{clientData?.clientPhone1 || 'N/A'}</span></div>
              <div><span className="text-gray-500 block mb-0.5">Teléfono 2</span><span className="font-semibold text-gray-800">{clientData?.clientPhone2 || '-'}</span></div>
              <div className="col-span-2"><span className="text-gray-500 block mb-0.5">Correo electrónico</span><span className="font-semibold text-gray-800">{clientData?.email || 'N/A'}</span></div>
            </div>
          </div>

          {/* Filter & Results Count */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            <div className="flex gap-4 items-center">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Periodo)}
                className="border border-gray-400 bg-white rounded px-3 py-1.5 focus:border-[#3ab0e2] outline-none text-gray-800 cursor-pointer shadow-sm text-sm"
              >
                <option value="Último mes">Último mes</option>
                <option value="Últimos 3 meses">Últimos 3 meses</option>
                <option value="Últimos 6 meses">Últimos 6 meses</option>
                <option value="Último año">Último año</option>
              </select>
            </div>

            <span className="font-bold text-gray-800 mt-4 md:mt-0">
              {displayedPurchases.length} compras encontradas
            </span>
          </div>

          {/* Purchases History Tables */}
          <div className="flex flex-col gap-10 mt-4">
            {displayedPurchases.map((purchase) => (
              <div key={purchase.transactionID} className="flex flex-col w-full animate-fade-in">
                <span className="font-bold text-gray-800 text-sm mb-2">
                  {formatDateOnly(purchase.transactionDate)}{purchase.folio ? ` · Folio ${purchase.folio}` : ''}
                </span>
                <div className="w-full border border-gray-300 rounded overflow-hidden shadow-sm hidden md:block">
                  <table className="w-full text-center text-sm md:text-base border-collapse text-gray-800">
                    <thead className="bg-[#f2f2f2] text-gray-800 font-semibold border-b border-gray-300">
                      <tr>
                        <th className="py-2 px-4 border-r border-gray-300">Producto(s)</th>
                        <th className="py-2 px-4 border-r border-gray-300">Cantidad</th>
                        <th className="py-2 px-4 border-r border-gray-300">Precio Final (incluye todos los descuentos)</th>
                        <th className="py-2 px-4">Suma</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(purchase.details || []).map((detail) => (
                        <tr key={detail.transDetailID}>
                          <td className="py-4 px-4 border-r border-gray-200">{detail.product?.productName || '—'}</td>
                          <td className="py-4 px-4 border-r border-gray-200">{detail.quantity}</td>
                          <td className="py-4 px-4 border-r border-gray-200">{formatMoney(detail.subtotal / detail.quantity)}</td>
                          <td className="py-4 px-4">{formatMoney(detail.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tarjetas — celulares (< md) */}
                <div className="w-full md:hidden flex flex-col gap-2">
                  {(purchase.details || []).map((detail) => (
                    <div key={detail.transDetailID} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center gap-3 text-sm">
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 truncate">{detail.product?.productName || '—'}</div>
                        <div className="text-xs text-gray-500">{detail.quantity} × {formatMoney(detail.subtotal / detail.quantity)}</div>
                      </div>
                      <div className="shrink-0 font-semibold text-gray-800">{formatMoney(detail.subtotal)}</div>
                    </div>
                  ))}
                </div>
                <div className="w-full flex justify-end mt-4 pr-2">
                  <span className="font-bold text-gray-800">
                    Importe total: {formatMoney(purchase.finalAmount)}
                  </span>
                </div>
              </div>
            ))}

            {displayedPurchases.length === 0 && (
              <div className="text-center text-gray-500 py-10 italic">
                No se encontraron compras en el periodo seleccionado.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

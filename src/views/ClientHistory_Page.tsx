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
      <div className="w-full max-w-6xl mb-10 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-20">
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
            Historial de compras
          </h1>
          <History size={45} strokeWidth={1.5} />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Cargando...</p>
      ) : (
        <div className="w-full max-w-6xl flex flex-col gap-8 px-4">

          {/* Client Info Table */}
          <div className="w-full border border-gray-300 rounded overflow-hidden shadow-sm">
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
                <div className="w-full border border-gray-300 rounded overflow-hidden shadow-sm">
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

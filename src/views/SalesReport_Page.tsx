import { useState, useEffect } from 'react';
import { TrendingUp, Receipt } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getTransactions, getTransactionById } from '../api/transactions';
import { getErrorMessage } from '../utils/errorMessage';
import { formatDateOnly, formatDeliveryDate, getVendedorName, getRepartidorName, getLugarEntrega, getClienteNombre, formatMoney } from '../utils/orderDisplay';
import type { Transaction } from '../types';

interface DateParts {
  mm: string;
  dd: string;
  aaaa: string;
}

// Arma "YYYY-MM-DD" a partir de los 3 campos sueltos y valida que sea una
// fecha real (rechaza cosas como 31 de febrero, que Date normalmente
// "arregla" corriéndola a marzo en silencio).
function toISODate(parts: DateParts): string | null {
  const mm = parts.mm.padStart(2, '0');
  const dd = parts.dd.padStart(2, '0');
  const aaaa = parts.aaaa;
  if (!/^\d{2}$/.test(mm) || !/^\d{2}$/.test(dd) || !/^\d{4}$/.test(aaaa)) return null;
  const iso = `${aaaa}-${mm}-${dd}`;
  const check = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(check.getTime())) return null;
  if (check.getUTCFullYear() !== Number(aaaa) || check.getUTCMonth() + 1 !== Number(mm) || check.getUTCDate() !== Number(dd)) return null;
  return iso;
}

export default function SalesReport_Page() {
  // --- ESTADOS DE FECHAS ---
  const [fechaInicio, setFechaInicio] = useState<DateParts>({ mm: '', dd: '', aaaa: '' });
  const [fechaFin, setFechaFin] = useState<DateParts>({ mm: '', dd: '', aaaa: '' });
  const [isReporteDia, setIsReporteDia] = useState(false);

  // --- ESTADOS DE VISTA Y USUARIO ---
  const [viewState, setViewState] = useState<'form' | 'table' | 'sellers' | 'detail'>('form');
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState('Todos');
  const [generating, setGenerating] = useState(false);

  // Ventas del periodo ya generado (filtradas por fecha y vendedor).
  const [sales, setSales] = useState<Transaction[]>([]);
  // Universo de vendedores para el selector: se saca de las ventas ya
  // registradas (no hay endpoint de "lista de usuarios" abierto a cualquier
  // rol con permiso de ver este reporte — GET /users es solo para admin).
  const [vendedoresDisponibles, setVendedoresDisponibles] = useState<string[]>([]);

  // Detalle de una venta puntual (se pide completo por separado: el listado
  // no trae renglones/pagos, solo lo necesario para la tabla).
  const [selectedSale, setSelectedSale] = useState<Transaction | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Al montar, se cargan todas las ventas para armar la lista de vendedores
  // del selector (independiente del periodo que se vaya a reportar).
  useEffect(() => {
    getTransactions({ transType: 'sale' })
      .then((all) => {
        const nombres = new Set<string>();
        for (const sale of all) {
          const nombre = getVendedorName(sale);
          if (nombre !== '-') nombres.add(nombre);
        }
        setVendedoresDisponibles(Array.from(nombres).sort((a, b) => a.localeCompare(b)));
      })
      .catch(() => {});
  }, []);

  // Efecto para manejar el "Reporte del día"
  useEffect(() => {
    if (isReporteDia) {
      const hoy = new Date();
      const actual = {
        mm: String(hoy.getMonth() + 1).padStart(2, '0'),
        dd: String(hoy.getDate()).padStart(2, '0'),
        aaaa: String(hoy.getFullYear())
      };
      setFechaInicio(actual);
      setFechaFin(actual);
    }
  }, [isReporteDia]);

  const handleGenerateReport = async () => {
    const inicioISO = toISODate(fechaInicio);
    const finISO = toISODate(fechaFin);
    if (!inicioISO || !finISO) {
      alert('Ingresa una fecha de inicio y de fin válidas (día, mes y año).');
      return;
    }
    if (inicioISO > finISO) {
      alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }

    setGenerating(true);
    try {
      const all = await getTransactions({ transType: 'sale' });
      // transactionDate es "YYYY-MM-DD": comparar como texto es seguro y
      // evita cualquier lío de zona horaria al construir un Date.
      const enRango = all.filter((sale) => {
        if (!sale.transactionDate || sale.transactionDate < inicioISO || sale.transactionDate > finISO) return false;
        if (vendedorSeleccionado === 'Todos') return true;
        return getVendedorName(sale) === vendedorSeleccionado;
      });
      setSales(enRango);
      setViewState('table');
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo generar el reporte.'));
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setViewState('form');
    setFechaInicio({ mm: '', dd: '', aaaa: '' });
    setFechaFin({ mm: '', dd: '', aaaa: '' });
    setIsReporteDia(false);
    setVendedorSeleccionado('Todos');
    setSales([]);
  };

  const handleViewDetail = async (transactionID: string) => {
    setLoadingDetail(true);
    try {
      const data = await getTransactionById(transactionID);
      setSelectedSale(data);
      setViewState('detail');
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo cargar el detalle de la venta.'));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewSellers = () => {
    setViewState('sellers');
  };

  // Calcular importe total de ventas del periodo actual
  const calcularTotalPeriodo = () => {
    return sales.reduce((acc, sale) => acc + sale.finalAmount, 0);
  };

  // Top vendedores del periodo ya generado (mismas ventas que se ven en la tabla).
  const getTopVendedores = () => {
    const sumas: Record<string, number> = {};
    sales.forEach((sale) => {
      const vendedor = getVendedorName(sale);
      sumas[vendedor] = (sumas[vendedor] || 0) + sale.finalAmount;
    });

    const top = Object.entries(sumas).map(([vendedor, total]) => ({ vendedor, total }));
    top.sort((a, b) => b.total - a.total);
    return top.map((item, index) => ({
      posicion: index + 1,
      vendedor: item.vendedor,
      totalFormat: formatMoney(item.total),
    }));
  };

  if (viewState === 'detail') {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans animate-fade-in p-6 md:p-10">
        {/* HEADER DETALLE DE VENTA */}
        <header className="relative py-6 mb-8 border-b border-gray-200 flex items-center justify-center min-h-20">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-6">
            <img
              src={logoEmpresa}
              alt="Logo"
              className="h-20 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-4 text-[#e2694b]">
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
              Detalle de la venta
            </h1>
            <Receipt size={48} strokeWidth={1.5} />
          </div>
        </header>

        {!selectedSale ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : (
        <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-10 mt-6">
          {/* Columna Izquierda: Información */}
          <div className="flex flex-col gap-5 text-sm md:text-base text-gray-800 w-full md:w-1/3">
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Folio:</span> <span>{selectedSale.folio}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Fecha de orden:</span> <span>{formatDateOnly(selectedSale.transactionDate)}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Fecha de entrega:</span> <span>{formatDeliveryDate(selectedSale)}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Cliente:</span> <span>{getClienteNombre(selectedSale)}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Teléfono Cliente:</span> <span>{selectedSale.client?.clientPhone1 || '-'}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">RFC Cliente:</span> <span>{selectedSale.client?.RFC || '-'}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Vendedor:</span> <span>{getVendedorName(selectedSale)}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Repartidor:</span> <span>{getRepartidorName(selectedSale)}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Lugar de entrega:</span> <span>{getLugarEntrega(selectedSale)}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4 mt-4"><span className="font-medium w-36">Estado del pago:</span> <span>{selectedSale.outstandingAmount > 0 ? 'Pendiente' : 'Pagado'}</span></div>
          </div>

          {/* Columna Derecha: Tabla de productos */}
          <div className="w-full md:w-2/3 flex flex-col items-end">
            <div className="w-full border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-center text-sm md:text-base border-collapse text-gray-800">
                <thead className="bg-[#f2f2f2] font-semibold text-gray-800">
                  <tr>
                    <th className="py-2 px-4 border-r border-b border-gray-300">Productos(s)</th>
                    <th className="py-2 px-4 border-r border-b border-gray-300">Cantidad</th>
                    <th className="py-2 px-4 border-r border-b border-gray-300">Precio</th>
                    <th className="py-2 px-4 border-b border-gray-300">Suma</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.details && selectedSale.details.length > 0 ? selectedSale.details.map((item) => (
                    <tr key={item.transDetailID} className="border-b border-gray-200">
                      <td className="py-3 px-4 border-r border-gray-200">{item.product?.productName}</td>
                      <td className="py-3 px-4 border-r border-gray-200">{item.quantity}</td>
                      <td className="py-3 px-4 border-r border-gray-200">{formatMoney(item.unitPrice)}</td>
                      <td className="py-3 px-4">{formatMoney(item.subtotal)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-gray-400 italic">Sin productos registrados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 text-xl font-medium text-gray-800 self-end mr-4">
              Importe total {formatMoney(selectedSale.finalAmount)}
            </div>

            <button
              onClick={() => { setSelectedSale(null); setViewState('table'); }}
              className="mt-20 bg-[#3ab0e2] hover:bg-sky-400 text-white px-10 py-2 rounded shadow transition-colors cursor-pointer self-end"
            >
              Salir
            </button>
          </div>
        </main>
        )}
      </div>
    );
  }

  // VISTAS FORM Y TABLE (comparten el header)
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans animate-fade-in p-6 md:p-10">
      {/* HEADER REPORTE DE VENTAS */}
      <header className="relative py-6 mb-8 border-b border-gray-200 flex items-center justify-center min-h-20">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-6">
          <img
            src={logoEmpresa}
            alt="Logo"
            className="h-20 w-auto object-contain"
          />
        </div>
        <div className="flex items-center gap-4 text-[#e2694b]">
          <TrendingUp size={45} strokeWidth={1.5} />
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Reporte de ventas
          </h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center">

        {/* TÍTULO CENTRAL */}
        <h2 className="text-xl md:text-2xl text-gray-800 font-medium text-center mb-8">
          {viewState === 'form'
            ? 'Selecciona una periodo para generar reporte'
            : viewState === 'sellers'
              ? 'Mejores vendedores del periodo'
              : 'Ventas del periodo'}
        </h2>

        {/* CONTENEDOR FECHAS Y BOTONES */}
        <div className={`w-full flex ${viewState === 'table' || viewState === 'sellers' ? 'justify-between items-center px-10 max-w-4xl' : 'flex-col items-center gap-6'}`}>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="w-12 font-medium text-gray-800">Inicio</span>
              <div className="flex gap-2">
                <input disabled={viewState === 'table' || viewState === 'sellers'} type="text" placeholder="MM" className="w-16 p-2 border border-gray-300 bg-white rounded text-center outline-none focus:border-[#3ab0e2] disabled:opacity-60" value={fechaInicio.mm} onChange={(e) => setFechaInicio({...fechaInicio, mm: e.target.value})} />
                <input disabled={viewState === 'table' || viewState === 'sellers'} type="text" placeholder="DD" className="w-16 p-2 border border-gray-300 bg-white rounded text-center outline-none focus:border-[#3ab0e2] disabled:opacity-60" value={fechaInicio.dd} onChange={(e) => setFechaInicio({...fechaInicio, dd: e.target.value})} />
                <input disabled={viewState === 'table' || viewState === 'sellers'} type="text" placeholder="AAAA" className="w-24 p-2 border border-gray-300 bg-white rounded text-center outline-none focus:border-[#3ab0e2] disabled:opacity-60" value={fechaInicio.aaaa} onChange={(e) => setFechaInicio({...fechaInicio, aaaa: e.target.value})} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-12 font-medium text-gray-800">Fin</span>
              <div className="flex gap-2">
                <input disabled={viewState === 'table' || viewState === 'sellers'} type="text" placeholder="MM" className="w-16 p-2 border border-gray-300 bg-white rounded text-center outline-none focus:border-[#3ab0e2] disabled:opacity-60" value={fechaFin.mm} onChange={(e) => setFechaFin({...fechaFin, mm: e.target.value})} />
                <input disabled={viewState === 'table' || viewState === 'sellers'} type="text" placeholder="DD" className="w-16 p-2 border border-gray-300 bg-white rounded text-center outline-none focus:border-[#3ab0e2] disabled:opacity-60" value={fechaFin.dd} onChange={(e) => setFechaFin({...fechaFin, dd: e.target.value})} />
                <input disabled={viewState === 'table' || viewState === 'sellers'} type="text" placeholder="AAAA" className="w-24 p-2 border border-gray-300 bg-white rounded text-center outline-none focus:border-[#3ab0e2] disabled:opacity-60" value={fechaFin.aaaa} onChange={(e) => setFechaFin({...fechaFin, aaaa: e.target.value})} />
              </div>
            </div>
          </div>

          {viewState === 'table' && (
            <div className="flex flex-col gap-3">
              <button onClick={handleViewSellers} className="bg-[#16A085] hover:bg-emerald-500 text-white px-6 py-2 shadow-sm rounded text-sm transition-colors cursor-pointer">
                Ver vendedores
              </button>
              <button onClick={handleReset} className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-6 py-2 shadow-sm rounded text-sm transition-colors cursor-pointer">
                Reiniciar
              </button>
            </div>
          )}

          {viewState === 'sellers' && (
            <div className="flex flex-col gap-3">
              <button onClick={() => setViewState('table')} className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 shadow-sm rounded text-sm transition-colors cursor-pointer">
                Regresar
              </button>
            </div>
          )}
        </div>

        {/* CONTENIDOS ESPECÍFICOS DEL FORMULARIO INICIAL */}
        {viewState === 'form' && (
          <div className="w-full flex flex-col items-center mt-4">
            <div className="flex items-center justify-center gap-4 py-4 w-full">
              <span className="text-xl text-gray-800">Reporte del dia</span>
              <input
                type="checkbox"
                className="w-5 h-5 accent-[#3ab0e2] cursor-pointer"
                checked={isReporteDia}
                onChange={(e) => setIsReporteDia(e.target.checked)}
              />
            </div>

            <div className="space-y-4 flex flex-col items-center w-full mt-4">
              <h3 className="text-xl text-gray-800 text-center">Selecciona un vendedor</h3>
              <select
                className="w-64 p-2 border border-gray-300 rounded outline-none focus:border-[#3ab0e2] bg-white cursor-pointer"
                value={vendedorSeleccionado}
                onChange={(e) => setVendedorSeleccionado(e.target.value)}
              >
                <option value="Todos">Todos</option>
                {vendedoresDisponibles.map((nombre) => (
                  <option key={nombre} value={nombre}>{nombre}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center pt-10 w-full mb-10">
              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded shadow transition-colors font-medium cursor-pointer disabled:opacity-60"
              >
                {generating ? 'Generando...' : 'Generar reporte'}
              </button>
            </div>
          </div>
        )}

        {/* TABLA DE RESULTADOS */}
        {viewState === 'table' && (
          <div className="w-full overflow-x-auto mt-12 px-2 animate-fade-in">
            <table className="w-full border-collapse text-sm text-center text-gray-700 border border-gray-300">
              <thead className="bg-[#f2f2f2] text-gray-800 font-semibold border-b border-gray-300 uppercase text-xs">
                <tr>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle">Folio</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle w-24">Fecha pedido</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle w-24">Fecha entrega</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle">Estado</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle">Cliente</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle">Vendedor</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle w-24">Importe total final</th>
                  <th className="px-3 py-4 align-middle"></th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-gray-400 italic">
                      No hay ventas en ese periodo.
                    </td>
                  </tr>
                ) : sales.map((sale) => (
                  <tr key={sale.transactionID} className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors h-14">
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{sale.folio}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{formatDateOnly(sale.transactionDate)}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{formatDeliveryDate(sale)}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{sale.outstandingAmount > 0 ? 'Pendiente' : 'Pagado'}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{getClienteNombre(sale)}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{getVendedorName(sale)}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{formatMoney(sale.finalAmount)}</td>
                    <td className="px-3 py-2 align-middle">
                      <button
                        onClick={() => handleViewDetail(sale.transactionID)}
                        disabled={loadingDetail}
                        className="text-gray-700 hover:text-[#e2694b] text-sm cursor-pointer transition-colors font-medium underline disabled:opacity-50"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* SUMA DEL PERIODO */}
            <div className="w-full flex justify-end mt-6 pr-4">
              <div className="flex gap-4 items-center">
                <span className="text-gray-700 font-medium text-lg">Total de ventas del periodo:</span>
                <span className="text-xl font-semibold text-gray-800">
                  {formatMoney(calcularTotalPeriodo())}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TABLA DE VENDEDORES (MEJORES VENDEDORES) */}
        {viewState === 'sellers' && (
          <div className="w-full overflow-x-auto mt-12 px-2 max-w-4xl animate-fade-in">
            <table className="w-full border-collapse text-sm text-center text-gray-700 border border-gray-300">
              <thead className="bg-[#f2f2f2] text-gray-800 font-semibold border-b border-gray-300 uppercase text-xs">
                <tr>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle w-24">Posición</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle">Vendedor(a)</th>
                  <th className="px-3 py-4 align-middle w-48">Total Ventas</th>
                </tr>
              </thead>
              <tbody>
                {getTopVendedores().length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-gray-400 italic">
                      No hay ventas en ese periodo.
                    </td>
                  </tr>
                ) : getTopVendedores().map((vendedor) => (
                  <tr key={vendedor.vendedor} className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors h-14">
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{vendedor.posicion}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{vendedor.vendedor}</td>
                    <td className="px-3 py-2 align-middle font-medium">{vendedor.totalFormat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}

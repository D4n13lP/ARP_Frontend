import { useState, useEffect } from 'react';
import { TrendingUp, Receipt } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getTransactions, getTransactionById } from '../api/transactions';
import { getErrorMessage } from '../utils/errorMessage';
import { formatDateOnly, formatDeliveryDate, getVendedorName, getRepartidorName, getLugarEntrega, getClienteNombre, formatMoney } from '../utils/orderDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Transaction } from '../types';

export default function SalesReport_Page() {
  // --- ESTADOS DE FECHAS --- ("YYYY-MM-DD", igual que en OrdersReports_Page)
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
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
      const y = hoy.getFullYear();
      const m = String(hoy.getMonth() + 1).padStart(2, '0');
      const d = String(hoy.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${d}`;
      setFechaInicio(iso);
      setFechaFin(iso);
    }
  }, [isReporteDia]);

  const handleGenerateReport = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor selecciona la fecha de inicio y la fecha de fin.');
      return;
    }
    if (fechaInicio > fechaFin) {
      alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }

    setGenerating(true);
    try {
      const all = await getTransactions({ transType: 'sale', includePayments: true });
      // transactionDate es "YYYY-MM-DD": comparar como texto es seguro y
      // evita cualquier lío de zona horaria al construir un Date.
      const enRango = all.filter((sale) => {
        if (!sale.transactionDate || sale.transactionDate < fechaInicio || sale.transactionDate > fechaFin) return false;
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
    setFechaInicio('');
    setFechaFin('');
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

  // Forma de pago de la venta (se pide con includePayments=true): efectivo,
  // o transferencia/tarjeta con el alias de la cuenta destino si aplica.
  const getFormaPago = (sale: Transaction) => {
    const pago = sale.payments?.[0];
    if (!pago) return '-';
    if (pago.paymentMethod === 'cash') return 'Efectivo';
    const alias = pago.destAccount?.accountAlias;
    return alias ? `Transferencia / tarjeta — ${alias}` : 'Transferencia / tarjeta';
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
              className="h-20 w-auto object-contain max-lg:portrait:hidden"
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
          <LoadingSpinner />
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
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Forma de pago:</span> <span>{getFormaPago(selectedSale)}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Estado del pago:</span> <span>{selectedSale.outstandingAmount > 0 ? 'Pendiente' : 'Pagado'}</span></div>
          </div>

          {/* Columna Derecha: Tabla de productos */}
          <div className="w-full md:w-2/3 flex flex-col items-end">
            {/* Escritorio/tablet (>= md), intacta */}
            <div className="w-full border border-gray-300 rounded overflow-hidden hidden md:block">
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

            {/* Tarjetas — celulares (< md) */}
            <div className="w-full md:hidden flex flex-col gap-2">
              {selectedSale.details && selectedSale.details.length > 0 ? selectedSale.details.map((item) => (
                <div key={item.transDetailID} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 truncate">{item.product?.productName}</div>
                    <div className="text-xs text-gray-500">{item.quantity} × {formatMoney(item.unitPrice)}</div>
                  </div>
                  <div className="shrink-0 font-semibold text-gray-800">{formatMoney(item.subtotal)}</div>
                </div>
              )) : (
                <p className="text-gray-400 italic text-center py-4">Sin productos registrados.</p>
              )}
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
            className="h-20 w-auto object-contain max-lg:portrait:hidden"
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

        {/* CONTENEDOR FECHAS Y BOTONES — en celular, tanto "table" (Ver
            vendedores/Reiniciar) como "sellers" (Regresar) se apilan: primero
            las fechas y abajo el/los botón(es); desde md+ se mantiene intacta
            la fila original (fechas a la izquierda, botones a la derecha) en
            ambos casos. "form" no se toca. */}
        <div className={`w-full flex ${viewState === 'table' || viewState === 'sellers' ? 'flex-col items-center gap-6 md:flex-row md:justify-between md:items-center md:px-10 md:max-w-4xl' : 'flex-col items-center gap-6'}`}>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <label className="w-12 font-medium text-gray-800">Inicio</label>
              <input
                type="date"
                disabled={viewState === 'table' || viewState === 'sellers'}
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#3ab0e2] text-gray-700 bg-white disabled:opacity-60"
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="w-12 font-medium text-gray-800">Fin</label>
              <input
                type="date"
                disabled={viewState === 'table' || viewState === 'sellers'}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#3ab0e2] text-gray-700 bg-white disabled:opacity-60"
              />
            </div>
          </div>

          {viewState === 'table' && (
            <div className="flex flex-row gap-3 md:flex-col">
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

        {/* TABLA DE RESULTADOS — escritorio/tablet (>= md), intacta */}
        {viewState === 'table' && (
          <div className="w-full overflow-x-auto mt-12 px-2 animate-fade-in hidden md:block">
            <table className="w-full border-collapse text-sm text-center text-gray-700 border border-gray-300">
              <thead className="bg-[#f2f2f2] text-gray-800 font-semibold border-b border-gray-300 uppercase text-xs">
                <tr>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle">Folio</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle w-24">Fecha pedido</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle w-24">Fecha entrega</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle">Estado</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle">Cliente</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle">Vendedor</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle">Forma de pago</th>
                  <th className="px-3 py-4 border-r border-gray-300 align-middle w-24">Importe total final</th>
                  <th className="px-3 py-4 align-middle"></th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-gray-400 italic">
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
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{getFormaPago(sale)}</td>
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
          </div>
        )}

        {/* Tarjetas — celulares (< md) */}
        {viewState === 'table' && (
          <div className="w-full mt-12 px-2 animate-fade-in md:hidden flex flex-col gap-3">
            {sales.length === 0 ? (
              <p className="text-center text-gray-400 italic py-8">No hay ventas en ese periodo.</p>
            ) : sales.map((sale) => (
              <div key={sale.transactionID} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{getClienteNombre(sale)}</h3>
                    <span className="text-xs text-gray-500">Folio {sale.folio}</span>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${sale.outstandingAmount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {sale.outstandingAmount > 0 ? 'Pendiente' : 'Pagado'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <div><span className="text-gray-500 block mb-0.5">Fecha pedido</span><span className="font-semibold text-gray-800">{formatDateOnly(sale.transactionDate)}</span></div>
                  <div><span className="text-gray-500 block mb-0.5">Fecha entrega</span><span className="font-semibold text-gray-800">{formatDeliveryDate(sale)}</span></div>
                  <div><span className="text-gray-500 block mb-0.5">Vendedor</span><span className="font-semibold text-gray-800">{getVendedorName(sale)}</span></div>
                  <div><span className="text-gray-500 block mb-0.5">Forma de pago</span><span className="font-semibold text-gray-800">{getFormaPago(sale)}</span></div>
                  <div><span className="text-gray-500 block mb-0.5">Importe total</span><span className="font-semibold text-gray-800">{formatMoney(sale.finalAmount)}</span></div>
                </div>
                <button
                  onClick={() => handleViewDetail(sale.transactionID)}
                  disabled={loadingDetail}
                  className="w-full py-2 bg-gray-50 text-gray-700 font-medium text-xs rounded-lg active:bg-gray-100 cursor-pointer disabled:opacity-50"
                >
                  Ver detalle
                </button>
              </div>
            ))}
          </div>
        )}

        {/* SUMA DEL PERIODO — se muestra en ambas versiones */}
        {viewState === 'table' && (
          <div className="w-full flex justify-end mt-6 pr-4 px-2">
            <div className="flex gap-4 items-center">
              <span className="text-gray-700 font-medium text-lg">Total de ventas del periodo:</span>
              <span className="text-xl font-semibold text-gray-800">
                {formatMoney(calcularTotalPeriodo())}
              </span>
            </div>
          </div>
        )}

        {/* TABLA DE VENDEDORES (MEJORES VENDEDORES) — escritorio/tablet (>= md), intacta */}
        {viewState === 'sellers' && (
          <div className="w-full overflow-x-auto mt-12 px-2 max-w-4xl animate-fade-in hidden md:block">
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

        {/* Tarjetas — celulares (< md) */}
        {viewState === 'sellers' && (
          <div className="w-full mt-12 px-2 max-w-4xl animate-fade-in md:hidden flex flex-col gap-2">
            {getTopVendedores().length === 0 ? (
              <p className="text-center text-gray-400 italic py-8">No hay ventas en ese periodo.</p>
            ) : getTopVendedores().map((vendedor) => (
              <div key={vendedor.vendedor} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 text-sm">
                <span className="shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center">{vendedor.posicion}</span>
                <span className="flex-1 font-medium text-gray-900 truncate">{vendedor.vendedor}</span>
                <span className="shrink-0 font-semibold text-gray-800">{vendedor.totalFormat}</span>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

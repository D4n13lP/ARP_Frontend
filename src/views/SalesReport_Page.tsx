import { useState, useEffect } from 'react';
import { TrendingUp, Receipt } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';

const dummySales = [
  {
    folio: 'V-001',
    fechaPedido: '01/04/2026',
    fechaEntrega: '02/04/2026',
    estado: 'Pagado',
    cliente: 'Maria Lopez',
    vendedor: 'Juan Pérez',
    importeTotalFinal: '$ 13,920.00',
  },
  {
    folio: 'V-002',
    fechaPedido: '02/04/2026',
    fechaEntrega: '03/04/2026',
    estado: 'Pagado',
    cliente: 'Carlos Slim',
    vendedor: 'Ana Martínez',
    importeTotalFinal: '$ 5,400.00',
  },
  {
    folio: 'V-003',
    fechaPedido: '03/04/2026',
    fechaEntrega: '04/04/2026',
    estado: 'Pendiente',
    cliente: 'Pedro Torres',
    vendedor: 'Juan Pérez',
    importeTotalFinal: '$ 8,300.00',
  }
];

const dummyDetail = {
  folio: 'V-001',
  fechaOrden: '01/04/2026',
  fechaEntrega: '02/04/2026',
  cliente: 'Maria Lopez',
  telefono: '555-123-4567',
  rfc: 'LOMM901020XYZ',
  vendedor: 'Juan Pérez',
  repartidor: 'Pedro Gómez',
  lugarEntrega: 'Calle 123, Colonia Centro',
  estadoPago: 'Pagado',
  productos: [
    { nombre: 'Maceta grande moderna', cantidad: 2, precio: '$ 450.00', suma: '$ 900.00' },
    { nombre: 'Pegazulejo', cantidad: 5, precio: '$ 865.00', suma: '$ 4,320.00' },
    { nombre: 'Block', cantidad: 1, precio: '$ 3,200.00', suma: '$ 3,200.00' },
    { nombre: 'Talamsa C9', cantidad: 1, precio: '$ 5,500.00', suma: '$ 5,500.00' }
  ],
  importeTotal: '$ 13,920.00'
};

export default function SalesReport_Page() {
  // --- ESTADOS DE FECHAS ---
  const [fechaInicio, setFechaInicio] = useState({ mm: '', dd: '', aaaa: '' });
  const [fechaFin, setFechaFin] = useState({ mm: '', dd: '', aaaa: '' });
  const [isReporteDia, setIsReporteDia] = useState(false);

  // --- ESTADOS DE VISTA Y USUARIO ---
  const [viewState, setViewState] = useState<'form' | 'table' | 'sellers' | 'detail'>('form');
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState('Todos');

  // Simulación de carga de usuarios
  const usuariosDB = ["Todos", "Juan Pérez", "María García", "Carlos López", "Ana Martínez", "Luis Rodríguez", "Elena Beltrán"];

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

  const handleGenerateReport = () => {
    setViewState('table');
  };

  const handleReset = () => {
    setViewState('form');
    setFechaInicio({ mm: '', dd: '', aaaa: '' });
    setFechaFin({ mm: '', dd: '', aaaa: '' });
    setIsReporteDia(false);
    setVendedorSeleccionado('Todos');
  };

  const handleViewDetail = () => {
    setViewState('detail');
  };

  const handleViewSellers = () => {
    setViewState('sellers');
  };

  // Calcular importe total de ventas del periodo actual
  const calcularTotalPeriodo = () => {
    return dummySales.reduce((acc, sale) => {
      const numericVal = parseFloat(sale.importeTotalFinal.replace(/[^0-9.-]+/g, ''));
      return acc + (isNaN(numericVal) ? 0 : numericVal);
    }, 0);
  };

  // Calcular top vendedores (esto normalmente lo harías con la BD)
  const getTopVendedores = () => {
    const sumas: Record<string, number> = {};
    dummySales.forEach(sale => {
      const val = parseFloat(sale.importeTotalFinal.replace(/[^0-9.-]+/g, ''));
      sumas[sale.vendedor] = (sumas[sale.vendedor] || 0) + val;
    });

    const top = Object.entries(sumas).map(([vendedor, total]) => ({ vendedor, total }));
    top.sort((a, b) => b.total - a.total);
    // Agregamos index natural
    return top.map((item, index) => ({
      posicion: index + 1,
      vendedor: item.vendedor,
      totalFormat: `$ ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }));
  };

  if (viewState === 'detail') {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans animate-fade-in p-6 md:p-10">
        {/* HEADER DETALLE DE VENTA */}
        <header className="relative py-6 mb-8 border-b border-gray-200 flex items-center justify-center min-h-[5rem]">
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

        <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-10 mt-6">
          {/* Columna Izquierda: Información */}
          <div className="flex flex-col gap-5 text-sm md:text-base text-gray-800 w-full md:w-1/3">
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Folio:</span> <span>{dummyDetail.folio}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Fecha de orden:</span> <span>{dummyDetail.fechaOrden}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Fecha de entrega:</span> <span>{dummyDetail.fechaEntrega}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Cliente:</span> <span>{dummyDetail.cliente}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Teléfono Cliente:</span> <span>{dummyDetail.telefono}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">RFC Cliente:</span> <span>{dummyDetail.rfc}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Vendedor:</span> <span>{dummyDetail.vendedor}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Repartidor:</span> <span>{dummyDetail.repartidor}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4"><span className="font-medium w-36">Lugar de entrega:</span> <span>{dummyDetail.lugarEntrega}</span></div>
            <div className="flex justify-between md:justify-start md:gap-4 mt-4"><span className="font-medium w-36">Estado del pago:</span> <span>{dummyDetail.estadoPago}</span></div>
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
                  {dummyDetail.productos.map((prod, i) => (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="py-3 px-4 border-r border-gray-200">{prod.nombre}</td>
                      <td className="py-3 px-4 border-r border-gray-200">{prod.cantidad}</td>
                      <td className="py-3 px-4 border-r border-gray-200">{prod.precio}</td>
                      <td className="py-3 px-4">{prod.suma}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 text-xl font-medium text-gray-800 self-end mr-4">
              Importe total {dummyDetail.importeTotal}
            </div>

            <button 
              onClick={() => setViewState('form')}
              className="mt-20 bg-[#3ab0e2] hover:bg-sky-400 text-white px-10 py-2 rounded shadow transition-colors cursor-pointer self-end"
            >
              Salir
            </button>
          </div>
        </main>
      </div>
    );
  }

  // VISTAS FORM Y TABLE (comparten el header)
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans animate-fade-in p-6 md:p-10">
      {/* HEADER REPORTE DE VENTAS */}
      <header className="relative py-6 mb-8 border-b border-gray-200 flex items-center justify-center min-h-[5rem]">
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
                {usuariosDB.map((user) => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-center pt-10 w-full mb-10">
              <button
                onClick={handleGenerateReport}
                className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded shadow transition-colors font-medium cursor-pointer"
              >
                Generar reporte
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
                {dummySales.map((sale, index) => (
                  <tr key={index} className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors h-14">
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{sale.folio}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{sale.fechaPedido}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{sale.fechaEntrega}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{sale.estado}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{sale.cliente}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{sale.vendedor}</td>
                    <td className="px-3 py-2 border-r border-gray-200 align-middle">{sale.importeTotalFinal}</td>
                    <td className="px-3 py-2 align-middle">
                      <button 
                        onClick={handleViewDetail}
                        className="text-gray-700 hover:text-[#e2694b] text-sm cursor-pointer transition-colors font-medium underline"
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
                  $ {calcularTotalPeriodo().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {getTopVendedores().map((vendedor, index) => (
                  <tr key={index} className="border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors h-14">
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
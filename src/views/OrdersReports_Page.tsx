import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { ROUTES } from '../routes';

// Dummy data for "Reporte pedidos" table
const dummyOrders = [
  {
    folio: '',
    fechaPedido: '07/24/2025',
    fechaEntrega: '08/10/2025',
    estado: 'Entregado',
    cliente: 'Juan',
    vendedor: 'Karla',
    importeTotalFinal: '$ 3,500.00',
    importeACuenta: '',
    importePendiente: '',
    lugarEntrega: '',
  },
  {
    folio: '',
    fechaPedido: '02/08/2025',
    fechaEntrega: '08/11/2025',
    estado: 'Entregado',
    cliente: 'Cliente no registrado',
    vendedor: 'César',
    importeTotalFinal: '$ 1,200.00',
    importeACuenta: '',
    importePendiente: '',
    lugarEntrega: '',
  },
  {
    folio: '',
    fechaPedido: '12/08/2025',
    fechaEntrega: '27/08/2025',
    estado: 'Pendiente',
    cliente: 'Antonio',
    vendedor: 'Karla',
    importeTotalFinal: '$ 4,500.00',
    importeACuenta: '',
    importePendiente: '',
    lugarEntrega: '',
  },
  {
    folio: '',
    fechaPedido: '23/08/2025',
    fechaEntrega: '28/08/2025',
    estado: 'Pendiente',
    cliente: 'No registrado',
    vendedor: 'César',
    importeTotalFinal: '$ 800.00',
    importeACuenta: '',
    importePendiente: '',
    lugarEntrega: '',
  }
];

export default function OrdersReports_Page() {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      alert('Por favor selecciona la fecha de inicio y la fecha de fin.');
      return;
    }
    
    // Validación de rango de fechas
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }

    setReportGenerated(true);
  };

  // Calcula automáticamente la suma de importeTotalFinal
  const calculateTotal = () => {
    return dummyOrders.reduce((sum, order) => {
      const numFormatted = order.importeTotalFinal.replace(/[^0-9.-]+/g, '');
      return sum + (parseFloat(numFormatted) || 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-7xl mb-8 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">
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
              disabled={reportGenerated}
              className={`px-8 py-2 rounded text-sm w-fit transition-colors shadow-sm font-medium ${
                reportGenerated 
                  ? 'bg-[#a3aac0] text-white cursor-default shadow-none' 
                  : 'bg-[#3ab0e2] hover:bg-sky-400 text-white cursor-pointer'
              }`}
            >
              Generar reporte
            </button>
            
            {reportGenerated && (
              <div className="flex flex-col text-sm text-gray-800 gap-3 mt-4 font-medium">
                <span>{dummyOrders.length} pedidos en el periodo</span>
                <span>Importe total del periodo: $ {calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Table Section */}
        {reportGenerated && (
          <div className="w-full overflow-x-auto mt-6 px-2 animate-fade-in">
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
                {dummyOrders.map((order, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors h-16">
                    <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.folio}</td>
                    <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.fechaPedido}</td>
                    <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.fechaEntrega}</td>
                    <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.estado}</td>
                    <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.cliente}</td>
                    <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.vendedor}</td>
                    <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.importeTotalFinal}</td>
                    <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.importeACuenta}</td>
                    <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.importePendiente}</td>
                    <td className="px-3 py-3 border-r border-gray-200 align-middle text-xs whitespace-pre-wrap">{order.lugarEntrega}</td>
                    <td className="px-3 py-3 align-middle">
                      <button 
                        onClick={() => navigate(ROUTES.ORDERS.DETAIL)} 
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

      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { ROUTES } from '../routes';

// Dummy data for "Actualización de pedidos" table
const ordersData = [
  {
    id: '1',
    folio: '',
    fechaPedido: '12/08/2025',
    fechaEntrega: '27/08/2025',
    estado: 'Pendiente entrega',
    cliente: 'Cliente1',
    vendedor: 'Cesar',
    importeTotal: '$ 13,920.00',
    importeACuenta: '$ 7,000.00',
    importePendiente: '$ 6,920.00',
    lugarEntrega: 'Av. Jardines de San Mateo s/n, Sta Cruz Acatlan, 53150 Naucalpan de Juárez, Méx.',
  },
  {
    id: '2',
    folio: '',
    fechaPedido: '',
    fechaEntrega: '',
    estado: '',
    cliente: '',
    vendedor: '',
    importeTotal: '',
    importeACuenta: '',
    importePendiente: '',
    lugarEntrega: '',
  }
];

export default function UpdateOrder_Page() {
  const navigate = useNavigate();

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
            {ordersData.map((order, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors h-24">
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.folio}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.fechaPedido}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.fechaEntrega}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.estado}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.cliente}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.vendedor}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.importeTotal}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.importeACuenta}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle">{order.importePendiente}</td>
                <td className="px-3 py-3 border-r border-gray-200 align-middle text-xs whitespace-pre-wrap">{order.lugarEntrega}</td>
                <td className="px-3 py-3 align-middle">
                  <button 
                    onClick={() => navigate(ROUTES.ORDERS.DETAIL)} 
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

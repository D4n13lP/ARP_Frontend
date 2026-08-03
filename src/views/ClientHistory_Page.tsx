import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { History } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';

interface Cliente {
  id: string;
  nombre: string;
  telefono1: string;
  telefono2: string;
  rfc: string;
  email: string;
}

// Mock data para las compras
const mockPurchases = [
  {
    id: 'p1',
    date: '10/03/2026',
    products: [
      { name: 'Pegazulejo', quantity: 5, priceFinal: '$ 865.00', sum: '$ 4,320.00' }
    ],
    total: '$ 4,320.00'
  },
  {
    id: 'p2',
    date: '15/02/2026',
    products: [
      { name: 'Maceta grande moderna', quantity: 2, priceFinal: '$ 450.00', sum: '$ 900.00' },
      { name: 'Block', quantity: 1, priceFinal: '$ 3,200.00', sum: '$ 3,200.00' }
    ],
    total: '$ 4,100.00'
  }
];

export default function ClientHistory_Page() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [period, setPeriod] = useState('Últimos 3 meses');
  const [clientData, setClientData] = useState<Cliente | null>(null);

  useEffect(() => {
    // Buscar el cliente en el almacenamiento local usando el ID de la URL
    if (id) {
      try {
        const saved = localStorage.getItem('clientes_db');
        if (saved) {
          const clientes: Cliente[] = JSON.parse(saved);
          const found = clientes.find((c) => c.id === id);
          if (found) {
            setClientData(found);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del cliente', error);
      }
    }
  }, [id]);

  // Mock lógica simulando base de datos
  const getFilteredPurchases = () => {
    if (period === 'Último mes') {
      return [mockPurchases[0]];
    } 
    return mockPurchases;
  };

  const displayedPurchases = getFilteredPurchases();

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-6xl mb-10 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">
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
                <td className="py-3 px-4 border-r border-gray-300">{clientData?.id || id || 'N/A'}</td>
                <td className="py-3 px-4 border-r border-gray-300">{clientData?.nombre || 'Desconocido'}</td>
                <td className="py-3 px-4 border-r border-gray-300">{clientData?.rfc || 'N/A'}</td>
                <td className="py-3 px-4 border-r border-gray-300">{clientData?.telefono1 || 'N/A'}</td>
                <td className="py-3 px-4 border-r border-gray-300">{clientData?.telefono2 || '-'}</td>
                <td className="py-3 px-4">{clientData?.email || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cierre de tabla info cliente omitido accidentalmente en reemplazo? No, es reescribir solo las thead/tbody */}

        {/* Filter & Results Count */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-4">
          <div className="flex gap-4 items-center">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-400 bg-white rounded px-3 py-1.5 focus:border-[#3ab0e2] outline-none text-gray-800 cursor-pointer shadow-sm text-sm"
            >
              <option value="Último mes">Seleccionar periodo</option>
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
            <div key={purchase.id} className="flex flex-col w-full animate-fade-in">
              <span className="font-bold text-gray-800 text-sm mb-2">{purchase.date}</span>
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
                    {purchase.products.map((prod, i) => (
                      <tr key={i}>
                        <td className="py-4 px-4 border-r border-gray-200">{prod.name}</td>
                        <td className="py-4 px-4 border-r border-gray-200">{prod.quantity}</td>
                        <td className="py-4 px-4 border-r border-gray-200">{prod.priceFinal}</td>
                        <td className="py-4 px-4">{prod.sum}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="w-full flex justify-end mt-4 pr-2">
                <span className="font-bold text-gray-800">
                  Importe total: {purchase.total}
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
    </div>
  );
}
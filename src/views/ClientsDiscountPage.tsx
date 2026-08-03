import { useState } from 'react';
import { TicketPercent, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import logoEmpresa from '../assets/logo_empresa.jpg';

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  pendientes: number;
  precio: number;
}

export default function ClientDiscountSetup_Page() {
  // --- ESTADOS ---
  const [clienteID, setClienteID] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [isProductSpecific, setIsProductSpecific] = useState(false);
  const [porcentaje, setPorcentaje] = useState<number | string>('');
  const navigate = useNavigate(); // 2. Inicializar la función navigate

  // Producto de ejemplo para demostrar el cálculo
  const [productoEjemplo] = useState<Producto>({
    id: 'P-001',
    nombre: 'Piso Cerámico Piedra',
    categoria: 'Pisos',
    stock: 50,
    pendientes: 5,
    precio: 250.00
  });

  // --- LÓGICA DE CÁLCULO DINÁMICO ---
  const calcularPrecioConDescuento = (precioOriginal: number) => {
    const p = typeof porcentaje === 'number' ? porcentaje : 0;
    if (p <= 0) return precioOriginal.toFixed(2);
    const descuento = precioOriginal * (p / 100);
    return (precioOriginal - descuento).toFixed(2);
  };

  const handlePorcentajeChange = (val: string) => {
    if (val === '') { setPorcentaje(''); return; }
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1 && num <= 100) setPorcentaje(num);
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col">
      <div className="max-w-7xl mx-auto w-full mb-4">
        <img src={logoEmpresa} alt="Logo" className="h-16 md:h-20 object-contain" />
      </div>
      
      {/* BOTÓN REGRESAR */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-400 hover:text-[#3ab0e2] transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Regresar al menú</span>
      </button>

      <main className="w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-8 text-[#e65100]">
          <h1 className="text-4xl font-normal">Descuento para clientes</h1>
          <TicketPercent className="text-[#e65100]" size={60} strokeWidth={1.2} />
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
          {/* SECCIÓN CLIENTE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600 uppercase">ID Cliente</label>
              <input 
                type="text" 
                className="p-3 border-2 border-gray-200 rounded-md focus:border-[#3ab0e2] outline-none bg-white font-mono"
                value={clienteID}
                onChange={(e) => setClienteID(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600 uppercase">Nombre del cliente</label>
              <input 
                type="text" 
                className="p-3 border-2 border-gray-200 rounded-md focus:border-[#3ab0e2] outline-none bg-white"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
              />
            </div>
          </div>

          {/* SECCIÓN CATEGORÍA / ESPECÍFICO */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 transition-all ${isProductSpecific ? 'opacity-30 pointer-events-none' : ''}`}>
             <div className="flex flex-col gap-2">
                <label className="text-lg font-medium">Categoría</label>
                <input type="text" className="p-3 border-2 border-gray-200 rounded-md" placeholder="Buscar..." />
             </div>
             <div className="flex flex-col justify-end">
                <select className="p-3 border-2 border-gray-200 rounded-md bg-gray-50 outline-none">
                  <option>Seleccionar categoría...</option>
                </select>
             </div>
          </div>

          <div className="flex items-center gap-3 mb-10">
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-[#3ab0e2]" 
              checked={isProductSpecific}
              onChange={(e) => setIsProductSpecific(e.target.checked)}
            />
            <label className="text-lg font-semibold text-gray-700">Descuento en productos específicos</label>
          </div>

          <div className={`mb-10 max-w-md flex ${!isProductSpecific ? 'opacity-30 pointer-events-none' : ''}`}>
            <input type="text" className="flex-1 p-3 border-2 border-gray-200 rounded-l-md outline-none focus:border-[#3ab0e2]" placeholder="Nombre del producto..." />
            <button className="bg-[#3ab0e2] text-white px-6 rounded-r-md"><Search size={22} /></button>
          </div>

          {/* TABLA CON CÁLCULO DINÁMICO */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg mb-8">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                <tr>
                  <th className="p-4 border-b">Producto</th>
                  <th className="p-4 border-b">Categoría</th>
                  <th className="p-4 border-b text-center">Cant. Disponible</th>
                  <th className="p-4 border-b text-center">Pendientes</th>
                  <th className="p-4 border-b">Estado</th>
                  <th className="p-4 border-b">Precio</th>
                  <th className="p-4 border-b bg-blue-50 text-[#3ab0e2]">Precio con descuento</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isProductSpecific ? (
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{productoEjemplo.nombre}</td>
                    <td className="p-4">{productoEjemplo.categoria}</td>
                    <td className="p-4 text-center">{productoEjemplo.stock}</td>
                    <td className="p-4 text-center">{productoEjemplo.pendientes}</td>
                    <td className="p-4 text-green-600 font-bold">ACTIVO</td>
                    <td className="p-4">${productoEjemplo.precio.toFixed(2)}</td>
                    <td className="p-4 font-bold text-[#3ab0e2] bg-blue-50/30">
                      ${calcularPrecioConDescuento(productoEjemplo.precio)}
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                      Seleccione una categoría o busque productos específicos para ver el cálculo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER: PORCENTAJE Y BOTÓN */}
          <div className="flex flex-col md:flex-row items-center gap-6 justify-end border-t border-gray-100 pt-8">
            <div className="flex items-center gap-4">
              <label className="font-bold text-gray-700">Porcentaje de descuento:</label>
              <div className="relative w-32">
                <input 
                  type="text"
                  placeholder="1 - 100"
                  className="w-full p-2 pr-8 border-2 border-[#3ab0e2] rounded text-center font-bold outline-none"
                  value={porcentaje}
                  onChange={(e) => handlePorcentajeChange(e.target.value)}
                />
                <span className="absolute right-3 top-2.5 font-bold text-[#3ab0e2]">%</span>
              </div>
            </div>
            
            <button 
              className={`px-12 py-3 rounded shadow-lg transition-all font-bold text-white ${!clienteID ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#3ab0e2] hover:bg-[#16A085]'}`}
              disabled={!clienteID}
            >
              Siguiente
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ArrowUp, ArrowDown } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getSuppliers } from '../api/suppliers';
import type { Supplier } from '../types';

export default function WatchSuppliers_Page() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [codigoBusqueda, setCodigoBusqueda] = useState('');
  const [nombreBusqueda, setNombreBusqueda] = useState('');

  useEffect(() => {
    getSuppliers().then(setSuppliers);
  }, []);

  const filteredSuppliers = suppliers
    .filter((s) =>
      s.suppCode.toLowerCase().includes(codigoBusqueda.toLowerCase()) &&
      s.supplierName.toLowerCase().includes(nombreBusqueda.toLowerCase())
    )
    .sort((a, b) => sortAsc
      ? a.supplierName.localeCompare(b.supplierName)
      : b.supplierName.localeCompare(a.supplierName));

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      
      {/* Header aligned like ManageAccount_Page but adapted for WatchSuppliers_Page */}
      <div className="w-full max-w-7xl mb-12 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">
        
        {/* Back Button and Logo (Left) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-6">
          <img 
            src={logoEmpresa} 
            alt="LogoEmpresa" 
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
            Proveedores
          </h1>
          <Users size={45} strokeWidth={1.5} />
        </div>
      </div>

      <main className="flex-grow flex flex-col items-center w-full mt-4">
        
        {/* Search and Sort Section */}
        <div className="w-full max-w-7xl flex flex-wrap items-center justify-center gap-8 mb-8">
          
          {/* Código proveedor search */}
          <div className="flex items-center">
            <input 
              type="text" 
              placeholder="Código proveedor" 
              value={codigoBusqueda}
              onChange={(e) => setCodigoBusqueda(e.target.value)}
              className="border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:border-[#3ab0e2] text-sm w-48"
            />
            <button className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-4 py-2 rounded-r transition-colors flex items-center justify-center h-full">
               <Search size={20} />
            </button>
          </div>

          {/* Nombre proveedor search */}
          <div className="flex items-center">
            <input 
              type="text" 
              placeholder="Nombre proveedor" 
              value={nombreBusqueda}
              onChange={(e) => setNombreBusqueda(e.target.value)}
              className="border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:border-[#3ab0e2] text-sm w-48"
            />
            <button className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-4 py-2 rounded-r transition-colors flex items-center justify-center h-full">
               <Search size={20} />
            </button>
          </div>

          {/* Sort button */}
          <div className="flex items-center ml-4">
             <button 
               onClick={() => setSortAsc(!sortAsc)}
               className="border border-gray-300 text-gray-500 hover:bg-gray-50 bg-white px-4 py-2 flex items-center gap-2 rounded transition-colors text-sm"
             >
               Nombre
               {sortAsc ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
             </button>
          </div>

        </div>

        {/* Results Table Section */}
        <div className="w-full max-w-7xl overflow-x-auto">
          <table className="w-full border-collapse text-sm text-left text-gray-700 border border-gray-300">
            <thead className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 border-r border-gray-300">Código de proveedor</th>
                <th className="px-4 py-3 border-r border-gray-300">Nombre de proveedor</th>
                <th className="px-4 py-3 border-r border-gray-300">Empresa o negocio</th>
                <th className="px-4 py-3 border-r border-gray-300">Dirección</th>
                <th className="px-4 py-3 border-r border-gray-300">Teléfono oficina</th>
                <th className="px-4 py-3 border-r border-gray-300">Nombre del contacto</th>
                <th className="px-4 py-3 border-r border-gray-300">Teléfono del contacto</th>
                <th className="px-4 py-3">Más información</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((item) => (
                <tr key={item.suppCode} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 border-r border-gray-200">{item.suppCode}</td>
                  <td className="px-4 py-3 border-r border-gray-200">{item.supplierName}</td>
                  <td className="px-4 py-3 border-r border-gray-200">{item.enterpBusi || '---'}</td>
                  <td className="px-4 py-3 border-r border-gray-200">{item.address || '---'}</td>
                  <td className="px-4 py-3 border-r border-gray-200">{item.officePhone || '---'}</td>
                  <td className="px-4 py-3 border-r border-gray-200">{item.contactName || '---'}</td>
                  <td className="px-4 py-3 border-r border-gray-200">{item.contactPhone || '---'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/suppliers/detail/${item.suppCode}`)}
                      className="text-gray-600 hover:text-[#e2694b] text-sm cursor-pointer transition-colors font-medium"
                    >
                      Ver información
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400 italic">
                    No se encontraron proveedores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

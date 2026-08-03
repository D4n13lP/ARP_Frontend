import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoEmpresa from '../assets/logo_empresa.jpg';

export default function Retiros_Page() {
  const navigate = useNavigate();
  const [cantidad, setCantidad] = useState('');
  const [saldoDisponible, setSaldoDisponible] = useState(25000);
  const [error, setError] = useState('');

  const handleRetirar = () => {
    const amount = parseFloat(cantidad);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Ingresa una cantidad válida mayor a 0');
      return;
    }

    if (amount > saldoDisponible) {
      setError('La cantidad a retirar supera el saldo disponible');
      return;
    }

    // Calcula el remanente
    setSaldoDisponible(prev => prev - amount);
    setCantidad('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-7xl mb-12 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">
        {/* Logo a la izquierda */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <img 
            src={logoEmpresa} 
            alt="LogoEmpresa" 
            className="h-20 w-auto object-contain" 
          />
        </div>
        
        {/* Título centrado */}
        <div className="flex items-center text-[#e2694b]">
          <h1 className="text-4xl font-bold tracking-tight">
            Retiro de efectivo
          </h1>
        </div>
      </div>

      <div className="w-full max-w-4xl relative flex flex-col items-center">
        
        {/* Botón regresar alineado a la izquierda del contenedor principal */}
        <div className="w-full mb-16 flex justify-start">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-800 hover:text-[#d0583b] transition-colors text-lg font-medium"
          >
            regresar
          </button>
        </div>

        {/* Contenido centrado */}
        <div className="flex flex-col items-center gap-12 w-full max-w-lg">
          <h2 className="text-2xl md:text-3xl text-gray-900 font-medium">
            Saldo disponible en caja: $ {saldoDisponible.toLocaleString('en-US')}
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
            <span className="text-gray-900 text-lg">Ingresa la cantidad a retirar</span>
            <div className="flex flex-col items-center gap-2">
              <input 
                type="number" 
                value={cantidad}
                onChange={(e) => {
                  setCantidad(e.target.value);
                  setError('');
                }}
                className={`border rounded px-2 py-1.5 w-32 focus:outline-none text-center text-lg ${
                  error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#e2694b]'
                }`}
              />
              {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
            </div>
          </div>

          <button
            onClick={handleRetirar}
            className="bg-[#e2694b] hover:bg-[#d0583b] text-white px-8 py-2 rounded-md font-bold text-lg shadow-sm transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={saldoDisponible <= 0}
          >
            Retirar
          </button>
        </div>
        
      </div>
    </div>
  );
}

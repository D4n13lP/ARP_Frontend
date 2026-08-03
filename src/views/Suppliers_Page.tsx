import { Users, UserPlus } from 'lucide-react';
import MenuCard from '../components/MenuCard';
import logoEmpresa from '../assets/logo_empresa.jpg'; // Usando la importación recomendada

export default function SuppliersMenu_Page() {
  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-7xl mb-12 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">
        {/* Logo a la izquierda */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <img 
            src={logoEmpresa} 
            alt="Acabados Rústicos Pirámides" 
            className="h-20 w-auto object-contain" 
          />
        </div>
        
        {/* Título centrado */}
        <div className="flex items-center gap-6 text-[#e65100]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Proveedores
          </h1>
          {/* Icono de Proveedores similar al de la imagen */}
          <div className="text-inherit">
            <Users size={55} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <main className="flex-grow flex flex-col items-center w-full mt-10">
        
        {/* 3. GRID DE TARJETAS: Con separación gap-20 y efecto hover invertido */}
        <div className="flex flex-wrap justify-center gap-20 w-full max-w-5xl px-4">
          
          <MenuCard 
            label="Ver proveedores" 
            icon={Users} 
            path="/suppliers/watch" 
            bgColor="bg-[#3ab0e2]" 
          />
          
          <MenuCard 
            label="Registrar proveedor" 
            icon={UserPlus} 
            path="/suppliers/register" 
            bgColor="bg-[#ffcc33]" 
          />
          
        </div>

        {/* 4. CONTRAPESO: Espaciador inferior para el centrado óptico */}
        <div className="flex-grow min-h-[100px]" />
      </main>
    </div>
  );
}
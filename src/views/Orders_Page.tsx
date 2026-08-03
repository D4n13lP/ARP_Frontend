import { FileEdit, FileText, Receipt } from 'lucide-react';
import MenuCard from '../components/MenuCard';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { ROUTES } from '../routes';

export default function OrdersMenu_Page() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans animate-fade-in">
      {/* HEADER: Divider line at bottom */}
      <header className="relative py-6 mb-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center h-16">
          <img
            src={logoEmpresa}
            alt="Acabados Rústicos Pirámides"
            className="absolute left-4 sm:left-6 lg:left-8 h-16 md:h-20 object-contain"
          />
          <div className="flex items-center gap-4 text-[#e65100]">
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-center">
              Pedidos
            </h1>
            <Receipt size={48} strokeWidth={1.2} />
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center mt-12">
        
        {/* 3. GRID DE TARJETAS: Alineación horizontal estándar */}
        <div className="flex flex-wrap justify-center gap-20 w-full max-w-5xl px-4">
          
          <MenuCard 
            label="Actualizar pedido" 
            icon={FileEdit} 
            path={ROUTES.ORDERS.UPDATE} 
            bgColor="bg-[#74c9f1]" 
          />
          
          <MenuCard 
            label="Reporte Pedidos" 
            icon={FileText} 
            path={ROUTES.ORDERS.REPORT} 
            bgColor="bg-[#fcd34d]" 
          />
          
        </div>

        {/* 4. CONTRAPESO: Espaciador inferior */}
        <div className="flex-grow min-h-[100px]" />
      </main>
    </div>
  );
}
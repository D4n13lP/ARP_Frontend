import { ShoppingCart, PackageSearch, Wallet, Banknote } from 'lucide-react';
import MenuCard from '../components/MenuCard';
import logoEmpresa from '../assets/logo_empresa.jpg';

export default function SalesMenu_Page() {
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
        <div className="flex items-center gap-6 text-[#e65100]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Ventas y pedidos
          </h1>
          {/* El icono ahora hereda el color text-[#e65100] */}
          <div className="text-inherit">
            <Banknote size={65} strokeWidth={1.2} />
          </div>
        </div>
      </div>

      <main className="flex-grow flex flex-col items-center w-full mt-10">
        
        {/* 3. GRID DE TARJETAS: Alineadas horizontalmente con flex-row (por defecto en flex) */}
        <div className="flex flex-wrap justify-center gap-12 w-full max-w-7xl px-4">
          
          <MenuCard 
            label="Registrar Venta" 
            icon={ShoppingCart} 
            path="/sales/register" 
            bgColor="bg-[#3ab0e2]" 
          />
          
          <MenuCard 
            label="Registrar Pedido" 
            icon={PackageSearch} 
            path="/orders/register" 
            bgColor="bg-[#ffcc33]" 
          />

          <MenuCard
            label="Cuentas de pago"
            icon={Wallet}
            path="/destinationAccount/register"
            bgColor="bg-[#5d1209]" // Color café/oscuro de la imagen
          />
          
        </div>

        {/* 4. CONTRAPESO: Espaciador inferior */}
        <div className="flex-grow min-h-[100px]" />
      </main>
    </div>
  );
}
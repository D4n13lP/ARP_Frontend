

import { useState } from 'react';
import { Search } from 'lucide-react';
import ProductSearchTable from '../components/ProductSearchTable';
import SaleSummary, { CartItem } from '../components/SaleSummary';
import OrderReview from '../components/OrderReview';
import logoEmpresa from '../assets/logo_empresa.jpg';

// Simulación de los productos consultados en la BD
const searchResultsMock = [
  { id: '1', nombre: 'Maceta grande moderna', categoria: 'Macetas', cantidadDisponible: 20, precio: 450.00, promocion: 0 },
  { id: '2', nombre: 'Escultura decorativa', categoria: 'Figuras', cantidadDisponible: 0, precio: 7000.00, promocion: 0 },
  { id: '3', nombre: 'Pegazulejo', categoria: 'Adhesivos', cantidadDisponible: 500, precio: 865.00, promocion: 0 },
  { id: '4', nombre: 'Block', categoria: 'Tabiques', cantidadDisponible: 7000, precio: 3200.00, promocion: 0 },
  { id: '5', nombre: 'Talamsa C9', categoria: 'Celosía', cantidadDisponible: 9000, precio: 5500.00, promocion: 0 },
];

export default function RegisterOrder_Page() {
  const [codigo, setCodigo] = useState('');
  const [nombreProducto, setNombreProducto] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Estado para controlar en qué paso de la vista estamos
  const [viewStep, setViewStep] = useState<'search' | 'summary' | 'review'>('search');
  const [cartData, setCartData] = useState<CartItem[]>([]);
  const [orderSummaryData, setOrderSummaryData] = useState<any>(null);

  const handleSearch = () => {
    // Al presionar buscar, mostramos la tabla
    setHasSearched(true);
  };

  const handleAddSelectedProducts = (selectedProducts: any[]) => {
    const newCartItems: CartItem[] = selectedProducts.map(item => ({
      id: item.product.id,
      nombre: item.product.nombre,
      precio: item.product.precio,
      cantidad: item.amount,
      promocion: item.product.promocion || 0
    }));
    
    setCartData(newCartItems);
    setViewStep('summary');
  };

  const handleProceedToReview = (summaryData: any) => {
    setOrderSummaryData(summaryData);
    setViewStep('review');
  };

  const handleRegisterOrder = () => {
    console.log("Registrando pedido con datos finales:", orderSummaryData);
    // Lógica para enviar a backend...
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      
      {/* Header con LOGO a la izquierda y TÍTULO centrado */}
      <div className="w-full max-w-7xl mb-12 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">
        
        {/* LOGO */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <img 
            src={logoEmpresa} 
            alt="LogoEmpresa" 
            className="h-20 w-auto object-contain" 
          />
        </div>

        {/* CONTENEDOR DEL TÍTULO */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-[#e65100]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Registrar Pedido
          </h1>
          {/* Ícono de caja registradora en el mismo color */}
          <div className="text-[#e65100]">
             <svg 
              className="w-14 h-14 md:w-16 md:h-16" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M4 6h16v2H4zm2 4h12v10H6zm3 2h2v2H9zm4 0h2v2h-2zm-4 4h2v2H9zm4 0h2v2h-2zm-6-8V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2h3v2h2v12c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V8h2zm3-4v2h4V4H6z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl relative flex flex-col items-center">
        
        {viewStep === 'search' && (
          <>
            {/* Buscador de productos */}
            <div className="flex w-full mb-12">
              <div className="flex items-end gap-8 mx-auto xl:mx-0 w-full xl:w-auto xl:mr-auto justify-start pl-8 xl:pl-48">
                <div className="flex flex-col w-56 md:w-64">
                  <div className="flex h-10 border border-gray-300 rounded shadow-sm overflow-hidden">
                    <input
                      type="text"
                      placeholder="Código"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      className="px-3 w-full text-sm focus:outline-none focus:ring-1 focus:ring-[#3ab0e2]"
                    />
                    <button 
                      onClick={handleSearch}
                      className="bg-[#3ab0e2] hover:bg-sky-500 px-4 flex items-center justify-center transition-colors"
                    >
                      <Search className="text-white w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col w-64 md:w-80">
                  <div className="flex h-10 border border-gray-300 rounded shadow-sm overflow-hidden">
                    <input
                      type="text"
                      placeholder="Nombre producto"
                      value={nombreProducto}
                      onChange={(e) => setNombreProducto(e.target.value)}
                      className="px-3 w-full text-sm focus:outline-none focus:ring-1 focus:ring-[#3ab0e2]"
                    />
                    <button 
                      onClick={handleSearch}
                      className="bg-[#3ab0e2] hover:bg-sky-500 px-4 flex items-center justify-center transition-colors"
                    >
                      <Search className="text-white w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla resultados de búsqueda */}
            <div className="w-full px-4 mb-20 max-w-6xl mx-auto">
              {hasSearched && (
                <ProductSearchTable 
                  products={searchResultsMock} 
                  onAddSelected={handleAddSelectedProducts} 
                />
              )}
            </div>
          </>
        )}

        {viewStep === 'summary' && (
          <div className="w-full px-4 max-w-6xl mx-auto">
             {/* Componente SaleSummary con variant="order" */}
             <SaleSummary 
              cartItems={cartData} 
              onNext={handleProceedToReview} 
              variant="order"
             />
          </div>
        )}

        {viewStep === 'review' && orderSummaryData && (
          <div className="w-full px-4 max-w-6xl mx-auto mb-20">
            <OrderReview 
              orderData={orderSummaryData} 
              onRegister={handleRegisterOrder} 
            />
          </div>
        )}

     </div>
    </div>
  );
}

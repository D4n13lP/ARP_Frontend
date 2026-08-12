import { useState } from 'react';
import { Search } from 'lucide-react';
import ProductSearchTable, { type ProductData } from '../components/ProductSearchTable';
import SaleSummary, { type CartItem, type SaleSummaryData } from '../components/SaleSummary';
import OrderReview, { type OrderPayment } from '../components/OrderReview';
import TicketPrintModal, { type TicketData } from '../components/TicketPrintModal';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getInventories } from '../api/inventory';
import { createOrder } from '../api/transactions';
import { getErrorMessage } from '../utils/errorMessage';
import { useAppStore } from '../stores/useAppStore';

export default function RegisterOrder_Page() {
  const authUser = useAppStore((state) => state.authUser);
  const [codigo, setCodigo] = useState('');
  const [nombreProducto, setNombreProducto] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  // La tabla se va LLENANDO con cada búsqueda (no se reinicia); "Limpiar" la vacía a propósito.
  const [searchResults, setSearchResults] = useState<ProductData[]>([]);
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  // Estado para controlar en qué paso de la vista estamos
  const [viewStep, setViewStep] = useState<'search' | 'summary' | 'review'>('search');
  const [cartData, setCartData] = useState<CartItem[]>([]);
  const [orderSummaryData, setOrderSummaryData] = useState<SaleSummaryData | null>(null);
  const [registeringOrder, setRegisteringOrder] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  // La tabla de resultados sale de "inventory" (no de "product"): si el mismo
  // producto tiene existencia en varios almacenes, aparece una fila por cada
  // almacén donde está registrado, cada una con su propia cantidad disponible.
  const handleSearch = async () => {
    const codigoBusqueda = codigo.trim().toLowerCase();
    const nombreBusqueda = nombreProducto.trim().toLowerCase();
    if (!codigoBusqueda && !nombreBusqueda) {
      alert('Ingresa un criterio de búsqueda.');
      return;
    }
    setSearching(true);
    try {
      const inventarios = await getInventories();
      const matches: ProductData[] = inventarios
        .filter((inv) => {
          const sku = (inv.product?.sku || '').toLowerCase();
          const nombre = (inv.product?.productName || '').toLowerCase();
          return (!codigoBusqueda || sku.includes(codigoBusqueda))
            && (!nombreBusqueda || nombre.includes(nombreBusqueda));
        })
        .map((inv) => ({
          id: inv.inventoryID,
          nombre: inv.product?.productName || '',
          categoria: inv.product?.category?.categoryName || '',
          almacen: inv.warehouse?.whname || '',
          cantidadDisponible: inv.quantity,
          precio: Number(inv.product?.salePrice ?? 0),
          promocion: inv.product?.promo ? Number(inv.product.promo.discountPercentage) * 100 : 0,
          unidad: inv.product?.unit?.produnitName || '',
        }));

      // Se agregan/actualizan los resultados de esta búsqueda sin perder los
      // de antes ni las cantidades que ya se habían capturado.
      setSearchResults((prev) => {
        const merged = new Map(prev.map((p) => [p.id, p]));
        for (const m of matches) merged.set(m.id, m);
        return Array.from(merged.values());
      });
      setAmounts((prev) => {
        const next = { ...prev };
        for (const m of matches) if (!(m.id in next)) next[m.id] = 0;
        return next;
      });
      setHasSearched(true);
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudieron buscar los productos.'));
    } finally {
      setSearching(false);
    }
  };

  const handleAmountChange = (id: string, value: string, max: number) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) numValue = 0;
    if (numValue > max) numValue = max;
    setAmounts((prev) => ({ ...prev, [id]: numValue }));
  };

  const handleClearResults = () => {
    setSearchResults([]);
    setAmounts({});
    setHasSearched(false);
  };

  const handleAddSelectedProducts = (selectedProducts: { product: ProductData; amount: number }[]) => {
    const newCartItems: CartItem[] = selectedProducts.map(item => ({
      id: item.product.id,
      nombre: item.product.nombre,
      precio: item.product.precio,
      cantidad: item.amount,
      promocion: item.product.promocion || 0,
      unidad: item.product.unidad || '',
    }));

    setCartData(newCartItems);
    setViewStep('summary');
  };

  const handleProceedToReview = (summaryData: SaleSummaryData) => {
    setOrderSummaryData(summaryData);
    setViewStep('review');
  };

  const handleRegisterOrder = async (payment: OrderPayment) => {
    if (!orderSummaryData) return;
    setRegisteringOrder(true);
    try {
      const result = await createOrder({
        clientCode: orderSummaryData.cliente?.clientCode ?? null,
        newClient: orderSummaryData.newClienteData ?? undefined,
        items: orderSummaryData.cartItems.map((item) => ({
          inventoryID: item.id,
          quantity: item.cantidad,
          discountPercent: orderSummaryData.itemsDiscountPercent ?? item.promocion,
        })),
        depositAmount: payment.depositAmount,
        paymentMethod: payment.paymentMethod ? (payment.paymentMethod as 'cash' | 'digital') : undefined,
        destAccountClabe: payment.destAccountClabe,
        transDiscountID: orderSummaryData.transDiscountID,
        delivery: orderSummaryData.entrega,
        shippingCost: orderSummaryData.shippingCost,
      });

      // Igual que en RegisterSale_Page: subtotal sin descuento vs. el total ya
      // descontado (orderSummaryData.totales.base) para desglosar el ticket.
      const subtotalBruto = orderSummaryData.cartItems.reduce((sum, item) => sum + item.suma, 0);
      const totalDescuento = subtotalBruto - orderSummaryData.totales.base;
      const anticipoNum = payment.depositAmount;
      const restanteNum = Math.max(0, orderSummaryData.totales.final - anticipoNum);
      const tipoPagoLabel = anticipoNum > 0
        ? (payment.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia / tarjeta')
        : 'Sin anticipo';

      setTicketData({
        tipo: 'pedido',
        folio: result.folio ?? result.transactionID,
        fecha: new Date(),
        vendedor: authUser?.userName || '-',
        cliente: orderSummaryData.cliente?.clientName || orderSummaryData.newClienteData?.clientName || 'Cliente no registrado',
        domicilio: orderSummaryData.entrega.enTienda ? 'En tienda' : (orderSummaryData.entrega.address || '-'),
        fechaEntrega: orderSummaryData.entrega.inmediata
          ? 'Inmediata'
          : (orderSummaryData.entrega.dispatchDateI ? `${orderSummaryData.entrega.dispatchDateI} a ${orderSummaryData.entrega.dispatchDateF || '-'}` : '-'),
        items: orderSummaryData.cartItems.map((item) => ({
          nombre: item.nombre,
          cantidad: item.cantidad,
          unidad: item.unidad,
          precio: item.precio,
          importe: item.sumaFinal,
        })),
        subtotal: subtotalBruto,
        descuento: totalDescuento,
        costoEnvio: orderSummaryData.shippingCost,
        total: orderSummaryData.totales.final,
        anticipo: anticipoNum,
        restante: restanteNum,
        tipoPago: tipoPagoLabel,
        totalPago: anticipoNum,
        metodoPagoEsEfectivo: anticipoNum > 0 && payment.paymentMethod === 'cash',
      });

      // Listo: se limpia todo para poder registrar el siguiente pedido desde cero.
      setCodigo('');
      setNombreProducto('');
      setHasSearched(false);
      setSearchResults([]);
      setAmounts({});
      setCartData([]);
      setOrderSummaryData(null);
      setViewStep('search');
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo registrar el pedido.'));
    } finally {
      setRegisteringOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">

      {/* Header con LOGO a la izquierda y TÍTULO centrado */}
      <div className="w-full max-w-7xl mb-12 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-20">

        {/* LOGO */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 max-lg:portrait:hidden">
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
                      placeholder="Código o ID"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      className="px-3 w-full text-sm focus:outline-none focus:ring-1 focus:ring-[#3ab0e2]"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={searching}
                      className="bg-[#3ab0e2] hover:bg-sky-500 px-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={searching}
                      className="bg-[#3ab0e2] hover:bg-sky-500 px-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Search className="text-white w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabla resultados de búsqueda */}
            <div className="w-full px-4 mb-20 max-w-6xl mx-auto">
              {searching ? (
                <p className="text-center text-gray-400">Buscando...</p>
              ) : hasSearched && (
                <ProductSearchTable
                  products={searchResults}
                  amounts={amounts}
                  onAmountChange={handleAmountChange}
                  onAddSelected={handleAddSelectedProducts}
                  onClear={handleClearResults}
                />
              )}
            </div>
          </>
        )}

        {viewStep === 'summary' && (
          <div className="w-full px-4 max-w-6xl mx-auto">
             {/* Componente SaleSummary con variant="order": el pago/anticipo
                 se captura después, en OrderReview. */}
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
              submitting={registeringOrder}
            />
          </div>
        )}

     </div>

     <TicketPrintModal key={ticketData?.folio ?? 'closed'} data={ticketData} onClose={() => setTicketData(null)} />
    </div>
  );
}

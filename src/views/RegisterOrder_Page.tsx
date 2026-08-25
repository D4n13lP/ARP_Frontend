import { useEffect, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import ProductSearchTable, { type ProductData } from '../components/ProductSearchTable';
import SaleSummary, { type CartItem, type SaleSummaryData } from '../components/SaleSummary';
import OrderReview, { type OrderPayment } from '../components/OrderReview';
import TicketPrintModal, { type TicketData } from '../components/TicketPrintModal';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getInventories } from '../api/inventory';
import { createOrder } from '../api/transactions';
import { createSpecialOrderProduct } from '../api/products';
import { getProductUnits, createProductUnit } from '../api/productUnits';
import { getErrorMessage } from '../utils/errorMessage';
import { useAppStore } from '../stores/useAppStore';
import type { ProductUnit } from '../types';

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
  const [viewStep, setViewStep] = useState<'search' | 'summary' | 'review' | 'specialOrder'>('search');
  const [cartData, setCartData] = useState<CartItem[]>([]);
  const [orderSummaryData, setOrderSummaryData] = useState<SaleSummaryData | null>(null);
  const [registeringOrder, setRegisteringOrder] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  // "Orden Especial": crea un producto ad-hoc (prodType 'custom') y lo
  // ingresa de una vez al almacén fijo "Pedido especial" — ver
  // createSpecialOrderProduct. De ahí en adelante sigue el mismo flujo que
  // una búsqueda normal (resumen -> revisión -> registro -> ticket).
  const [productUnits, setProductUnits] = useState<ProductUnit[]>([]);
  const [especialForm, setEspecialForm] = useState({ productName: '', description: '', salePrice: '', unidad: '', quantity: '' });
  const [savingSpecialOrder, setSavingSpecialOrder] = useState(false);

  useEffect(() => {
    getProductUnits().then(setProductUnits).catch(() => {});
  }, []);

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
          prodCode: inv.prodCode,
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
      prodCode: item.product.prodCode,
      nombre: item.product.nombre,
      precio: item.product.precio,
      cantidad: item.amount,
      promocion: item.product.promocion || 0,
      unidad: item.product.unidad || '',
    }));

    // Se combina con lo que ya hubiera en el carrito (p. ej. el producto de
    // una Orden Especial) en vez de reemplazarlo — así se pueden agregar
    // productos normales del inventario junto al de la orden especial.
    setCartData((prev) => {
      const merged = new Map(prev.map((item) => [item.id, item]));
      for (const item of newCartItems) merged.set(item.id, item);
      return Array.from(merged.values());
    });
    setViewStep('summary');
  };

  // Botón "Continuar" del aviso compacto (orden especial registrada primero,
  // sin buscar nada más todavía) — hace exactamente lo mismo que el botón
  // "Agregar" de la tabla, tomando lo que ya está en "searchResults".
  const handleContinuarConEspecial = () => {
    const selected = searchResults
      .filter((p) => amounts[p.id] > 0)
      .map((p) => ({ product: p, amount: amounts[p.id] }));
    handleAddSelectedProducts(selected);
  };

  const handleAbrirOrdenEspecial = () => {
    setEspecialForm({ productName: '', description: '', salePrice: '', unidad: '', quantity: '' });
    setViewStep('specialOrder');
  };

  const handleRegistrarOrdenEspecial = async () => {
    if (!especialForm.productName.trim()) {
      alert('Ingresa el nombre del producto.');
      return;
    }
    const quantity = parseInt(especialForm.quantity, 10);
    if (!Number.isInteger(quantity) || quantity < 1) {
      alert('Ingresa una cantidad válida (entero de 1 o más).');
      return;
    }
    setSavingSpecialOrder(true);
    try {
      // Misma resolución que categoría/unidad en ProductModal: se usa la
      // unidad ya guardada si el nombre coincide, o se crea una nueva.
      const trimmedUnidad = especialForm.unidad.trim();
      let produnitID: string | undefined;
      if (trimmedUnidad) {
        const existing = productUnits.find((u) => u.produnitName.trim().toLowerCase() === trimmedUnidad.toLowerCase());
        if (existing) {
          produnitID = existing.produnitID;
        } else {
          const created = await createProductUnit(trimmedUnidad);
          produnitID = created.produnitID;
          setProductUnits((prev) => [...prev, created]);
        }
      }

      const inventory = await createSpecialOrderProduct({
        productName: especialForm.productName.trim(),
        description: especialForm.description.trim() || undefined,
        salePrice: Number(especialForm.salePrice) || 0,
        produnitID,
        quantity,
      });

      // Siempre se agrega como una fila más de "searchResults" (con la
      // cantidad ya precargada) — nunca directo al carrito. Mientras no se
      // haya buscado nada (hasSearched=false) se muestra el aviso compacto
      // en vez de la tabla completa; en cuanto se busca algo (antes o
      // después de esto), pasa a la tabla junto con los productos
      // encontrados, con un solo botón "Agregar" para todo.
      const newRow: ProductData = {
        id: inventory.inventoryID,
        prodCode: inventory.prodCode,
        nombre: inventory.product?.productName || especialForm.productName.trim(),
        categoria: inventory.product?.category?.categoryName || '',
        almacen: inventory.warehouse?.whname || '',
        cantidadDisponible: inventory.quantity,
        precio: Number(inventory.product?.salePrice ?? especialForm.salePrice) || 0,
        promocion: 0,
        unidad: inventory.product?.unit?.produnitName || '',
      };
      setSearchResults((prev) => [...prev, newRow]);
      setAmounts((prev) => ({ ...prev, [newRow.id]: newRow.cantidadDisponible }));
      setViewStep('search');
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo registrar la orden especial.'));
    } finally {
      setSavingSpecialOrder(false);
    }
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
          // item.promocion ya viene resuelto desde SaleSummary (rows) — ver
          // comentario equivalente en RegisterSale_Page.tsx.
          discountPercent: item.promocion,
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
            {/* Buscador de productos. En móvil (< sm) se apilan en columna a
                lo ancho completo — en fila no cabían los tres elementos
                (dos campos + botón) en una pantalla angosta. */}
            <div className="flex w-full mb-12">
              <div className="flex flex-col items-stretch gap-4 w-full max-w-sm sm:max-w-none sm:flex-row sm:items-end sm:gap-8 sm:w-auto mx-auto">
                <div className="flex flex-col w-full sm:w-56 md:w-64">
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

                <div className="flex flex-col w-full sm:w-64 md:w-80">
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

                <div className="flex flex-col w-full sm:w-auto sm:justify-end">
                  <button
                    onClick={handleAbrirOrdenEspecial}
                    className="h-10 px-4 bg-gray-700 hover:bg-gray-900 text-white text-sm font-medium rounded shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
                  >
                    <Sparkles className="w-4 h-4" /> Orden Especial
                  </button>
                </div>
              </div>
            </div>

            {/* Aviso compacto: solo aparece cuando la orden especial se
                registró primero y todavía no se ha buscado nada más — en
                cuanto se hace una búsqueda (antes o después), esto se
                reemplaza por la tabla de resultados con la misma fila
                dentro (ver handleRegistrarOrdenEspecial/handleSearch). */}
            {!hasSearched && searchResults.length > 0 && (
              <div className="w-full max-w-6xl mx-auto px-4 mb-8 flex items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 rounded-lg py-3">
                <span className="text-sm text-emerald-800">
                  {searchResults.length === 1 ? '1 producto agregado al pedido.' : `${searchResults.length} productos agregados al pedido.`}
                  {' '}Puedes seguir buscando para agregar más, o continuar.
                </span>
                <button
                  onClick={handleContinuarConEspecial}
                  className="shrink-0 bg-[#3ab0e2] hover:bg-sky-500 text-white px-6 py-2 rounded shadow-sm text-sm font-medium transition-colors cursor-pointer"
                >
                  Continuar
                </button>
              </div>
            )}

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

        {viewStep === 'specialOrder' && (
          <div className="w-full max-w-2xl mx-auto mb-20">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Orden especial</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Crea un producto especial para este pedido — se registra automáticamente en el almacén "Pedido especial".
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Nombre del producto</label>
                  <input
                    type="text"
                    value={especialForm.productName}
                    onChange={(e) => setEspecialForm((prev) => ({ ...prev, productName: e.target.value }))}
                    placeholder="Ej. Mueble a medida"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#3ab0e2] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Descripción</label>
                  <textarea
                    value={especialForm.description}
                    onChange={(e) => setEspecialForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Detalles del pedido especial"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#3ab0e2] text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Precio de venta</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={especialForm.salePrice}
                      onChange={(e) => setEspecialForm((prev) => ({ ...prev, salePrice: e.target.value }))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#3ab0e2] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Unidad</label>
                    {/* Mismo patrón que categoría/unidad en ProductModal: input
                        con datalist — elige una unidad ya guardada o escribe una
                        nueva, que se crea al registrar la orden especial. */}
                    <input
                      type="text"
                      list="ordenEspecialUnitsList"
                      value={especialForm.unidad}
                      onChange={(e) => setEspecialForm((prev) => ({ ...prev, unidad: e.target.value }))}
                      placeholder="Escribe o elige una unidad"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#3ab0e2] text-sm"
                    />
                    <datalist id="ordenEspecialUnitsList">
                      {productUnits.map((u) => (
                        <option key={u.produnitID} value={u.produnitName} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      step="1"
                      value={especialForm.quantity}
                      onChange={(e) => setEspecialForm((prev) => ({ ...prev, quantity: e.target.value }))}
                      placeholder="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#3ab0e2] text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setViewStep('search')}
                  className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegistrarOrdenEspecial}
                  disabled={savingSpecialOrder}
                  className="bg-[#3ab0e2] hover:bg-sky-500 text-white px-8 py-2 rounded shadow-sm text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingSpecialOrder ? 'Registrando...' : 'Continuar'}
                </button>
              </div>
            </div>
          </div>
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

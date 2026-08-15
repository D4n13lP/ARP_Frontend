import { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { getClients } from '../api/clients';
import { getTransDiscounts } from '../api/transDiscounts';
import { getDestAccounts } from '../api/destAccounts';
import { getCouriers } from '../api/couriers';
import { getClientProductDiscounts } from '../api/clientProductDiscounts';
import { getErrorMessage } from '../utils/errorMessage';
import type { Client, ClientProductDiscount, Courier, DestAccount, TransDiscount } from '../types';

export interface CartItem {
  id: string; // inventoryID (ver ProductSearchTable) — de ahí sale de qué almacén se descuenta
  prodCode: string; // para cruzar contra el descuento cliente+producto (ClientsDiscountPage)
  nombre: string;
  cantidad: number;
  precio: number;
  promocion: number; // Porcentaje, ej: 10 para 10%
  unidad: string; // productUnit.produnitName registrada en el producto
}

// Lo que junta este componente para que la vista padre registre la venta/pedido.
export interface SaleSummaryData {
  cartItems: (CartItem & { suma: number; sumaFinal: number })[];
  // "Cliente no registrado" -> la transacción queda SIN cliente asociado
  // (null), no se crea ningún registro nuevo en "client". clientName va solo
  // para mostrarlo en pantalla (p. ej. OrderReview) — al backend solo se le
  // manda el clientCode.
  cliente: { clientCode: string; clientName: string } | null;
  // Datos capturados en "Cliente no registrado" cuando sí se decide crear el
  // registro (o se rechaza pero de todos modos se guardan, con "(No
  // registrado)" en el nombre) — ver el modal de confirmación más abajo.
  // Va directo al "newClient" que ya soporta createSale/createOrder.
  newClienteData: { clientName: string; clientPhone1?: string; RFC?: string } | null;
  itemsDiscountPercent: number | null; // si hay descuento tipo1/tipo2 aplicado, reemplaza el de cada producto
  transDiscountID: string | null;
  pago: { paymentMethod: string; destAccountClabe: string | null };
  entrega: {
    enTienda: boolean;
    address: string | null;
    inmediata: boolean;
    dispatchDateI: string | null;
    dispatchDateF: string | null;
    courierID: string | null;
    courierName: string | null; // solo para mostrar (OrderReview)
  };
  shippingCost: number;
  totales: { base: number; conDescuento: number; final: number };
}

interface SaleSummaryProps {
  cartItems: CartItem[];
  onNext: (data: SaleSummaryData) => void;
  // Controlado por la vista padre mientras espera la respuesta real del
  // registro (createSale) — SaleSummary no sabe si esa llamada ya terminó.
  submitting?: boolean;
  variant?: 'sale' | 'order';
}

type SelectOption = string | { label: string; value: string };

// Componente para los dropdowns personalizados (como en la imagen: botón verde + menú gris)
export function CustomSelect({ label, options, value, onChange, disabled = false }: { label: string, options: SelectOption[], value: string, onChange: (v: string) => void, disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const normalized = options.map((opt) => (typeof opt === 'string' ? { label: opt, value: opt } : opt));
  const selectedLabel = normalized.find((opt) => opt.value === value)?.label;

  return (
    <div className="relative w-56">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full py-2 px-4 rounded-md flex justify-between items-center text-sm font-medium transition-colors ${
          disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-[#1b9a82] hover:bg-[#157f6b] text-white'
        }`}
      >
        <span>{selectedLabel || label}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-[#a3abc0] rounded-md shadow-lg p-2 z-10 animate-fade-in text-sm">
          {normalized.length === 0 ? (
            <p className="text-white text-center py-1.5 px-3">Sin opciones</p>
          ) : normalized.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-1.5 px-3 rounded-md mb-1.5 last:mb-0 text-center transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SaleSummary({ cartItems, onNext, submitting = false, variant = 'sale' }: SaleSummaryProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // ---------- ESTADOS PASO 1 ----------
  const [clienteNoRegistrado, setClienteNoRegistrado] = useState(false);
  const [idCliente, setIdCliente] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  // Ventana con los resultados de la búsqueda de cliente (lista + checkbox
  // para elegir uno solo). null = cerrada.
  const [clientModal, setClientModal] = useState<{ results: Client[]; pickedCode: string | null } | null>(null);
  const [aplicarDescuento, setAplicarDescuento] = useState(false);
  const [tipoDescuento, setTipoDescuento] = useState(''); // transDiscountID
  // Confirmación "¿Desea registrar al cliente?" — aparece al continuar si
  // "Cliente no registrado" está marcado y sí se escribió un nombre.
  const [showClienteConfirm, setShowClienteConfirm] = useState(false);
  // Descuentos cliente+producto del cliente elegido (ClientsDiscountPage) —
  // se aplican solo por si acaso aquí en pantalla, para que el total que ve
  // el cajero antes de confirmar ya coincida con lo que processTransaction
  // va a cobrar de verdad en el servidor (que es quien realmente lo exige).
  const [clientProductDiscounts, setClientProductDiscounts] = useState<ClientProductDiscount[]>([]);

  // ---------- ESTADOS PASO 2 ----------
  const [formaPago, setFormaPago] = useState(''); // 'cash' | 'digital'
  const [cuentaDestino, setCuentaDestino] = useState(''); // clabe
  const [telefono, setTelefono] = useState('');
  const [rfc, setRfc] = useState('');

  const [seEntregaEnTienda, setSeEntregaEnTienda] = useState(false);
  const [linea1, setLinea1] = useState('');
  const [linea2, setLinea2] = useState('');
  const [linea3, setLinea3] = useState('');

  const [entregaInmediata, setEntregaInmediata] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [repartidor, setRepartidor] = useState(''); // courierID
  const [costoEnvio, setCostoEnvio] = useState('');

  // ---------- CATÁLOGOS REALES (se cargan una vez) ----------
  const [clientes, setClientes] = useState<Client[]>([]);
  const [transDiscounts, setTransDiscounts] = useState<TransDiscount[]>([]);
  const [destAccounts, setDestAccounts] = useState<DestAccount[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);

  useEffect(() => {
    getClients().then(setClientes).catch(() => {});
    getTransDiscounts().then(setTransDiscounts).catch(() => {});
    getDestAccounts().then(setDestAccounts).catch(() => {});
    getCouriers().then(setCouriers).catch(() => {});
  }, []);

  // Al elegir un cliente (modal de resultados de búsqueda), se rellenan los
  // 3 campos de referencia (nombre/teléfono/RFC) con sus datos reales — antes
  // quedaban vacíos porque nada los llenaba al aceptar la selección.
  useEffect(() => {
    if (selectedClient) {
      setNombreCliente(selectedClient.clientName);
      setTelefono(selectedClient.clientPhone1 || '');
      setRfc(selectedClient.RFC || '');
    }
  }, [selectedClient]);

  // Descuentos cliente+producto del cliente elegido — se piden de nuevo cada
  // vez que cambia (o se limpian si se quita la selección).
  useEffect(() => {
    if (!selectedClient) {
      setClientProductDiscounts([]);
      return;
    }
    getClientProductDiscounts(selectedClient.clientCode)
      .then(setClientProductDiscounts)
      .catch(() => setClientProductDiscounts([]));
  }, [selectedClient]);

  const formasPagoOptions = [
    { label: 'Efectivo', value: 'cash' },
    { label: 'Transferencia / tarjeta', value: 'digital' },
  ];
  const cuentasDestinoOptions = destAccounts.map((acc) => ({
    label: `${acc.accountAlias || acc.bank || 'Cuenta'} · ${acc.clabe}`,
    value: acc.clabe,
  }));
  const repartidoresOptions = couriers.map((c) => ({ label: c.courierName, value: c.courierID }));
  const tiposDescuentoOptions = transDiscounts.map((d) => ({
    label: `Descuento tipo ${d.type === 't1' ? '1' : '2'} (${(Number(d.percent) * 100).toFixed(0)}%)`,
    value: d.transDiscountID,
  }));

  // Búsqueda real de cliente por ID (clientCode) o nombre (Paso 1) — abre una
  // ventana con TODOS los resultados; ahí se elige uno con un checkbox.
  const handleSearchCliente = async () => {
    if (clienteNoRegistrado || (!idCliente.trim() && !nombreCliente.trim())) return;
    setBuscandoCliente(true);
    try {
      const lista = clientes.length > 0 ? clientes : await getClients().then((data) => { setClientes(data); return data; });
      const idBusqueda = idCliente.trim().toLowerCase();
      const nombreBusqueda = nombreCliente.trim().toLowerCase();
      const encontrados = lista.filter((c) =>
        (idBusqueda && (c.clientCode.toLowerCase() === idBusqueda || c.clientCode.toLowerCase().includes(idBusqueda)))
        || (nombreBusqueda && c.clientName.toLowerCase().includes(nombreBusqueda))
      );
      setClientModal({ results: encontrados, pickedCode: selectedClient?.clientCode ?? null });
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo buscar el cliente.'));
    } finally {
      setBuscandoCliente(false);
    }
  };

  // Cálculos
  const selectedDiscount = transDiscounts.find((d) => d.transDiscountID === tipoDescuento);
  const itemsDiscountPercent = (aplicarDescuento && selectedDiscount) ? Number(selectedDiscount.percent) * 100 : null;

  const rows = useMemo(() => {
    return cartItems.map(item => {
      // El descuento cliente+producto (ClientsDiscountPage) gana sobre
      // cualquier otro — mismo orden de prioridad que aplica
      // processTransaction en el servidor (ver transaction.controller.ts),
      // así el total que se ve aquí ya coincide con lo que se va a cobrar.
      const clientOverride = clientProductDiscounts.find((d) => d.prodCode === item.prodCode);
      const efectivoPromocion = clientOverride
        ? Number(clientOverride.discountPercentage) * 100
        : (itemsDiscountPercent ?? item.promocion);
      const suma = item.precio * item.cantidad;
      const montoDescuento = suma * (efectivoPromocion / 100);
      const sumaFinal = suma - montoDescuento;
      return { ...item, promocion: efectivoPromocion, suma, sumaFinal };
    });
  }, [cartItems, itemsDiscountPercent, clientProductDiscounts]);

  const totalFinal = useMemo(() => {
    return rows.reduce((acc, current) => acc + current.sumaFinal, 0);
  }, [rows]);

  // Con el nuevo cálculo por fila, totalFinal YA refleja el descuento tipo1/2
  // cuando está activo (reemplaza al de cada producto, no se suman ambos).
  const totalConDescuento = totalFinal;

  const costoEnvioNum = parseFloat(costoEnvio) || 0;
  const totalConEnvio = totalConDescuento + costoEnvioNum;

  // Acciones
  const handleSiguiente = () => {
    // "Cliente no registrado" siempre puede avanzar: la transacción queda sin
    // cliente asociado. Si no está marcado, hace falta haber elegido uno.
    if (!clienteNoRegistrado && !selectedClient) {
      alert('Busca y selecciona un cliente, o marca "Cliente no registrado".');
      return;
    }
    setStep(2);
  };

  // Arma y manda los datos finales — separado de handleRegisterSale porque
  // cuando hay que preguntar "¿Desea registrar al cliente?" esto se dispara
  // después, ya con la decisión tomada (ver handleConfirmCliente).
  const enviarRegistro = (newClienteData: SaleSummaryData['newClienteData']) => {
    onNext({
      cartItems: rows,
      // "Cliente no registrado" -> sin cliente YA EXISTENTE asociado
      // (newClienteData es lo que sí se guarda cuando se escribió un nombre).
      cliente: (!clienteNoRegistrado && selectedClient)
        ? { clientCode: selectedClient.clientCode, clientName: selectedClient.clientName }
        : null,
      newClienteData,
      itemsDiscountPercent,
      transDiscountID: (aplicarDescuento && tipoDescuento) || null,
      pago: { paymentMethod: formaPago, destAccountClabe: formaPago === 'digital' ? cuentaDestino : null },
      entrega: {
        enTienda: seEntregaEnTienda,
        address: seEntregaEnTienda ? null : [linea1, linea2, linea3].filter((l) => l.trim()).join(', ') || null,
        inmediata: entregaInmediata,
        dispatchDateI: entregaInmediata ? null : (fechaInicio || null),
        dispatchDateF: entregaInmediata ? null : (fechaFin || null),
        courierID: repartidor || null,
        courierName: couriers.find((c) => c.courierID === repartidor)?.courierName || null,
      },
      shippingCost: costoEnvioNum,
      totales: { base: totalFinal, conDescuento: totalConDescuento, final: totalConEnvio },
    });
  };

  const handleRegisterSale = () => {
    // El pago solo se decide aquí para variant="sale" — en un pedido
    // (variant="order") el pago/anticipo se captura después, en OrderReview.
    if (variant === 'sale') {
      if (!formaPago) {
        alert('Selecciona una forma de pago.');
        return;
      }
      if (formaPago === 'digital' && !cuentaDestino) {
        alert('Selecciona la cuenta destino del pago.');
        return;
      }
    }
    // Si se marcó "Cliente no registrado" y sí se escribió un nombre, antes
    // de continuar se pregunta si se quiere dar de alta como cliente real.
    if (clienteNoRegistrado && nombreCliente.trim()) {
      setShowClienteConfirm(true);
      return;
    }
    enviarRegistro(null);
  };

  // "Aceptar" -> se crea el cliente con los datos escritos. "Rechazar" -> no
  // se crea ningún cliente; la transacción queda sin cliente asociado, igual
  // que si nunca se hubiera escrito nada (los datos escritos se descartan).
  const handleConfirmCliente = (registrar: boolean) => {
    setShowClienteConfirm(false);
    if (!registrar) {
      enviarRegistro(null);
      return;
    }
    enviarRegistro({
      clientName: nombreCliente.trim(),
      clientPhone1: telefono.trim() || undefined,
      RFC: rfc.trim() || undefined,
    });
  };

  // Función comodín para formatear moneda
  const formatMoney = (val: number) => `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="w-full mt-8 animate-fade-in">
      {/* Título y Fecha/Hora (Simulada) */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-[#3ab0e2] w-8 h-8" />
          <h3 className="font-bold text-gray-800 text-lg">Productos en el carrito</h3>
        </div>
        <div className="font-bold text-gray-800 lg:mr-32">
          {new Date().toLocaleDateString('es-ES', {month: '2-digit', day: '2-digit', year: 'numeric'})} - {new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
        </div>
      </div>

      {/* Tabla del carrito */}
      <div className="overflow-x-auto border border-gray-300 rounded mb-10">
        <table className="w-full text-sm text-center bg-white">
          <thead className="bg-[#f2f2f2] text-gray-800 border-b border-gray-300">
            <tr>
              <th className="py-3 px-4 font-bold border-r border-gray-300 w-1/3 text-left">PRODUCTO</th>
              <th className="py-3 px-4 font-bold border-r border-gray-300">CANTIDAD</th>
              <th className="py-3 px-4 font-bold border-r border-gray-300">UNIDAD</th>
              <th className="py-3 px-4 font-bold border-r border-gray-300">PRECIO UNIDAD</th>
              <th className="py-3 px-4 font-bold border-r border-gray-300">SUMA</th>
              <th className="py-3 px-4 font-bold border-r border-gray-300">PROMOCIÓN</th>
              <th className="py-3 px-4 font-bold">SUMA FINAL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-gray-200 last:border-b-0">
                <td className="py-3 px-4 border-r border-gray-200 text-left">{row.nombre}</td>
                <td className="py-3 px-4 border-r border-gray-200">{row.cantidad}</td>
                <td className="py-3 px-4 border-r border-gray-200">{row.unidad || '—'}</td>
                <td className="py-3 px-4 border-r border-gray-200">${row.precio.toFixed(2)}</td>
                <td className="py-3 px-4 border-r border-gray-200">${row.suma.toFixed(2)}</td>
                <td className="py-3 px-4 border-r border-gray-200">
                  {row.promocion > 0 ? `${row.promocion}%` : '%='}
                </td>
                <td className="py-3 px-4 font-medium">${row.sumaFinal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {step === 1 ? (
        /* ==================== PASO 1 (CONTROLES ORIGINALES) ==================== */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mb-12 animate-fade-in">
          {/* Columna Izquierda: Cliente */}
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-800">Cliente no registrado</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-sky-500 cursor-pointer"
                checked={clienteNoRegistrado}
                onChange={(e) => {
                  setClienteNoRegistrado(e.target.checked);
                  setSelectedClient(null);
                }}
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-800 w-16">ID Cliente</span>
              <div className={`flex flex-1 h-8 border ${clienteNoRegistrado ? 'bg-gray-100 border-gray-200' : 'border-gray-400'} rounded overflow-hidden`}>
                <input
                  type="text"
                  disabled={clienteNoRegistrado}
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  placeholder="Buscar por ID o nombre del cliente"
                  className="px-2 w-full text-xs outline-none bg-transparent"
                />
                <button
                  disabled={clienteNoRegistrado || buscandoCliente}
                  onClick={handleSearchCliente}
                  className={`${clienteNoRegistrado ? 'bg-gray-300' : 'bg-[#3ab0e2] hover:bg-sky-500'} px-2 transition-colors disabled:opacity-60`}
                >
                  <Search className="text-white w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-16"></span>
              <div className={`flex w-48 h-8 border ${clienteNoRegistrado ? 'bg-gray-100 border-gray-200' : 'border-gray-400'} rounded overflow-hidden`}>
                <input
                  type="text"
                  disabled={clienteNoRegistrado}
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="px-2 w-full text-xs outline-none bg-transparent"
                />
                 <button
                  disabled={clienteNoRegistrado || buscandoCliente}
                  onClick={handleSearchCliente}
                  className={`${clienteNoRegistrado ? 'text-gray-400' : 'text-gray-500 hover:text-sky-500'} px-2 transition-colors disabled:opacity-60`}
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 transition-opacity duration-300 h-6 flex items-center">
                 {buscandoCliente && <span className="text-xs text-gray-500">Buscando...</span>}
                 {selectedClient && !clienteNoRegistrado && (
                   <span className="text-xs font-bold text-gray-900">Cliente encontrado: {selectedClient.clientName}</span>
                 )}
              </div>
            </div>
          </div>

          {/* Columna Centro: Descuentos */}
          <div className="flex flex-col gap-6 items-center text-sm">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-800">Aplicar descuento</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-sky-500 cursor-pointer"
                checked={aplicarDescuento}
                onChange={(e) => setAplicarDescuento(e.target.checked)}
              />
            </div>

            <select 
              disabled={!aplicarDescuento}
              value={tipoDescuento}
              onChange={(e) => setTipoDescuento(e.target.value)}
              className={`border rounded p-1.5 px-3 outline-none min-w-[200px] text-gray-700 
                ${!aplicarDescuento ? 'bg-gray-100 border-gray-200 text-gray-400' : 'border-gray-400 focus:border-sky-500'}`}
            >
              <option value="">Selecciona descuento</option>
              {tiposDescuentoOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Columna Derecha: Total y Botón Siguiente */}
          <div className="flex flex-col items-center gap-8 text-sm pt-2">
            <div className="flex items-center gap-4">
              <span className="font-bold text-gray-800 text-base">TOTAL</span>
              <span className="font-bold text-gray-900 text-xl">{formatMoney(totalFinal)}</span>
            </div>
            
            <button 
              onClick={handleSiguiente}
              className="bg-[#3ab0e2] hover:bg-sky-500 text-white font-medium py-1.5 px-6 rounded shadow-sm w-32 transition-colors ml-auto"
            >
              Siguiente
            </button>
          </div>
        </div>

      ) : (

        /* ==================== PASO 2 (FORMULARIO PAGO Y ENVÍO) ==================== */
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 text-sm animate-fade-in mb-16">
          
          {/* ---- COLUMNA 1: PAGO Y DATOS CLIENTE (Aprox 4.5 columnas) ---- */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
            
            {/* Headers de Formas de Pago (sólo en Venta) */}
            {variant === 'sale' && (
              <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-gray-900">Selecciona la forma de pago</span>
                  <CustomSelect
                    label="Selecciona forma de pago"
                    options={formasPagoOptions}
                    value={formaPago}
                    onChange={setFormaPago}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-gray-900">Cuenta destino</span>
                  <CustomSelect
                    label="Seleccionar cuenta"
                    options={cuentasDestinoOptions}
                    value={formaPago === 'cash' ? '' : cuentaDestino}
                    onChange={setCuentaDestino}
                    disabled={formaPago !== 'digital'}
                  />
                </div>
              </div>
            )}

            {/* Datos de contacto */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-3">
                <span className="font-bold w-16">Nombre</span>
                <input
                  type="text"
                  disabled={!clienteNoRegistrado}
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Nombre del cliente"
                  className={`border rounded-full h-8 px-4 flex-1 ${!clienteNoRegistrado ? 'bg-white text-gray-500 border-gray-300' : 'bg-white border-gray-400 focus:outline-none focus:border-sky-500'}`}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold w-16">Teléfono</span>
                <input
                  type="text"
                  disabled={!clienteNoRegistrado}
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Número de teléfono del cliente"
                  className={`border rounded-full h-8 px-4 flex-1 ${!clienteNoRegistrado ? 'bg-white text-gray-500 border-gray-300' : 'bg-white border-gray-400 focus:outline-none focus:border-sky-500'}`}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold w-16">RFC</span>
                <input
                  type="text"
                  disabled={!clienteNoRegistrado}
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value)}
                  placeholder="Ingrese el RFC del cliente"
                  className={`border rounded-full h-8 px-4 flex-1 ${!clienteNoRegistrado ? 'bg-white text-gray-500 border-gray-300' : 'bg-white border-gray-400 focus:outline-none focus:border-sky-500'}`}
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-3">
                <span className="font-bold">Se entrega en tienda</span>
                <input 
                  type="checkbox"
                  checked={seEntregaEnTienda}
                  onChange={(e) => setSeEntregaEnTienda(e.target.checked)}
                  className="w-4 h-4 accent-sky-500 cursor-pointer border-gray-300 rounded" 
                />
              </div>
              
              <span className="font-bold">Dirección de entrega</span>
              
              <div className="flex items-center gap-3">
                <span className="font-bold w-14">Linea 1</span>
                <input
                  type="text"
                  disabled={seEntregaEnTienda}
                  value={linea1}
                  onChange={(e) => setLinea1(e.target.value)}
                  placeholder="Calle, Número, Colonia, Código Postal"
                  className={`border rounded-full h-8 px-4 flex-1 text-center ${seEntregaEnTienda ? 'bg-white border-gray-300 text-gray-400' : 'bg-white border-gray-400 focus:outline-none focus:border-sky-500'}`}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold w-14">Linea 2</span>
                <input
                  type="text"
                  disabled={seEntregaEnTienda}
                  value={linea2}
                  onChange={(e) => setLinea2(e.target.value)}
                  placeholder="Municipio, Estado"
                  className={`border rounded-full h-8 px-4 flex-1 text-center ${seEntregaEnTienda ? 'bg-white border-gray-300 text-gray-400' : 'bg-white border-gray-400 focus:outline-none focus:border-sky-500'}`}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold w-14">Linea 3</span>
                <input
                  type="text"
                  disabled={seEntregaEnTienda}
                  value={linea3}
                  onChange={(e) => setLinea3(e.target.value)}
                  placeholder="Referencias"
                  className={`border rounded-full h-8 px-4 flex-1 text-center ${seEntregaEnTienda ? 'bg-white border-gray-300 text-gray-400' : 'bg-white border-gray-400 focus:outline-none focus:border-sky-500'}`}
                />
              </div>
            </div>
          </div>

          {/* ---- COLUMNA 2: FECHAS Y REPARTIDOR (Aprox 4.5 columnas) ---- */}
          <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 pt-1">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-900">Entrega inmediata</span>
              <input 
                type="checkbox"
                checked={entregaInmediata}
                onChange={(e) => setEntregaInmediata(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-sky-500 cursor-pointer" 
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold whitespace-nowrap">Fecha de entrega a partir de</span>
              <input 
                type="date" 
                disabled={entregaInmediata}
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={`border rounded-full h-8 px-3 text-xs w-[130px] flex-shrink-0 ${entregaInmediata ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-white border-gray-400 focus:outline-none focus:border-sky-500'}`}
              />
              <span className="font-bold">hasta</span>
              <input 
                type="date" 
                disabled={entregaInmediata}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={`border rounded-full h-8 px-3 text-xs w-[130px] flex-shrink-0 ${entregaInmediata ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-white border-gray-400 focus:outline-none focus:border-sky-500'}`}
              />
            </div>

            {/* Mensaje de cliente encontrado (solo visual como en la imagen) */}
            <div className="mt-8 font-bold text-gray-900">
               {(!clienteNoRegistrado && selectedClient) ? `Cliente encontrado: ${selectedClient.clientName}` : ''}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <span className="font-bold text-gray-900">Repartidor</span>
              <CustomSelect
                label="Seleccionar repartidor"
                options={repartidoresOptions}
                value={repartidor}
                onChange={setRepartidor}
                disabled={seEntregaEnTienda}
              />
            </div>
          </div>

          {/* ---- COLUMNA 3: TOTALES Y REGISTRAR (Aprox 3 columnas) ---- */}
          <div className="col-span-1 lg:col-span-3 flex flex-col justify-end items-end gap-6 pb-2">
            
            <div className="flex flex-col items-end gap-5 w-full">
              <div className="flex gap-4">
                <span className="font-bold">TOTAL</span>
                <span className="font-bold">{formatMoney(totalFinal)}</span>
              </div>

              {/* Si hay algún descuento se puede indicar aquí de forma dinámica */}
              {aplicarDescuento && selectedDiscount && (
                <div className="flex gap-4">
                   <span className="font-bold">TOTAL + Descuento Tipo {selectedDiscount.type === 't1' ? '1' : '2'}:</span>
                   <span className="font-bold">{formatMoney(totalConDescuento)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 mt-10 w-full justify-between items-end">
              <div className="flex flex-col gap-2">
                 <span className="font-bold text-gray-900">Costo de envio</span>
                 <input 
                    type="number" 
                    placeholder="" 
                    value={costoEnvio}
                    onChange={(e) => setCostoEnvio(e.target.value)}
                    className="border border-gray-400 rounded-md h-8 w-24 px-2 focus:outline-none focus:border-sky-500" 
                 />
              </div>

              <button
                onClick={handleRegisterSale}
                disabled={submitting}
                className="bg-[#3ab0e2] hover:bg-sky-500 text-white py-1.5 px-6 rounded shadow-sm transition-colors mt-auto disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Registrando...' : (variant === 'sale' ? 'Registrar venta' : 'Siguiente')}
              </button>
            </div>

            <div className="flex gap-4 w-full mt-6 mb-2">
               <span className="font-bold">TOTAL + ENVIO:</span>
               <span className="font-bold">{formatMoney(totalConEnvio)}</span>
            </div>

          </div>

        </div>
      )}

      {/* Resultados de la búsqueda de cliente: lista con checkbox (uno solo) */}
      {clientModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900">Resultados de la búsqueda</h2>
            {clientModal.results.length === 0 ? (
              <p className="text-gray-500 text-sm">No se encontró ningún cliente con ese ID o nombre.</p>
            ) : (
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                {clientModal.results.map((c) => (
                  <label
                    key={c.clientCode}
                    className="flex items-center gap-3 text-sm py-2 px-2 rounded border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={clientModal.pickedCode === c.clientCode}
                      onChange={() => setClientModal({ ...clientModal, pickedCode: c.clientCode })}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                    <span className="text-gray-800">{c.clientName}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setClientModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const picked = clientModal.results.find((c) => c.clientCode === clientModal.pickedCode) ?? null;
                  setSelectedClient(picked);
                  setClientModal(null);
                }}
                disabled={!clientModal.pickedCode}
                className="bg-[#3ab0e2] hover:bg-sky-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "¿Desea registrar al cliente?" — aparece al continuar si "Cliente no
          registrado" está marcado y sí se escribió un nombre. Rechazar
          descarta esos datos: la transacción queda sin cliente asociado. */}
      {showClienteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 animate-fade-in text-center">
            <h2 className="text-lg font-semibold text-gray-900">¿Desea registrar al cliente?</h2>
            <p className="text-sm text-gray-500">
              {nombreCliente.trim()}
              {telefono.trim() && ` · ${telefono.trim()}`}
              {rfc.trim() && ` · ${rfc.trim()}`}
            </p>
            <div className="flex justify-center gap-3 mt-2">
              <button
                onClick={() => handleConfirmCliente(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded transition-colors cursor-pointer"
              >
                Rechazar
              </button>
              <button
                onClick={() => handleConfirmCliente(true)}
                className="bg-[#3ab0e2] hover:bg-sky-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
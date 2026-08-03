import { useState, useMemo } from 'react';
import { ShoppingCart, Search, ChevronDown, ChevronUp } from 'lucide-react';

export interface CartItem {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  promocion: number; // Porcentaje, ej: 10 para 10%
}

interface SaleSummaryProps {
  cartItems: CartItem[];
  onNext: (data: any) => void;
  variant?: 'sale' | 'order';
}

// Componente para los dropdowns personalizados (como en la imagen: botón verde + menú gris)
export function CustomSelect({ label, options, value, onChange, disabled = false }: { label: string, options: string[], value: string, onChange: (v: string) => void, disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

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
        <span>{value || label}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-[#a3abc0] rounded-md shadow-lg p-2 z-10 animate-fade-in text-sm">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-1.5 px-3 rounded-md mb-1.5 last:mb-0 text-center transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SaleSummary({ cartItems, onNext, variant = 'sale' }: SaleSummaryProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // ---------- ESTADOS PASO 1 ----------
  const [clienteNoRegistrado, setClienteNoRegistrado] = useState(false);
  const [idCliente, setIdCliente] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [aplicarDescuento, setAplicarDescuento] = useState(false);
  const [tipoDescuento, setTipoDescuento] = useState('');

  // ---------- ESTADOS PASO 2 ----------
  const [formaPago, setFormaPago] = useState('');
  const [cuentaDestino, setCuentaDestino] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rfc, setRfc] = useState('');
  
  const [seEntregaEnTienda, setSeEntregaEnTienda] = useState(false);
  const [linea1, setLinea1] = useState('');
  const [linea2, setLinea2] = useState('');
  const [linea3, setLinea3] = useState('');

  const [entregaInmediata, setEntregaInmediata] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  const [repartidor, setRepartidor] = useState('');
  const [costoEnvio, setCostoEnvio] = useState('');

  // ---------- DATOS MOCK PARA DROPDOWNS ----------
  const formasPagoMock = ['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia'];
  const cuentasDestinoMock = ['Cuenta destino 1', 'Cuenta destino 2'];
  const repartidoresMock = ['Repartidor 1', 'Repartidor 2', 'Repartidor 3'];

  // Simulación de búsqueda de cliente (Paso 1)
  const handleSearchCliente = () => {
    if ((idCliente.length > 0 || nombreCliente.length > 0) && !clienteNoRegistrado) {
      setClienteEncontrado(true);
    }
  };

  // Cálculos
  const rows = useMemo(() => {
    return cartItems.map(item => {
      const suma = item.precio * item.cantidad;
      const montoDescuento = suma * (item.promocion / 100);
      const sumaFinal = suma - montoDescuento;
      return { ...item, suma, sumaFinal };
    });
  }, [cartItems]);

  const totalFinal = useMemo(() => {
    return rows.reduce((acc, current) => acc + current.sumaFinal, 0);
  }, [rows]);

  const totalConDescuento = useMemo(() => {
    // Si hubiese lógica de descuento adicional (tipo 1, tipo 2), se aplicaría aquí. Para este ejemplo asumo el mismo:
    return totalFinal; 
  }, [totalFinal, aplicarDescuento, tipoDescuento]);

  const costoEnvioNum = parseFloat(costoEnvio) || 0;
  const totalConEnvio = totalConDescuento + costoEnvioNum;

  // Acciones
  const handleSiguiente = () => {
    setStep(2);
  };

  const handleRegisterSale = () => {
    onNext({
      cartItems: rows,
      cliente: clienteNoRegistrado ? null : { id: idCliente, nombre: nombreCliente, telefono, rfc },
      descuento: aplicarDescuento ? tipoDescuento : null,
      entrega: {
        enTienda: seEntregaEnTienda,
        direccion: seEntregaEnTienda ? null : { linea1, linea2, linea3 },
        inmediata: entregaInmediata,
        fechas: entregaInmediata ? null : { desde: fechaInicio, hasta: fechaFin },
        repartidor,
        costoEnvio: costoEnvioNum
      },
      pago: { formaPago, cuentaDestino: formaPago === 'Efectivo' ? '' : cuentaDestino },
      totales: { base: totalFinal, conDescuento: totalConDescuento, final: totalConEnvio }
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
                  setClienteEncontrado(false);
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
                  disabled={clienteNoRegistrado} 
                  onClick={handleSearchCliente}
                  className={`${clienteNoRegistrado ? 'bg-gray-300' : 'bg-[#3ab0e2] hover:bg-sky-500'} px-2 transition-colors`}
                >
                  <Search className="text-white w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-16"></span>
              <div className={`flex w-48 h-8 border ${clienteNoRegistrado ? 'bg-gray-100 border-gray-200' : 'border-gray-400'} rounded-full overflow-hidden px-1`}>
                <input
                  type="text"
                  disabled={clienteNoRegistrado}
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="px-2 w-full text-xs outline-none bg-transparent text-center"
                />
                 <button 
                  disabled={clienteNoRegistrado} 
                  onClick={handleSearchCliente}
                  className={`${clienteNoRegistrado ? 'text-gray-400' : 'text-gray-500 hover:text-sky-500'} pr-1 transition-colors`}
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 transition-opacity duration-300 h-6 flex items-center">
                 {clienteEncontrado && !clienteNoRegistrado && (
                   <span className="text-xs font-bold text-gray-900">Cliente encontrado</span>
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
              <option value="tipo1">Descuento tipo 1</option>
              <option value="tipo2">Descuento tipo 2</option>
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
                    options={formasPagoMock} 
                    value={formaPago} 
                    onChange={setFormaPago} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-gray-900">Cuenta destino</span>
                  <CustomSelect 
                    label="Seleccionar cuenta" 
                    options={cuentasDestinoMock} 
                    value={formaPago === 'Efectivo' ? '' : cuentaDestino} 
                    onChange={setCuentaDestino} 
                    disabled={formaPago === 'Efectivo'}
                  />
                </div>
              </div>
            )}

            {/* Datos de contacto */}
            <div className="flex flex-col gap-3 mt-4">
              <input
                type="text"
                disabled={!clienteNoRegistrado}
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                placeholder="Nombre del cliente"
                className={`border rounded-full h-8 px-4 w-64 ${!clienteNoRegistrado ? 'bg-white text-gray-500 border-gray-300' : 'bg-white border-gray-400 focus:outline-none focus:border-sky-500'}`}
              />
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
               {(!clienteNoRegistrado && clienteEncontrado) ? 'Cliente encontrado' : ''}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <span className="font-bold text-gray-900">Repartidor</span>
              <CustomSelect 
                label="Seleccionar repartidor" 
                options={repartidoresMock} 
                value={repartidor} 
                onChange={setRepartidor} 
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
              {aplicarDescuento && tipoDescuento && (
                <div className="flex gap-4">
                   <span className="font-bold">TOTAL + {tipoDescuento === 'tipo1' ? 'Descuento Tipo 1' : 'Descuento Tipo 2'}:</span>
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
                className="bg-[#3ab0e2] hover:bg-sky-500 text-white py-1.5 px-6 rounded shadow-sm transition-colors mt-auto"
              >
                {variant === 'sale' ? 'Registrar venta' : 'Siguiente'}
              </button>
            </div>

            <div className="flex gap-4 w-full mt-6 mb-2">
               <span className="font-bold">TOTAL + ENVIO:</span>
               <span className="font-bold">{formatMoney(totalConEnvio)}</span>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
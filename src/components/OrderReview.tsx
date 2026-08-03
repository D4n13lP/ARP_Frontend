import { useState } from 'react';
import { CustomSelect } from './SaleSummary';

interface OrderReviewProps {
  orderData: any;
  onRegister: () => void;
}

export default function OrderReview({ orderData, onRegister }: OrderReviewProps) {
  const [aplicarPagoParcial, setAplicarPagoParcial] = useState(false);
  const [anticipo, setAnticipo] = useState<string>('');
  const [formaPago, setFormaPago] = useState('');
  const [cuentaDestino, setCuentaDestino] = useState('');

  // Mocks para los select, similares a SaleSummary
  const formasPagoMock = ['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia'];
  const cuentasDestinoMock = ['Cuenta destino 1', 'Cuenta destino 2'];

  // Función para formato moneda
  const formatMoney = (val: number) => `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalFinal = orderData.totales?.final || 0;
  
  const anticipoNum = parseFloat(anticipo) || 0;
  const importePendiente = aplicarPagoParcial ? Math.max(0, totalFinal - anticipoNum) : totalFinal;

  return (
    <div className="w-full mt-10 animate-fade-in max-w-6xl mx-auto text-sm text-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Lado izquierdo: Resumen del Pedido */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2"><span className="font-bold w-32">Folio</span> <span>{'{Folio autogenerado}'}</span></div>
            <div className="flex gap-2"><span className="font-bold w-32">Fecha de orden:</span> <span>{new Date().toLocaleDateString('es-ES', { month: '2-digit', day: '2-digit', year: 'numeric'})}</span></div>
            <div className="flex gap-2"><span className="font-bold w-32">Fecha de entrega:</span> <span>{orderData.entrega?.inmediata ? 'Inmediata' : orderData.entrega?.fechas?.desde ? `${orderData.entrega.fechas.desde} hasta ${orderData.entrega.fechas.hasta}` : '-'}</span></div>
            <div className="flex gap-2"><span className="font-bold w-32">Cliente:</span> <span>{orderData.cliente ? orderData.cliente.nombre : 'Cliente no registrado'}</span></div>
            <div className="flex gap-2"><span className="font-bold w-32">Vendedor:</span> <span>{'{Nombre Vendedor}'}</span></div>
            <div className="flex gap-2"><span className="font-bold w-32">Repartidor:</span> <span>{orderData.entrega?.repartidor || '-'}</span></div>
            <div className="flex gap-2">
               <span className="font-bold w-32">Lugar de entrega:</span> 
               <span>
                 {orderData.entrega?.enTienda ? 'En tienda' : (
                   orderData.entrega?.direccion ? 
                     `${orderData.entrega.direccion.linea1}, ${orderData.entrega.direccion.linea2}` : '-'
                 )}
               </span>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="overflow-hidden border border-gray-300 rounded">
            <table className="w-full text-center text-xs">
              <thead className="bg-[#f2f2f2] border-b border-gray-300">
                <tr>
                  <th className="py-2.5 px-3 font-bold border-r border-gray-300 text-left">Productos(s)</th>
                  <th className="py-2.5 px-3 font-bold border-r border-gray-300">Cantidad</th>
                  <th className="py-2.5 px-3 font-bold border-r border-gray-300">Precio</th>
                  <th className="py-2.5 px-3 font-bold">Suma</th>
                </tr>
              </thead>
              <tbody>
                {orderData.cartItems && orderData.cartItems.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-200 last:border-0 bg-white">
                    <td className="py-2.5 px-3 border-r border-gray-200 text-left">{item.nombre}</td>
                    <td className="py-2.5 px-3 border-r border-gray-200">{item.cantidad}</td>
                    <td className="py-2.5 px-3 border-r border-gray-200">${item.precio.toFixed(2)}</td>
                    <td className="py-2.5 px-3">${item.suma.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-6 font-bold mt-2">
            <div className="flex gap-2">
              <span className="w-32">Total con envio:</span>
              <span>{formatMoney(totalFinal)}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-32">Forma de pago:</span>
              <span className="font-normal">{formaPago || '-'}</span>
            </div>
          </div>
        </div>

        {/* Lado derecho: Pagos y Confirmación */}
        <div className="flex flex-col pt-16 gap-8 text-sm">
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="font-bold">Aplicar pago parcial</span>
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 accent-sky-500 cursor-pointer"
                checked={aplicarPagoParcial}
                onChange={(e) => {
                  setAplicarPagoParcial(e.target.checked);
                  if (!e.target.checked) setAnticipo('');
                }}
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="font-medium w-48">Ingresa la cantidad de anticipo:</span>
              <input 
                type="number"
                disabled={!aplicarPagoParcial} 
                value={anticipo}
                onChange={(e) => setAnticipo(e.target.value)}
                className={`border h-8 px-2 w-32 rounded shadow-sm focus:outline-none focus:border-sky-500 ${!aplicarPagoParcial ? 'bg-gray-100 border-gray-200' : 'border-gray-400 bg-white'}`}
              />
            </div>

            <div className="flex items-center gap-4">
              <span className="font-medium w-48">Importe pendiente:</span>
              <span className="font-normal">{formatMoney(importePendiente)}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
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

          <div className="flex justify-end mt-12 w-full max-w-[36rem]">
            <button 
              onClick={() => {
                // Agregar lógica de registro
                onRegister();
              }}
              className="bg-[#3ab0e2] hover:bg-sky-500 text-white font-medium py-2 px-6 rounded shadow-sm transition-colors"
            >
              Registrar pedido
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
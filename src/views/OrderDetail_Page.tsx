import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { useAppStore } from '../stores/useAppStore';

interface Payment {
  importe: string;
  fecha: string;
}

export default function OrderDetail_Page() {
  const navigate = useNavigate();
  const user = useAppStore(state => state.user); // Usuario logueado (caja del dia si es efectivo)

  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([
    { importe: '$7,000.00', fecha: 'DD/MM/YYYY' },
    { importe: '', fecha: '' },
    { importe: '', fecha: '' }
  ]);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('Pendiente');

  // Cuentas mockeadas (serán traídas de DB idealmente)
  const availableAccounts = [
    { id: '1', alias: 'Negocio1' },
    { id: '2', alias: 'Negocio2' }
  ];

  const handleAddPayment = () => {
    if (!paymentAmount || !paymentMethod) {
      alert('Por favor ingresa un importe y selecciona la forma de pago');
      return;
    }

    if (paymentMethod !== 'Efectivo' && !destinationAccount) {
      alert('Por favor selecciona una cuenta destino');
      return;
    }

    const today = new Date().toLocaleDateString('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const newPayment: Payment = {
      importe: `$${parseFloat(paymentAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      fecha: today
    };

    // Replace the first empty slot or push
    const emptyIndex = paymentHistory.findIndex(p => !p.importe);
    if (emptyIndex !== -1) {
      const updatedHistory = [...paymentHistory];
      updatedHistory[emptyIndex] = newPayment;
      setPaymentHistory(updatedHistory);
    } else {
      setPaymentHistory([...paymentHistory, newPayment]);
    }

    if (paymentMethod === 'Efectivo') {
      alert(`Abonado a la caja del usuario: ${user.nombreUsuario}`);
    }

    setPaymentAmount('');
    setPaymentMethod('');
    setDestinationAccount('');
  };

  const handleSave = () => {
    // Al dar clic en guardar, enviar a la base de datos y regresar a la vista de Actualizar Pedido
    alert('Pedido actualizado exitosamente en la base de datos.');
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-7xl mb-8 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">
        {/* Back Button and Logo (Left) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-6">
          <img 
            src={logoEmpresa} 
            alt="Logo Empresa" 
            className="h-20 w-auto object-contain" 
          />
          <button 
            onClick={() => navigate(-1)} 
            className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-6 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
          >
            Atras
          </button>
        </div>
        
        {/* Title Centered with Icon */}
        <div className="flex items-center gap-4 text-[#e2694b]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Pedidos
          </h1>
          <Receipt size={45} strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="text-2xl font-medium text-gray-800 mb-10 text-center">
        Actualización de pedidos
      </h2>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-12 mt-4 px-4">
        
        {/* Left Column: Display Information */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Folio:</span>
            <span className="text-gray-600"></span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Fecha de orden:</span>
            <span className="text-gray-600"></span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Fecha de entrega:</span>
            <span className="text-gray-600"></span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Cliente:</span>
            <span className="text-gray-600"></span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Teléfono Cliente:</span>
            <span className="text-gray-600"></span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">RFC Cliente:</span>
            <span className="text-gray-600"></span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Vendedor:</span>
            <span className="text-gray-600"></span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Repartidor:</span>
            <span className="text-gray-600"></span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-2">
            <span className="text-gray-800 font-medium">Lugar de entrega:</span>
            <span className="text-gray-600"></span>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-4 mb-6">
            <span className="text-gray-800 font-medium">Estado del pago:</span>
            <span className="text-gray-600">Pendiente / Pagado</span>
          </div>

          <div className="w-full mb-6">
            <table className="w-full border-collapse text-sm text-center text-gray-700 border border-gray-300">
              <thead className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-300 text-xs">
                <tr>
                  <th className="px-3 py-3 border-r border-gray-300 align-middle text-left">Productos(s)</th>
                  <th className="px-3 py-3 border-r border-gray-300 align-middle">Cantidad</th>
                  <th className="px-3 py-3 border-r border-gray-300 align-middle">Precio</th>
                  <th className="px-3 py-3 align-middle">Suma</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-3 text-left border-r border-gray-200">Maceta grande moderna</td>
                  <td className="px-3 py-3 border-r border-gray-200">2</td>
                  <td className="px-3 py-3 border-r border-gray-200">$ 450.00</td>
                  <td className="px-3 py-3">$ 900.00</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-3 text-left border-r border-gray-200">Pegazulejo</td>
                  <td className="px-3 py-3 border-r border-gray-200">5</td>
                  <td className="px-3 py-3 border-r border-gray-200">$ 865.00</td>
                  <td className="px-3 py-3">$ 4,320.00</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-3 text-left border-r border-gray-200">Block</td>
                  <td className="px-3 py-3 border-r border-gray-200">1</td>
                  <td className="px-3 py-3 border-r border-gray-200">$ 3,200.00</td>
                  <td className="px-3 py-3">$ 3,200.00</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="px-3 py-3 text-left border-r border-gray-200">Talamsa C9</td>
                  <td className="px-3 py-3 border-r border-gray-200">1</td>
                  <td className="px-3 py-3 border-r border-gray-200">$ 5,500.00</td>
                  <td className="px-3 py-3">$ 5,500.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-center text-lg mt-2 text-gray-800">
            Importe total $ 13,920.00
          </div>
        </div>

        {/* Right Column: Update Forms */}
        <div className="flex-1 flex flex-col pl-0 lg:pl-10">
          <h3 className="text-gray-800 font-medium mb-4">Historial de pagos</h3>
          <div className="w-full mb-6">
            <table className="w-full border-collapse text-sm text-left text-gray-700 border border-gray-300">
              <thead className="bg-gray-100 text-gray-800 font-semibold border-b border-gray-300 text-xs">
                <tr>
                  <th className="px-4 py-3 border-r border-gray-300">Importe</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 h-10">
                    <td className="px-4 py-2 border-r border-gray-200">{payment.importe}</td>
                    <td className="px-4 py-2">{payment.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            <span className="text-gray-800">Anticipo: $7,000.00</span>
            <span className="text-gray-800">Pendiente: $ 6,920.00</span>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 font-bold text-sm">Selecciona la forma de pago</label>
              <select 
                title="Selecciona forma de pago"
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  if (e.target.value === 'Efectivo') {
                    setDestinationAccount(''); // Clear if efectivo
                  }
                }}
                className="w-full border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:border-[#3ab0e2] text-gray-700 bg-white"
              >
                <option value="">Selecciona forma de pago</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                <option value="Tarjeta de debito">Tarjeta de débito</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-gray-900 font-bold text-sm">Cuenta destino</label>
              <select 
                title="Seleccionar cuenta"
                value={destinationAccount}
                onChange={(e) => setDestinationAccount(e.target.value)}
                disabled={paymentMethod === 'Efectivo'}
                className="w-full border border-gray-300 rounded py-2 px-3 text-sm focus:outline-none focus:border-[#3ab0e2] text-gray-700 bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">Seleccionar cuenta</option>
                {availableAccounts.map(account => (
                  <option key={account.id} value={account.alias}>
                    {account.alias}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10 items-end">
            <div className="flex flex-col gap-2">
               <label className="text-gray-900 font-bold text-sm">Abonar importe al pedido</label>
            </div>
            <div className="flex flex-col items-end gap-3">
              <input 
                type="number"
                placeholder="Importe"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-32 border border-gray-400 rounded py-1.5 px-3 text-sm focus:outline-none focus:border-[#3ab0e2] text-gray-800"
              />
              <button 
                onClick={handleAddPayment}
                className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-6 py-2 rounded transition-colors text-sm cursor-pointer shadow-sm"
              >
                Abonar importe
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 pb-4">
             <div className="flex items-center gap-4">
               <label className="text-gray-800 text-sm">Estado de la entrega</label>
               <select 
                 title="Estado de la entrega"
                 value={deliveryStatus}
                 onChange={(e) => setDeliveryStatus(e.target.value)}
                 className="w-32 border border-gray-400 rounded py-1 px-3 text-sm focus:outline-none focus:border-[#3ab0e2] text-gray-800 bg-white"
               >
                 <option value="Pendiente">Pendiente</option>
                 <option value="Entregado">Entregado</option>
               </select>
             </div>
             
             <button 
                onClick={handleSave}
                className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded transition-colors text-sm cursor-pointer font-medium shadow-sm"
              >
                Guardar
              </button>
          </div>

        </div>
      </div>
    </div>
  );
}
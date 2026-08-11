import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { useAppStore } from '../stores/useAppStore';
import { getPaymentHistories } from '../api/paymentHistories';
import { getTotalCash, createWithdrawal } from '../api/totalCash';
import { getErrorMessage } from '../utils/errorMessage';

export default function Retiros_Page() {
  const navigate = useNavigate();
  const authUser = useAppStore((state) => state.authUser);

  const [cantidad, setCantidad] = useState('');
  const [saldoDisponible, setSaldoDisponible] = useState(0);
  const [loading, setLoading] = useState(true);
  const [retirando, setRetirando] = useState(false);
  const [error, setError] = useState('');

  // Saldo disponible en caja: es POR USUARIO, no una bolsa compartida entre
  // todos. Se acumula con el efectivo real recibido en las transacciones que
  // ESE usuario cobró (paymentHistory.collectedBy, paymentMethod 'cash') y se
  // le resta lo que ese mismo usuario ya haya retirado (totalCash.ownUserID).
  const cargarSaldo = async (userID: string) => {
    setLoading(true);
    try {
      const [pagos, retiros] = await Promise.all([getPaymentHistories(), getTotalCash()]);
      const totalRecibido = pagos
        .filter((p) => p.paymentMethod === 'cash' && p.collectedBy?.userID === userID)
        .reduce((sum, p) => sum + p.paymentAmount, 0);
      const totalRetirado = retiros
        .filter((r) => r.ownUserID === userID)
        .reduce((sum, r) => sum + r.withdrawalAmount, 0);
      setSaldoDisponible(totalRecibido - totalRetirado);
    } catch (err) {
      alert(getErrorMessage(err, 'No se pudo cargar el saldo de caja.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) cargarSaldo(authUser.userID);
  }, [authUser]);

  const handleRetirar = async () => {
    const amount = parseFloat(cantidad);

    if (isNaN(amount) || amount <= 0) {
      setError('Ingresa una cantidad válida mayor a 0');
      return;
    }

    if (amount > saldoDisponible) {
      setError('La cantidad a retirar supera el saldo disponible');
      return;
    }

    if (!authUser) {
      setError('No se encontró tu sesión, vuelve a iniciar sesión.');
      return;
    }

    setRetirando(true);
    try {
      await createWithdrawal({
        ownUserID: authUser.userID,
        adminUserID: authUser.userID,
        withdrawalAmount: amount,
        withdrawalDate: new Date().toISOString(),
      });
      // Se vuelve a calcular contra el servidor en vez de solo restar
      // localmente, por si se registró algo más mientras tanto.
      await cargarSaldo(authUser.userID);
      setCantidad('');
      setError('');
    } catch (err) {
      alert(getErrorMessage(err, 'No se pudo registrar el retiro.'));
    } finally {
      setRetirando(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-7xl mb-12 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">
        {/* Logo a la izquierda */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 max-lg:portrait:hidden">
          <img
            src={logoEmpresa}
            alt="LogoEmpresa"
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Título centrado */}
        <div className="flex items-center text-[#e2694b]">
          <h1 className="text-4xl font-bold tracking-tight">
            Retiro de efectivo
          </h1>
        </div>
      </div>

      <div className="w-full max-w-4xl relative flex flex-col items-center">

        {/* Botón regresar alineado a la izquierda del contenedor principal */}
        <div className="w-full mb-16 flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-800 hover:text-[#d0583b] transition-colors text-lg font-medium cursor-pointer"
          >
            regresar
          </button>
        </div>

        {/* Contenido centrado */}
        {loading ? (
          <p className="text-gray-500">Cargando saldo de caja...</p>
        ) : (
          <div className="flex flex-col items-center gap-12 w-full max-w-lg">
            <h2 className="text-2xl md:text-3xl text-gray-900 font-medium text-center">
              Saldo disponible en caja: $ {saldoDisponible.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
              <span className="text-gray-900 text-lg">Ingresa la cantidad a retirar</span>
              <div className="flex flex-col items-center gap-2">
                <input
                  type="number"
                  disabled={retirando}
                  value={cantidad}
                  onChange={(e) => {
                    setCantidad(e.target.value);
                    setError('');
                  }}
                  className={`border rounded px-2 py-1.5 w-32 focus:outline-none text-center text-lg disabled:opacity-60 ${
                    error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-[#e2694b]'
                  }`}
                />
                {error && <span className="text-red-500 text-sm font-medium">{error}</span>}
              </div>
            </div>

            <button
              onClick={handleRetirar}
              className="bg-[#e2694b] hover:bg-[#d0583b] text-white px-8 py-2 rounded-md font-bold text-lg shadow-sm transition-colors cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={saldoDisponible <= 0 || retirando}
            >
              {retirando ? 'Retirando...' : 'Retirar'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

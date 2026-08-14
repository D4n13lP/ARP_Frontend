import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { useAppStore } from '../stores/useAppStore';
import { getPaymentHistories } from '../api/paymentHistories';
import { getTotalCash, createWithdrawal } from '../api/totalCash';
import { getUsers } from '../api/users';
import { getErrorMessage } from '../utils/errorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import type { AuthUser } from '../types';

export default function Retiros_Page() {
  const navigate = useNavigate();
  const authUser = useAppStore((state) => state.authUser);
  const isAdmin = authUser?.userType === 'admin';

  const [cantidad, setCantidad] = useState('');
  const [saldoDisponible, setSaldoDisponible] = useState(0);
  const [loading, setLoading] = useState(true);
  const [retirando, setRetirando] = useState(false);
  const [error, setError] = useState('');

  // Solo se usa cuando isAdmin: lista de todos los usuarios del sistema para
  // que el administrador pueda elegir de quién cargar/retirar el saldo.
  const [usuarios, setUsuarios] = useState<AuthUser[]>([]);
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [selectedUserID, setSelectedUserID] = useState<string | null>(null);
  // Solo afecta la version movil (ver md:block mas abajo): colapsada por
  // defecto, se expande al tocar el encabezado o al escribir una busqueda.
  const [usuariosListaAbierta, setUsuariosListaAbierta] = useState(false);

  // Usuario objetivo: el elegido por el admin, o el propio usuario de la
  // sesión por defecto (y siempre para seller, que no tiene forma de cambiarlo).
  const targetUserID = selectedUserID ?? authUser?.userID ?? null;
  const targetUser = useMemo(
    () => usuarios.find((u) => u.userID === targetUserID) ?? (authUser?.userID === targetUserID ? authUser : null),
    [usuarios, targetUserID, authUser],
  );

  useEffect(() => {
    if (!isAdmin) return;
    getUsers()
      .then(setUsuarios)
      .catch((err) => alert(getErrorMessage(err, 'No se pudo cargar la lista de usuarios.')));
  }, [isAdmin]);

  const usuariosFiltrados = useMemo(() => {
    const q = busquedaUsuario.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) => u.userName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [usuarios, busquedaUsuario]);

  // En movil la lista viaja colapsada por defecto; se muestra al tocar el
  // encabezado o en cuanto hay texto de busqueda (para ver los resultados).
  // En tablet/escritorio esto no aplica: la lista siempre esta expandida.
  const usuariosListaVisible = usuariosListaAbierta || busquedaUsuario.trim().length > 0;

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
    if (targetUserID) cargarSaldo(targetUserID);
  }, [targetUserID]);

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

    if (!authUser || !targetUserID) {
      setError('No se encontró tu sesión, vuelve a iniciar sesión.');
      return;
    }

    setRetirando(true);
    try {
      await createWithdrawal({
        ownUserID: targetUserID,
        adminUserID: authUser.userID,
        withdrawalAmount: amount,
        // Instante real en UTC a propósito (igual que paymentDate/adjustmentDate
        // en el backend) — si algún día se muestra esta fecha en pantalla,
        // debe formatearse con formatDateTimeMX (utils/formatDate.ts), que ya
        // convierte a hora de México, no guardarla aquí como hora local.
        withdrawalDate: new Date().toISOString(),
      });
      // Se vuelve a calcular contra el servidor en vez de solo restar
      // localmente, por si se registró algo más mientras tanto.
      await cargarSaldo(targetUserID);
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

      <div className={`w-full relative flex flex-col items-center ${isAdmin ? 'max-w-5xl' : 'max-w-4xl'}`}>

        {/* Botón regresar alineado a la izquierda del contenedor principal */}
        <div className="w-full mb-16 flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-800 hover:text-[#d0583b] transition-colors text-lg font-medium cursor-pointer"
          >
            regresar
          </button>
        </div>

        {/* Contenido: el usuario seller conserva exactamente el mismo bloque
            de siempre (sin panel lateral, sin selector de usuario). Solo el
            admin ve la versión extendida con el panel de usuarios. */}
        {!isAdmin ? (
          loading ? (
            <LoadingSpinner label="Cargando saldo de caja..." />
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
          )
        ) : (
          <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
            {/* Panel lateral de usuarios (solo admin) */}
            <aside className="w-full lg:w-80 shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setUsuariosListaAbierta((prev) => !prev)}
                  className="w-full flex items-center justify-between mb-3 cursor-pointer md:cursor-default"
                >
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                    Usuarios del sistema
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform md:hidden ${usuariosListaVisible ? 'rotate-180' : ''}`}
                  />
                </button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={busquedaUsuario}
                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                    placeholder="Buscar por correo o usuario..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#e2694b]"
                  />
                </div>
              </div>

              <div className={`max-h-80 overflow-y-auto divide-y divide-gray-100 md:block ${usuariosListaVisible ? 'block' : 'hidden'}`}>
                {usuariosFiltrados.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6 px-4">
                    No se encontraron usuarios.
                  </p>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <label
                      key={u.userID}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={targetUserID === u.userID}
                        onChange={() => setSelectedUserID(u.userID)}
                        className="w-4 h-4 accent-[#e2694b] cursor-pointer shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{u.userName}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </aside>

            {/* Contenido de saldo/retiro */}
            <div className="w-full flex-1 flex flex-col items-center">
              {loading ? (
                <LoadingSpinner label="Cargando saldo de caja..." />
              ) : (
                <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
                  <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <span className="text-gray-700 text-base">
                      Usuario: <span className="font-semibold text-gray-900">{targetUser?.userName ?? '—'}</span>
                      {targetUserID === authUser?.userID && (
                        <span className="text-gray-500"> (Sesión actual)</span>
                      )}
                    </span>
                    <button
                      onClick={() => setSelectedUserID(null)}
                      disabled={targetUserID === authUser?.userID}
                      className="text-sm font-medium text-[#e2694b] hover:text-[#d0583b] underline decoration-dotted disabled:text-gray-300 disabled:no-underline disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Restaurar datos de la sesión activa
                    </button>
                  </div>

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
        )}

      </div>
    </div>
  );
}

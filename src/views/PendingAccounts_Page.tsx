import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { UserCheck } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getPendingUsers, allowUser, deleteUser } from '../api/users';
import { getErrorMessage } from '../utils/errorMessage';
import { useAppStore } from '../stores/useAppStore';
import { ROUTES } from '../routes';
import type { AuthUser } from '../types';

export default function PendingAccounts_Page() {
  const navigate = useNavigate();
  const authUser = useAppStore((state) => state.authUser);
  const isAdmin = authUser?.userType === 'admin';

  const [pending, setPending] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    getPendingUsers()
      .then(setPending)
      .catch((error) => alert(getErrorMessage(error, 'No se pudieron cargar las cuentas pendientes.')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  async function handleAccept(user: AuthUser) {
    setBusy(true);
    try {
      await allowUser(user.userID);
      setPending((prev) => prev.filter((u) => u.userID !== user.userID));
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo aprobar la cuenta.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmReject() {
    if (!rejectTarget) return;
    setBusy(true);
    try {
      await deleteUser(rejectTarget.userID);
      setPending((prev) => prev.filter((u) => u.userID !== rejectTarget.userID));
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo rechazar la cuenta.'));
    } finally {
      setBusy(false);
      setRejectTarget(null);
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">

      {/* Header */}
      <div className="w-full max-w-7xl mb-12 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-6">
          <img src={logoEmpresa} alt="Logo Empresa" className="h-20 w-auto object-contain" />
          <button
            onClick={() => navigate(ROUTES.ACCOUNT_SWITCH)}
            className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-6 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
          >
            Atras
          </button>
        </div>

        <div className="flex items-center gap-4 text-[#e2694b]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Cuentas pendientes
          </h1>
          <UserCheck size={45} strokeWidth={1.5} />
        </div>
      </div>

      <main className="w-full max-w-4xl flex flex-col mt-4">
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : pending.length === 0 ? (
          <p className="text-gray-500">No hay cuentas pendientes de aprobación.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Usuario</th>
                  <th className="text-left font-semibold px-4 py-3">Correo</th>
                  <th className="text-center font-semibold px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((u) => (
                  <tr key={u.userID} className="border-t border-gray-200">
                    <td className="px-4 py-3 text-gray-800 font-medium">{u.userName}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleAccept(u)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Aceptar
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setRejectTarget(u)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Confirmación de rechazo */}
      {rejectTarget && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900">Rechazar cuenta</h2>
            <p className="text-gray-600 text-sm">
              ¿Seguro que quieres rechazar a <span className="font-semibold">{rejectTarget.userName}</span>?
              Esto elimina la cuenta por completo — tendría que registrarse de nuevo si quiere intentarlo otra vez.
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                disabled={busy}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={busy}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
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

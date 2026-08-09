import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Trash2, UserCheck } from 'lucide-react';
import { getUsers, deleteUser, promoteUser, demoteUser } from '../api/users';
import { getModules } from '../api/modules';
import { getUserPermissions, updateUserPermission } from '../api/userPermissions';
import { getErrorMessage } from '../utils/errorMessage';
import { useAppStore } from '../stores/useAppStore';
import { ROUTES } from '../routes';
import type { AuthUser, Module, UserPermission } from '../types';

export default function OtherAccountSettings_Page() {
  const navigate = useNavigate();
  const authUser = useAppStore((state) => state.authUser);

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserID, setSelectedUserID] = useState<string | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<AuthUser | null>(null);
  const [busy, setBusy] = useState(false);

  const isAdmin = authUser?.userType === 'admin';

  async function loadAll() {
    try {
      const [usersRes, modulesRes, permissionsRes] = await Promise.all([
        getUsers(),
        getModules(),
        getUserPermissions(),
      ]);
      setUsers(usersRes);
      setModules(modulesRes);
      setPermissions(permissionsRes);
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudieron cargar las cuentas y permisos.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Solo admin puede ver esta pantalla — cualquier otro rol se manda al dashboard.
  if (!isAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  const selectedUser = users.find((u) => u.userID === selectedUserID) ?? null;
  const pendingCount = users.filter((u) => !u.isAllowed).length;

  function permissionFor(userID: string, moduleID: string) {
    return permissions.find((p) => p.userID === userID && p.moduleID === moduleID);
  }

  function userHasAllModules(userID: string, field: 'canView' | 'canEdit') {
    if (modules.length === 0) return false;
    return modules.every((m) => permissionFor(userID, m.moduleID)?.[field] === true);
  }

  async function refreshPermissions() {
    try {
      setPermissions(await getUserPermissions());
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudieron actualizar los permisos.'));
    }
  }

  async function handleToggleModuleView(userID: string, moduleID: string, next: boolean) {
    setBusy(true);
    try {
      await updateUserPermission(userID, moduleID, { canView: next });
      await refreshPermissions();
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo actualizar el permiso.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleBulk(userID: string, field: 'canView' | 'canEdit', next: boolean) {
    setBusy(true);
    try {
      await Promise.all(modules.map((m) => updateUserPermission(userID, m.moduleID, { [field]: next })));
      await refreshPermissions();
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo actualizar el permiso.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleAdmin(user: AuthUser, next: boolean) {
    setBusy(true);
    try {
      const updated = next ? await promoteUser(user.userID) : await demoteUser(user.userID);
      setUsers((prev) => prev.map((u) => (u.userID === updated.userID ? updated : u)));
      // Si lo degradaron y no tenía permisos individuales (p. ej. el primer admin),
      // el backend se los siembra en ese momento — los recargamos para reflejarlo.
      await refreshPermissions();
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo cambiar el tipo de cuenta.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmDelete() {
    if (!confirmDeleteUser) return;
    setBusy(true);
    try {
      await deleteUser(confirmDeleteUser.userID);
      setUsers((prev) => prev.filter((u) => u.userID !== confirmDeleteUser.userID));
      if (selectedUserID === confirmDeleteUser.userID) {
        setSelectedUserID(null);
      }
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo eliminar la cuenta.'));
    } finally {
      setBusy(false);
      setConfirmDeleteUser(null);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row animate-fade-in">

      {/* Vistas permitidas: per-módulo, para el usuario seleccionado */}
      <aside className="w-full md:w-64 shrink-0 bg-[#2A3542] text-white p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Vistas permitidas</h2>

        {!selectedUser ? (
          <p className="text-sm text-gray-400">Selecciona un usuario de la tabla para ver y editar sus vistas permitidas.</p>
        ) : (
          <>
            <p className="text-xs text-gray-400 -mt-2">
              Editando <span className="font-semibold text-white">{selectedUser.userName}</span>
              {selectedUser.userType === 'admin' && ' — es admin, tiene todo activado'}
            </p>
            <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-2">
              {modules.map((m) => {
                const checked = selectedUser.userType === 'admin'
                  ? true
                  : permissionFor(selectedUser.userID, m.moduleID)?.canView ?? false;
                return (
                  <label key={m.moduleID} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-white/10 cursor-pointer">
                    <span>{m.moduleName}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={busy || selectedUser.userType === 'admin'}
                      onChange={(e) => handleToggleModuleView(selectedUser.userID, m.moduleID, e.target.checked)}
                      className="h-4 w-4 accent-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </label>
                );
              })}
            </div>
          </>
        )}
      </aside>

      {/* Tabla de cuentas y permisos individuales */}
      <main className="flex-1 p-6 md:p-10">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
          <h1 className="text-2xl font-semibold text-[#e2694b]">Configurar cuentas</h1>

          <button
            type="button"
            disabled={pendingCount === 0}
            onClick={() => navigate(ROUTES.ACCOUNT_PENDING)}
            title={pendingCount === 0 ? 'No hay cuentas pendientes' : `${pendingCount} cuenta(s) esperando aprobación`}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              pendingCount === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-500/60 animate-pulse hover:bg-emerald-600'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Cuentas pendientes{pendingCount > 0 && ` (${pendingCount})`}
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6 max-w-2xl">
          Da click en un usuario para elegirlo y editar sus vistas permitidas. Los permisos son por persona:
          cambiar los de una cuenta no afecta a las demás, aunque compartan el mismo tipo de cuenta.
        </p>

        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">USUARIO</th>
                  <th className="text-center font-semibold px-4 py-3">PERMISO LECTURA</th>
                  <th className="text-center font-semibold px-4 py-3">PERMISO EDITAR</th>
                  <th className="text-center font-semibold px-4 py-3">Administrador</th>
                  {isAdmin && <th className="text-center font-semibold px-4 py-3">Eliminar</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const selected = u.userID === selectedUserID;
                  const isSelf = u.userID === authUser?.userID;
                  return (
                    <tr
                      key={u.userID}
                      onClick={() => setSelectedUserID(u.userID)}
                      className={`border-t border-gray-200 cursor-pointer transition-colors ${
                        selected ? 'bg-orange-100 border-l-4 border-l-[#e2694b]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-800 font-medium">{u.userName}</td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={u.userType === 'admin' || userHasAllModules(u.userID, 'canView')}
                          disabled={busy || u.userType === 'admin'}
                          onChange={(e) => handleToggleBulk(u.userID, 'canView', e.target.checked)}
                          className="h-4 w-4 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={u.userType === 'admin' || userHasAllModules(u.userID, 'canEdit')}
                          disabled={busy || u.userType === 'admin'}
                          onChange={(e) => handleToggleBulk(u.userID, 'canEdit', e.target.checked)}
                          className="h-4 w-4 accent-emerald-600 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={u.userType === 'admin'}
                          disabled={busy}
                          onChange={(e) => handleToggleAdmin(u, e.target.checked)}
                          className="h-4 w-4 accent-[#e2694b] cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={busy || isSelf}
                            title={isSelf ? 'No puedes eliminar tu propia cuenta' : 'Eliminar cuenta'}
                            onClick={() => setConfirmDeleteUser(u)}
                            className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <Trash2 className="w-5 h-5 inline" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Confirmación de borrado */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900">Eliminar cuenta</h2>
            <p className="text-gray-600 text-sm">
              ¿Seguro que quieres eliminar la cuenta de <span className="font-semibold">{confirmDeleteUser.userName}</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                disabled={busy}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
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

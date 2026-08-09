import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "../stores/useAppStore";
import { getMyPermissions } from "../api/userPermissions";
import { ROUTES } from "../routes";

// Envuelve las rutas internas (dashboard, productos, ventas, etc.) en router.tsx.
// Sin token guardado (ver stores/authSlice.ts) manda al login en vez de renderizar
// la página pedida; con token, deja pasar a través del Outlet.
export default function RequireAuth() {
  const token = useAppStore((state) => state.token);
  const authUser = useAppStore((state) => state.authUser);
  const setMyPermissions = useAppStore((state) => state.setMyPermissions);
  const resetMyPermissions = useAppStore((state) => state.resetMyPermissions);
  const location = useLocation();

  // Los admin no necesitan permisos individuales (siempre pasan todo, ver
  // ModuleGuard), así que solo se piden para vendedores/etc.
  useEffect(() => {
    if (!token || !authUser) {
      resetMyPermissions();
      return;
    }
    if (authUser.userType === 'admin') {
      return;
    }
    getMyPermissions()
      .then(setMyPermissions)
      .catch(() => setMyPermissions([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authUser?.userID, authUser?.userType]);

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

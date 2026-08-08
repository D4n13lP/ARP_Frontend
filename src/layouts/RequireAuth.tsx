import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "../stores/useAppStore";
import { ROUTES } from "../routes";

// Envuelve las rutas internas (dashboard, productos, ventas, etc.) en router.tsx.
// Sin token guardado (ver stores/authSlice.ts) manda al login en vez de renderizar
// la página pedida; con token, deja pasar a través del Outlet.
export default function RequireAuth() {
  const token = useAppStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

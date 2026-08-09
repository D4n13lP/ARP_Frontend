import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { ROUTES } from '../routes';

// Bloquea el acceso a una vista cuando el usuario tiene canView desactivado
// para su módulo correspondiente (ver panel "Vistas permitidas" en
// OtherAccountSettings_Page). Los admin siempre pasan.
export default function ModuleGuard({ moduleKey, children }: { moduleKey: string; children: ReactNode }) {
  const authUser = useAppStore((state) => state.authUser);
  const myPermissions = useAppStore((state) => state.myPermissions);
  const permissionsLoaded = useAppStore((state) => state.permissionsLoaded);

  if (authUser?.userType === 'admin') {
    return <>{children}</>;
  }

  // Evita un parpadeo de "acceso no permitido" mientras se cargan los
  // permisos justo después de iniciar sesión.
  if (!permissionsLoaded) {
    return null;
  }

  const canView = myPermissions.some((p) => p.module?.moduleKey === moduleKey && p.canView);
  if (!canView) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-6 gap-4 animate-fade-in">
        <ShieldOff className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-semibold text-[#e2694b]">Acceso no permitido</h1>
        <p className="text-gray-500 max-w-md">
          Tu cuenta no tiene permiso para ver esta pantalla. Si crees que es un error, pide a un administrador
          que active esta vista desde "Configurar cuentas".
        </p>
        <Link
          to={ROUTES.DASHBOARD}
          className="bg-[#3ab0e2] hover:bg-sky-600 text-white px-6 py-2 rounded shadow-sm text-sm font-medium transition-colors"
        >
          Ir al inicio
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

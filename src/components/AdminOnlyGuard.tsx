import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { ROUTES } from '../routes';

// A diferencia de ModuleGuard (permisos por módulo, otorgables a vendedores
// desde "Configurar cuentas"), esta pantalla es EXCLUSIVA de administradores:
// no existe forma de darle acceso a un vendedor bajo ninguna circunstancia.
export default function AdminOnlyGuard({ children }: { children: ReactNode }) {
  const authUser = useAppStore((state) => state.authUser);

  if (authUser?.userType === 'admin') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center p-6 gap-4 animate-fade-in">
      <ShieldOff className="w-16 h-16 text-gray-300" />
      <h1 className="text-2xl font-semibold text-[#e2694b]">Acceso no permitido</h1>
      <p className="text-gray-500 max-w-md">
        Esta pantalla es exclusiva para administradores.
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

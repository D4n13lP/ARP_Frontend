import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string | null;
  size?: number;
  className?: string;
}

// Spinner inline reutilizable: reemplaza los "Cargando..." de texto plano
// que había regados por varias vistas mientras esperan datos del backend.
// Mismo estilo (Loader2 + color de marca) que ya usaba VerifyEmail_Page —
// se centraliza aquí para que todas las vistas se vean igual.
export default function LoadingSpinner({ label = 'Cargando...', size = 32, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-10 text-gray-500 ${className}`}>
      <Loader2 className="animate-spin text-[#3ab0e2]" size={size} strokeWidth={1.5} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

// Pantalla completa: fallback de <Suspense> en router.tsx (mientras se
// descarga el código de la vista a la que se navegó) y vistas que ocupan
// toda la pantalla mientras cargan su primer dato.
export function FullPageLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <LoadingSpinner label={label} size={48} />
    </div>
  );
}

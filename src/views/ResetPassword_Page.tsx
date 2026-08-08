import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, XCircle } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { resetPassword } from '../api/auth';
import { getErrorMessage } from '../utils/errorMessage';
import { ROUTES } from '../routes';

export default function ResetPassword_Page() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (!token) {
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (error) {
      alert(getErrorMessage(error, 'El enlace de recuperación es inválido o expiró.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">

      {/* Header */}
      <div className="w-full max-w-7xl mb-12 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">

        {/* Back Button and Logo (Left) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-6">
          <img
            src={logoEmpresa}
            alt="Logo Empresa"
            className="h-20 w-auto object-contain"
          />
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-6 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
          >
            Atras
          </button>
        </div>

        {/* Title Centered with Icon */}
        <div className="flex items-center gap-4 text-[#e2694b]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Nueva contraseña
          </h1>
          <KeyRound size={45} strokeWidth={1.5} />
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-2xl flex flex-col mt-4">
        {!token ? (
          <div className="flex flex-col items-center gap-6 text-center py-8">
            <XCircle className="text-red-600" size={56} strokeWidth={1.5} />
            <h2 className="text-2xl font-semibold text-gray-900">Enlace inválido</h2>
            <p className="text-gray-600 max-w-md">
              Este enlace no incluye la información necesaria para restablecer tu contraseña. Solicita uno nuevo.
            </p>
            <button
              onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
              className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
            >
              Solicitar un nuevo enlace
            </button>
          </div>
        ) : done ? (
          <div className="flex flex-col items-center gap-6 text-center py-8">
            <p className="text-gray-800 text-lg">
              Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.
            </p>
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
            >
              Ir a iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-gray-900 font-semibold w-1/3 text-lg">
                Nueva contraseña
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="confirmPassword" className="text-gray-900 font-semibold w-1/3 text-lg">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
              />
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </div>

          </form>
        )}
      </main>
    </div>
  );
}

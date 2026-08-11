import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { forgotPassword } from '../api/auth';
import { getErrorMessage } from '../utils/errorMessage';
import { ROUTES } from '../routes';

export default function ForgotPassword_Page() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // El backend siempre responde el mismo mensaje exista o no la cuenta,
      // para no revelar qué correos están registrados.
      await forgotPassword(email);
      setSent(true);
    } catch (error) {
      alert(getErrorMessage(error, 'Ocurrió un error al enviar el enlace de recuperación. Intenta de nuevo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">

      {/* Header */}
      <div className="w-full max-w-7xl mb-12 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem] max-lg:portrait:flex-col max-lg:portrait:gap-4">

        {/* Back Button and Logo (Left) — en celular vertical se saca del
            position:absolute para que no se encime con el título de abajo. */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-6 max-lg:portrait:static max-lg:portrait:translate-y-0 max-lg:portrait:self-start">
          <img
            src={logoEmpresa}
            alt="Logo Empresa"
            className="h-20 w-auto object-contain max-lg:portrait:hidden"
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
            Olvidé mi contraseña
          </h1>
          <KeyRound size={45} strokeWidth={1.5} />
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-2xl flex flex-col mt-4">
        {sent ? (
          <div className="flex flex-col items-center gap-6 text-center py-8">
            <p className="text-gray-800 text-lg max-w-md">
              Si <span className="font-semibold">{email}</span> está registrado, te enviamos un correo con un enlace para restablecer tu contraseña.
            </p>
            <p className="text-sm text-gray-500 max-w-md">
              El enlace es válido por 1 hora. Puede ser tu correo principal o el de recuperación que hayas configurado en tu perfil.
            </p>
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
            >
              Volver a iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            <p className="text-gray-600">
              Escribe tu correo (el principal o el de recuperación) y te mandaremos un enlace para restablecer tu contraseña.
            </p>

            <div className="flex items-center justify-between">
              <label htmlFor="email" className="text-gray-900 font-semibold w-1/3 text-lg">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
              />
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </div>

          </form>
        )}
      </main>
    </div>
  );
}

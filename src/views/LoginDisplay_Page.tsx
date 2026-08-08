import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { login } from '../api/auth';
import { useAppStore } from '../stores/useAppStore';
import { getErrorMessage } from '../utils/errorMessage';
import { ROUTES } from '../routes';

export default function LoginDisplay_Page() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { user, token } = await login(email, password);
      setSession(user, token);
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo iniciar sesión. Intenta de nuevo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e2694b] flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm bg-[#f1e8d6] rounded-3xl shadow-2xl px-8 pt-8 pb-10 flex flex-col items-center">

        {/* Logo */}
        <div className="bg-white rounded-md shadow-sm p-3 mb-10 w-full">
          <img src={logoEmpresa} alt="Acabados Rústicos Pirámides" className="w-full h-auto object-contain" />
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="w-full flex flex-col gap-5">
            <input
              type="text"
              name="email"
              placeholder="usuario/correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-white border-none rounded-xl py-3 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8a2a2a]"
            />
            <input
              type="password"
              name="password"
              placeholder="contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-white border-none rounded-xl py-3 px-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8a2a2a]"
            />
          </div>

          {/* Espacio en blanco, como en el diseño */}
          <div className="h-40" />

          <div className="w-full flex flex-col gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-b from-[#7d2222] to-[#4a0f0f] hover:from-[#8a2727] hover:to-[#551212] text-white font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.REGISTER)}
              className="w-full bg-linear-to-b from-[#7d2222] to-[#4a0f0f] hover:from-[#8a2727] hover:to-[#551212] text-white font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Registrarse
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
            className="mt-4 text-sm text-gray-800 hover:underline cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      </div>
    </div>
  );
}

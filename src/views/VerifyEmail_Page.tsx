import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { verifyEmail } from '../api/auth';
import { getErrorMessage } from '../utils/errorMessage';
import { ROUTES } from '../routes';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmail_Page() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? '' : 'El enlace de activación no es válido.');

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((error) => {
        setStatus('error');
        setMessage(getErrorMessage(error, 'El enlace de activación es inválido o expiró.'));
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col items-center text-center gap-6">
        <img src={logoEmpresa} alt="Logo Empresa" className="h-20 w-auto object-contain" />

        {status === 'loading' && (
          <>
            <Loader2 className="animate-spin text-[#3ab0e2]" size={48} strokeWidth={1.5} />
            <p className="text-gray-600">Activando tu cuenta...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="text-green-600" size={56} strokeWidth={1.5} />
            <h1 className="text-2xl font-semibold text-gray-900">Cuenta activada</h1>
            <p className="text-gray-600">{message} Revisa tu correo, te mandamos un mensaje de bienvenida con tu número de empleado.</p>
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
            >
              Ir a iniciar sesión
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="text-red-600" size={56} strokeWidth={1.5} />
            <h1 className="text-2xl font-semibold text-gray-900">No se pudo activar tu cuenta</h1>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
            >
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
}

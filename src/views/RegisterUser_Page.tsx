import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { register, type RegisterPayload } from '../api/auth';
import { getErrorMessage } from '../utils/errorMessage';
import { ROUTES } from '../routes';

export default function RegisterUser_Page() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    recoveryEmail: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Tras registrarse con éxito mostramos el employeeCode en vez del formulario:
  // es el único momento en que el usuario lo ve, conviene que no se le pase de largo.
  const [registered, setRegistered] = useState<{ employeeCode: string; email: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: RegisterPayload = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
      };
      if (formData.phone) {
        payload.phone = formData.phone;
      }
      if (formData.recoveryEmail) {
        payload.recoveryEmail = formData.recoveryEmail;
      }

      const { employeeCode } = await register(payload);
      setRegistered({ employeeCode, email: formData.email });
    } catch (error) {
      alert(getErrorMessage(error, 'Ocurrió un error al registrar la cuenta. Intenta de nuevo.'));
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
            Registrar usuario
          </h1>
          <UserPlus size={45} strokeWidth={1.5} />
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-2xl flex flex-col mt-4">
        {registered ? (
          <div className="flex flex-col items-center gap-6 text-center py-8">
            <p className="text-gray-800 text-lg">
              Cuenta creada. Te mandamos un correo de confirmación a <span className="font-semibold">{registered.email}</span> — ábrelo y presiona el botón para activar tu cuenta antes de iniciar sesión.
            </p>

            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-gray-500">Tu número de empleado</span>
              <span className="text-3xl font-bold tracking-widest text-[#e2694b] bg-gray-100 rounded-lg px-6 py-3">
                {registered.employeeCode}
              </span>
              <span className="text-sm text-gray-500">Guárdalo, es tu identificador dentro del sistema.</span>
            </div>

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
              <label htmlFor="userName" className="text-gray-900 font-semibold w-1/3 text-lg">
                Nombre de usuario
              </label>
              <input
                type="text"
                name="userName"
                id="userName"
                value={formData.userName}
                onChange={handleChange}
                required
                placeholder="Obligatorio"
                className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="phone" className="text-gray-900 font-semibold w-1/3 text-lg">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Opcional"
                className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="email" className="text-gray-900 font-semibold w-1/3 text-lg">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Obligatorio"
                className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="recoveryEmail" className="text-gray-900 font-semibold w-1/3 text-lg">
                Correo de recuperación
              </label>
              <input
                type="email"
                name="recoveryEmail"
                id="recoveryEmail"
                value={formData.recoveryEmail}
                onChange={handleChange}
                placeholder="Opcional, distinto a tu correo principal"
                className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-gray-900 font-semibold w-1/3 text-lg">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Obligatorio"
                className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
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
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Obligatorio"
                className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
              />
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500 max-w-xs">
                Al registrarte te enviaremos un correo con un botón para activar tu cuenta.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
              >
                {isSubmitting ? 'Registrando...' : 'Registrar'}
              </button>
            </div>

          </form>
        )}
      </main>
    </div>
  );
}

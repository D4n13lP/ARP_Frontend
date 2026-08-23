import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logoEmpresa from '../assets/logo_empresa.jpg';
import fuentePerfecta from '../assets/fuente_perfecta_630F00.svg';
import { login } from '../api/auth';
import { useAppStore } from '../stores/useAppStore';
import { getErrorMessage } from '../utils/errorMessage';
import { ROUTES } from '../routes';

export default function LoginDisplay_Page() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  // El interceptor de http.ts manda aquí con ?session=expired cuando el
  // token venció o dejó de ser válido (ver src/api/http.ts).
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('session') === 'expired';

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
    <div className="min-h-screen bg-linear-to-t from-[#6c1b1b] to-[#e35336] to-40% flex items-center justify-center p-6 relative animate-fade-in overflow-hidden">
      <div className="relative flex items-center">

        {/* Fuente decorativa: absoluta, centrada verticalmente en la
            PANTALLA (no en la tarjeta) — top-1/2 en vez de anclarla a un
            borde. Esto funciona porque el contenedor que la envuelve
            (.relative.flex.items-center, el mismo que envuelve a la
            tarjeta) ya está centrado verticalmente dentro del viewport
            completo (el contenedor exterior es min-h-screen flex
            items-center) — o sea que el centro vertical de ESTE contenedor
            coincide exactamente con el centro vertical de la pantalla,
            sin importar la altura de la tarjeta.
            -translate-y-[58.4%] en vez de -translate-y-1/2: el dibujo
            dentro del SVG NO está centrado en su propio lienzo (viewBox
            0 0 446 829) — el trazo va de y=200 a y=768 (medido de las
            coordenadas del path), con punto medio real en y=484, mientras
            que el centro geométrico del lienzo es y=414.5. Esa diferencia
            (69.5px, un 8.4% de 829) es lo que hacía que, aunque la CAJA del
            <img> sí quedaba centrada con -translate-y-1/2, el DIBUJO se
            viera corrido hacia abajo. 50% + 8.4% = 58.4% corrige ese
            desfase para que el dibujo (no solo la caja) quede centrado.
            Al centrarse (en vez de anclarse arriba o abajo) el sobrante se
            reparte mitad arriba, mitad abajo, así que con el tope de altura
            de abajo tampoco se sale de la pantalla ni agrega scroll. Queda
            fuera del flujo (no afecta el centrado de la tarjeta ni agrega
            scroll por sí misma). A diferencia de la pirámide (ancha y
            angosto (446x829) — dimensionarlo por ANCHO como antes lo hacía
            enorme de alto y se salía muy por debajo de la tarjeta/pantalla;
            por eso aquí se dimensiona por ALTO, con ancho automático.
            clamp(180px, 120vh, min(191%, 80vh)): 120vh es a propósito mucho
            más grande que el tope, así que en la enorme mayoría de
            pantallas de escritorio/laptop el clamp topa ahí, mostrando
            SIEMPRE el tamaño máximo (191% de la altura de la tarjeta, o
            80% del alto de la ventana, lo que sea menor — así nunca se sale
            de la pantalla). Solo en ventanas realmente bajas 120vh cae por
            debajo de ese tope y ahí sí empieza a achicarse de verdad, hasta
            un piso de 180px para que no desaparezca. Sin z-index propio
            (queda por debajo del z-10 de la tarjeta): el formulario siempre
            se ve completo encima, la fuente solo se asoma donde no se
            encima con la tarjeta. left-82.5 queda bien en tablet (lg); en
            pantallas de escritorio más anchas (xl+) se recorre más a la
            derecha para no dejar tanto espacio vacío. */}
        <img
          src={fuentePerfecta}
          alt=""
          aria-hidden="true"
          className="hidden lg:block pointer-events-none select-none absolute top-1/2 -translate-y-[58.4%] left-82.5 xl:left-100 2xl:left-115 h-[clamp(180px,120vh,min(191%,80vh))] w-auto"
        />

        <div className="relative z-10 w-full max-w-sm bg-[#f1e8d6] rounded-3xl shadow-2xl px-8 pt-8 pb-10 flex flex-col items-center">

          {/* Logo */}
          <div className="bg-white rounded-md shadow-sm p-3 mb-10 w-full">
            <img src={logoEmpresa} alt="Acabados Rústicos Pirámides" className="w-full h-auto object-contain" />
          </div>

          {sessionExpired && (
            <div className="w-full -mt-6 mb-6 bg-[#8a2a2a]/10 border border-[#8a2a2a]/30 text-[#7d2222] text-sm rounded-xl px-4 py-3 text-center">
              Tu sesión expiró o ya no es válida. Inicia sesión de nuevo.
            </div>
          )}

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
    </div>
  );
}

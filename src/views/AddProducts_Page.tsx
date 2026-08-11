import { ArrowLeft, Boxes, ClipboardPlus, FileSpreadsheet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import logoEmpresa from '../assets/logo_empresa.jpg'
import { ROUTES } from '../routes'

export default function AddProducts_Page() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white animate-fade-in px-6 md:px-12 py-8">
      <div className="max-w-7xl mx-auto">
        <img
          src={logoEmpresa}
          alt="Acabados Rusticos Piramides"
          className="h-16 md:h-20 object-contain max-lg:portrait:hidden"
        />

        <div className="mt-8 flex items-center justify-center gap-4 text-[#e65100]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Registro de Productos
          </h1>
          <Boxes size={55} strokeWidth={1.2} />
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          Seleccione la modalidad de registro para continuar
        </p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <button
            onClick={() => navigate(ROUTES.PRODUCTS.ADD_PRODUCT)}
            className="group rounded-2xl border border-[#ffd7b5] bg-[#fff7ef] p-8 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center gap-3 text-[#e65100]">
              <ClipboardPlus size={28} />
              <h2 className="text-xl font-semibold">Registro individual</h2>
            </div>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Capture todos los datos de un producto con pestañas por seccion: datos generales,
              almacen/proveedor y precio de venta.
            </p>
            <span className="mt-5 inline-block text-sm font-medium text-[#e65100] group-hover:underline">
              Ir a agregar producto
            </span>
          </button>

          <button
            onClick={() => navigate('/products/register')}
            className="group rounded-2xl border border-[#cdeaf8] bg-[#eef8ff] p-8 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center gap-3 text-[#0077b6]">
              <FileSpreadsheet size={28} />
              <h2 className="text-xl font-semibold">Registro rapido</h2>
            </div>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Registre multiples productos de forma agil para cargas operativas del dia a dia.
            </p>
            <span className="mt-5 inline-block text-sm font-medium text-[#0077b6] group-hover:underline">
              Ir a registro rapido
            </span>
          </button>
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate(ROUTES.PRODUCTS.ROOT)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-gray-700 hover:text-[#16A085] hover:border-[#16A085] hover:bg-emerald-50 transition-colors duration-300"
          >
            <ArrowLeft size={18} />
            Volver a productos
          </button>
        </div>
      </div>
    </div>
  )
}

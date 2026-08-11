import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { createSupplier } from '../api/suppliers';
import { ROUTES } from '../routes';

export default function RegisterSupplier_Page() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    supplierName: '',
    enterpBusi: '',
    address: '',
    officePhone: '',
    contactName: '',
    contactPhone: '',
    email: '',
    website: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSupplier(formData);
      alert('Proveedor registrado exitosamente');
      navigate(ROUTES.SUPPLIERS.WATCH_SUPPLIERS);
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Ocurrió un error al registrar el proveedor.');
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
            onClick={() => navigate(-1)} 
            className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-6 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
          >
            Atras
          </button>
        </div>
        
        {/* Title Centered with Icon */}
        <div className="flex items-center gap-4 text-[#e2694b]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Registrar proveedor
          </h1>
          <UserPlus size={45} strokeWidth={1.5} />
        </div>
      </div>

      {/* Main Form Content */}
      <main className="w-full max-w-2xl flex flex-col mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex items-center justify-between">
            <label htmlFor="supplierName" className="text-gray-900 font-semibold w-1/3 text-lg">
              Nombre de proveedor
            </label>
            <input
              type="text"
              name="supplierName"
              id="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              required
              className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="enterpBusi" className="text-gray-900 font-semibold w-1/3 text-lg">
              Empresa
            </label>
            <input
              type="text"
              name="enterpBusi"
              id="enterpBusi"
              value={formData.enterpBusi}
              onChange={handleChange}
              className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="address" className="text-gray-900 font-semibold w-1/3 text-lg">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleChange}
              className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="officePhone" className="text-gray-900 font-semibold w-1/3 text-lg">
              Teléfono oficina
            </label>
            <input
              type="text"
              name="officePhone"
              id="officePhone"
              value={formData.officePhone}
              onChange={handleChange}
              className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="contactName" className="text-gray-900 font-semibold w-1/3 text-lg">
              Nombre del contacto
            </label>
            <input
              type="text"
              name="contactName"
              id="contactName"
              value={formData.contactName}
              onChange={handleChange}
              className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="contactPhone" className="text-gray-900 font-semibold w-1/3 text-lg">
              Teléfono de contacto
            </label>
            <input
              type="text"
              name="contactPhone"
              id="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
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
              className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="website" className="text-gray-900 font-semibold w-1/3 text-lg">
              Sitio web
            </label>
            <input
              type="text"
              name="website"
              id="website"
              value={formData.website}
              onChange={handleChange}
              className="w-2/3 bg-gray-200 border-none rounded py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3ab0e2]"
            />
          </div>

          <div className="flex justify-end mt-6">
            <button 
              type="submit" 
              className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-8 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
            >
              Guardar
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
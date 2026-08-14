import { useEffect, useState } from 'react';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { ROUTES } from '../routes';
import { getWarehouses, createWarehouse, deleteWarehouse } from '../api/warehouses';
import { getInventories } from '../api/inventory';
import { getErrorMessage } from '../utils/errorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Warehouse } from '../types';

export default function Warehouses_Page() {
  const navigate = useNavigate();
  const [almacenes, setAlmacenes] = useState<Warehouse[]>([]);
  // whID de todos los almacenes que tienen al menos un producto asignado en
  // "inventory" — a esos no se les debe mostrar el botón "Eliminar".
  const [whIDsConProductos, setWhIDsConProductos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ whname: '', whaddress: '' });

  useEffect(() => {
    Promise.all([getWarehouses(), getInventories()])
      .then(([whs, inventarios]) => {
        whs.sort((a, b) => a.whname.localeCompare(b.whname));
        setAlmacenes(whs);
        setWhIDsConProductos(new Set(inventarios.map((inv) => inv.whID)));
      })
      .catch((error) => alert(getErrorMessage(error, 'No se pudieron cargar los almacenes.')))
      .finally(() => setLoading(false));
  }, []);

  async function handleAgregar() {
    if (!formData.whname.trim()) {
      alert('El nombre del almacén es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      const created = await createWarehouse({
        whname: formData.whname.trim(),
        whaddress: formData.whaddress.trim() || undefined,
      });
      setAlmacenes((prev) => [...prev, created].sort((a, b) => a.whname.localeCompare(b.whname)));
      setFormData({ whname: '', whaddress: '' });
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo registrar el almacén.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(whID: string) {
    if (!window.confirm('¿Estás seguro de eliminar este almacén?')) return;
    try {
      await deleteWarehouse(whID);
      setAlmacenes((prev) => prev.filter((w) => w.whID !== whID));
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo eliminar el almacén.'));
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans animate-fade-in">
      {/* HEADER: igual que Clients_Page */}
      <header className="relative py-6 mb-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center h-16 max-lg:portrait:h-auto max-lg:portrait:flex-col max-lg:portrait:gap-4">
          {/* en celular vertical se saca del position:absolute para que no se
              encime con el título de abajo. */}
          <div className="absolute left-4 sm:left-6 lg:left-8 flex items-center gap-4 max-lg:portrait:static max-lg:portrait:self-start">
            <img
              src={logoEmpresa}
              alt="Logo Empresa"
              className="h-16 md:h-20 object-contain max-lg:portrait:hidden"
            />
            <button
              onClick={() => navigate(ROUTES.INVENTORY)}
              className="bg-[#3ab0e2] text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-sky-600 transition shadow-sm cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Atrás
            </button>
          </div>
          <h1 className="text-4xl md:text-5xl font-normal text-[#e65100] tracking-tight text-center">
            Almacenes
          </h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col mb-10">

        {/* FORMULARIO PARA AGREGAR */}
        <div className="flex flex-wrap items-end gap-4 mb-8 p-6 rounded-lg border shadow-sm bg-gray-50 border-gray-100 transition-all duration-300">
          {[
            { id: 'whname', label: 'Nombre del almacén', req: true },
            { id: 'whaddress', label: 'Dirección', req: false },
          ].map((field) => (
            <div key={field.id} className="flex-1 min-w-[220px] relative">
              <input
                type="text"
                placeholder={`Ingrese ${field.label}${field.req ? '' : ' (Opcional)'}`}
                className="w-full p-2 pr-8 border border-gray-300 rounded focus:ring-2 focus:ring-[#3ab0e2] outline-none bg-white transition-all"
                value={formData[field.id as keyof typeof formData]}
                onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
              />
              {formData[field.id as keyof typeof formData] && (
                <button
                  onClick={() => setFormData({ ...formData, [field.id]: '' })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleAgregar}
            disabled={saving}
            className="bg-[#3ab0e2] hover:bg-[#16A085] px-8 py-2 rounded transition-all flex items-center gap-2 font-medium cursor-pointer shadow-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} /> {saving ? 'Agregando...' : 'Agregar'}
          </button>
        </div>

        {/* TABLA DE ALMACENES — escritorio/tablet (>= md), intacta */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="p-4 border-b">Nombre del almacén</th>
                <th className="p-4 border-b">Dirección</th>
                <th className="p-4 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {almacenes.map((almacen) => (
                <tr key={almacen.whID} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{almacen.whname}</td>
                  <td className="p-4">{almacen.whaddress || '---'}</td>
                  <td className="p-4 text-center">
                    {!whIDsConProductos.has(almacen.whID) && (
                      <button
                        onClick={() => handleEliminar(almacen.whID)}
                        className="text-red-500 hover:text-red-700 cursor-pointer font-bold transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={3}><LoadingSpinner /></td>
                </tr>
              )}
              {!loading && almacenes.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-gray-400 italic bg-gray-50/50">
                    No hay almacenes registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tarjetas — celulares (< md). Mismos datos/handler que la tabla. */}
        <div className="md:hidden flex flex-col gap-3">
          {loading && <LoadingSpinner />}
          {almacenes.map((almacen) => (
            <div key={almacen.whID} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{almacen.whname}</h3>
                <span className="text-xs text-gray-500">{almacen.whaddress || '---'}</span>
              </div>
              {!whIDsConProductos.has(almacen.whID) && (
                <button
                  onClick={() => handleEliminar(almacen.whID)}
                  className="shrink-0 text-red-500 hover:text-red-700 cursor-pointer font-bold text-sm transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
          {!loading && almacenes.length === 0 && (
            <p className="p-12 text-center text-gray-400 italic bg-gray-50/50 rounded-xl">
              No hay almacenes registrados todavía.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

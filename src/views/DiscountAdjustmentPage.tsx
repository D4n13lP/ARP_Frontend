import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings2, ArrowLeft, Save } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getTransDiscounts, updateTransDiscount, createTransDiscount } from '../api/transDiscounts';
import { getErrorMessage } from '../utils/errorMessage';
import type { TransDiscount } from '../types';

export default function DiscountAdjustments_Page() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // transDiscount.percent en BD es fracción 0-1; en pantalla se maneja 1-100.
  const [t1, setT1] = useState<TransDiscount | null>(null);
  const [t2, setT2] = useState<TransDiscount | null>(null);
  const [descTipo1, setDescTipo1] = useState<number | string>('');
  const [descTipo2, setDescTipo2] = useState<number | string>('');

  useEffect(() => {
    getTransDiscounts()
      .then((items) => {
        const found1 = items.find((d) => d.type === 't1') || null;
        const found2 = items.find((d) => d.type === 't2') || null;
        setT1(found1);
        setT2(found2);
        setDescTipo1(found1 ? Math.round(Number(found1.percent) * 100) : '');
        setDescTipo2(found2 ? Math.round(Number(found2.percent) * 100) : '');
      })
      .catch((error) => alert(getErrorMessage(error, 'No se pudieron cargar los tipos de descuento.')))
      .finally(() => setLoading(false));
  }, []);

  // --- VALIDACIÓN DE PORCENTAJE (1-100) ---
  const handleInputChange = (
    val: string,
    setter: React.Dispatch<React.SetStateAction<number | string>>
  ) => {
    if (val === '') {
      setter('');
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      setter(num);
    }
  };

  const handleSave = async () => {
    if (descTipo1 === '' || descTipo2 === '') {
      alert('Ingresa ambos porcentajes antes de guardar.');
      return;
    }
    setSaving(true);
    try {
      const percent1 = Number(descTipo1) / 100;
      const percent2 = Number(descTipo2) / 100;
      const [saved1, saved2] = await Promise.all([
        t1 ? updateTransDiscount(t1.transDiscountID, { percent: percent1 }) : createTransDiscount({ type: 't1', percent: percent1 }),
        t2 ? updateTransDiscount(t2.transDiscountID, { percent: percent2 }) : createTransDiscount({ type: 't2', percent: percent2 }),
      ]);
      setT1(saved1);
      setT2(saved2);
      alert('Configuración actualizada correctamente');
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo actualizar la configuración.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col">
      {/* LOGO */}
      <div className="max-w-7xl mx-auto w-full mb-4">
        <img src={logoEmpresa} alt="Logo" className="h-16 md:h-20 object-contain" />
      </div>

      <main className="w-full max-w-2xl mx-auto">
        {/* BOTÓN REGRESAR */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-[#3ab0e2] transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Regresar al menú</span>
        </button>

        {/* TÍTULO */}
        <div className="flex items-center gap-6 mb-12 text-[#e65100]">
          <h1 className="text-4xl font-normal tracking-tight">Ajustar tipos de descuento</h1>
          <Settings2 className="text-[#8e44ad]" size={50} strokeWidth={1.5} />
        </div>

        {loading ? (
          <p className="text-center text-gray-400">Cargando...</p>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl p-10 shadow-sm space-y-10">

            {/* CAMPO: DESCUENTO TIPO 1 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-xl font-semibold text-gray-700">Descuento tipo 1</label>
                <p className="text-sm text-gray-400 italic">Configuración global para promociones generales</p>
              </div>
              <div className="relative w-full md:w-40">
                <input
                  type="text"
                  disabled={saving}
                  value={descTipo1}
                  onChange={(e) => handleInputChange(e.target.value, setDescTipo1)}
                  className="w-full p-3 pr-10 border-2 border-[#8e44ad]/30 rounded-lg outline-none focus:border-[#8e44ad] text-center text-2xl font-bold text-gray-800 disabled:opacity-60"
                />
                <span className="absolute right-4 top-3.5 font-bold text-[#8e44ad] text-xl">%</span>
              </div>
            </div>

            <hr className="border-gray-50" />

            {/* CAMPO: DESCUENTO TIPO 2 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-xl font-semibold text-gray-700">Descuento tipo 2</label>
                <p className="text-sm text-gray-400 italic">Configuración global para clientes específicos</p>
              </div>
              <div className="relative w-full md:w-40">
                <input
                  type="text"
                  disabled={saving}
                  value={descTipo2}
                  onChange={(e) => handleInputChange(e.target.value, setDescTipo2)}
                  className="w-full p-3 pr-10 border-2 border-[#8e44ad]/30 rounded-lg outline-none focus:border-[#8e44ad] text-center text-2xl font-bold text-gray-800 disabled:opacity-60"
                />
                <span className="absolute right-4 top-3.5 font-bold text-[#8e44ad] text-xl">%</span>
              </div>
            </div>

            {/* BOTÓN GUARDAR */}
            <div className="pt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-3 bg-[#3ab0e2] hover:bg-[#16A085] text-white px-10 py-3 rounded-lg shadow-md transition-all font-bold text-lg active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={22} />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

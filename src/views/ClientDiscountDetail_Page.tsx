import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TicketPercent, Check, X } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getClientById } from '../api/clients';
import { getClientProductDiscounts, saveClientProductDiscount, deleteClientProductDiscount } from '../api/clientProductDiscounts';
import { getErrorMessage } from '../utils/errorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Client, ClientProductDiscount } from '../types';

export default function ClientDiscountDetail_Page() {
  const navigate = useNavigate();
  const { clientCode } = useParams();

  const [clientData, setClientData] = useState<Client | null>(null);
  const [discounts, setDiscounts] = useState<ClientProductDiscount[]>([]);
  const [loading, setLoading] = useState(!!clientCode);

  // Edición en línea: qué fila se está editando y el texto de su input —
  // solo acepta 1-90 (restricción propia de esta vista, ver handleEditValueChange).
  const [editingID, setEditingID] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingID, setSavingID] = useState<string | null>(null);
  const [deletingID, setDeletingID] = useState<string | null>(null);

  useEffect(() => {
    if (!clientCode) return;
    Promise.all([
      getClientById(clientCode),
      getClientProductDiscounts(clientCode),
    ])
      .then(([client, items]) => {
        setClientData(client);
        setDiscounts(items);
      })
      .catch((error) => alert(getErrorMessage(error, 'No se pudieron cargar los descuentos del cliente.')))
      .finally(() => setLoading(false));
  }, [clientCode]);

  const handleStartEdit = (d: ClientProductDiscount) => {
    setEditingID(d.clientProductDiscountID);
    setEditValue(String(Math.round(Number(d.discountPercentage) * 100)));
  };

  const handleCancelEdit = () => {
    setEditingID(null);
    setEditValue('');
  };

  // Restricción propia de esta vista: solo 1-90 (a diferencia de
  // ClientsDiscountPage, que al asignar un descuento nuevo acepta 1-100).
  const handleEditValueChange = (val: string) => {
    if (val === '') {
      setEditValue('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 90 && /^\d+$/.test(val)) {
      setEditValue(String(num));
    }
  };

  const handleSaveEdit = async (d: ClientProductDiscount) => {
    const num = Number(editValue);
    if (!editValue || isNaN(num) || num < 1 || num > 90) {
      alert('Ingresa un porcentaje válido (1-90).');
      return;
    }
    setSavingID(d.clientProductDiscountID);
    try {
      const updated = await saveClientProductDiscount({
        clientCode: d.clientCode,
        prodCode: d.prodCode,
        discountPercentage: num / 100,
      });
      setDiscounts((prev) => prev.map((item) => (item.clientProductDiscountID === updated.clientProductDiscountID ? updated : item)));
      handleCancelEdit();
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo actualizar el descuento.'));
    } finally {
      setSavingID(null);
    }
  };

  const handleDelete = async (d: ClientProductDiscount) => {
    if (!window.confirm(`¿Eliminar el descuento de "${d.product?.productName || 'este producto'}"?`)) return;
    setDeletingID(d.clientProductDiscountID);
    try {
      await deleteClientProductDiscount(d.clientProductDiscountID);
      setDiscounts((prev) => prev.filter((item) => item.clientProductDiscountID !== d.clientProductDiscountID));
      if (editingID === d.clientProductDiscountID) handleCancelEdit();
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo eliminar el descuento.'));
    } finally {
      setDeletingID(null);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      {/* Header — mismo patrón que ClientHistory_Page/OrderDetail_Page */}
      <div className="w-full max-w-6xl mb-10 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-20 max-lg:portrait:flex-col max-lg:portrait:gap-4">
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

        <div className="flex items-center gap-4 text-[#e2694b]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Descuentos del cliente
          </h1>
          <TicketPercent size={45} strokeWidth={1.5} />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="w-full max-w-6xl flex flex-col gap-8 px-4">

          {/* Datos del cliente — escritorio/tablet (>= md) */}
          <div className="w-full border border-gray-300 rounded overflow-hidden shadow-sm hidden md:block">
            <table className="w-full text-center text-sm md:text-base border-collapse text-gray-800">
              <thead className="text-white font-semibold" style={{ backgroundColor: '#5d0e00' }}>
                <tr>
                  <th className="py-2 px-4 border-r border-white/20">ID Cliente</th>
                  <th className="py-2 px-4 border-r border-white/20">Nombre</th>
                  <th className="py-2 px-4 border-r border-white/20">RFC</th>
                  <th className="py-2 px-4 border-r border-white/20">Teléfono 1</th>
                  <th className="py-2 px-4">Correo electrónico</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr>
                  <td className="py-3 px-4 border-r border-gray-300 font-mono text-xs">{clientData?.clientCode || clientCode || 'N/A'}</td>
                  <td className="py-3 px-4 border-r border-gray-300">{clientData?.clientName || 'Desconocido'}</td>
                  <td className="py-3 px-4 border-r border-gray-300">{clientData?.RFC || 'N/A'}</td>
                  <td className="py-3 px-4 border-r border-gray-300">{clientData?.clientPhone1 || 'N/A'}</td>
                  <td className="py-3 px-4">{clientData?.email || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tarjeta — celulares (< md) */}
          <div className="w-full border border-gray-300 rounded-xl shadow-sm p-4 md:hidden space-y-3" style={{ backgroundColor: '#fdf6f0' }}>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-tight">{clientData?.clientName || 'Desconocido'}</h3>
              <span className="text-xs text-gray-500 font-mono">{clientData?.clientCode || clientCode || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-2.5 rounded-lg border border-gray-200">
              <div><span className="text-gray-500 block mb-0.5">RFC</span><span className="font-semibold text-gray-800">{clientData?.RFC || 'N/A'}</span></div>
              <div><span className="text-gray-500 block mb-0.5">Teléfono 1</span><span className="font-semibold text-gray-800">{clientData?.clientPhone1 || 'N/A'}</span></div>
              <div className="col-span-2"><span className="text-gray-500 block mb-0.5">Correo electrónico</span><span className="font-semibold text-gray-800">{clientData?.email || 'N/A'}</span></div>
            </div>
          </div>

          {/* Tabla de descuentos por producto — escritorio/tablet (>= md) */}
          <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm hidden md:block">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                <tr>
                  <th className="p-4 border-b">Nombre del Producto</th>
                  <th className="p-4 border-b">Categoría</th>
                  <th className="p-4 border-b text-center">Porcentaje de descuento</th>
                  <th className="p-4 border-b text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm">
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400 italic bg-gray-50/50">
                      Este cliente todavía no tiene descuentos asignados a ningún producto.
                    </td>
                  </tr>
                ) : discounts.map((d) => {
                  const isEditing = editingID === d.clientProductDiscountID;
                  return (
                    <tr key={d.clientProductDiscountID} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{d.product?.productName || '—'}</td>
                      <td className="p-4">{d.product?.category?.categoryName || '—'}</td>
                      <td className="p-4 text-center">
                        {isEditing ? (
                          <div className="relative w-24 mx-auto">
                            <input
                              type="text"
                              autoFocus
                              placeholder="1-90"
                              value={editValue}
                              onChange={(e) => handleEditValueChange(e.target.value)}
                              className="w-full p-1.5 pr-6 border-2 border-[#3ab0e2] rounded text-center font-bold outline-none"
                            />
                            <span className="absolute right-2 top-1.5 font-bold text-[#3ab0e2] text-sm">%</span>
                          </div>
                        ) : (
                          <span className="font-bold text-[#3ab0e2]">{Math.round(Number(d.discountPercentage) * 100)}%</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-4">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(d)}
                                disabled={savingID === d.clientProductDiscountID}
                                title="Guardar"
                                className="text-emerald-600 hover:text-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                title="Cancelar"
                                className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(d)}
                              className="text-amber-500 hover:text-amber-700 cursor-pointer font-bold transition-colors"
                            >
                              Editar
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(d)}
                            disabled={deletingID === d.clientProductDiscountID}
                            className="text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-bold transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjetas — celulares (< md) */}
          <div className="md:hidden flex flex-col gap-3">
            {discounts.length === 0 ? (
              <p className="p-12 text-center text-gray-400 italic bg-gray-50/50 rounded-xl">
                Este cliente todavía no tiene descuentos asignados a ningún producto.
              </p>
            ) : discounts.map((d) => {
              const isEditing = editingID === d.clientProductDiscountID;
              return (
                <div key={d.clientProductDiscountID} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{d.product?.productName || '—'}</h3>
                    <span className="text-xs text-gray-500">{d.product?.category?.categoryName || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="text-gray-500 text-xs">Porcentaje de descuento</span>
                    {isEditing ? (
                      <div className="relative w-24">
                        <input
                          type="text"
                          autoFocus
                          placeholder="1-90"
                          value={editValue}
                          onChange={(e) => handleEditValueChange(e.target.value)}
                          className="w-full p-1.5 pr-6 border-2 border-[#3ab0e2] rounded text-center font-bold outline-none"
                        />
                        <span className="absolute right-2 top-1.5 font-bold text-[#3ab0e2] text-sm">%</span>
                      </div>
                    ) : (
                      <span className="font-bold text-[#3ab0e2]">{Math.round(Number(d.discountPercentage) * 100)}%</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(d)}
                          disabled={savingID === d.clientProductDiscountID}
                          className="flex-1 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg active:bg-emerald-100 cursor-pointer disabled:opacity-40"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 py-2 bg-gray-50 text-gray-600 font-bold text-xs rounded-lg active:bg-gray-100 cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(d)}
                        className="flex-1 py-2 bg-amber-50 text-amber-600 font-bold text-xs rounded-lg active:bg-amber-100 cursor-pointer"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(d)}
                      disabled={deletingID === d.clientProductDiscountID}
                      className="flex-1 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-lg active:bg-red-100 cursor-pointer disabled:opacity-40"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}

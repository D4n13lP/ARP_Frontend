import { useEffect, useState } from 'react';
import { TicketPercent, Search, ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import logoEmpresa from '../assets/logo_empresa.jpg';
import { getClients } from '../api/clients';
import { getProducts } from '../api/products';
import { getClientProductDiscounts, saveClientProductDiscount, deleteClientProductDiscount } from '../api/clientProductDiscounts';
import { getErrorMessage } from '../utils/errorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Client, ClientProductDiscount, Product } from '../types';

export default function ClientDiscountSetup_Page() {
  const navigate = useNavigate();

  // --- BÚSQUEDA DE CLIENTE (mismo patrón que SaleSummary: ID/nombre -> modal con resultados) ---
  const [idCliente, setIdCliente] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clientes, setClientes] = useState<Client[]>([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clientModal, setClientModal] = useState<{ results: Client[]; pickedCode: string | null } | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // --- DESCUENTOS YA ASIGNADOS AL CLIENTE SELECCIONADO (producto por producto) ---
  const [clientDiscounts, setClientDiscounts] = useState<ClientProductDiscount[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [deletingID, setDeletingID] = useState<string | null>(null);

  // --- BÚSQUEDA DE PRODUCTO PARA ASIGNARLE UN DESCUENTO A ESE CLIENTE ---
  const [productos, setProductos] = useState<Product[]>([]);
  const [productoBusqueda, setProductoBusqueda] = useState('');
  const [buscandoProducto, setBuscandoProducto] = useState(false);
  const [resultadosProducto, setResultadosProducto] = useState<Product[]>([]);
  // Porcentaje que se está escribiendo por producto (prodCode -> texto del input).
  const [percentInputs, setPercentInputs] = useState<Record<string, string>>({});
  const [savingProdCode, setSavingProdCode] = useState<string | null>(null);

  const handleSearchCliente = async () => {
    if (!idCliente.trim() && !clienteNombre.trim()) return;
    setBuscandoCliente(true);
    try {
      const lista = clientes.length > 0 ? clientes : await getClients().then((data) => { setClientes(data); return data; });
      const idBusqueda = idCliente.trim().toLowerCase();
      const nombreBusqueda = clienteNombre.trim().toLowerCase();
      const encontrados = lista.filter((c) =>
        (idBusqueda && (c.clientCode.toLowerCase() === idBusqueda || c.clientCode.toLowerCase().includes(idBusqueda)))
        || (nombreBusqueda && c.clientName.toLowerCase().includes(nombreBusqueda))
      );
      setClientModal({ results: encontrados, pickedCode: selectedClient?.clientCode ?? null });
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo buscar el cliente.'));
    } finally {
      setBuscandoCliente(false);
    }
  };

  const handlePickClient = (client: Client) => {
    setSelectedClient(client);
    setIdCliente(client.clientCode);
    setClienteNombre(client.clientName);
    setPercentInputs({});
  };

  // Al elegir cliente, trae sus descuentos por producto ya guardados —
  // así se ve de una vez qué productos ya tienen algo asignado.
  useEffect(() => {
    if (!selectedClient) {
      setClientDiscounts([]);
      return;
    }
    setLoadingDiscounts(true);
    getClientProductDiscounts(selectedClient.clientCode)
      .then(setClientDiscounts)
      .catch((error) => alert(getErrorMessage(error, 'No se pudieron cargar los descuentos del cliente.')))
      .finally(() => setLoadingDiscounts(false));
  }, [selectedClient]);

  const handleSearchProducto = async () => {
    const busqueda = productoBusqueda.trim().toLowerCase();
    if (!busqueda) return;
    setBuscandoProducto(true);
    try {
      const lista = productos.length > 0 ? productos : await getProducts().then((data) => { setProductos(data); return data; });
      const encontrados = lista.filter((p) =>
        p.productName.toLowerCase().includes(busqueda) || p.sku.toLowerCase().includes(busqueda)
      );
      setResultadosProducto(encontrados);
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo buscar el producto.'));
    } finally {
      setBuscandoProducto(false);
    }
  };

  const getDiscountForProduct = (prodCode: string) => clientDiscounts.find((d) => d.prodCode === prodCode);

  // Si ya se está editando el input, respeta lo escrito; si no, precarga el
  // % ya guardado para ese producto (o vacío si nunca se le asignó nada).
  const getPercentInputValue = (prodCode: string): string => {
    if (percentInputs[prodCode] !== undefined) return percentInputs[prodCode];
    const existing = getDiscountForProduct(prodCode);
    return existing ? String(Math.round(Number(existing.discountPercentage) * 100)) : '';
  };

  const handlePercentInputChange = (prodCode: string, val: string) => {
    if (val === '') {
      setPercentInputs((prev) => ({ ...prev, [prodCode]: '' }));
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 100 && /^\d+$/.test(val)) {
      setPercentInputs((prev) => ({ ...prev, [prodCode]: String(num) }));
    }
  };

  const handleSaveProductDiscount = async (prodCode: string) => {
    if (!selectedClient) return;
    const val = getPercentInputValue(prodCode);
    const num = Number(val);
    if (!val || isNaN(num) || num < 1 || num > 100) {
      alert('Ingresa un porcentaje válido (1-100).');
      return;
    }
    setSavingProdCode(prodCode);
    try {
      const saved = await saveClientProductDiscount({
        clientCode: selectedClient.clientCode,
        prodCode,
        discountPercentage: num / 100,
      });
      setClientDiscounts((prev) => [...prev.filter((d) => d.prodCode !== prodCode), saved]);
      setPercentInputs((prev) => {
        const next = { ...prev };
        delete next[prodCode];
        return next;
      });
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo guardar el descuento.'));
    } finally {
      setSavingProdCode(null);
    }
  };

  const handleDeleteProductDiscount = async (discount: ClientProductDiscount) => {
    if (!window.confirm(`¿Quitar el descuento de "${discount.product?.productName || 'este producto'}"?`)) return;
    setDeletingID(discount.clientProductDiscountID);
    try {
      await deleteClientProductDiscount(discount.clientProductDiscountID);
      setClientDiscounts((prev) => prev.filter((d) => d.clientProductDiscountID !== discount.clientProductDiscountID));
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo quitar el descuento.'));
    } finally {
      setDeletingID(null);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col">
      <div className="max-w-7xl mx-auto w-full mb-4 max-lg:portrait:hidden">
        <img src={logoEmpresa} alt="Logo" className="h-16 md:h-20 object-contain" />
      </div>

      {/* BOTÓN REGRESAR */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-[#3ab0e2] transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Regresar al menú</span>
      </button>

      <main className="w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-8 text-[#e65100]">
          <h1 className="text-4xl font-normal">Descuento para clientes</h1>
          <TicketPercent className="text-[#e65100]" size={60} strokeWidth={1.2} />
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
          {/* SECCIÓN CLIENTE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-4 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600 uppercase">ID Cliente</label>
              <div className="flex border-2 border-gray-200 rounded-md overflow-hidden focus-within:border-[#3ab0e2]">
                <input
                  type="text"
                  className="p-3 w-full outline-none bg-white font-mono"
                  value={idCliente}
                  onChange={(e) => setIdCliente(e.target.value)}
                  placeholder="Buscar por ID"
                />
                <button
                  type="button"
                  disabled={buscandoCliente}
                  onClick={handleSearchCliente}
                  className="bg-[#3ab0e2] hover:bg-sky-500 px-4 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Search className="text-white w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600 uppercase">Nombre del cliente</label>
              <div className="flex border-2 border-gray-200 rounded-md overflow-hidden focus-within:border-[#3ab0e2]">
                <input
                  type="text"
                  className="p-3 w-full outline-none bg-white"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Buscar por nombre"
                />
                <button
                  type="button"
                  disabled={buscandoCliente}
                  onClick={handleSearchCliente}
                  className="bg-[#3ab0e2] hover:bg-sky-500 px-4 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Search className="text-white w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-10 min-h-6 text-sm">
            {buscandoCliente && <span className="text-gray-500">Buscando...</span>}
            {selectedClient && !buscandoCliente && (
              <span className="font-bold text-gray-900">Cliente seleccionado: {selectedClient.clientName}</span>
            )}
          </div>

          {selectedClient && (
            <>
              {/* DESCUENTOS YA ASIGNADOS A ESTE CLIENTE */}
              <h2 className="text-lg font-bold text-gray-800 mb-3">Descuentos ya asignados</h2>
              {loadingDiscounts ? (
                <LoadingSpinner />
              ) : clientDiscounts.length === 0 ? (
                <p className="text-sm text-gray-400 italic mb-8">Este cliente todavía no tiene descuentos asignados a ningún producto.</p>
              ) : (
                <div className="flex flex-col gap-2 mb-8">
                  {clientDiscounts.map((d) => (
                    <div key={d.clientProductDiscountID} className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-sm">
                      <span className="font-medium text-gray-800 truncate">{d.product?.productName || d.prodCode}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-[#3ab0e2]">{Math.round(Number(d.discountPercentage) * 100)}%</span>
                        <button
                          onClick={() => handleDeleteProductDiscount(d)}
                          disabled={deletingID === d.clientProductDiscountID}
                          title="Quitar este descuento"
                          className="text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* BUSCAR PRODUCTO PARA ASIGNARLE UN DESCUENTO */}
          <p className="text-sm text-gray-500 italic mb-4">
            Busca un producto y asígnale un porcentaje — el descuento aplica solo cuando este cliente compre justo ese producto.
          </p>
          <div className="mb-10 max-w-md flex">
            <input
              type="text"
              className="flex-1 p-3 border-2 border-gray-200 rounded-l-md outline-none focus:border-[#3ab0e2]"
              placeholder="Nombre o código del producto..."
              value={productoBusqueda}
              onChange={(e) => setProductoBusqueda(e.target.value)}
            />
            <button
              type="button"
              disabled={buscandoProducto}
              onClick={handleSearchProducto}
              className="bg-[#3ab0e2] text-white px-6 rounded-r-md hover:bg-sky-500 transition-colors disabled:opacity-50"
            >
              <Search size={22} />
            </button>
          </div>

          {/* TABLA DE RESULTADOS — escritorio/tablet (>= md) */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg mb-8 hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                <tr>
                  <th className="p-4 border-b">Producto</th>
                  <th className="p-4 border-b">Categoría</th>
                  <th className="p-4 border-b">Precio</th>
                  <th className="p-4 border-b bg-blue-50 text-[#3ab0e2]">Descuento para este cliente</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {buscandoProducto ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 italic">Buscando...</td>
                  </tr>
                ) : resultadosProducto.length > 0 ? (
                  resultadosProducto.map((p) => (
                    <tr key={p.prodCode} className="hover:bg-gray-50">
                      <td className="p-4 font-medium">{p.productName}</td>
                      <td className="p-4">{p.category?.categoryName || '—'}</td>
                      <td className="p-4">${Number(p.salePrice).toFixed(2)}</td>
                      <td className="p-4 bg-blue-50/30">
                        <div className="flex items-center gap-2">
                          <div className="relative w-24">
                            <input
                              type="text"
                              disabled={!selectedClient}
                              placeholder="1-100"
                              value={getPercentInputValue(p.prodCode)}
                              onChange={(e) => handlePercentInputChange(p.prodCode, e.target.value)}
                              className="w-full p-2 pr-6 border-2 border-[#3ab0e2]/40 rounded text-center font-bold outline-none focus:border-[#3ab0e2] disabled:opacity-50"
                            />
                            <span className="absolute right-2 top-2 font-bold text-[#3ab0e2] text-sm">%</span>
                          </div>
                          <button
                            onClick={() => handleSaveProductDiscount(p.prodCode)}
                            disabled={!selectedClient || savingProdCode === p.prodCode}
                            title={selectedClient ? undefined : 'Primero busca y selecciona un cliente'}
                            className="bg-[#3ab0e2] hover:bg-[#16A085] text-white px-3 py-2 rounded text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {savingProdCode === p.prodCode ? '...' : 'Guardar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                      Busca un producto para asignarle un descuento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tarjetas — celulares (< md) */}
          <div className="md:hidden flex flex-col gap-3 mb-8">
            {buscandoProducto ? (
              <p className="text-center text-gray-400 italic py-8">Buscando...</p>
            ) : resultadosProducto.length > 0 ? (
              resultadosProducto.map((p) => (
                <div key={p.prodCode} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-gray-900 text-base leading-tight">{p.productName}</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <div><span className="text-gray-500 block mb-0.5">Categoría</span><span className="font-semibold text-gray-800">{p.category?.categoryName || '—'}</span></div>
                    <div><span className="text-gray-500 block mb-0.5">Precio</span><span className="font-semibold text-gray-800">${Number(p.salePrice).toFixed(2)}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        disabled={!selectedClient}
                        placeholder="1-100"
                        value={getPercentInputValue(p.prodCode)}
                        onChange={(e) => handlePercentInputChange(p.prodCode, e.target.value)}
                        className="w-full p-2 pr-6 border-2 border-[#3ab0e2]/40 rounded text-center font-bold outline-none focus:border-[#3ab0e2] disabled:opacity-50"
                      />
                      <span className="absolute right-2 top-2 font-bold text-[#3ab0e2] text-sm">%</span>
                    </div>
                    <button
                      onClick={() => handleSaveProductDiscount(p.prodCode)}
                      disabled={!selectedClient || savingProdCode === p.prodCode}
                      className="bg-[#3ab0e2] hover:bg-[#16A085] text-white px-4 py-2 rounded text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingProdCode === p.prodCode ? '...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 italic py-8">Busca un producto para asignarle un descuento.</p>
            )}
          </div>
        </div>
      </main>

      {/* Resultados de la búsqueda de cliente: lista con checkbox (uno solo) */}
      {clientModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md flex flex-col gap-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900">Resultados de la búsqueda</h2>
            {clientModal.results.length === 0 ? (
              <p className="text-gray-500 text-sm">No se encontró ningún cliente con ese ID o nombre.</p>
            ) : (
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                {clientModal.results.map((c) => (
                  <label
                    key={c.clientCode}
                    className="flex items-center gap-3 text-sm py-2 px-2 rounded border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={clientModal.pickedCode === c.clientCode}
                      onChange={() => setClientModal({ ...clientModal, pickedCode: c.clientCode })}
                      className="w-4 h-4 accent-sky-500 cursor-pointer"
                    />
                    <span className="text-gray-800">{c.clientName}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setClientModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const picked = clientModal.results.find((c) => c.clientCode === clientModal.pickedCode) ?? null;
                  if (picked) handlePickClient(picked);
                  setClientModal(null);
                }}
                disabled={!clientModal.pickedCode}
                className="bg-[#3ab0e2] hover:bg-sky-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

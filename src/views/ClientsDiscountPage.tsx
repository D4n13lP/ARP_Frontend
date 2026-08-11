import { useState } from 'react';
import { TicketPercent, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import logoEmpresa from '../assets/logo_empresa.jpg';
import { getClients, updateClient } from '../api/clients';
import { getProducts } from '../api/products';
import { getErrorMessage } from '../utils/errorMessage';
import type { Client, Product } from '../types';

export default function ClientDiscountSetup_Page() {
  const navigate = useNavigate();

  // --- BÚSQUEDA DE CLIENTE (mismo patrón que SaleSummary: ID/nombre -> modal con resultados) ---
  const [idCliente, setIdCliente] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clientes, setClientes] = useState<Client[]>([]);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clientModal, setClientModal] = useState<{ results: Client[]; pickedCode: string | null } | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [porcentaje, setPorcentaje] = useState<number | string>('');
  const [saving, setSaving] = useState(false);

  // --- VISTA PREVIA CON PRODUCTOS REALES (no se guarda nada por producto: el
  // descuento del cliente es un único porcentaje aplicado a toda su compra;
  // esta tabla solo ayuda a ver cómo quedaría el precio de un producto real) ---
  const [productos, setProductos] = useState<Product[]>([]);
  const [productoBusqueda, setProductoBusqueda] = useState('');
  const [buscandoProducto, setBuscandoProducto] = useState(false);
  const [resultadosProducto, setResultadosProducto] = useState<Product[]>([]);

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
    setPorcentaje(client.discountPercentage ? Math.round(Number(client.discountPercentage) * 100) : '');
  };

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

  // --- LÓGICA DE CÁLCULO DINÁMICO ---
  const calcularPrecioConDescuento = (precioOriginal: number) => {
    const p = typeof porcentaje === 'number' ? porcentaje : 0;
    if (p <= 0) return precioOriginal.toFixed(2);
    const descuento = precioOriginal * (p / 100);
    return (precioOriginal - descuento).toFixed(2);
  };

  const handlePorcentajeChange = (val: string) => {
    if (val === '') { setPorcentaje(''); return; }
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1 && num <= 100) setPorcentaje(num);
  };

  const handleGuardar = async () => {
    if (!selectedClient) {
      alert('Busca y selecciona un cliente.');
      return;
    }
    if (porcentaje === '') {
      alert('Ingresa el porcentaje de descuento.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateClient(selectedClient.clientCode, { discountPercentage: Number(porcentaje) / 100 });
      setSelectedClient(updated);
      setClientes((prev) => prev.map((c) => (c.clientCode === updated.clientCode ? updated : c)));
      alert('Descuento del cliente actualizado correctamente.');
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo guardar el descuento del cliente.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col">
      <div className="max-w-7xl mx-auto w-full mb-4">
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
              <span className="font-bold text-gray-900">
                Cliente seleccionado: {selectedClient.clientName}
                {selectedClient.discountPercentage ? ` (descuento actual: ${Math.round(Number(selectedClient.discountPercentage) * 100)}%)` : ' (sin descuento asignado)'}
              </span>
            )}
          </div>

          {/* VISTA PREVIA CON PRODUCTO REAL */}
          <p className="text-sm text-gray-500 italic mb-4">
            El descuento se aplica de forma global a todas las compras del cliente. Busca un producto solo para previsualizar el precio con el porcentaje capturado abajo.
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

          {/* TABLA CON CÁLCULO DINÁMICO */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg mb-8">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                <tr>
                  <th className="p-4 border-b">Producto</th>
                  <th className="p-4 border-b">Categoría</th>
                  <th className="p-4 border-b">Precio</th>
                  <th className="p-4 border-b bg-blue-50 text-[#3ab0e2]">Precio con descuento</th>
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
                      <td className="p-4 font-bold text-[#3ab0e2] bg-blue-50/30">
                        ${calcularPrecioConDescuento(Number(p.salePrice))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                      Busca un producto para ver el cálculo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER: PORCENTAJE Y BOTÓN */}
          <div className="flex flex-col md:flex-row items-center gap-6 justify-end border-t border-gray-100 pt-8">
            <div className="flex items-center gap-4">
              <label className="font-bold text-gray-700">Porcentaje de descuento:</label>
              <div className="relative w-32">
                <input
                  type="text"
                  placeholder="1 - 100"
                  className="w-full p-2 pr-8 border-2 border-[#3ab0e2] rounded text-center font-bold outline-none"
                  value={porcentaje}
                  onChange={(e) => handlePorcentajeChange(e.target.value)}
                />
                <span className="absolute right-3 top-2.5 font-bold text-[#3ab0e2]">%</span>
              </div>
            </div>

            <button
              onClick={handleGuardar}
              disabled={!selectedClient || saving}
              className={`px-12 py-3 rounded shadow-lg transition-all font-bold text-white ${!selectedClient || saving ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#3ab0e2] hover:bg-[#16A085] cursor-pointer'}`}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
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

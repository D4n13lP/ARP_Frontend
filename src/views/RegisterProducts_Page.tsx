import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, RefreshCw, Zap } from 'lucide-react';
import { ROUTES } from '../routes';
import { getCategories, createCategory } from '../api/categories';
import { getWarehouses } from '../api/warehouses';
import { createProduct, updateProduct, deleteProduct } from '../api/products';
import { createInventory } from '../api/inventory';
import { API_BASE_URL } from '../api/http';
import type { Product, Warehouse } from '../types';

export default function RegisterProducts_Page() {
  const navigate = useNavigate();
  const nombreInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    cantidad: '',
    costo: '',
    precioVenta: '',
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [whID, setWhID] = useState('');

  // Igual que Agregar Producto: el código y el SKU los genera la base de
  // datos. Se reserva un producto borrador (nombre vacío) apenas se puede,
  // y de ahí en adelante cada "Registrar Producto" solo lo completa — no
  // crea uno nuevo. Si el usuario abandona sin terminar, el borrador se borra.
  const [draftProduct, setDraftProduct] = useState<Product | null>(null);
  const draftRef = useRef<Product | null>(null);

  // Se incrementa en cada llamada a reserveDraft (montaje, StrictMode
  // remontando en desarrollo, o el siguiente registro tras uno exitoso). Cada
  // llamada recuerda "su" número; si al resolver ya no es el número vigente,
  // significa que otra reserva más nueva la superó — se autoborra en vez de
  // pisar el borrador correcto (con una bandera simple, la primera reserva de
  // StrictMode terminaba "reviviendo" porque el remontaje real la reseteaba).
  const draftGenerationRef = useRef(0);

  async function reserveDraft() {
    const myGeneration = ++draftGenerationRef.current;
    try {
      const created = await createProduct({ productName: '', prodType: 'warehouse', cost: 0, salePrice: 0, lowStock: 0 });
      if (myGeneration !== draftGenerationRef.current) {
        // ya se pidió otra reserva más nueva mientras esta estaba en camino
        deleteProduct(created.prodCode).catch(() => {});
        return;
      }
      draftRef.current = created;
      setDraftProduct(created);
    } catch {
      if (myGeneration === draftGenerationRef.current) {
        alert('No se pudo reservar un código de producto. Intenta de nuevo.');
      }
    }
  }

  useEffect(() => {
    // StrictMode (activo en main.tsx) monta este efecto dos veces seguidas en
    // desarrollo (monta → "desmonta" de prueba → vuelve a montar). El contador
    // de generación en reserveDraft ya distingue la reserva vieja (se autoborra
    // al resolver) de la que sí se queda — sin él, ambas terminaban peleándose
    // por el mismo estado y el campo se quedaba pegado en "Generando…".
    getCategories().then((data) => setCategories(data.map((c) => c.categoryName)));
    getWarehouses().then((data) => {
      setWarehouses(data);
      if (data.length > 0) setWhID(data[0].whID);
    });

    reserveDraft();

    const cleanupOnUnload = () => {
      if (draftRef.current) {
        // best-effort: si se cierra la pestaña, el navegador puede no completar la petición
        fetch(`${API_BASE_URL}/products/${draftRef.current.prodCode}`, { method: 'DELETE', keepalive: true }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', cleanupOnUnload);

    return () => {
      window.removeEventListener('beforeunload', cleanupOnUnload);
      // el usuario navegó a otra pantalla de la SPA (o StrictMode probó la
      // limpieza) sin terminar el registro actual
      if (draftRef.current) {
        deleteProduct(draftRef.current.prodCode).catch(() => {});
        draftRef.current = null;
      }
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!draftProduct) {
      alert('Espera a que se genere el código del producto.');
      return;
    }

    try {
      const trimmedCategoria = formData.categoria.trim();
      const existingCategories = await getCategories();
      const existing = existingCategories.find(c => c.categoryName.trim().toLowerCase() === trimmedCategoria.toLowerCase());
      const categoryID = existing ? existing.categoryID : (await createCategory(trimmedCategoria)).categoryID;

      const newProduct = await updateProduct(draftProduct.prodCode, {
        productName: formData.nombre,
        cost: Number(formData.costo) || 0,
        salePrice: Number(formData.precioVenta) || 0,
        categoryID,
      });

      if (whID) {
        try {
          await createInventory({ prodCode: newProduct.prodCode, whID, quantity: Number(formData.cantidad) || 0 });
        } catch (inventoryError) {
          // El producto ya se completó pero el inventario no — sin este
          // rollback quedaría un producto "fantasma" sin existencias, con su
          // código ya usado. Lo borramos y dejamos listo un borrador nuevo
          // para poder reintentar sin recargar la página.
          await deleteProduct(newProduct.prodCode).catch(() => {});
          draftRef.current = null;
          setDraftProduct(null);
          reserveDraft();
          throw inventoryError;
        }
      }

      // Este borrador ya quedó registrado con éxito: reservamos el siguiente
      // código antes de limpiar el formulario, para seguir capturando rápido.
      draftRef.current = null;
      setDraftProduct(null);
      reserveDraft();

      // Reset form but keep category and almacén
      setFormData({
        nombre: '',
        categoria: formData.categoria,
        cantidad: '',
        costo: '',
        precioVenta: '',
      });

      if (nombreInputRef.current) {
        nombreInputRef.current.focus();
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Ocurrió un error al registrar el producto.');
    }
  };

  const formClassName = "w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e65100] focus:ring-4 focus:ring-orange-100 focus:outline-none placeholder-gray-400 text-sm font-medium bg-white text-gray-800 transition-colors";
  const labelClassName = "block text-sm font-bold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in pb-12">
      {/* Mismo aspecto que el encabezado de Clientes: borde inferior, título
          centrado a este tamaño/color. Aquí no hay logo de la empresa — en su
          lugar va el botón Volver (a la izquierda) y se conserva el ícono
          Zap que ya identificaba esta pantalla. */}
      <header className="relative py-6 mb-2 border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center h-16">
          <button
            onClick={() => navigate(ROUTES.PRODUCTS.ADD_PRODUCTS)}
            className="absolute left-4 sm:left-6 lg:left-8 text-gray-500 hover:text-[#e65100] flex items-center gap-2 transition-colors duration-300 text-sm font-medium"
          >
            <ArrowLeft size={18} /> Volver
          </button>
          <div className="flex items-center gap-3 text-[#e65100]">
            <Zap size={40} strokeWidth={1.5} />
            <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-center whitespace-nowrap">
              Registro Rápido
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="mb-6 border-l-4 border-[#e65100] pl-4">
              <h2 className="text-lg font-bold text-gray-800">Carga rápida de inventario</h2>
              <p className="text-sm text-gray-500 mt-1">
                El código lo genera el sistema, igual que en Agregar Producto. La categoría se mantiene entre registros.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <datalist id="quickCategoriesList">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código de producto / SKU: lo genera la base de datos, aquí solo se muestra */}
                <div>
                  <label className={labelClassName}>Código / SKU</label>
                  <input
                    type="text"
                    value={draftProduct?.sku || 'Generando…'}
                    readOnly
                    disabled
                    title={draftProduct?.prodCode}
                    className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-500 placeholder-gray-400 text-sm font-medium cursor-not-allowed"
                  />
                </div>

                {/* Nombre del Producto */}
                <div>
                  <label className={labelClassName}>Nombre del producto</label>
                  <input
                    ref={nombreInputRef}
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej. Maceta de barro grande"
                    className={formClassName}
                    required
                  />
                </div>

                {/* Categoría (Editable Dropdown) */}
                <div>
                  <label className={labelClassName}>Categoría</label>
                  <input
                    list="quickCategoriesList"
                    value={formData.categoria}
                    onChange={(e) => handleInputChange('categoria', e.target.value)}
                    placeholder="Seleccione o escriba una categoría..."
                    className={formClassName}
                    required
                  />
                </div>

                {/* Cantidad */}
                <div>
                  <label className={labelClassName}>Cantidad</label>
                  <input
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) => handleInputChange('cantidad', e.target.value)}
                    placeholder="Ej. 10"
                    className={formClassName}
                    required
                  />
                </div>

                {/* Almacén destino */}
                <div>
                  <label className={labelClassName}>Almacén</label>
                  <select
                    value={whID}
                    onChange={(e) => setWhID(e.target.value)}
                    className={formClassName}
                    required
                  >
                    <option value="" disabled>Selecciona un almacén</option>
                    {warehouses.map((w) => (
                      <option key={w.whID} value={w.whID}>{w.whname}</option>
                    ))}
                  </select>
                </div>

                {/* Costo */}
                <div>
                  <label className={labelClassName}>Costo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costo}
                      onChange={(e) => handleInputChange('costo', e.target.value)}
                      placeholder="0.00"
                      className={`${formClassName} pl-8`}
                      required
                    />
                  </div>
                </div>

                {/* Precio Venta */}
                <div>
                  <label className={labelClassName}>Precio Venta</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.precioVenta}
                      onChange={(e) => handleInputChange('precioVenta', e.target.value)}
                      placeholder="0.00"
                      className={`${formClassName} pl-8`}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-4 border-t pt-6">
                <button
                  type="button"
                  onClick={() => setFormData({ nombre: '', categoria: '', cantidad: '', costo: '', precioVenta: '' })}
                  className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} /> Limpiar Todo
                </button>
                <button
                  type="submit"
                  disabled={!draftProduct}
                  className="px-8 py-2.5 text-sm font-bold text-white bg-[#e65100] hover:bg-[#cc4800] rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg focus:ring-4 focus:ring-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check size={18} /> Registrar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

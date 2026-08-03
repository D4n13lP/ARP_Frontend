import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, RefreshCw, Zap } from 'lucide-react';
import { ROUTES } from '../routes';
import { getCategories, createCategory } from '../api/categories';
import { getWarehouses } from '../api/warehouses';
import { createProduct } from '../api/products';
import { createInventory } from '../api/inventory';
import type { Warehouse } from '../types';

export default function RegisterProducts_Page() {
  const navigate = useNavigate();
  const codigoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    cantidad: '',
    costo: '',
    precioVenta: '',
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [whID, setWhID] = useState('');

  useEffect(() => {
    getCategories().then((data) => setCategories(data.map((c) => c.categoryName)));
    getWarehouses().then((data) => {
      setWarehouses(data);
      if (data.length > 0) setWhID(data[0].whID);
    });
    // Focus in on load for scanner
    if (codigoInputRef.current) {
      codigoInputRef.current.focus();
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const trimmedCategoria = formData.categoria.trim();
      const existingCategories = await getCategories();
      const existing = existingCategories.find(c => c.categoryName.trim().toLowerCase() === trimmedCategoria.toLowerCase());
      const categoryID = existing ? existing.categoryID : (await createCategory(trimmedCategoria)).categoryID;

      const newProduct = await createProduct({
        productName: formData.nombre,
        sku: formData.codigo,
        prodType: 'warehouse',
        cost: Number(formData.costo) || 0,
        salePrice: Number(formData.precioVenta) || 0,
        categoryID,
      });

      if (whID) {
        await createInventory({ prodCode: newProduct.prodCode, whID, quantity: Number(formData.cantidad) || 0 });
      }

      // Reset form but keep category and almacén
      setFormData({
        codigo: '',
        nombre: '',
        categoria: formData.categoria,
        cantidad: '',
        costo: '',
        precioVenta: '',
      });

      if (codigoInputRef.current) {
        codigoInputRef.current.focus();
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Ocurrió un error al registrar el producto.');
    }
  };

  const formClassName = "w-full px-3 py-2 border border-gray-300 rounded focus:border-[#e65100] focus:ring-4 focus:ring-orange-100 focus:outline-none placeholder-gray-400 text-sm font-medium bg-white text-gray-800 transition-colors";
  const labelClassName = "block text-sm font-bold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in pb-12">
      <div className="bg-white border-b shadow-sm sticky top-0 z-10 px-6 py-4 flex items-center justify-between relative">
        <button
          onClick={() => navigate(ROUTES.PRODUCTS.ADD_PRODUCTS)}
          className="text-gray-500 hover:text-[#e65100] flex items-center gap-2 transition-colors duration-300 text-sm font-medium"
        >
          <ArrowLeft size={18} /> Volver
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
          <Zap className="text-[#e65100]" size={36} /><h1 className="text-3xl md:text-[40px] font-normal text-[#e65100] whitespace-nowrap">Registro Rápido</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="mb-6 border-l-4 border-[#e65100] pl-4">
              <h2 className="text-lg font-bold text-gray-800">Carga rápida de inventario</h2>
              <p className="text-sm text-gray-500 mt-1">
                Optimizado para pistolas de código de barras. La categoría se mantiene entre registros.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <datalist id="quickCategoriesList">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código de producto / SKU */}
                <div>
                  <label className={labelClassName}>Código / SKU</label>
                  <input
                    ref={codigoInputRef}
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => handleInputChange('codigo', e.target.value)}
                    placeholder="Escanea o escribe el código"
                    className={formClassName}
                    required
                  />
                </div>

                {/* Nombre del Producto */}
                <div>
                  <label className={labelClassName}>Nombre del producto</label>
                  <input
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
                  onClick={() => setFormData({ codigo: '', nombre: '', categoria: '', cantidad: '', costo: '', precioVenta: '' })}
                  className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} /> Limpiar Todo
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 text-sm font-bold text-white bg-[#e65100] hover:bg-[#cc4800] rounded-lg transition-colors flex items-center gap-2 shadow-md hover:shadow-lg focus:ring-4 focus:ring-orange-100"
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

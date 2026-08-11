import { useEffect, useState } from 'react';
import { TicketPercent, Search, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getCategories, updateCategory } from '../api/categories';
import { getProducts, updateProduct } from '../api/products';
import { getPromos, createPromo, updatePromo } from '../api/promos';
import { getErrorMessage } from '../utils/errorMessage';
import type { Category, Product, Promo } from '../types';

export default function PromotionSetup_Page() {
  const navigate = useNavigate();

  // --- ESTADOS DE LÓGICA ---
  const [isProductSpecific, setIsProductSpecific] = useState(false);
  const [porcentaje, setPorcentaje] = useState<number | string>('');
  const [busquedaCat, setBusquedaCat] = useState('');
  const [categoriaSel, setCategoriaSel] = useState(''); // categoryID

  const [productoBusqueda, setProductoBusqueda] = useState('');
  const [buscandoProducto, setBuscandoProducto] = useState(false);
  const [resultadosProducto, setResultadosProducto] = useState<Product[]>([]);
  const [productoSel, setProductoSel] = useState<Product | null>(null);

  const [saving, setSaving] = useState(false);

  // --- CATÁLOGOS REALES ---
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [productos, setProductos] = useState<Product[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    getCategories().then(setCategorias).catch((error) => alert(getErrorMessage(error, 'No se pudieron cargar las categorías.')));
    getPromos().then(setPromos).catch(() => {});
  }, []);

  const categoriasFiltradas = busquedaCat.trim()
    ? categorias.filter((c) => c.categoryName.toLowerCase().includes(busquedaCat.trim().toLowerCase()))
    : categorias;

  const categoriaActual = categorias.find((c) => c.categoryID === categoriaSel) || null;
  const promoDeCategoria = categoriaActual?.discountID
    ? promos.find((p) => p.discountID === categoriaActual.discountID)
    : null;

  // Al elegir categoría o producto, se precarga el % del promo que ya tuviera
  // asignado (si tiene) — evita "perder" el descuento existente al abrir.
  const handleSelectCategoria = (categoryID: string) => {
    setCategoriaSel(categoryID);
    const cat = categorias.find((c) => c.categoryID === categoryID);
    setBusquedaCat(cat?.categoryName || '');
    const promo = cat?.discountID ? promos.find((p) => p.discountID === cat.discountID) : null;
    setPorcentaje(promo ? Math.round(Number(promo.discountPercentage) * 100) : '');
  };

  const handleSelectProducto = (producto: Product) => {
    setProductoSel(producto);
    const promo = producto.discountID ? promos.find((p) => p.discountID === producto.discountID) || producto.promo : null;
    setPorcentaje(promo ? Math.round(Number(promo.discountPercentage) * 100) : '');
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

  // --- VALIDACIÓN DE PORCENTAJE ---
  const handlePorcentajeChange = (val: string) => {
    const num = parseInt(val);
    if (val === '') { setPorcentaje(''); return; }
    if (!isNaN(num) && num >= 1 && num <= 100) {
      setPorcentaje(num);
    }
  };

  const calcularPrecioConDescuento = (precioOriginal: number) => {
    const p = typeof porcentaje === 'number' ? porcentaje : 0;
    if (p <= 0) return precioOriginal.toFixed(2);
    return (precioOriginal - precioOriginal * (p / 100)).toFixed(2);
  };

  const handleGuardar = async () => {
    if (porcentaje === '') {
      alert('Ingresa el porcentaje de descuento.');
      return;
    }
    if (isProductSpecific && !productoSel) {
      alert('Busca y selecciona un producto.');
      return;
    }
    if (!isProductSpecific && !categoriaSel) {
      alert('Selecciona una categoría.');
      return;
    }
    setSaving(true);
    try {
      const fraccion = Number(porcentaje) / 100;
      const existingDiscountID = isProductSpecific ? productoSel!.discountID : categoriaActual!.discountID;

      const promo = existingDiscountID
        ? await updatePromo(existingDiscountID, { discountPercentage: fraccion })
        : await createPromo(fraccion);

      if (isProductSpecific) {
        const updated = await updateProduct(productoSel!.prodCode, { discountID: promo.discountID });
        setProductoSel(updated);
        setResultadosProducto((prev) => prev.map((p) => (p.prodCode === updated.prodCode ? updated : p)));
        setProductos((prev) => prev.map((p) => (p.prodCode === updated.prodCode ? updated : p)));
      } else {
        const updated = await updateCategory(categoriaActual!.categoryID, { discountID: promo.discountID });
        setCategorias((prev) => prev.map((c) => (c.categoryID === updated.categoryID ? updated : c)));
      }
      setPromos((prev) => {
        const next = prev.filter((p) => p.discountID !== promo.discountID);
        return [...next, promo];
      });
      alert('Promoción guardada correctamente.');
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo guardar la promoción.'));
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
        {/* TÍTULO Y BANNER */}
        <div className="flex items-center gap-6 mb-8 text-[#e65100]">
          <div className="flex flex-col">
            <h1 className="text-4xl font-normal">Descuentos</h1>
            <span className="text-xl text-gray-500 font-light italic">Promoción</span>
          </div>
          <TicketPercent className="text-[#e65100]" size={60} strokeWidth={1.2} />
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">

          {/* SECCIÓN 1: CATEGORÍA (Deshabilitable) */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 transition-opacity ${isProductSpecific ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex flex-col gap-2">
              <label className="text-lg font-medium text-gray-700">Categoría</label>
              <div className="relative">
                <input
                  type="text"
                  list="categorias-list"
                  placeholder="Buscar categoría..."
                  className="w-full p-3 border-2 border-gray-200 rounded-md focus:border-[#3ab0e2] outline-none"
                  value={busquedaCat}
                  onChange={(e) => {
                    setBusquedaCat(e.target.value);
                    const match = categorias.find((c) => c.categoryName.toLowerCase() === e.target.value.trim().toLowerCase());
                    if (match) handleSelectCategoria(match.categoryID);
                  }}
                />
                <datalist id="categorias-list">
                  {categoriasFiltradas.map((cat) => <option key={cat.categoryID} value={cat.categoryName} />)}
                </datalist>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-end">
              <div className="relative">
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-md appearance-none bg-gray-50 cursor-pointer outline-none focus:border-[#3ab0e2]"
                  value={categoriaSel}
                  onChange={(e) => handleSelectCategoria(e.target.value)}
                >
                  <option value="">Seleccionar categoría...</option>
                  {categorias.map((cat) => <option key={cat.categoryID} value={cat.categoryID}>{cat.categoryName}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-4 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>

          {/* CHECKBOX DE CONTROL */}
          <div className="flex items-center gap-3 mb-10 p-4 bg-blue-50/50 rounded-lg border border-blue-100 w-fit">
            <input
              type="checkbox"
              id="specific"
              className="w-5 h-5 accent-[#3ab0e2] cursor-pointer"
              checked={isProductSpecific}
              onChange={(e) => {
                setIsProductSpecific(e.target.checked);
                setPorcentaje('');
              }}
            />
            <label htmlFor="specific" className="text-lg font-semibold text-gray-800 cursor-pointer">
              Descuento en productos específicos
            </label>
          </div>

          {/* SECCIÓN 2: PRODUCTO ESPECÍFICO (Habilitable) */}
          <div className={`mb-10 transition-all ${!isProductSpecific ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <div className="max-w-md flex shadow-sm">
              <input
                type="text"
                placeholder="Nombre del producto o código..."
                className="flex-1 p-3 border-2 border-gray-200 rounded-l-md outline-none focus:border-[#3ab0e2]"
                value={productoBusqueda}
                onChange={(e) => setProductoBusqueda(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSearchProducto}
                disabled={buscandoProducto}
                className="bg-[#3ab0e2] text-white px-6 rounded-r-md hover:bg-[#16A085] transition-colors cursor-pointer disabled:opacity-50"
              >
                <Search size={22} />
              </button>
            </div>
          </div>

          {/* TABLA DINÁMICA */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg mb-8">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-600 text-sm font-bold">
                <tr>
                  <th className="p-4 border-b">Producto</th>
                  <th className="p-4 border-b">Categoría</th>
                  <th className="p-4 border-b">Estado</th>
                  <th className="p-4 border-b">Precio</th>
                  <th className="p-4 border-b bg-blue-50 text-[#3ab0e2]">Precio c/Desc</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isProductSpecific ? (
                  buscandoProducto ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Buscando...</td></tr>
                  ) : resultadosProducto.length === 0 ? (
                    <tr className="border-b border-gray-50 italic text-gray-400">
                      <td colSpan={5} className="p-8 text-center">Busque un producto para mostrar resultados</td>
                    </tr>
                  ) : (
                    resultadosProducto.map((p) => (
                      <tr
                        key={p.prodCode}
                        onClick={() => handleSelectProducto(p)}
                        className={`cursor-pointer hover:bg-gray-50 ${productoSel?.prodCode === p.prodCode ? 'bg-blue-50/60' : ''}`}
                      >
                        <td className="p-4 font-medium">{p.productName}</td>
                        <td className="p-4">{p.category?.categoryName || '—'}</td>
                        <td className="p-4">
                          {p.discountID ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">CON PROMO</span> : <span className="text-gray-400 text-xs">Sin promo</span>}
                        </td>
                        <td className="p-4">${Number(p.salePrice).toFixed(2)}</td>
                        <td className="p-4 font-bold text-[#3ab0e2] bg-blue-50/30">
                          ${productoSel?.prodCode === p.prodCode ? calcularPrecioConDescuento(Number(p.salePrice)) : Number(p.salePrice).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  // Fila única para Categoría
                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium">Todos los productos</td>
                    <td className="p-4">{categoriaActual?.categoryName || busquedaCat || 'Sin categoría seleccionada'}</td>
                    <td className="p-4">
                      {promoDeCategoria ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">CON PROMO ({Math.round(Number(promoDeCategoria.discountPercentage) * 100)}%)</span> : <span className="text-gray-400 text-xs">Sin promo</span>}
                    </td>
                    <td className="p-4">---</td>
                    <td className="p-4 font-bold text-[#3ab0e2]">Variable %</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* SECCIÓN 3: PORCENTAJE (SIEMPRE HABILITADO) */}
          <div className="flex flex-col md:flex-row items-center gap-4 justify-end border-t border-gray-100 pt-8">
            <div className="flex items-center gap-4">
              <label className="font-bold text-gray-700">Porcentaje de descuento:</label>
              <div className="relative w-32">
                <input
                  type="text"
                  placeholder="1 - 100"
                  className="w-full p-2 pr-8 border-2 border-[#3ab0e2] rounded outline-none text-center font-bold"
                  value={porcentaje}
                  onChange={(e) => handlePorcentajeChange(e.target.value)}
                />
                <span className="absolute right-3 top-2.5 font-bold text-[#3ab0e2]">%</span>
              </div>
            </div>

            <button
              onClick={handleGuardar}
              disabled={saving}
              className="bg-[#3ab0e2] hover:bg-[#16A085] text-white px-12 py-3 rounded shadow-lg transition-all font-bold cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

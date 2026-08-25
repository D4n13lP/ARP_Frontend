import { ShoppingCart } from 'lucide-react';

export interface ProductData {
  id: string; // inventoryID: cada fila es un registro de "inventory" (producto + almacén)
  prodCode: string; // el producto en sí (varias filas pueden compartirlo, una por almacén)
  nombre: string;
  categoria: string;
  almacen: string;
  cantidadDisponible: number;
  precio: number;
  promocion: number; // porcentaje 0-100, ej. 10 para 10%
  unidad: string; // productUnit.produnitName registrada en el producto
}

interface ProductSearchTableProps {
  products: ProductData[];
  // Las cantidades capturadas viven en el componente padre (ver RegisterSale_Page):
  // la tabla se va llenando con cada búsqueda en vez de reiniciarse, así que el
  // padre es quien decide cuándo aparece una fila nueva (y arranca en 0) sin
  // tocar lo que ya se había escrito en las demás.
  amounts: Record<string, number>;
  onAmountChange: (id: string, value: string, max: number) => void;
  onAddSelected: (selectedProducts: { product: ProductData, amount: number }[]) => void;
  onClear: () => void;
}

export default function ProductSearchTable({ products, amounts, onAmountChange, onAddSelected, onClear }: ProductSearchTableProps) {
  const handleAdd = () => {
    const selected = products
      .filter(p => amounts[p.id] > 0)
      .map(p => ({ product: p, amount: amounts[p.id] }));
    onAddSelected(selected);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="text-cyan-500 w-8 h-8" />
        <h3 className="font-bold text-gray-800">Productos en el carrito</h3>
        <span className="ml-auto font-bold text-gray-800 mr-20">Producto encontrado</span>
      </div>

      {/* Tabla — escritorio/tablet (>= md), intacta */}
      <div className="hidden md:block overflow-x-auto border border-gray-300 rounded mb-4">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
            <tr>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Producto</th>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Categoría</th>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Almacén</th>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Cantidad disponible</th>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Precio unidad</th>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Estado</th>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Cantidad</th>
              <th className="py-3 px-4 font-semibold">Unidad</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-gray-400 italic">
                  No se encontraron productos con existencia en ningún almacén.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-gray-300 last:border-b-0">
                  <td className="py-3 px-4 border-r border-gray-300">{product.nombre}</td>
                  <td className="py-3 px-4 border-r border-gray-300">{product.categoria}</td>
                  <td className="py-3 px-4 border-r border-gray-300">{product.almacen}</td>
                  <td className="py-3 px-4 border-r border-gray-300">{product.cantidadDisponible.toLocaleString()}</td>
                  <td className="py-3 px-4 border-r border-gray-300">${product.precio.toFixed(2)}</td>
                  <td className="py-3 px-4 border-r border-gray-300">
                    {product.cantidadDisponible > 0 ? 'Disponible' : 'Agotado'}
                  </td>
                  <td className="py-3 px-4 border-r border-gray-300 flex justify-center items-center">
                    <input
                      type="number"
                      min="0"
                      max={product.cantidadDisponible}
                      value={!amounts[product.id] ? '' : amounts[product.id]}
                      onChange={(e) => onAmountChange(product.id, e.target.value, product.cantidadDisponible)}
                      placeholder="0"
                      disabled={product.cantidadDisponible === 0}
                      className="w-16 border rounded text-center p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-4">{product.unidad || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tarjetas — celulares (< md). Mismo diseño que Inventory.tsx, mismos
          datos/handlers que la tabla de arriba, nada nuevo. */}
      <div className="md:hidden flex flex-col gap-3 mb-4">
        {products.length === 0 ? (
          <p className="text-center text-gray-400 italic text-sm py-6">
            No se encontraron productos con existencia en ningún almacén.
          </p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 text-base leading-tight truncate">{product.nombre}</h4>
                  <span className="text-xs text-gray-500">{product.categoria || 'Sin categoría'}</span>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${product.cantidadDisponible === 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {product.cantidadDisponible > 0 ? 'Disponible' : 'Agotado'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <div>
                  <span className="text-gray-500 block mb-0.5">Almacén</span>
                  <span className="font-semibold text-gray-800">{product.almacen || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Cantidad disponible</span>
                  <span className="font-semibold text-gray-800">{product.cantidadDisponible.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Precio unidad</span>
                  <span className="font-semibold text-gray-800">${product.precio.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Unidad</span>
                  <span className="font-semibold text-gray-800">{product.unidad || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block mb-0.5">Cantidad a agregar</span>
                  <input
                    type="number"
                    min="0"
                    max={product.cantidadDisponible}
                    value={!amounts[product.id] ? '' : amounts[product.id]}
                    onChange={(e) => onAmountChange(product.id, e.target.value, product.cantidadDisponible)}
                    placeholder="0"
                    disabled={product.cantidadDisponible === 0}
                    className="w-full border border-gray-300 rounded text-center py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClear}
          className="border border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold py-2 px-6 rounded shadow-sm transition-colors"
        >
          Limpiar
        </button>
        <button
          onClick={handleAdd}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded shadow-sm transition-colors"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}

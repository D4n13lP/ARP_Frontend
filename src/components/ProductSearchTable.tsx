import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

interface ProductData {
  id: string;
  nombre: string;
  categoria: string;
  cantidadDisponible: number;
  precio: number;
}

interface ProductSearchTableProps {
  products: ProductData[];
  onAddSelected: (selectedProducts: { product: ProductData, amount: number }[]) => void;
}

export default function ProductSearchTable({ products, onAddSelected }: ProductSearchTableProps) {
  const [amounts, setAmounts] = useState<Record<string, number>>(
    products.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {})
  );

  const handleAmountChange = (id: string, value: string, max: number) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
      numValue = 0;
    }
    if (numValue > max) {
      numValue = max;
    }
    setAmounts(prev => ({ ...prev, [id]: numValue }));
  };

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

      <div className="overflow-x-auto border border-gray-300 rounded mb-4">
        <table className="w-full text-sm text-center">
          <thead className="bg-gray-100 text-gray-700 border-b border-gray-300">
            <tr>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Producto</th>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Categoría</th>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Cantidad disponible</th>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Precio unidad</th>
              <th className="py-3 px-4 font-semibold border-r border-gray-300">Estado</th>
              <th className="py-3 px-4 font-semibold">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-300 last:border-b-0">
                <td className="py-3 px-4 border-r border-gray-300">{product.nombre}</td>
                <td className="py-3 px-4 border-r border-gray-300">{product.categoria}</td>
                <td className="py-3 px-4 border-r border-gray-300">{product.cantidadDisponible.toLocaleString()}</td>
                <td className="py-3 px-4 border-r border-gray-300">${product.precio.toFixed(2)}</td>
                <td className="py-3 px-4 border-r border-gray-300">
                  {product.cantidadDisponible > 0 ? 'Disponible' : 'Agotado'}
                </td>
                <td className="py-3 px-4 flex justify-center items-center">
                  <input
                    type="number"
                    min="0"
                    max={product.cantidadDisponible}
                    value={amounts[product.id] === 0 ? '' : amounts[product.id]}
                    onChange={(e) => handleAmountChange(product.id, e.target.value, product.cantidadDisponible)}
                    placeholder="0"
                    disabled={product.cantidadDisponible === 0}
                    className="w-16 border rounded text-center p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
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
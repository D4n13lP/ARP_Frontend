// import React from 'react';
// import { Search, ChevronUp, ChevronDown } from 'lucide-react';
// import { useAppStore } from '../stores/useAppStore'; // Importamos el store central

// export default function Inventory() {
//   // Consumimos el estado global siguiendo el patrón de tu proyecto
//   const productos = useAppStore((state) => state.productos);
//   const setBusqueda = useAppStore((state) => state.setBusqueda);

//   const columnas = [
//     { label: 'Producto', key: 'nombre' },
//     { label: 'Categoría', key: 'categoria' },
//     { label: 'Cantidad disponible', key: 'stock' },
//     { label: 'Pendientes de entregar', key: 'pendientes' },
//     { label: 'Estado', key: 'estado' },
//     { label: 'Opciones', key: 'opciones' },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-sans text-gray-800">
//       <div className="flex justify-between items-end mb-4 max-w-7xl mx-auto px-4">
//         <div className="flex items-baseline gap-6">
//           <h1 className="text-4xl font-bold text-[#e65100]">Inventario</h1>
//           <h2 className="text-2xl font-normal text-gray-600">General</h2>
//         </div>
//         <button className="bg-[#3ab0e2] text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-[#2a90ba] transition shadow-sm">
//           Repartidores
//         </button>
//       </div>

//       <div className="bg-white rounded-lg shadow-md border border-gray-200 max-w-7xl mx-auto overflow-hidden">
//         {/* Tabs */}
//         <div className="flex border-b border-gray-200 px-4 pt-4">
//           <button className="px-6 py-2.5 border-t border-x border-gray-300 rounded-t-lg bg-white font-medium text-sm -mb-[1px] relative z-10">
//             Listado general del Stock
//           </button>
//           {/* ... otros botones de tabs ... */}
//         </div>

//         <div className="p-8">
//           {/* Formulario conectado al Store */}
//           <div className="flex flex-wrap gap-4 mb-8 items-center">
//             <input 
//               type="text" 
//               placeholder="Nombre del producto" 
//               className="border border-gray-300 rounded px-3 py-1.5 flex-grow focus:border-sky-400 outline-none"
//               onChange={(e) => setBusqueda(e.target.value)}
//             />
//             <button className="bg-[#3ab0e2] p-2 rounded text-white hover:bg-[#2a90ba] transition">
//               <Search size={20} strokeWidth={2.5} />
//             </button>
//           </div>

//           {/* Tabla dinámica */}
//           <div className="border border-gray-300 rounded shadow-sm overflow-hidden">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-[#f3f4f6] border-b border-gray-300">
//                   {columnas.map((col) => (
//                     <th key={col.key} className="px-4 py-2.5 text-sm font-bold text-gray-700 border-r border-gray-300 last:border-r-0">
//                       <div className="flex justify-between items-center">
//                         {col.label}
//                         <div className="flex flex-col text-gray-400 scale-75">
//                           <ChevronUp size={12} className="-mb-1" />
//                           <ChevronDown size={12} />
//                         </div>
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {productos.length > 0 ? (
//                   productos.map((prod, idx) => (
//                     <tr key={idx} className="hover:bg-gray-50 h-10">
//                       <td className="px-4 border-r border-gray-200">{prod.nombre}</td>
//                       <td className="px-4 border-r border-gray-200">{prod.categoria}</td>
//                       <td className="px-4 border-r border-gray-200 text-center">{prod.stock}</td>
//                       <td className="px-4 border-r border-gray-200 text-center">{prod.pendientes}</td>
//                       <td className="px-4 border-r border-gray-200">{prod.estado}</td>
//                       <td className="px-4 text-center">...</td>
//                     </tr>
//                   ))
//                 ) : (
//                   Array(5).fill(0).map((_, i) => (
//                     <tr key={i} className="h-10">
//                       {columnas.map((_, j) => (
//                         <td key={j} className="border-r border-gray-200 last:border-r-0 px-4"></td>
//                       ))}
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//           {/* Nota al pie omitida por brevedad */}
//         </div>
//       </div>
//     </div>
//   );
// }
// Segundo Codigo ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ //
// import { Search, ChevronUp, ChevronDown } from 'lucide-react';
// import { useAppStore } from '../stores/useAppStore';

// export default function Inventory() {
//   // Estado y acciones de Zustand
//   const { tabActiva, setTabActiva, filtros, setFiltro, productos } = useAppStore();

//   const tabs = [
//     { id: 'general', label: 'Listado general del Stock' },
//     { id: 'almacen', label: 'Stock por inventario de almacen' },
//     { id: 'ajustes', label: 'Historial de ajustes' },
//     { id: 'transferencias', label: 'Historial de transferencias' },
//   ];

//   const columnas = [
//     { label: 'Producto', key: 'nombre' },
//     { label: 'Categoría', key: 'categoria' },
//     { label: 'Cantidad disponible', key: 'stock' },
//     { label: 'Pendientes de entregar', key: 'pendientes' },
//     { label: 'Estado', key: 'estado' },
//     { label: 'Opciones', key: 'opciones' },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
//       {/* Header Superior */}
//       <div className="flex justify-between items-end mb-6 max-w-7xl mx-auto px-4">
//         <div className="flex items-baseline gap-6">
//           <h1 className="text-4xl font-bold text-[#e65100]">Inventario</h1>
//           <h2 className="text-2xl font-normal text-gray-600">General</h2>
//         </div>
//         <button className="bg-[#3ab0e2] text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-sky-600 transition shadow-sm">
//           Repartidores
//         </button>
//       </div>

//       {/* Contenedor Principal */}
//       <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-7xl mx-auto overflow-hidden">
        
//         {/* Pestañas (Tabs) */}
//         <div className="flex border-b border-gray-200 px-4 pt-4 bg-gray-50/50">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setTabActiva(tab.id)}
//               className={`px-6 py-2.5 text-sm font-medium transition-all ${
//                 tabActiva === tab.id
//                   ? "border-t border-x border-gray-300 rounded-t-lg bg-white text-gray-800 -mb-[1px] z-10 shadow-sm"
//                   : "text-[#3ab0e2] hover:text-sky-700 hover:underline"
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* Cuerpo del Contenido */}
//         <div className="p-8">
          
//           {/* Fila de Filtros (Los 3 campos de búsqueda) */}
//           <div className="flex flex-wrap gap-4 mb-8 items-center">
//             <input 
//               type="text" 
//               placeholder="Código" 
//               value={filtros.codigo}
//               onChange={(e) => setFiltro('codigo', e.target.value)}
//               className="border border-gray-300 rounded px-3 py-2 w-32 focus:border-sky-400 outline-none transition-colors"
//             />
//             <input 
//               type="text" 
//               placeholder="Nombre del producto" 
//               value={filtros.nombre}
//               onChange={(e) => setFiltro('nombre', e.target.value)}
//               className="border border-gray-300 rounded px-3 py-2 flex-grow focus:border-sky-400 outline-none transition-colors"
//             />
//             <input 
//               type="text" 
//               placeholder="Categoría" 
//               value={filtros.categoria}
//               onChange={(e) => setFiltro('categoria', e.target.value)}
//               className="border border-gray-300 rounded px-3 py-2 w-64 focus:border-sky-400 outline-none transition-colors"
//             />
            
//             {/* Botón de Lupa */}
//             <button className="bg-[#3ab0e2] p-2 rounded text-white hover:bg-sky-600 transition shadow-md">
//               <Search size={22} strokeWidth={2.5} />
//             </button>
            
//             <span className="ml-2 font-bold text-gray-700 whitespace-nowrap">Productos con descuento</span>
//           </div>

//           {/* Tabla */}
//           <div className="border border-gray-300 rounded overflow-hidden shadow-sm mb-10">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-[#f2f2f2] border-b border-gray-300">
//                   {columnas.map((col) => (
//                     <th key={col.key} className="px-4 py-2.5 text-sm font-bold border-r border-gray-300 last:border-r-0">
//                       <div className="flex justify-between items-center">
//                         {col.label}
//                         <div className="flex flex-col text-gray-400 scale-75">
//                           <ChevronUp size={12} className="-mb-1" />
//                           <ChevronDown size={12} />
//                         </div>
//                       </div>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {productos.length > 0 ? (
//                   productos.map((prod, idx) => (
//                     <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 h-11">
//                       {/* Aquí irán los datos reales */}
//                     </tr>
//                   ))
//                 ) : (
//                   // Filas vacías por defecto (como en la imagen)
//                   Array(5).fill(0).map((_, i) => (
//                     <tr key={i} className="h-11 border-b border-gray-100 last:border-b-0">
//                       {columnas.map((_, j) => (
//                         <td key={j} className="border-r border-gray-100 last:border-r-0 px-4"></td>
//                       ))}
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Nota al pie */}
//           <div className="max-w-3xl mx-auto text-center">
//             <p className="text-sm text-gray-800 leading-relaxed">
//               <span className="font-bold">Nota:</span> En la tabla de arriba deberá aparecer la lista de productos con algunos detalles relevantes, 
//               en la versión funcional al dar clic en el nombre del producto mandará al usuario a la pantalla con la descripción completa del producto.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { ROUTES } from '../routes';
import { getInventories } from '../api/inventory';
import { getInventoryAdjustments } from '../api/inventoryAdjustments';
import type { InventoryRow } from '../stores/inventorySlice';
import type { InventoryAdjustment } from '../types';

export default function Inventory() {
  const navigate = useNavigate();
  const { tabActiva, setTabActiva, filtros, setFiltro, productos, setProductos } = useAppStore();
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);

  useEffect(() => {
    if (tabActiva === 'general' || tabActiva === 'almacen') {
      getInventories().then((data) => {
        const rows: InventoryRow[] = data.map((inv) => ({
          id: inv.inventoryID,
          codigo: inv.product?.sku || inv.prodCode,
          nombre: inv.product?.productName || '',
          categoria: inv.product?.category?.categoryName || '',
          stock: inv.quantity,
          pendientes: 0,
          estado: (inv.product?.lowStock || 0) > 0 && inv.quantity <= (inv.product?.lowStock || 0) ? 'Bajo' : 'Normal',
        }));
        setProductos(rows);
      });
    } else {
      getInventoryAdjustments().then((data) => {
        setAdjustments(data.filter((a) => a.type === (tabActiva === 'ajustes' ? 'adjust' : 'transfer')));
      });
    }
  }, [tabActiva, setProductos]);

  const productosFiltrados = productos.filter((p) =>
    p.codigo.toLowerCase().includes(filtros.codigo.toLowerCase()) &&
    p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase()) &&
    p.categoria.toLowerCase().includes(filtros.categoria.toLowerCase())
  );

  const tabs = [
    { id: 'general', label: 'Listado general del Stock' },
    { id: 'almacen', label: 'Stock por inventario de almacen' },
    { id: 'ajustes', label: 'Historial de ajustes' },
    { id: 'transferencias', label: 'Historial de transferencias' },
  ];

  const getColumnas = () => {
    if (tabActiva === 'ajustes') {
      return [
        { label: 'Producto', key: 'producto' },
        { label: 'Categoría', key: 'categoria' },
        { label: 'Cantidad disponible', key: 'cantidadDisponible' },
        { label: 'C. Disponible antes', key: 'cDisponibleAntes' },
        { label: 'Pendientes de entrega', key: 'pendientesEntrega' },
        { label: 'P. De entregar antes', key: 'pEntregarAntes' },
        { label: 'Fecha de ajuste', key: 'fechaAjuste' },
      ];
    } else if (tabActiva === 'transferencias') {
      return [
        { label: 'Producto', key: 'producto' },
        { label: 'Categoría', key: 'categoria' },
        { label: 'Almacen de origen', key: 'almacenOrigen' },
        { label: 'Almacen destino', key: 'almacenDestino' },
        { label: 'Cantidad', key: 'cantidad' },
        { label: 'Fecha de transferencia', key: 'fechaTransferencia' },
      ];
    } else {
      return [
        { label: 'Producto', key: 'nombre' },
        { label: 'Categoría', key: 'categoria' },
        { label: 'Cantidad disponible', key: 'stock' },
        { label: 'Pendientes de entregar', key: 'pendientes' },
        { label: 'Estado', key: 'estado' },
        { label: 'Opciones', key: 'opciones' },
      ];
    }
  };

  const columnas = getColumnas();

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      {/* Header Superior */}
      <div className="flex justify-between items-end mb-6 max-w-7xl mx-auto px-4">
        <div className="flex items-baseline gap-6">
          <h1 className="text-4xl font-bold text-[#e65100]">Inventario</h1>
          <h2 className="text-2xl font-normal text-gray-600">General</h2>
        </div>
        <button 
          onClick={() => navigate(ROUTES.DELIVERYMEN)}
          className="bg-[#3ab0e2] text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-sky-600 transition shadow-sm cursor-pointer"
        >
          Repartidores
        </button>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-7xl mx-auto overflow-hidden">
        
        {/* Pestañas (Tabs) */}
        <div className="flex border-b border-gray-200 px-4 pt-4 bg-gray-50/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`px-6 py-2.5 text-sm font-medium transition-all ${
                tabActiva === tab.id
                  ? "border-t border-x border-gray-300 rounded-t-lg bg-white text-gray-800 -mb-[1px] z-10"
                  : "text-[#3ab0e2] hover:text-sky-700 hover:underline"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* Fila de Filtros */}
          <div className="flex flex-wrap gap-4 mb-8 items-center">
            <input 
              type="text" 
              placeholder="Código" 
              value={filtros.codigo}
              onChange={(e) => setFiltro('codigo', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-32 focus:border-sky-400 outline-none"
            />
            <input 
              type="text" 
              placeholder="Nombre del producto" 
              value={filtros.nombre}
              onChange={(e) => setFiltro('nombre', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 flex-grow focus:border-sky-400 outline-none"
            />
            <input 
              type="text" 
              placeholder="Categoría" 
              value={filtros.categoria}
              onChange={(e) => setFiltro('categoria', e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 w-64 focus:border-sky-400 outline-none"
            />
            <button className="bg-[#3ab0e2] p-2 rounded text-white hover:bg-sky-600 transition shadow-md">
              <Search size={22} strokeWidth={2.5} />
            </button>
            <span className="ml-2 font-bold text-gray-700 whitespace-nowrap">Productos con descuento</span>
          </div>

          {/* Tabla Dinámica */}
          <div className="border border-gray-300 rounded overflow-hidden shadow-sm mb-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f2f2] border-b border-gray-300">
                  {columnas.map((col) => (
                    <th key={col.key} className="px-4 py-2.5 text-sm font-bold border-r border-gray-300 last:border-r-0">
                      <div className="flex justify-between items-center">
                        {col.label}
                        <div className="flex flex-col text-gray-400 scale-75">
                          <ChevronUp size={12} className="-mb-1" />
                          <ChevronDown size={12} />
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(tabActiva === 'general' || tabActiva === 'almacen') && (
                  productosFiltrados.length > 0 ? (
                    productosFiltrados.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50 transition-colors h-11">
                        <td className="px-4 border-r border-gray-200">{prod.nombre}</td>
                        <td className="px-4 border-r border-gray-200">{prod.categoria}</td>
                        <td className="px-4 border-r border-gray-200 text-center">{prod.stock}</td>
                        <td className="px-4 border-r border-gray-200 text-center">{prod.pendientes}</td>
                        <td className="px-4 border-r border-gray-200">{prod.estado}</td>
                        <td className="px-4 text-center">
                          <button className="text-sky-500 hover:text-sky-700 font-medium">Ver</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={`empty-${i}`} className="h-11">
                        {columnas.map((_, j) => (
                          <td key={`cell-${j}`} className="border-r border-gray-300 last:border-r-0"></td>
                        ))}
                      </tr>
                    ))
                  )
                )}
                {tabActiva === 'ajustes' && (
                  adjustments.length > 0 ? (
                    adjustments.map((adj) => (
                      <tr key={adj.adjustID} className="hover:bg-gray-50 transition-colors h-11">
                        <td className="px-4 border-r border-gray-200">{adj.product?.productName}</td>
                        <td className="px-4 border-r border-gray-200">{adj.product?.category?.categoryName}</td>
                        <td className="px-4 border-r border-gray-200 text-center">{adj.availableBefore}</td>
                        <td className="px-4 border-r border-gray-200 text-center">{adj.outstandingDeliveryBefore}</td>
                        <td className="px-4 border-r border-gray-200 text-center">{adj.quantityTransferred}</td>
                        <td className="px-4 border-r border-gray-200">{adj.adjustmentDate ? new Date(adj.adjustmentDate).toLocaleDateString('es-MX') : ''}</td>
                      </tr>
                    ))
                  ) : (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={`empty-adj-${i}`} className="h-11">
                        {columnas.map((_, j) => (
                          <td key={`cell-${j}`} className="border-r border-gray-300 last:border-r-0"></td>
                        ))}
                      </tr>
                    ))
                  )
                )}
                {tabActiva === 'transferencias' && (
                  adjustments.length > 0 ? (
                    adjustments.map((adj) => (
                      <tr key={adj.adjustID} className="hover:bg-gray-50 transition-colors h-11">
                        <td className="px-4 border-r border-gray-200">{adj.product?.productName}</td>
                        <td className="px-4 border-r border-gray-200">{adj.product?.category?.categoryName}</td>
                        <td className="px-4 border-r border-gray-200">{adj.sourceWarehouse?.whname}</td>
                        <td className="px-4 border-r border-gray-200">{adj.destinationWarehouse?.whname}</td>
                        <td className="px-4 border-r border-gray-200 text-center">{adj.quantityTransferred}</td>
                        <td className="px-4 border-r border-gray-200">{adj.adjustmentDate ? new Date(adj.adjustmentDate).toLocaleDateString('es-MX') : ''}</td>
                      </tr>
                    ))
                  ) : (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={`empty-transf-${i}`} className="h-11">
                        {columnas.map((_, j) => (
                          <td key={`cell-${j}`} className="border-r border-gray-300 last:border-r-0"></td>
                        ))}
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Nota al pie */}
          <div className="max-w-3xl mx-auto text-center mt-12">
            <p className="text-sm text-gray-800 leading-relaxed">
              <span className="font-bold">Nota:</span> En la tabla de arriba deberá aparecer la lista de productos...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
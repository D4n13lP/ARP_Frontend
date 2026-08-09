import { useEffect, useState } from 'react';
import { Search, ChevronUp, ChevronDown, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { ROUTES } from '../routes';
import { getInventories, updateInventory } from '../api/inventory';
import { getInventoryAdjustments } from '../api/inventoryAdjustments';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { getWarehouses } from '../api/warehouses';
import { getMyPermissions } from '../api/userPermissions';
import { getErrorMessage } from '../utils/errorMessage';
import ProductModal from './ProductModal';
import type { InventoryRow } from '../stores/inventorySlice';
import type { InventoryAdjustment, Warehouse } from '../types';

export default function Inventory() {
  const navigate = useNavigate();
  const {
    tabActiva, setTabActiva, filtros, setFiltro, toggleFiltroDescuento,
    productos, setProductos, authUser, openModal,
  } = useAppStore();

  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [canEditInventory, setCanEditInventory] = useState(false);

  // Edición inline de "Cantidad disponible"
  const [editingRowID, setEditingRowID] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [confirmChange, setConfirmChange] = useState<{ row: InventoryRow; nextValue: number } | null>(null);
  const [savingQuantity, setSavingQuantity] = useState(false);

  // Totales para los encabezados "Producto (N)" / "Categoría (N)", y catálogo de almacenes.
  useEffect(() => {
    getProducts().then((data) => setTotalProducts(data.length)).catch(() => {});
    getCategories().then((data) => setTotalCategories(data.length)).catch(() => {});
    getWarehouses().then(setWarehouses).catch(() => {});
  }, []);

  // Editar cantidad: admin siempre, vendedor solo si tiene canEdit para 'inventory'
  // (columna "PERMISO EDITAR" / panel "Vistas permitidas" en OtherAccountSettings_Page).
  useEffect(() => {
    if (authUser?.userType === 'admin') {
      setCanEditInventory(true);
      return;
    }
    getMyPermissions()
      .then((perms) => {
        const inv = perms.find((p) => p.module?.moduleKey === 'inventory');
        setCanEditInventory(!!inv?.canEdit);
      })
      .catch(() => setCanEditInventory(false));
  }, [authUser?.userType]);

  useEffect(() => {
    if (tabActiva === 'general' || tabActiva === 'almacen') {
      getInventories()
        .then((data) => {
          const rows: InventoryRow[] = data.map((inv) => ({
            id: inv.inventoryID,
            codigo: inv.product?.sku || inv.prodCode,
            nombre: inv.product?.productName || '',
            categoria: inv.product?.category?.categoryName || '',
            stock: inv.quantity,
            pendientes: 0,
            estado: inv.quantity === 0 ? 'Agotado' : 'Disponible',
            almacen: inv.warehouse?.whname || '',
            whID: inv.whID,
            tieneDescuento: !!inv.product?.promo,
            product: inv.product ?? null,
          }));
          setProductos(rows);
        })
        .catch((error) => alert(getErrorMessage(error, 'No se pudo cargar el inventario.')));
    } else {
      getInventoryAdjustments()
        .then((data) => {
          setAdjustments(data.filter((a) => a.type === (tabActiva === 'ajustes' ? 'adjust' : 'transfer')));
        })
        .catch((error) => alert(getErrorMessage(error, 'No se pudo cargar el historial.')));
    }
  }, [tabActiva, setProductos]);

  const productosFiltrados = productos.filter((p) =>
    p.codigo.toLowerCase().includes(filtros.codigo.toLowerCase()) &&
    p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase()) &&
    p.categoria.toLowerCase().includes(filtros.categoria.toLowerCase()) &&
    (!filtros.descuento || p.tieneDescuento) &&
    (tabActiva !== 'almacen' || !filtros.almacenID || p.whID === filtros.almacenID)
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
        { label: 'Disponible antes', key: 'disponibleAntes' },
        { label: 'Pendiente antes', key: 'pendienteAntes' },
        { label: 'Cantidad ajustada', key: 'cantidadAjustada' },
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
        { label: `Producto (${totalProducts})`, key: 'nombre' },
        { label: `Categoría (${totalCategories})`, key: 'categoria' },
        { label: 'Cantidad disponible', key: 'stock' },
        { label: 'Pendientes de entregar', key: 'pendientes' },
        { label: 'Estado', key: 'estado' },
        { label: 'Almacen', key: 'almacen' },
        { label: 'Opciones', key: 'opciones' },
      ];
    }
  };

  const columnas = getColumnas();

  function startEditing(row: InventoryRow) {
    if (!canEditInventory) return;
    setEditingRowID(row.id);
    setEditingValue(String(row.stock));
  }

  function cancelEditing() {
    setEditingRowID(null);
    setEditingValue('');
  }

  function requestQuantityChange(row: InventoryRow) {
    const next = Number(editingValue);
    if (!Number.isFinite(next) || next < 0) {
      alert('Escribe una cantidad válida (0 o más).');
      return;
    }
    if (next === row.stock) {
      cancelEditing();
      return;
    }
    setConfirmChange({ row, nextValue: next });
  }

  async function handleConfirmQuantityChange() {
    if (!confirmChange) return;
    setSavingQuantity(true);
    try {
      const updated = await updateInventory(confirmChange.row.id, { quantity: confirmChange.nextValue });
      setProductos(productos.map((p) => p.id === confirmChange.row.id
        ? { ...p, stock: updated.quantity, estado: updated.quantity === 0 ? 'Agotado' : 'Disponible' }
        : p));
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo actualizar la cantidad.'));
    } finally {
      setSavingQuantity(false);
      setConfirmChange(null);
      setEditingRowID(null);
      setEditingValue('');
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      {/* Header Superior */}
      <div className="flex justify-between items-end mb-6 max-w-7xl mx-auto px-4">
        <div className="flex items-baseline gap-6">
          <h1 className="text-4xl font-bold text-[#e65100]">Inventario</h1>
          {tabActiva === 'almacen' ? (
            <select
              value={filtros.almacenID}
              onChange={(e) => setFiltro('almacenID', e.target.value)}
              className="text-lg font-normal text-gray-700 border border-gray-300 rounded px-3 py-1.5 bg-white cursor-pointer focus:border-sky-400 outline-none"
            >
              <option value="">General (todos los almacenes)</option>
              {warehouses.map((w) => (
                <option key={w.whID} value={w.whID}>{w.whname}</option>
              ))}
            </select>
          ) : (
            <h2 className="text-2xl font-normal text-gray-600">General</h2>
          )}
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
              className={`px-6 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                tabActiva === tab.id
                  ? "border-t border-x border-gray-300 rounded-t-lg bg-white text-gray-800 -mb-px z-10"
                  : "text-[#3ab0e2] hover:text-sky-700 hover:underline"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* Fila de Filtros — solo aplica a las tablas de stock */}
          {(tabActiva === 'general' || tabActiva === 'almacen') && (
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
                className="border border-gray-300 rounded px-3 py-2 grow focus:border-sky-400 outline-none"
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
              <button
                type="button"
                onClick={toggleFiltroDescuento}
                title="Mostrar solo productos con descuento"
                className={`ml-2 flex items-center gap-2 px-4 py-2 rounded font-medium text-sm transition-colors cursor-pointer border ${
                  filtros.descuento
                    ? 'bg-[#e2694b] border-[#e2694b] text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#e2694b] hover:text-[#e2694b]'
                }`}
              >
                <Tag size={16} />
                Productos con descuento
              </button>
            </div>
          )}

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
                        <td
                          className={`px-4 border-r border-gray-200 text-center ${canEditInventory && editingRowID !== prod.id ? 'cursor-pointer hover:bg-sky-50' : ''}`}
                          onClick={() => editingRowID !== prod.id && startEditing(prod)}
                          title={canEditInventory ? 'Click para editar la cantidad' : undefined}
                        >
                          {editingRowID === prod.id ? (
                            <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="number"
                                min={0}
                                autoFocus
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') requestQuantityChange(prod);
                                  if (e.key === 'Escape') cancelEditing();
                                }}
                                className="w-20 border border-sky-400 rounded px-2 py-1 text-center outline-none"
                              />
                              <button onClick={() => requestQuantityChange(prod)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold px-1 cursor-pointer">
                                OK
                              </button>
                              <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1 cursor-pointer">
                                ×
                              </button>
                            </div>
                          ) : (
                            prod.stock
                          )}
                        </td>
                        <td className="px-4 border-r border-gray-200 text-center">{prod.pendientes}</td>
                        <td className="px-4 border-r border-gray-200">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${prod.estado === 'Agotado' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {prod.estado}
                          </span>
                        </td>
                        <td className="px-4 border-r border-gray-200">{prod.almacen}</td>
                        <td className="px-4 text-center">
                          <button
                            onClick={() => prod.product && openModal(prod.product)}
                            disabled={!prod.product}
                            className="text-sky-500 hover:text-sky-700 font-medium disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Ver
                          </button>
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
                        <td className="px-4 border-r border-gray-200 text-center">
                          {adj.quantityTransferred != null && adj.quantityTransferred > 0 ? `+${adj.quantityTransferred}` : adj.quantityTransferred}
                        </td>
                        <td className="px-4 border-r border-gray-200">{adj.adjustmentDate ? new Date(adj.adjustmentDate).toLocaleString('es-MX') : ''}</td>
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
                        <td className="px-4 border-r border-gray-200">{adj.adjustmentDate ? new Date(adj.adjustmentDate).toLocaleString('es-MX') : ''}</td>
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
        </div>
      </div>

      {/* Confirmación de cambio de cantidad */}
      {confirmChange && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900">Confirmar cambio de cantidad</h2>
            <p className="text-gray-600 text-sm">
              ¿Confirmas cambiar la cantidad de <span className="font-semibold">{confirmChange.row.nombre}</span> de{' '}
              <span className="font-semibold">{confirmChange.row.stock}</span> a{' '}
              <span className="font-semibold">{confirmChange.nextValue}</span>?
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setConfirmChange(null)}
                disabled={savingQuantity}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmQuantityChange}
                disabled={savingQuantity}
                className="bg-[#3ab0e2] hover:bg-sky-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingQuantity ? 'Guardando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductModal />
    </div>
  );
}

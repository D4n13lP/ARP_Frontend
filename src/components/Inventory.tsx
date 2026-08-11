import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Tag, Boxes, Warehouse as WarehouseIcon, Settings, Clock, ArrowLeftRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { ROUTES } from '../routes';
import { getInventories, updateInventory, transferInventory } from '../api/inventory';
import { getInventoryAdjustments } from '../api/inventoryAdjustments';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { getWarehouses } from '../api/warehouses';
import { getMyPermissions } from '../api/userPermissions';
import { getErrorMessage } from '../utils/errorMessage';
import { formatDateTimeMX } from '../utils/formatDate';
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

  // Cambio de almacén (columna "Almacen" como desplegable) — flujo en dos pasos:
  // 1) elegir Transferir/Ingresar + cantidad, 2) confirmar (modal ya existente).
  const [warehouseModeStep, setWarehouseModeStep] = useState<{ row: InventoryRow; nextWhID: string } | null>(null);
  const [warehouseQtyInput, setWarehouseQtyInput] = useState('');
  const [confirmWarehouseChange, setConfirmWarehouseChange] = useState<{
    row: InventoryRow; nextWhID: string; mode: 'transfer' | 'ingresar'; quantity: number;
  } | null>(null);
  const [savingWarehouse, setSavingWarehouse] = useState(false);

  // Orden de la tabla al hacer click en un encabezado (flechas arriba/abajo).
  // Un solo estado para las 4 pestañas: cada una tiene sus propias columnas
  // (keys distintas), así que no chocan entre sí; se reinicia al cambiar de pestaña.
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setSortKey(null);
    setSortDir('asc');
  }, [tabActiva]);

  function handleSort(key: string) {
    if (key === 'opciones') return; // esa columna no tiene datos que ordenar
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  // --- Scroll de la tabla (solo escritorio/tablet) ---
  // Contenedor con alto máximo (scroll vertical propio, solo aparece si hace
  // falta) + botones de flecha arriba que mueven la tabla a los lados — un
  // control de verdad, no solo un scrollbar delgado/decorativo. Los botones
  // solo se muestran si la tabla realmente no cabe completa a lo ancho.
  // Puramente visual: no toca datos ni la lógica de la tabla.
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const [tableClientWidth, setTableClientWidth] = useState(0);
  const [tableScrollLeft, setTableScrollLeft] = useState(0);

  useEffect(() => {
    const container = tableScrollRef.current;
    const table = container?.querySelector('table');
    if (!container || !table) return;
    const measure = () => {
      setTableScrollWidth(table.scrollWidth);
      setTableClientWidth(container.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    ro.observe(table);
    return () => ro.disconnect();
  }, []);

  const hasHorizontalOverflow = tableScrollWidth > tableClientWidth + 1;

  function handleTableScroll(e: React.UIEvent<HTMLDivElement>) {
    setTableScrollLeft(e.currentTarget.scrollLeft);
  }

  function scrollTableBy(delta: number) {
    tableScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  }

  // Scrollbar visible (no la delgada/auto-oculta del sistema) en
  // Chrome/Edge/Safari (::-webkit-scrollbar) y Firefox (scrollbar-width/color) —
  // ayuda visual extra además de los botones.
  const visibleScrollbar =
    "[&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar]:w-2.5 " +
    "[&::-webkit-scrollbar-track]:bg-gray-100 " +
    "[&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full " +
    "[&::-webkit-scrollbar-thumb:hover]:bg-gray-500 " +
    "[scrollbar-width:thin] [scrollbar-color:#9ca3af_#f3f4f6]";

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

  // Extraído del efecto de abajo para poder recargar la tabla después de
  // transferir/ingresar stock (esas acciones pueden crear o modificar HASTA
  // dos filas de inventario a la vez — la de origen y la de destino — así
  // que es más simple/confiable volver a pedir todo que parchear a mano).
  const reloadInventory = useCallback(() => {
    return Promise.all([getInventories(), getProducts()])
      .then(([inventarios, allProducts]) => {
        const rows: InventoryRow[] = inventarios.map((inv) => ({
          id: inv.inventoryID,
          inventoryID: inv.inventoryID,
          prodCode: inv.prodCode,
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

        // Productos que todavía no tienen ninguna fila de inventario (nunca
        // se les asignó almacén) — se agregan como filas "virtuales" para
        // que no desaparezcan de la tabla.
        const seenProdCodes = new Set(rows.map((r) => r.prodCode));
        for (const p of allProducts) {
          if (seenProdCodes.has(p.prodCode)) continue;
          rows.push({
            id: p.prodCode,
            inventoryID: null,
            prodCode: p.prodCode,
            codigo: p.sku || p.prodCode,
            nombre: p.productName,
            categoria: p.category?.categoryName || '',
            stock: 0,
            pendientes: 0,
            estado: 'Agotado',
            almacen: '',
            whID: '',
            tieneDescuento: !!p.promo,
            product: p,
          });
        }

        setProductos(rows);
      })
      .catch((error) => alert(getErrorMessage(error, 'No se pudo cargar el inventario.')));
  }, [setProductos]);

  useEffect(() => {
    if (tabActiva === 'general' || tabActiva === 'almacen') {
      reloadInventory();
    } else {
      getInventoryAdjustments()
        .then((data) => {
          setAdjustments(data.filter((a) => a.type === (tabActiva === 'ajustes' ? 'adjust' : 'transfer')));
        })
        .catch((error) => alert(getErrorMessage(error, 'No se pudo cargar el historial.')));
    }
  }, [tabActiva, reloadInventory]);

  const productosFiltrados = productos.filter((p) => {
    const codigoBusqueda = filtros.codigo.toLowerCase();
    // El campo "Código" busca en el SKU y también en la llave primaria del
    // producto (prodCode) — así funciona aunque el producto no tenga SKU, o
    // aunque se busque directamente por su ID.
    const coincideCodigo = !codigoBusqueda
      || p.codigo.toLowerCase().includes(codigoBusqueda)
      || p.prodCode.toLowerCase().includes(codigoBusqueda);
    return coincideCodigo &&
      p.nombre.toLowerCase().includes(filtros.nombre.toLowerCase()) &&
      p.categoria.toLowerCase().includes(filtros.categoria.toLowerCase()) &&
      (!filtros.descuento || p.tieneDescuento) &&
      (tabActiva !== 'almacen' || !filtros.almacenID || p.whID === filtros.almacenID);
  });

  // Valor comparable de cada columna de la tabla de stock (general/almacen).
  // "estado" no se ordena alfabéticamente: Disponible siempre queda antes que
  // Agotado en ascendente, y al revés en descendente.
  function getStockSortValue(row: InventoryRow, key: string): string | number {
    switch (key) {
      case 'nombre': return row.nombre.toLowerCase();
      case 'categoria': return row.categoria.toLowerCase();
      case 'stock': return row.stock;
      case 'pendientes': return row.pendientes;
      case 'estado': return row.estado === 'Disponible' ? 0 : 1;
      case 'almacen': return row.almacen.toLowerCase();
      default: return '';
    }
  }

  const productosOrdenados = useMemo(() => {
    if (!sortKey) return productosFiltrados;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...productosFiltrados].sort((a, b) => {
      const va = getStockSortValue(a, sortKey);
      const vb = getStockSortValue(b, sortKey);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [productosFiltrados, sortKey, sortDir]);

  // Igual que arriba, pero para las columnas de Historial de ajustes / transferencias.
  function getAdjustmentSortValue(adj: InventoryAdjustment, key: string): string | number {
    switch (key) {
      case 'producto': return (adj.product?.productName || '').toLowerCase();
      case 'categoria': return (adj.product?.category?.categoryName || '').toLowerCase();
      case 'disponibleAntes': return adj.availableBefore ?? 0;
      case 'pendienteAntes': return adj.outstandingDeliveryBefore ?? 0;
      case 'cantidadAjustada': return adj.quantityTransferred ?? 0;
      case 'fechaAjuste': return adj.adjustmentDate ? new Date(adj.adjustmentDate).getTime() : 0;
      case 'almacenOrigen': return (adj.sourceWarehouse?.whname || '').toLowerCase();
      case 'almacenDestino': return (adj.destinationWarehouse?.whname || '').toLowerCase();
      case 'cantidad': return adj.quantityTransferred ?? 0;
      case 'fechaTransferencia': return adj.adjustmentDate ? new Date(adj.adjustmentDate).getTime() : 0;
      default: return '';
    }
  }

  const adjustmentsOrdenados = useMemo(() => {
    if (!sortKey) return adjustments;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...adjustments].sort((a, b) => {
      const va = getAdjustmentSortValue(a, sortKey);
      const vb = getAdjustmentSortValue(b, sortKey);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [adjustments, sortKey, sortDir]);

  const tabs = [
    { id: 'general', label: 'Listado general del Stock' },
    { id: 'almacen', label: 'Stock por inventario de almacen' },
    { id: 'ajustes', label: 'Historial de ajustes' },
    { id: 'transferencias', label: 'Historial de transferencias' },
  ];

  // Iconos de las pestañas — solo para la barra compacta de celulares (ver
  // más abajo); la barra de escritorio/tablet sigue usando tab.label como
  // siempre. "Ajustes" combina engrane+reloj y "Transferencias" combina
  // reloj+flechas para diferenciar los dos historiales a simple vista.
  function getTabIcon(tabId: string) {
    switch (tabId) {
      case 'general':
        return <Boxes size={22} />;
      case 'almacen':
        return <WarehouseIcon size={22} />;
      case 'ajustes':
        return (
          <span className="relative inline-flex">
            <Settings size={22} />
            <Clock size={13} strokeWidth={2.5} className="absolute -bottom-1 -right-1.5 bg-white rounded-full" />
          </span>
        );
      case 'transferencias':
        return (
          <span className="relative inline-flex">
            <Clock size={22} />
            <ArrowLeftRight size={13} strokeWidth={2.5} className="absolute -bottom-1 -right-1.5 bg-white rounded-full" />
          </span>
        );
      default:
        return null;
    }
  }

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
    if (!row.inventoryID) return; // sin almacén asignado todavía: hay que asignar uno primero
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
    if (!confirmChange || !confirmChange.row.inventoryID) return;
    setSavingQuantity(true);
    try {
      const updated = await updateInventory(confirmChange.row.inventoryID, { quantity: confirmChange.nextValue });
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

  // Paso 1: se dispara al elegir un almacén distinto en el desplegable — abre
  // el modal de Transferir/Ingresar + cantidad (NO cambia nada todavía).
  function requestWarehouseChange(row: InventoryRow, nextWhID: string) {
    if (!nextWhID || nextWhID === row.whID) return;
    setWarehouseModeStep({ row, nextWhID });
    setWarehouseQtyInput('');
  }

  function cancelWarehouseModeStep() {
    setWarehouseModeStep(null);
    setWarehouseQtyInput('');
  }

  // Valida la cantidad (entero >= 1; para 'transfer' además <= stock actual)
  // y pasa al paso 2 (el modal de confirmación ya existente).
  function handlePickWarehouseMode(mode: 'transfer' | 'ingresar') {
    if (!warehouseModeStep) return;
    const qty = Number(warehouseQtyInput);
    if (!Number.isInteger(qty) || qty < 1) {
      alert('Escribe una cantidad válida (un entero de 1 o más).');
      return;
    }
    if (mode === 'transfer' && qty > warehouseModeStep.row.stock) {
      alert(`No puedes transferir más de ${warehouseModeStep.row.stock} unidades — es lo disponible en este almacén.`);
      return;
    }
    setConfirmWarehouseChange({ row: warehouseModeStep.row, nextWhID: warehouseModeStep.nextWhID, mode, quantity: qty });
    setWarehouseModeStep(null);
  }

  // Paso 2: confirmación final — transfiere o ingresa según lo elegido en el paso 1.
  async function handleConfirmWarehouseChange() {
    if (!confirmWarehouseChange) return;
    const { row, nextWhID, mode, quantity } = confirmWarehouseChange;
    setSavingWarehouse(true);
    try {
      await transferInventory({
        prodCode: row.prodCode,
        sourceWhID: row.whID || null,
        destinationWhID: nextWhID,
        quantity,
        mode,
      });
      // Una transferencia toca hasta dos filas (origen y destino) y un ingreso
      // puede crear una fila nueva — más simple/confiable recargar todo.
      await reloadInventory();
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo procesar el movimiento de almacén.'));
    } finally {
      setSavingWarehouse(false);
      setConfirmWarehouseChange(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      {/* Header Superior */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-6 max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-baseline gap-3 md:gap-6">
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
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.WAREHOUSES)}
            className="bg-[#3ab0e2] text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-sky-600 transition shadow-sm cursor-pointer"
          >
            Almacenes
          </button>
          <button
            onClick={() => navigate(ROUTES.DELIVERYMEN)}
            className="bg-[#3ab0e2] text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-sky-600 transition shadow-sm cursor-pointer"
          >
            Repartidores
          </button>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-7xl mx-auto overflow-hidden">

        {/* Pestañas (Tabs) — escritorio/tablet: exactamente como antes */}
        <div className="hidden md:flex border-b border-gray-200 px-4 pt-4 bg-gray-50/50">
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

        {/* Pestañas (Tabs) — celulares: mismos tabs/handler, solo iconos en
            vez de texto (el texto largo no cabe bien en pantallas angostas). */}
        <div className="flex md:hidden border-b border-gray-200 px-2 pt-3 bg-gray-50/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              title={tab.label}
              aria-label={tab.label}
              className={`flex-1 flex items-center justify-center py-2.5 transition-all cursor-pointer ${
                tabActiva === tab.id
                  ? "border-t border-x border-gray-300 rounded-t-lg bg-white text-gray-800 -mb-px z-10"
                  : "text-[#3ab0e2] hover:text-sky-700"
              }`}
            >
              {getTabIcon(tab.id)}
            </button>
          ))}
        </div>

        <div className="p-4 md:p-8">
          {/* Fila de Filtros — solo aplica a las tablas de stock */}
          {(tabActiva === 'general' || tabActiva === 'almacen') && (
            <div className="flex flex-wrap gap-4 mb-8 items-center">
              <input
                type="text"
                placeholder="Código o ID"
                value={filtros.codigo}
                onChange={(e) => setFiltro('codigo', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full md:w-32 focus:border-sky-400 outline-none"
              />
              <input
                type="text"
                placeholder="Nombre del producto"
                value={filtros.nombre}
                onChange={(e) => setFiltro('nombre', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full md:grow md:w-auto focus:border-sky-400 outline-none"
              />
              <input
                type="text"
                placeholder="Categoría"
                value={filtros.categoria}
                onChange={(e) => setFiltro('categoria', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full md:w-64 focus:border-sky-400 outline-none"
              />
              <button className="bg-[#3ab0e2] p-2 rounded text-white hover:bg-sky-600 transition shadow-md">
                <Search size={22} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={toggleFiltroDescuento}
                title="Mostrar solo productos con descuento"
                className={`md:ml-2 flex items-center gap-2 px-4 py-2 rounded font-medium text-sm transition-colors cursor-pointer border ${
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

          {/* Tabla Dinámica — solo escritorio/tablet (>= md); en celulares se
              reemplaza por tarjetas (ver más abajo), sin tocar nada de esta
              tabla ni de la lógica que la alimenta.
              - Botones de flecha arriba (control real, no solo un scrollbar)
                para desplazar la tabla a los lados — solo se muestran cuando
                la tabla realmente no cabe completa a lo ancho.
              - Alto máximo con scroll vertical propio: solo aparece cuando la
                tabla no cabe completa hacia abajo (más filas de las que caben).
              - Scrollbar visible (no la delgada/auto-oculta del sistema) como
                ayuda extra a los botones. */}
          <div className="hidden md:block mb-10">
            {hasHorizontalOverflow && (
              <div className="flex justify-between items-center leading-none">
                <button
                  type="button"
                  onClick={() => scrollTableBy(-280)}
                  disabled={tableScrollLeft <= 0}
                  aria-label="Desplazar tabla a la izquierda"
                  title="Desplazar a la izquierda"
                  className="p-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-sky-600 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-500"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollTableBy(280)}
                  disabled={tableScrollLeft >= tableScrollWidth - tableClientWidth - 1}
                  aria-label="Desplazar tabla a la derecha"
                  title="Desplazar a la derecha"
                  className="p-0.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-sky-600 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:hover:text-gray-500"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
            <div
              ref={tableScrollRef}
              onScroll={handleTableScroll}
              className={`border border-gray-300 rounded overflow-auto shadow-sm max-h-[65vh] ${visibleScrollbar}`}
            >
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f2f2] border-b border-gray-300">
                  {columnas.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      title={col.key === 'opciones' ? undefined : 'Ordenar'}
                      className={`sticky top-0 z-10 bg-[#f2f2f2] px-4 py-2.5 text-sm font-bold border-r border-b border-gray-300 last:border-r-0 ${
                        col.key === 'opciones' ? '' : 'cursor-pointer select-none hover:bg-gray-200/70'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        {col.label}
                        {col.key !== 'opciones' && (
                          <div className="flex flex-col scale-75">
                            <ChevronUp size={12} className={`-mb-1 ${sortKey === col.key && sortDir === 'asc' ? 'text-sky-600' : 'text-gray-400'}`} />
                            <ChevronDown size={12} className={sortKey === col.key && sortDir === 'desc' ? 'text-sky-600' : 'text-gray-400'} />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(tabActiva === 'general' || tabActiva === 'almacen') && (
                  productosOrdenados.length > 0 ? (
                    productosOrdenados.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50 transition-colors h-11">
                        <td className="px-4 border-r border-gray-200">{prod.nombre}</td>
                        <td className="px-4 border-r border-gray-200">{prod.categoria}</td>
                        <td
                          className={`px-4 border-r border-gray-200 text-center ${canEditInventory && prod.inventoryID && editingRowID !== prod.id ? 'cursor-pointer hover:bg-sky-50' : ''}`}
                          onClick={() => editingRowID !== prod.id && startEditing(prod)}
                          title={
                            !prod.inventoryID
                              ? 'Asigna un almacén primero para poder editar la cantidad'
                              : canEditInventory ? 'Click para editar la cantidad' : undefined
                          }
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
                        <td className="px-4 border-r border-gray-200">
                          {canEditInventory ? (
                            <select
                              value={prod.whID}
                              onChange={(e) => requestWarehouseChange(prod, e.target.value)}
                              disabled={savingWarehouse || !!warehouseModeStep || !!confirmWarehouseChange}
                              title={!prod.inventoryID ? 'Asignar almacén' : 'Cambiar de almacén'}
                              className="border border-gray-300 rounded px-2 py-1 text-sm bg-white cursor-pointer focus:border-sky-400 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {!prod.whID && <option value="">Sin asignar</option>}
                              {warehouses.map((w) => (
                                <option key={w.whID} value={w.whID}>{w.whname}</option>
                              ))}
                            </select>
                          ) : (
                            prod.almacen || 'Sin asignar'
                          )}
                        </td>
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
                  adjustmentsOrdenados.length > 0 ? (
                    adjustmentsOrdenados.map((adj) => (
                      <tr key={adj.adjustID} className="hover:bg-gray-50 transition-colors h-11">
                        <td className="px-4 border-r border-gray-200">{adj.product?.productName}</td>
                        <td className="px-4 border-r border-gray-200">{adj.product?.category?.categoryName}</td>
                        <td className="px-4 border-r border-gray-200 text-center">{adj.availableBefore}</td>
                        <td className="px-4 border-r border-gray-200 text-center">{adj.outstandingDeliveryBefore}</td>
                        <td className="px-4 border-r border-gray-200 text-center">
                          {adj.quantityTransferred != null && adj.quantityTransferred > 0 ? `+${adj.quantityTransferred}` : adj.quantityTransferred}
                        </td>
                        <td className="px-4 border-r border-gray-200">{formatDateTimeMX(adj.adjustmentDate)}</td>
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
                  adjustmentsOrdenados.length > 0 ? (
                    adjustmentsOrdenados.map((adj) => (
                      <tr key={adj.adjustID} className="hover:bg-gray-50 transition-colors h-11">
                        <td className="px-4 border-r border-gray-200">{adj.product?.productName}</td>
                        <td className="px-4 border-r border-gray-200">{adj.product?.category?.categoryName}</td>
                        <td className="px-4 border-r border-gray-200">{adj.sourceWarehouse?.whname}</td>
                        <td className="px-4 border-r border-gray-200">{adj.destinationWarehouse?.whname}</td>
                        <td className="px-4 border-r border-gray-200 text-center">{adj.quantityTransferred}</td>
                        <td className="px-4 border-r border-gray-200">{formatDateTimeMX(adj.adjustmentDate)}</td>
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

          {/* Tarjetas — solo celulares (< md). Mismos datos/estado/handlers que
              la tabla de arriba, nada nuevo: solo otra forma de mostrarlos. */}
          <div className="md:hidden flex flex-col gap-3 mb-10">
            {/* Orden: mismo mecanismo que las flechas del encabezado de la
                tabla (handleSort/sortKey/sortDir), solo que aquí como
                controles compactos porque no hay encabezado de columnas. */}
            {columnas.some((c) => c.key !== 'opciones') && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-500 shrink-0">Ordenar por:</span>
                <select
                  value={sortKey ?? ''}
                  onChange={(e) => e.target.value && handleSort(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white grow focus:border-sky-400 outline-none"
                >
                  <option value="">Sin ordenar</option>
                  {columnas.filter((c) => c.key !== 'opciones').map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
                {sortKey && (
                  <button
                    type="button"
                    onClick={() => handleSort(sortKey)}
                    title="Invertir orden"
                    className="border border-gray-300 rounded p-1.5 bg-white text-gray-500 hover:text-sky-600 cursor-pointer shrink-0"
                  >
                    {sortDir === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
              </div>
            )}

            {(tabActiva === 'general' || tabActiva === 'almacen') && (
              productosOrdenados.length > 0 ? productosOrdenados.map((prod) => (
                <div key={prod.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{prod.nombre}</h3>
                      <span className="text-xs text-gray-500">{prod.categoria || 'Sin categoría'}</span>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${prod.estado === 'Agotado' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {prod.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-500 block mb-0.5">Cantidad disponible</span>
                      {editingRowID === prod.id ? (
                        <div className="flex items-center gap-1">
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
                            className="w-16 border border-sky-400 rounded px-1.5 py-1 text-center outline-none"
                          />
                          <button onClick={() => requestQuantityChange(prod)} className="text-emerald-600 hover:text-emerald-800 font-bold px-1 cursor-pointer">
                            OK
                          </button>
                          <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600 text-base leading-none px-1 cursor-pointer">
                            ×
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => startEditing(prod)}
                          className={`font-semibold text-gray-800 ${canEditInventory && prod.inventoryID ? 'cursor-pointer hover:text-sky-600' : ''}`}
                        >
                          {prod.stock}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Pendientes</span>
                      <span className="font-semibold text-gray-800">{prod.pendientes}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 block mb-0.5">Almacén</span>
                      {canEditInventory ? (
                        <select
                          value={prod.whID}
                          onChange={(e) => requestWarehouseChange(prod, e.target.value)}
                          disabled={savingWarehouse || !!warehouseModeStep || !!confirmWarehouseChange}
                          title={!prod.inventoryID ? 'Asignar almacén' : 'Cambiar de almacén'}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white cursor-pointer focus:border-sky-400 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {!prod.whID && <option value="">Sin asignar</option>}
                          {warehouses.map((w) => (
                            <option key={w.whID} value={w.whID}>{w.whname}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-semibold text-gray-800">{prod.almacen || 'Sin asignar'}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => prod.product && openModal(prod.product)}
                    disabled={!prod.product}
                    className="w-full py-2 bg-sky-50 text-sky-700 font-medium text-xs rounded-lg active:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Ver detalles del producto
                  </button>
                </div>
              )) : (
                <p className="text-center text-gray-400 text-sm py-6">No hay productos que mostrar.</p>
              )
            )}

            {tabActiva === 'ajustes' && (
              adjustmentsOrdenados.length > 0 ? adjustmentsOrdenados.map((adj) => (
                <div key={adj.adjustID} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{adj.product?.productName}</h3>
                    <span className="text-xs text-gray-500">{adj.product?.category?.categoryName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-500 block mb-0.5">Disponible antes</span>
                      <span className="font-semibold text-gray-800">{adj.availableBefore}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Pendiente antes</span>
                      <span className="font-semibold text-gray-800">{adj.outstandingDeliveryBefore}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Cantidad ajustada</span>
                      <span className="font-semibold text-gray-800">
                        {adj.quantityTransferred != null && adj.quantityTransferred > 0 ? `+${adj.quantityTransferred}` : adj.quantityTransferred}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Fecha de ajuste</span>
                      <span className="font-semibold text-gray-800">{formatDateTimeMX(adj.adjustmentDate)}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-400 text-sm py-6">No hay ajustes que mostrar.</p>
              )
            )}

            {tabActiva === 'transferencias' && (
              adjustmentsOrdenados.length > 0 ? adjustmentsOrdenados.map((adj) => (
                <div key={adj.adjustID} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{adj.product?.productName}</h3>
                    <span className="text-xs text-gray-500">{adj.product?.category?.categoryName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-500 block mb-0.5">Almacen de origen</span>
                      <span className="font-semibold text-gray-800">{adj.sourceWarehouse?.whname}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Almacen destino</span>
                      <span className="font-semibold text-gray-800">{adj.destinationWarehouse?.whname}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Cantidad</span>
                      <span className="font-semibold text-gray-800">{adj.quantityTransferred}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-0.5">Fecha de transferencia</span>
                      <span className="font-semibold text-gray-800">{formatDateTimeMX(adj.adjustmentDate)}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-400 text-sm py-6">No hay transferencias que mostrar.</p>
              )
            )}
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

      {/* Paso 1: elegir Transferir/Ingresar + cantidad, antes de la confirmación */}
      {warehouseModeStep && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900">
              Mover a {warehouses.find((w) => w.whID === warehouseModeStep.nextWhID)?.whname}
            </h2>
            <p className="text-gray-600 text-sm">
              ¿Cuántas unidades de <span className="font-semibold">{warehouseModeStep.row.nombre}</span> quieres mover?
              Elige <span className="font-semibold">Transferir</span> si salen del almacén actual, o{' '}
              <span className="font-semibold">Ingresar</span> si son unidades nuevas.
            </p>
            <div>
              <input
                type="number"
                min={1}
                step={1}
                autoFocus
                value={warehouseQtyInput}
                onChange={(e) => setWarehouseQtyInput(e.target.value)}
                placeholder="Cantidad"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:border-sky-400 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Disponible para transferir en {warehouseModeStep.row.almacen || 'este almacén'}: {warehouseModeStep.row.stock}
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-2 flex-wrap">
              <button
                onClick={cancelWarehouseModeStep}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handlePickWarehouseMode('transfer')}
                disabled={warehouseModeStep.row.stock < 1}
                title={warehouseModeStep.row.stock < 1 ? 'No hay unidades disponibles para transferir en este almacén' : undefined}
                className="bg-[#e2694b] hover:bg-orange-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Transferir
              </button>
              <button
                onClick={() => handlePickWarehouseMode('ingresar')}
                className="bg-[#3ab0e2] hover:bg-sky-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors cursor-pointer"
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paso 2: confirmación de cambio de almacén (mismo diseño de siempre) */}
      {confirmWarehouseChange && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900">
              {confirmWarehouseChange.mode === 'transfer' ? 'Confirmar transferencia' : 'Confirmar ingreso de stock'}
            </h2>
            <p className="text-gray-600 text-sm">
              {confirmWarehouseChange.mode === 'transfer' ? (
                <>
                  ¿Confirmas transferir <span className="font-semibold">{confirmWarehouseChange.quantity}</span> unidades de{' '}
                  <span className="font-semibold">{confirmWarehouseChange.row.nombre}</span> de{' '}
                  <span className="font-semibold">{confirmWarehouseChange.row.almacen || 'Sin asignar'}</span> a{' '}
                  <span className="font-semibold">{warehouses.find((w) => w.whID === confirmWarehouseChange.nextWhID)?.whname}</span>?
                  Esto se registrará en el Historial de transferencias.
                </>
              ) : (
                <>
                  ¿Confirmas ingresar <span className="font-semibold">{confirmWarehouseChange.quantity}</span> unidades nuevas de{' '}
                  <span className="font-semibold">{confirmWarehouseChange.row.nombre}</span> en{' '}
                  <span className="font-semibold">{warehouses.find((w) => w.whID === confirmWarehouseChange.nextWhID)?.whname}</span>?
                  Esto se registrará en el Historial de ajustes.
                </>
              )}
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setConfirmWarehouseChange(null)}
                disabled={savingWarehouse}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmWarehouseChange}
                disabled={savingWarehouse}
                className="bg-[#3ab0e2] hover:bg-sky-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingWarehouse ? 'Guardando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProductModal />
    </div>
  );
}

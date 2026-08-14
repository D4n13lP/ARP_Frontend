import { type StateCreator } from 'zustand'

export interface MetricTableItem {
  id: number;
  producto: string;
  cantidad: number;
  importe?: number;
  tiempo?: string;
}

export interface MetricsSlice {
  // Datos de las tarjetas
  stats: {
    ventas: number;
    pedidos: number;
    rezagados: number;
  };
  // Datos de las tablas
  masVendidos: MetricTableItem[];
  recienLlegados: MetricTableItem[];
  productosRezagados: MetricTableItem[];
  ultimasVentas: MetricTableItem[];
  pedidosPorVencer: MetricTableItem[];
  usuariosTopVentas: MetricTableItem[];
  productosStockBajo: MetricTableItem[];
  // Periodo (en días) que el backend aplicó a usuariosTopVentas — ver
  // selector en DashboardPage (solo admin puede cambiarlo).
  ventasPeriodDays: number;
  setMetrics: (data: {
    stats: MetricsSlice['stats'];
    masVendidos: MetricTableItem[];
    recienLlegados: MetricTableItem[];
    productosRezagados: MetricTableItem[];
    ultimasVentas: MetricTableItem[];
    pedidosPorVencer: MetricTableItem[];
    usuariosTopVentas: MetricTableItem[];
    productosStockBajo: MetricTableItem[];
    ventasPeriodDays: number;
  }) => void;
}

export const createMetricsSlice: StateCreator<MetricsSlice> = (set) => ({
  stats: { ventas: 0, pedidos: 0, rezagados: 0 },
  masVendidos: [],
  recienLlegados: [],
  productosRezagados: [],
  ultimasVentas: [],
  pedidosPorVencer: [],
  usuariosTopVentas: [],
  productosStockBajo: [],
  ventasPeriodDays: 7,
  setMetrics: (data) => set(data),
})
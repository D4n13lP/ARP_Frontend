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
  setMetrics: (data: {
    stats: MetricsSlice['stats'];
    masVendidos: MetricTableItem[];
    recienLlegados: MetricTableItem[];
    productosRezagados: MetricTableItem[];
    ultimasVentas: MetricTableItem[];
    pedidosPorVencer: MetricTableItem[];
    usuariosTopVentas: MetricTableItem[];
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
  setMetrics: (data) => set(data),
})
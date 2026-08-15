import { type StateCreator } from 'zustand'
import type { Transaction } from '../types'

// Antes OrdersReports_Page.tsx guardaba todo esto en useState local: al
// hacer clic en "Ver detalles" se navega (react-router) a OrderDetail_Page
// (ruta distinta), y al volver con "Atras" (navigate(-1)) React desmonta y
// vuelve a montar OrdersReports_Page desde cero — se perdía el reporte ya
// generado. Vive en el store para sobrevivir a esa navegación de ida y
// vuelta; el botón "Reiniciar" (resetOrdersReport) sigue siendo la única
// forma de borrarlo a propósito para generar uno distinto.
export interface OrdersReportState {
  startDate: string
  endDate: string
  reportGenerated: boolean
  orders: Transaction[]
}

const initialOrdersReportState: OrdersReportState = {
  startDate: '',
  endDate: '',
  reportGenerated: false,
  orders: [],
}

export interface OrdersReportSlice {
  ordersReport: OrdersReportState
  setOrdersReport: (patch: Partial<OrdersReportState>) => void
  resetOrdersReport: () => void
}

export const createOrdersReportSlice: StateCreator<OrdersReportSlice> = (set) => ({
  ordersReport: initialOrdersReportState,
  setOrdersReport: (patch) => set((state) => ({ ordersReport: { ...state.ordersReport, ...patch } })),
  resetOrdersReport: () => set({ ordersReport: initialOrdersReportState }),
})

import { type StateCreator } from 'zustand'
import type { Product } from '../types'

// Fila de inventario ya "aplanada" para las tablas de Inventory.tsx
export interface InventoryRow {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  pendientes: number;
  estado: string;
  almacen: string;
  whID: string;
  tieneDescuento: boolean;
  product: Product | null;
}

export interface InventorySlice {
  productos: InventoryRow[]
  tabActiva: string

  // Agrupamos los filtros en un objeto para mayor orden
  filtros: {
    codigo: string;
    nombre: string;
    categoria: string;
    descuento: boolean;
    almacenID: string;
  }

  // Acciones
  setProductos: (productos: InventoryRow[]) => void
  setTabActiva: (tab: string) => void
  setFiltro: (campo: 'codigo' | 'nombre' | 'categoria' | 'almacenID', valor: string) => void
  toggleFiltroDescuento: () => void
}

export const createInventorySlice: StateCreator<InventorySlice> = (set) => ({
  productos: [],
  tabActiva: 'general',

  filtros: {
    codigo: '',
    nombre: '',
    categoria: '',
    descuento: false,
    almacenID: '',
  },

  setProductos: (productos) => set({ productos }),
  setTabActiva: (tab) => set({ tabActiva: tab }),

  // Acción dinámica para actualizar cualquier filtro
  setFiltro: (campo, valor) => set((state) => ({
    filtros: {
      ...state.filtros,
      [campo]: valor
    }
  })),

  toggleFiltroDescuento: () => set((state) => ({
    filtros: {
      ...state.filtros,
      descuento: !state.filtros.descuento,
    }
  })),
})

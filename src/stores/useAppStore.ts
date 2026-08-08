import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createAuthSlice, type AuthSlice } from './authSlice'
import { createInventorySlice, type InventorySlice } from './inventorySlice'
import { createMetricsSlice, type MetricsSlice } from './metricsSlice'
import { createProductSlice, type ProductSlice } from './productSlice'
import { createUserSlice, type UserSlice } from './userSlice'
// ... otros imports de slices

// Combinamos todos los tipos de los Slices
type StoreState = AuthSlice & InventorySlice & MetricsSlice & ProductSlice & UserSlice

export const useAppStore = create<StoreState>()(devtools((...a) => ({
  ...createAuthSlice(...a),
  ...createInventorySlice(...a),
  ...createMetricsSlice(...a),
  ...createProductSlice(...a),
  ...createUserSlice(...a),
  // ... esparce los otros slices aquí
})))
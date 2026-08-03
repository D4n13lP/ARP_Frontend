import type { StateCreator } from 'zustand'
import type { Category, Product } from '../types'

export interface ProductSlice {
  products: Product[]
  categories: Category[]
  selectedCategory: string | null
  isModalOpen: boolean
  selectedProduct: Product | null // Usamos el tipo Product de tu index.ts
  // Acciones
  setProducts: (products: Product[]) => void
  setCategories: (categories: Category[]) => void
  setSelectedCategory: (categoryID: string | null) => void
  openModal: (product: Product) => void
  closeModal: () => void
}

export const createProductSlice: StateCreator<ProductSlice> = (set) => ({
  products: [],
  categories: [],
  selectedCategory: null,
  isModalOpen: false,
  selectedProduct: null,

  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (categoryID) => set({ selectedCategory: categoryID }),

  openModal: (product) => set({ isModalOpen: true, selectedProduct: product }),
  closeModal: () => set({ isModalOpen: false, selectedProduct: null }),
})
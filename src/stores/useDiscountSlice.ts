import { create } from 'zustand';

interface DiscountState {
  selectedType: string; // 'promocion' | 'cliente'
  setSelectedType: (type: string) => void;
}

export const useDiscountStore = create<DiscountState>((set) => ({
  selectedType: 'promocion', // Valor inicial
  setSelectedType: (type) => set({ selectedType: type }),
}));
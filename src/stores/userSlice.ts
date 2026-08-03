import type { StateCreator } from 'zustand';

export interface UserSlice {
  user: {
    nivelCuenta: string;
    codigoAdmin: string;
    nombreUsuario: string;
    correo: string;
    telefono: string;
    avatarUrl: string;
  };
  updateUserField: (field: keyof UserSlice['user'], value: string) => void;
}

export const createUserSlice: StateCreator<UserSlice> = (set) => ({
  user: {
    nivelCuenta: 'Administrador',
    codigoAdmin: '77456489CS45',
    nombreUsuario: 'César Gómez',
    correo: 'cesarg@gmail.com',
    telefono: '55 7921 5957',
    avatarUrl: '',
  },
  updateUserField: (field, value) => set((state) => ({
    user: {
      ...state.user,
      [field]: value
    }
  }))
});

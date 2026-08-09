import { type StateCreator } from 'zustand'
import type { UserPermission } from '../types'

// Permisos del usuario que tiene la sesión abierta (no confundir con
// OtherAccountSettings_Page, que edita los de OTRO usuario). Se cargan una
// vez al iniciar sesión (ver RequireAuth) y los usa ModuleGuard para bloquear
// la navegación a vistas con canView desactivado.
export interface PermissionsSlice {
  myPermissions: UserPermission[]
  permissionsLoaded: boolean
  setMyPermissions: (perms: UserPermission[]) => void
  resetMyPermissions: () => void
}

export const createPermissionsSlice: StateCreator<PermissionsSlice> = (set) => ({
  myPermissions: [],
  permissionsLoaded: false,
  setMyPermissions: (perms) => set({ myPermissions: perms, permissionsLoaded: true }),
  resetMyPermissions: () => set({ myPermissions: [], permissionsLoaded: false }),
})

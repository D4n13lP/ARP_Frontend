import type { StateCreator } from 'zustand';
import type { AuthUser } from '../types';

// Nota: el nombre "authUser" (no "user") es a propósito, para no chocar con
// el campo `user` de UserSlice (datos mock de perfil, sin relación con la sesión).
const STORAGE_KEY = 'arp_session';

interface StoredSession {
  authUser: AuthUser;
  token: string;
}

function loadStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

const stored = loadStoredSession();

export interface AuthSlice {
  authUser: AuthUser | null;
  token: string | null;
  setSession: (authUser: AuthUser, token: string) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  authUser: stored?.authUser ?? null,
  token: stored?.token ?? null,
  setSession: (authUser, token) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ authUser, token }));
    set({ authUser, token });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ authUser: null, token: null });
  },
});

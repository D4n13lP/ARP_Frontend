import axios from 'axios'
import { useAppStore } from '../stores/useAppStore'
import { ROUTES } from '../routes'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const http = axios.create({
  baseURL: API_BASE_URL,
})

// Adjunta el JWT de la sesión guardada (ver stores/authSlice.ts) a cada request,
// leído directo de localStorage para no depender de un import circular con el store.
http.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('arp_session')
    const token = raw ? (JSON.parse(raw) as { token?: string }).token : undefined
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // sesión corrupta en localStorage: se ignora, el request sigue sin token
  }
  return config
})

// Sesión muerta (token vencido/inválido — ver authenticateToken en el
// backend): cierra sesión y manda a Login automáticamente, en vez de dejar
// al usuario "atascado" viendo solo la alerta de error de esa pantalla.
// Se distingue de un intento de login fallido (también 401) porque un login
// nunca manda header Authorization — ahí no hay sesión todavía que cerrar.
let redirectingToLogin = false

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadAuthHeader = Boolean(error?.config?.headers?.Authorization)
    if (axios.isAxiosError(error) && error.response?.status === 401 && hadAuthHeader && !redirectingToLogin) {
      redirectingToLogin = true
      useAppStore.getState().logout()
      window.location.href = `${ROUTES.LOGIN}?session=expired`
    }
    return Promise.reject(error)
  },
)

import axios from 'axios'

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

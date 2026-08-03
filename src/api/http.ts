import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export const http = axios.create({
  baseURL: API_BASE_URL,
})

import { http } from './http'
import { LoginResponseSchema, RegisterResponseSchema, MessageResponseSchema, type LoginResponse, type RegisterResponse, type MessageResponse } from '../types'

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await http.post('/users/login', { email, password })
  return LoginResponseSchema.parse(data)
}

export interface RegisterPayload {
  userName: string;
  email: string;
  password: string;
  phone?: string;
  recoveryEmail?: string;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await http.post('/auth/register', payload)
  return RegisterResponseSchema.parse(data)
}

export async function verifyEmail(token: string): Promise<MessageResponse> {
  const { data } = await http.get('/auth/verify-email', { params: { token } })
  return MessageResponseSchema.parse(data)
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
  const { data } = await http.post('/auth/forgot-password', { email })
  return MessageResponseSchema.parse(data)
}

export async function resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
  const { data } = await http.post('/auth/reset-password', { token, newPassword })
  return MessageResponseSchema.parse(data)
}

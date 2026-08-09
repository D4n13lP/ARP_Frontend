import { http } from './http'
import { AuthUserSchema, type AuthUser } from '../types'

// Solo admin: protegido en el backend con authenticateToken + authorizeRoles('admin').
export async function getUsers(): Promise<AuthUser[]> {
  const { data } = await http.get('/users')
  return AuthUserSchema.array().parse(data)
}

export async function getPendingUsers(): Promise<AuthUser[]> {
  const { data } = await http.get('/users', { params: { isAllowed: false } })
  return AuthUserSchema.array().parse(data)
}

export async function allowUser(userID: string): Promise<AuthUser> {
  const { data } = await http.put(`/users/${userID}/allow`)
  return AuthUserSchema.parse(data)
}

export async function deleteUser(userID: string): Promise<void> {
  await http.delete(`/users/${userID}`)
}

export async function promoteUser(userID: string): Promise<AuthUser> {
  const { data } = await http.put(`/users/${userID}/promote`)
  return AuthUserSchema.parse(data)
}

export async function demoteUser(userID: string): Promise<AuthUser> {
  const { data } = await http.put(`/users/${userID}/demote`)
  return AuthUserSchema.parse(data)
}

// Autoservicio: cualquier usuario autenticado edita lo suyo. Solo acepta
// userName y phone — el backend ignora cualquier otro campo a propósito.
export interface UpdateMePayload {
  userName?: string;
  phone?: string;
}

export async function updateMe(payload: UpdateMePayload): Promise<AuthUser> {
  const { data } = await http.put('/users/me', payload)
  return AuthUserSchema.parse(data)
}

export async function updateRecoveryEmail(recoveryEmail: string): Promise<AuthUser> {
  const { data } = await http.put('/users/me/recovery-email', { recoveryEmail })
  return AuthUserSchema.parse(data)
}

export async function uploadAvatar(file: File | Blob): Promise<AuthUser> {
  const formData = new FormData()
  formData.append('image', file, 'avatar.jpg')
  const { data } = await http.put('/users/me/avatar', formData)
  return AuthUserSchema.parse(data)
}

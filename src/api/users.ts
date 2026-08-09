import { http } from './http'
import { AuthUserSchema, type AuthUser } from '../types'

// Solo admin: protegido en el backend con authenticateToken + authorizeRoles('admin').
export async function getUsers(): Promise<AuthUser[]> {
  const { data } = await http.get('/users')
  return AuthUserSchema.array().parse(data)
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

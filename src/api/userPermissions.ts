import { http } from './http'
import { UserPermissionSchema, type UserPermission } from '../types'

// Solo admin: protegido en el backend con authenticateToken + authorizeRoles('admin').
export async function getUserPermissions(): Promise<UserPermission[]> {
  const { data } = await http.get('/user-permissions')
  return UserPermissionSchema.array().parse(data)
}

export interface UserPermissionUpdate {
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export async function updateUserPermission(
  userID: string,
  moduleID: string,
  updates: UserPermissionUpdate,
): Promise<UserPermission> {
  const { data } = await http.put(`/user-permissions/${userID}/${moduleID}`, updates)
  return UserPermissionSchema.parse(data)
}

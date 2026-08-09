import { http } from './http'
import { RolePermissionSchema, type RolePermission } from '../types'

export async function getPermissions(): Promise<RolePermission[]> {
  const { data } = await http.get('/permissions')
  return RolePermissionSchema.array().parse(data)
}

export interface PermissionUpdate {
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export async function updatePermission(
  userType: 'admin' | 'seller',
  moduleID: string,
  updates: PermissionUpdate,
): Promise<RolePermission> {
  const { data } = await http.put(`/permissions/${userType}/${moduleID}`, updates)
  return RolePermissionSchema.parse(data)
}

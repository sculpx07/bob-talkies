import type { Permission } from '@/admin/types/permissions'

/** A role as Roles & permissions shows it (GET /roles). */
export interface RoleRecord {
  id: string
  name: string
  displayName: string
  description: string
  /** the built-in Super Admin: every permission, cannot be edited or deleted */
  isSystem: boolean
  permissions: Permission[]
  /** staff members with this role */
  userCount: number
  createdAt: string
  updatedAt: string
}

export interface RoleInput {
  displayName: string
  description: string
  permissions: Permission[]
}

/** GET /roles/permissions: every permission, grouped by module, with labels. */
export interface PermissionGroup {
  key: string
  label: string
  permissions: Array<{ key: Permission; label: string; description?: string }>
}

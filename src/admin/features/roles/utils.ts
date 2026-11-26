import type { Permission } from '@/admin/types/permissions'
import type { PermissionGroup } from './types'

/*
 * Same rule as the backend: any permission of a module needs that module's "view".
 * Ticking "Edit bookings" ticks "View bookings"; unticking "View" unticks the whole module.
 */

const moduleOf = (key: string) => key.split('.')[0]
const isView = (key: string) => key.endsWith('.view')

/** Turns one permission on or off, keeping each module's "view" consistent. */
export function togglePermission(current: Permission[], group: PermissionGroup, key: Permission, on: boolean): Permission[] {
  const set = new Set(current)
  const view = group.permissions.find((p) => isView(p.key))?.key
  if (on) {
    set.add(key)
    if (view) set.add(view)
  } else if (isView(key)) {
    group.permissions.forEach((p) => set.delete(p.key))
  } else {
    set.delete(key)
  }
  return [...set]
}

/** Every permission of a module on, or all off. Keys the person cannot give are left as they were. */
export function toggleGroup(current: Permission[], group: PermissionGroup, on: boolean, canGrant: (key: Permission) => boolean): Permission[] {
  const set = new Set(current)
  for (const p of group.permissions) {
    if (on && canGrant(p.key)) set.add(p.key)
    if (!on) set.delete(p.key)
  }
  return [...set]
}

/** "18 of 41 permissions" style count, and which modules a role touches. */
export function summarize(permissions: Permission[], groups: PermissionGroup[] = []) {
  const modules = new Set(permissions.map(moduleOf))
  return {
    count: permissions.length,
    modules: groups.filter((g) => modules.has(g.key)).map((g) => g.label),
  }
}

export const totalPermissions = (groups: PermissionGroup[] = []) => groups.reduce((n, g) => n + g.permissions.length, 0)

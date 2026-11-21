import { ROLES, type RoleName } from '@/admin/types/auth'

export const ROLE_OPTIONS: { value: RoleName; label: string; description: string }[] = [
  { value: ROLES.ADMIN, label: 'Admin', description: 'Bookings, leads, theatres, slots, add-ons, offers and settings.' },
  { value: ROLES.SUPER_ADMIN, label: 'Super admin', description: 'Everything an admin can do, plus managing staff accounts.' },
]

export const roleLabel = (name?: RoleName | null) => ROLE_OPTIONS.find((r) => r.value === name)?.label ?? '—'

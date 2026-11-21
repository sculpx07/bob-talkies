import type { RoleName } from '@/admin/types/auth'

export interface StaffRole {
  name: RoleName
  displayName: string
}

/** A staff account as the Staff screen sees it (GET /users). */
export interface StaffMember {
  id: string
  name: string
  email: string
  role: StaffRole | null
  isActive: boolean
  lastLoginAt?: string | null
  createdAt: string
}

export interface StaffListParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
  role?: RoleName
  isActive?: boolean
}

export interface StaffInput {
  name: string
  email: string
  role: RoleName
}

/** Create and reset-password replies carry a one-time password. */
export interface StaffWithPassword {
  user: StaffMember
  temporaryPassword: string | null
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

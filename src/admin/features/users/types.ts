/** The role shown next to a staff member (permissions live on the role, see Roles & permissions). */
export interface StaffRole {
  id: string
  name: string
  displayName: string
  isSystem: boolean
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
  /** role id */
  role?: string
  isActive?: boolean
}

export interface StaffInput {
  name: string
  email: string
  /** role id */
  role: string
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

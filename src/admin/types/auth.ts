import type { Permission } from './permissions'

/** A staff role (Roles & permissions). The system role (Super Admin) has every permission. */
export interface Role {
  id: string
  /** stable key, e.g. "front_desk" */
  name: string
  displayName: string
  description?: string
  isSystem: boolean
}

/** The signed-in staff member (GET /auth/me, sign-in reply). */
export interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  /** everything this person may do; the backend checks the same keys */
  permissions: Permission[]
  isActive: boolean
  lastLoginAt?: string
}

export interface SignInResponse {
  user: AdminUser
  accessToken: string
  refreshToken: string
}

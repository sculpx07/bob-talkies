/** Role names, same as the backend (bob-admin src/constants/roles.js). */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
} as const
export type RoleName = (typeof ROLES)[keyof typeof ROLES]

export interface Role {
  id: string
  name: RoleName
  displayName: string
  description?: string
}

/** The signed-in staff member (GET /auth/me). */
export interface AdminUser {
  id: string
  name: string
  email: string
  role: Role
  isActive: boolean
  lastLoginAt?: string
}

export interface SignInResponse {
  user: AdminUser
  accessToken: string
  refreshToken: string
}

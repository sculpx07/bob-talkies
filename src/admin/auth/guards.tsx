import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { LoadingBlock, EmptyState } from '@/admin/components/ui'
import type { Permission } from '@/admin/types/permissions'
import { useAuth } from './AuthProvider'

/** Route wrapper: signed-in staff only, otherwise to /login (and back afterwards). */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingBlock className="min-h-screen" label="Checking your session…" />
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

/** Page-level guard: shows "no access" unless the person has at least one of the permissions. */
export function RequirePermission({ anyOf, children }: { anyOf: Permission[]; children: ReactNode }) {
  const { can } = useAuth()
  if (!can(...anyOf)) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-5 w-5" />}
        title="You do not have access to this page"
        description="Ask a super admin to add it to your role."
        className="py-24"
      />
    )
  }
  return <>{children}</>
}

/** Renders children only with the permission, e.g. a delete button. */
export function Can({ permission, children, fallback = null }: { permission: Permission | Permission[]; children: ReactNode; fallback?: ReactNode }) {
  const { can } = useAuth()
  const keys = Array.isArray(permission) ? permission : [permission]
  return <>{can(...keys) ? children : fallback}</>
}

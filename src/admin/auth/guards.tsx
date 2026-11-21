import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { LoadingBlock, EmptyState } from '@/admin/components/ui'
import type { RoleName } from '@/admin/types/auth'
import { useAuth } from './AuthProvider'

/** Route wrapper: signed-in staff only, otherwise to /login (and back afterwards). */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingBlock className="min-h-screen" label="Checking your session…" />
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

/** Page-level guard: shows "no access" instead of the page for other roles. */
export function RequireRole({ roles, children }: { roles: RoleName[]; children: ReactNode }) {
  const { hasRole } = useAuth()
  if (!hasRole(...roles)) {
    return (
      <EmptyState
        icon={<ShieldAlert className="h-5 w-5" />}
        title="You do not have access to this page"
        description="Ask a super admin if you need it."
        className="py-24"
      />
    )
  }
  return <>{children}</>
}

/** Renders children only for the given roles, e.g. a super-admin-only delete button. */
export function Can({ roles, children, fallback = null }: { roles: RoleName[]; children: ReactNode; fallback?: ReactNode }) {
  const { hasRole } = useAuth()
  return <>{hasRole(...roles) ? children : fallback}</>
}

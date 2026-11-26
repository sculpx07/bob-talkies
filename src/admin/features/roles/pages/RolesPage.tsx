import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, MoreHorizontal, Pencil, Plus, ShieldCheck, Trash2, Users } from 'lucide-react'
import { useAuth, useCurrentUser } from '@/admin/auth/AuthProvider'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, IconButton, LoadingBlock, Menu, useToast, type MenuItem } from '@/admin/components/ui'
import { errorMessage } from '@/admin/lib/api/errors'
import { PERMISSIONS } from '@/admin/types/permissions'
import { useDeleteRole, usePermissionGroups, useRoles } from '../api'
import type { RoleRecord } from '../types'
import { summarize, totalPermissions } from '../utils'

/** Roles & permissions: every role, how many staff have it and what it can do. */
export default function RolesPage() {
  const me = useCurrentUser()
  const navigate = useNavigate()
  const { can } = useAuth()
  const toast = useToast()
  const roles = useRoles()
  const groups = usePermissionGroups()
  const remove = useDeleteRole()
  const [deleting, setDeleting] = useState<RoleRecord | null>(null)
  const canManage = can(PERMISSIONS.ROLES_MANAGE)
  const total = totalPermissions(groups.data)

  const doDelete = () => {
    if (!deleting) return
    remove.mutate(deleting.id, {
      onSuccess: () => { toast.success(`${deleting.displayName} deleted`); setDeleting(null) },
      onError: (err) => { toast.error('Could not delete the role', errorMessage(err)); setDeleting(null) },
    })
  }

  /** the system role and the role you are signed in with can only be looked at */
  const locked = (r: RoleRecord) => r.isSystem || r.id === me.role.id

  const actions = (r: RoleRecord): MenuItem[] => [
    { label: canManage && !locked(r) ? 'Edit' : 'View', icon: <Pencil />, onSelect: () => navigate(`/roles/${r.id}`) },
    ...(canManage && !locked(r)
      ? [{ label: 'Delete', icon: <Trash2 />, danger: true, disabled: r.userCount > 0, onSelect: () => setDeleting(r) }]
      : []),
  ]

  return (
    <>
      <PageHeader
        title="Roles & permissions"
        description="A role is a set of permissions. Give each staff member one role on the Staff page."
        actions={canManage && <Link to="/roles/new"><Button leftIcon={<Plus className="h-4 w-4" />}>New role</Button></Link>}
      />

      {roles.isLoading ? (
        <LoadingBlock />
      ) : roles.error ? (
        <ErrorState error={roles.error} retry={() => roles.refetch()} />
      ) : !roles.data?.length ? (
        <EmptyState icon={<ShieldCheck className="h-5 w-5" />} title="No roles yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.data.map((r) => {
            const { count, modules } = summarize(r.permissions, groups.data)
            return (
              <Card key={r.id} className="flex flex-col p-5" aria-label={r.displayName}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold text-slate-900">
                      <Link to={`/roles/${r.id}`} className="focus-ring rounded hover:text-violet-700">{r.displayName}</Link>
                      {r.isSystem && <Badge tone="brand"><Lock className="mr-1 inline h-3 w-3" aria-hidden="true" />Built in</Badge>}
                      {r.id === me.role.id && <Badge>Your role</Badge>}
                    </h2>
                    {r.description && <p className="mt-1 text-sm text-slate-600">{r.description}</p>}
                  </div>
                  <Menu items={actions(r)} trigger={<IconButton label={`Actions for ${r.displayName}`}><MoreHorizontal className="h-4 w-4" /></IconButton>} />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-800">
                  {r.isSystem ? 'Every permission' : `${count} of ${total || '…'} permissions`}
                </p>
                <p className="mt-1 line-clamp-2 flex-1 text-xs text-slate-500">
                  {r.isSystem ? 'Full access, including staff, roles and payment settings.' : modules.join(' · ') || 'No permissions'}
                </p>
                <p className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  {r.userCount === 0 ? 'No staff' : `${r.userCount} staff ${r.userCount === 1 ? 'member' : 'members'}`}
                </p>
              </Card>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.displayName ?? 'role'}?`}
        description="The role is removed for good. No staff member has it."
        confirmLabel="Delete role"
        tone="danger"
        loading={remove.isPending}
        onConfirm={doDelete}
      />
    </>
  )
}

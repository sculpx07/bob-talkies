import { useState } from 'react'
import { KeyRound, MoreHorizontal, Pencil, Plus, UserCheck, UserX, Users } from 'lucide-react'
import { useAuth, useCurrentUser } from '@/admin/auth/AuthProvider'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, ConfirmDialog, DataTable, EmptyState, IconButton, Menu, Pagination, SearchInput, Select, useToast,
  type Column, type MenuItem,
} from '@/admin/components/ui'
import { useDisclosure } from '@/admin/hooks/useDisclosure'
import { useUrlFilters } from '@/admin/hooks/useUrlFilters'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDate, timeAgo } from '@/admin/lib/utils/date'
import { PERMISSIONS } from '@/admin/types/permissions'
import { useRoles } from '@/admin/features/roles/api'
import { useResetStaffPassword, useSetStaffActive, useStaff } from '../api'
import { StaffFormModal, TemporaryPasswordModal, canAssignRole } from '../components/StaffModals'
import type { StaffMember } from '../types'

type PendingAction = { kind: 'deactivate' | 'reactivate' | 'reset'; member: StaffMember }
type ShownPassword = { member: StaffMember; password: string; reason: 'created' | 'reset' }

const STATUS_OPTIONS = [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Deactivated' }]

/** Staff accounts: add, edit, deactivate, reset password ("Manage staff"); everyone with "View staff" sees the list. */
export default function StaffPage() {
  const me = useCurrentUser()
  const { can, updateUser } = useAuth()
  const canManage = can(PERMISSIONS.STAFF_MANAGE)
  const roles = useRoles()
  const toast = useToast()
  const add = useDisclosure()
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [shown, setShown] = useState<ShownPassword | null>(null)
  const setActive = useSetStaffActive()
  const resetPassword = useResetStaffPassword()

  const [f, setFilters, reset] = useUrlFilters({ page: 1, search: '', role: '', status: '', sort: 'name' })
  const query = useStaff({
    page: f.page,
    limit: 25,
    sort: f.sort,
    search: f.search || undefined,
    role: f.role || undefined,
    isActive: f.status ? f.status === 'true' : undefined,
  })
  const hasFilters = Boolean(f.search || f.role || f.status)
  const isMe = (m: StaffMember) => m.id === me.id

  const runPending = async () => {
    if (!pending) return
    const { kind, member } = pending
    try {
      if (kind === 'reset') {
        const result = await resetPassword.mutateAsync(member.id)
        setShown({ member: result.user, password: result.temporaryPassword ?? '', reason: 'reset' })
      } else {
        await setActive.mutateAsync({ id: member.id, isActive: kind === 'reactivate' })
        toast.success(kind === 'reactivate' ? `${member.name} can sign in again` : `${member.name} was deactivated and signed out`)
      }
      setPending(null)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  // you can manage people whose role is within your own permissions (the backend checks the same)
  const manageable = (m: StaffMember) => {
    if (!canManage) return false
    const r = roles.data?.find((x) => x.id === m.role?.id)
    return isMe(m) || !r || canAssignRole(me, r)
  }

  const rowActions = (m: StaffMember): MenuItem[] => [
    { label: 'Edit', icon: <Pencil />, onSelect: () => setEditing(m) },
    ...(isMe(m) ? [] : [
      { label: 'Reset password', icon: <KeyRound />, disabled: !m.isActive, onSelect: () => setPending({ kind: 'reset', member: m }) },
      m.isActive
        ? { label: 'Deactivate', icon: <UserX />, danger: true, onSelect: () => setPending({ kind: 'deactivate', member: m }) }
        : { label: 'Reactivate', icon: <UserCheck />, onSelect: () => setPending({ kind: 'reactivate', member: m }) },
    ]),
  ]

  const columns: Column<StaffMember>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      cell: (m) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-medium text-slate-900">{m.name}{isMe(m) && <Badge>You</Badge>}</p>
          <p className="truncate text-xs text-slate-500">{m.email}</p>
        </div>
      ),
    },
    { key: 'role', header: 'Role', cell: (m) => <Badge tone={m.role?.isSystem ? 'brand' : 'neutral'}>{m.role?.displayName ?? '—'}</Badge> },
    { key: 'status', header: 'Status', cell: (m) => (m.isActive ? <Badge tone="success" dot>Active</Badge> : <Badge tone="danger" dot>Deactivated</Badge>) },
    {
      key: 'lastLoginAt',
      header: 'Last sign-in',
      sortable: true,
      hideOnMobile: true,
      cell: (m) => <span className="whitespace-nowrap text-xs text-slate-600">{m.lastLoginAt ? timeAgo(m.lastLoginAt) : 'Never'}</span>,
    },
    { key: 'createdAt', header: 'Added', sortable: true, hideOnMobile: true, cell: (m) => <span className="whitespace-nowrap text-xs text-slate-500">{formatDate(m.createdAt)}</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-12',
      cell: (m) => manageable(m) && (
        <Menu items={rowActions(m)} trigger={<IconButton label={`Actions for ${m.name}`}><MoreHorizontal className="h-4 w-4" /></IconButton>} />
      ),
    },
  ]

  const confirmCopy: Record<PendingAction['kind'], { title: string; body: string; label: string; tone: 'primary' | 'danger' }> = {
    deactivate: { title: 'Deactivate account?', body: 'They are signed out everywhere and cannot sign in until reactivated. Their bookings and lead history stay as they are.', label: 'Deactivate', tone: 'danger' },
    reactivate: { title: 'Reactivate account?', body: 'They can sign in again with their existing password.', label: 'Reactivate', tone: 'primary' },
    reset: { title: 'Reset password?', body: 'A new temporary password is created and shown once. Their current password stops working and they are signed out everywhere.', label: 'Reset password', tone: 'danger' },
  }
  const copy = pending && confirmCopy[pending.kind]

  return (
    <>
      <PageHeader
        title="Staff"
        description="Who can sign in to the admin panel, and what they can do."
        actions={canManage && <Button leftIcon={<Plus className="h-4 w-4" />} onClick={add.open}>Add staff member</Button>}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <SearchInput value={f.search} onChange={(search) => setFilters({ search })} placeholder="Name or email" />
          <div className="w-40"><Select aria-label="Role" value={f.role} onChange={(e) => setFilters({ role: e.target.value })} placeholder="Any role" options={(roles.data ?? []).map((r) => ({ value: r.id, label: r.displayName }))} /></div>
          <div className="w-40"><Select aria-label="Status" value={f.status} onChange={(e) => setFilters({ status: e.target.value })} placeholder="Any status" options={STATUS_OPTIONS} /></div>
          {hasFilters && <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button>}
        </div>
        <DataTable
          columns={columns}
          rows={query.data?.users}
          rowKey={(m) => m.id}
          loading={query.isLoading || query.isPlaceholderData}
          error={query.error}
          onRetry={() => query.refetch()}
          sort={f.sort}
          onSortChange={(sort) => setFilters({ sort })}
          empty={<EmptyState icon={<Users className="h-5 w-5" />} title="No staff match" action={<Button variant="secondary" onClick={reset}>Clear filters</Button>} />}
        />
        <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
      </Card>

      <StaffFormModal
        open={add.isOpen}
        onOpenChange={add.setOpen}
        onCreated={(member, password) => setShown({ member, password, reason: 'created' })}
      />
      <StaffFormModal
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        member={editing ?? undefined}
        isSelf={editing ? isMe(editing) : false}
        onSaved={(m) => { if (isMe(m)) updateUser({ name: m.name, email: m.email }) }}
      />
      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(o) => !o && setPending(null)}
        title={copy?.title ?? ''}
        description={pending ? `${pending.member.name} · ${pending.member.email}` : undefined}
        confirmLabel={copy?.label}
        tone={copy?.tone}
        loading={setActive.isPending || resetPassword.isPending}
        onConfirm={runPending}
      >
        <p className="text-sm text-slate-600">{copy?.body}</p>
      </ConfirmDialog>
      <TemporaryPasswordModal
        open={Boolean(shown)}
        onOpenChange={(o) => !o && setShown(null)}
        member={shown?.member}
        password={shown?.password ?? ''}
        reason={shown?.reason ?? 'created'}
      />
    </>
  )
}

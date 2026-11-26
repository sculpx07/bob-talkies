import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Copy, KeyRound } from 'lucide-react'
import { useCurrentUser } from '@/admin/auth/AuthProvider'
import { Button, FormField, Input, LoadingBlock, Modal, useToast } from '@/admin/components/ui'
import { applyServerErrors } from '@/admin/lib/forms'
import { cn } from '@/admin/lib/utils/cn'
import { useRoles } from '@/admin/features/roles/api'
import type { RoleRecord } from '@/admin/features/roles/types'
import type { AdminUser } from '@/admin/types/auth'
import { useCreateStaff, useUpdateStaff } from '../api'
import { staffSchema, type StaffFormValues } from '../schema'
import type { StaffMember } from '../types'

/** Same rule as the backend: only a super admin gives the Super Admin role; others only roles within their own permissions. */
export function canAssignRole(me: AdminUser, role: RoleRecord) {
  if (role.isSystem) return me.role.isSystem
  return role.permissions.every((p) => me.permissions.includes(p))
}

// ---------------------------------------------------------------- add / edit

/** Add a staff member (a temporary password is generated) or edit one. */
export function StaffFormModal({ open, onOpenChange, member, isSelf, onCreated, onSaved }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  /** given = edit */
  member?: StaffMember
  /** editing your own account: the role cannot change */
  isSelf?: boolean
  onCreated?: (member: StaffMember, temporaryPassword: string) => void
  onSaved?: (member: StaffMember) => void
}) {
  const toast = useToast()
  const me = useCurrentUser()
  const roles = useRoles(open)
  const create = useCreateStaff()
  const update = useUpdateStaff()
  const [formError, setFormError] = useState('')

  // new staff start on the first role this person may give that is not Super Admin
  const firstRole = roles.data?.find((r) => !r.isSystem && canAssignRole(me, r))?.id ?? ''
  const defaults = (): StaffFormValues => ({ name: member?.name ?? '', email: member?.email ?? '', role: member?.role?.id ?? firstRole })
  const { register, handleSubmit, reset, setError, watch, setValue, formState: { errors, isSubmitting } } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: defaults(),
  })
  useEffect(() => { if (open) { reset(defaults()); setFormError('') } }, [open, member, firstRole]) // eslint-disable-line react-hooks/exhaustive-deps
  const role = watch('role')

  const submit = handleSubmit(async (v) => {
    setFormError('')
    try {
      if (member) {
        const saved = await update.mutateAsync({ id: member.id, name: v.name, email: v.email, ...(!isSelf && { role: v.role }) })
        toast.success('Staff member updated')
        onSaved?.(saved)
      } else {
        const created = await create.mutateAsync(v)
        onCreated?.(created.user, created.temporaryPassword ?? '')
      }
      onOpenChange(false)
    } catch (err) {
      setFormError(applyServerErrors(err, setError, Object.keys(staffSchema.shape)).join(' '))
    }
  })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={member ? 'Edit staff member' : 'Add staff member'}
      description={member ? undefined : 'A temporary password is created for them. You will see it once, after saving.'}
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={isSubmitting}>{member ? 'Save' : 'Add staff member'}</Button></>}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        <FormField label="Name" required error={errors.name?.message}>{(f) => <Input {...f} autoComplete="off" {...register('name')} />}</FormField>
        <FormField label="Email" required error={errors.email?.message} hint="They sign in with this.">
          {(f) => <Input {...f} type="email" autoComplete="off" {...register('email')} />}
        </FormField>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">Role</legend>
          {isSelf ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">You cannot change your own role. Another person who manages staff can.</p>
          ) : roles.isLoading ? (
            <LoadingBlock />
          ) : (
            <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
              {roles.data?.map((r) => {
                const allowed = canAssignRole(me, r)
                return (
                  <label
                    key={r.id}
                    title={allowed ? undefined : 'This role has permissions you do not have'}
                    className={cn(
                      'flex gap-3 rounded-lg border p-3 text-sm',
                      allowed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                      role === r.id ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500' : 'border-slate-200 hover:border-slate-300',
                    )}
                  >
                    <input type="radio" className="mt-0.5 accent-violet-600" value={r.id} checked={role === r.id} disabled={!allowed} onChange={() => setValue('role', r.id, { shouldDirty: true })} />
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-900">{r.displayName}</span>
                      <span className="line-clamp-2 block text-xs text-slate-500">{r.description || (r.isSystem ? 'Every permission' : `${r.permissions.length} permissions`)}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          )}
          {errors.role?.message && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
        </fieldset>
      </form>
    </Modal>
  )
}

// ---------------------------------------------------------------- one-time password

/** Shows a generated password once, with a copy button. It cannot be shown again after closing. */
export function TemporaryPasswordModal({ open, onOpenChange, member, password, reason }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  member?: StaffMember
  password: string
  reason: 'created' | 'reset'
}) {
  const [copied, setCopied] = useState(false)
  useEffect(() => { if (open) setCopied(false) }, [open])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
    } catch { /* clipboard blocked: the password is selectable */ }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      title={reason === 'created' ? 'Staff member added' : 'Password reset'}
      description={`Share this temporary password with ${member?.name ?? 'them'} privately. It is shown only once.`}
      footer={<Button onClick={() => onOpenChange(false)}>Done</Button>}
    >
      <div className="space-y-3">
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <p className="text-xs text-slate-500">Email</p>
          <p className="font-medium text-slate-900">{member?.email}</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3">
          <KeyRound className="h-4 w-4 shrink-0 text-violet-600" />
          <code data-testid="temporary-password" className="flex-1 select-all font-mono text-base tracking-wider text-slate-900">{password}</code>
          <Button size="sm" variant="secondary" leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          {reason === 'reset' ? 'Their old password no longer works and they were signed out everywhere. ' : ''}
          Ask them to change it from <span className="font-medium">My account</span> after signing in.
        </p>
      </div>
    </Modal>
  )
}

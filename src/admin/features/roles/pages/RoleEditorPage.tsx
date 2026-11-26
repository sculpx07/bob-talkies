import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Info, Lock } from 'lucide-react'
import { useAuth, useCurrentUser } from '@/admin/auth/AuthProvider'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { Button, Card, ErrorState, FormField, Input, LoadingBlock, Textarea, useToast } from '@/admin/components/ui'
import { applyServerErrors } from '@/admin/lib/forms'
import { PERMISSIONS, type Permission } from '@/admin/types/permissions'
import { useCreateRole, usePermissionGroups, useRole, useUpdateRole } from '../api'
import { PermissionMatrix } from '../components/PermissionMatrix'
import type { RoleRecord } from '../types'
import { totalPermissions } from '../utils'

const schema = z.object({
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters').max(40),
  description: z.string().trim().max(200),
  permissions: z.array(z.string()).min(1, 'Give the role at least one permission'),
})
type FormValues = z.infer<typeof schema>
const FIELDS = Object.keys(schema.shape)

const toForm = (role?: RoleRecord): FormValues => ({
  displayName: role?.displayName ?? '',
  description: role?.description ?? '',
  permissions: role?.permissions ?? [],
})

/** /roles/new and /roles/:id. The system role and your own role open read-only. */
export default function RoleEditorPage() {
  const { id } = useParams()
  const isNew = !id
  const role = useRole(id)
  const groups = usePermissionGroups()

  if ((!isNew && role.isLoading) || groups.isLoading) return <LoadingBlock />
  if (role.error || groups.error) return <ErrorState error={role.error ?? groups.error} retry={() => { role.refetch(); groups.refetch() }} />
  return <RoleEditor key={id ?? 'new'} role={isNew ? undefined : role.data} groups={groups.data ?? []} />
}

function RoleEditor({ role, groups }: { role?: RoleRecord; groups: NonNullable<ReturnType<typeof usePermissionGroups>['data']> }) {
  const me = useCurrentUser()
  const { can } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const create = useCreateRole()
  const update = useUpdateRole()
  const [formError, setFormError] = useState('')

  const own = role?.id === me.role.id
  const readOnly = !can(PERMISSIONS.ROLES_MANAGE) || Boolean(role?.isSystem) || own
  // the backend only lets you hand out permissions you have yourself
  const canGrant = (key: Permission) => me.permissions.includes(key)

  const { register, control, handleSubmit, reset, setError, watch, formState: { errors, isSubmitting, isDirty } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toForm(role) })
  useEffect(() => { reset(toForm(role)) }, [role, reset])
  const selected = watch('permissions')

  const submit = handleSubmit(async (v) => {
    setFormError('')
    const input = { displayName: v.displayName, description: v.description, permissions: v.permissions as Permission[] }
    try {
      if (role) {
        await update.mutateAsync({ id: role.id, ...input })
        toast.success(`${v.displayName} saved`, role.userCount ? `${role.userCount} staff ${role.userCount === 1 ? 'member gets' : 'members get'} the change on their next action.` : undefined)
      } else {
        const created = await create.mutateAsync(input)
        toast.success(`${created.displayName} created`, 'Give it to staff on the Staff page.')
      }
      navigate('/roles')
    } catch (err) {
      setFormError(applyServerErrors(err, setError, FIELDS).join(' '))
    }
  })

  const title = role ? role.displayName : 'New role'
  return (
    <>
      <PageHeader
        title={title}
        description={role ? `${role.userCount} staff ${role.userCount === 1 ? 'member has' : 'members have'} this role` : 'Name the role and tick what it can do.'}
        back={{ to: '/roles', label: 'Roles & permissions' }}
        actions={!readOnly && (
          <>
            <Button variant="secondary" onClick={() => navigate('/roles')} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={submit} loading={isSubmitting} disabled={Boolean(role) && !isDirty}>{role ? 'Save role' : 'Create role'}</Button>
          </>
        )}
      />

      {readOnly && (
        <p className="mb-4 flex items-start gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm text-slate-700">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          {role?.isSystem
            ? 'Super Admin is built in: it always has every permission and cannot be changed.'
            : own
              ? 'This is your own role. Another person who manages roles can change it.'
              : 'You can look at roles, but not change them.'}
        </p>
      )}
      {formError && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

      <form onSubmit={submit} noValidate className="space-y-6">
        <Card className="grid gap-4 p-5 md:grid-cols-2">
          <FormField label="Role name" required error={errors.displayName?.message} hint='e.g. "Front desk", "Manager"'>
            {(f) => <Input {...f} maxLength={40} disabled={readOnly} {...register('displayName')} />}
          </FormField>
          <FormField label="Description" error={errors.description?.message} hint="Optional; who this role is for">
            {(f) => <Textarea {...f} rows={2} maxLength={200} disabled={readOnly} {...register('description')} />}
          </FormField>
        </Card>

        <section aria-labelledby="perm-heading">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="perm-heading" className="text-base font-semibold text-slate-900">Permissions</h2>
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                Any permission of a section also gives its View. Unticking View clears the section.
              </p>
            </div>
            <p className="text-sm font-medium text-slate-700">
              {role?.isSystem ? 'Every permission' : `${selected.length} of ${totalPermissions(groups)} selected`}
            </p>
          </div>
          {errors.permissions?.message && <p role="alert" className="mb-2 text-sm text-red-600">{errors.permissions.message}</p>}
          <Controller control={control} name="permissions" render={({ field }) => (
            <PermissionMatrix
              groups={groups}
              value={(role?.isSystem ? groups.flatMap((g) => g.permissions.map((p) => p.key)) : field.value) as Permission[]}
              onChange={field.onChange}
              readOnly={readOnly}
              canGrant={canGrant}
              invalid={Boolean(errors.permissions)}
            />
          )} />
        </section>

        {!readOnly && (
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button variant="secondary" onClick={() => navigate('/roles')} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" loading={isSubmitting} disabled={Boolean(role) && !isDirty}>{role ? 'Save role' : 'Create role'}</Button>
          </div>
        )}
      </form>
    </>
  )
}

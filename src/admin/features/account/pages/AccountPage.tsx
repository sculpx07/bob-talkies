import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'
import { useCurrentUser } from '@/admin/auth/AuthProvider'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { Badge, Button, Card, CardBody, CardHeader, FormField, Input, useToast } from '@/admin/components/ui'
import { applyServerErrors } from '@/admin/lib/forms'
import { formatDateTime } from '@/admin/lib/utils/date'
import { useChangePassword } from '@/admin/features/users/api'
import { changePasswordSchema, type ChangePasswordValues } from '@/admin/features/users/schema'

const EMPTY: ChangePasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' }

/** Profile of the signed-in staff member, and changing their own password. */
export default function AccountPage() {
  const user = useCurrentUser()
  const toast = useToast()
  const change = useChangePassword()
  const [formError, setFormError] = useState('')
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY,
  })

  const submit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setFormError('')
    try {
      await change.mutateAsync({ currentPassword, newPassword })
      reset(EMPTY)
      toast.success('Password changed. Other devices were signed out.')
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['currentPassword', 'newPassword']).join(' '))
    }
  })

  const rows: [string, ReactNode][] = [
    ['Name', user.name],
    ['Email', user.email],
    ['Role', <Badge key="role" tone={user.role.isSystem ? 'brand' : 'neutral'}>{user.role.displayName}</Badge>],
    ['Last sign-in', user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'],
  ]

  return (
    <>
      <PageHeader title="My account" description="Your profile and password." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader title="Profile" description="Someone who manages staff can change your name, email or role." />
          <CardBody>
            <dl className="divide-y divide-slate-100 text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Change password" description="At least 8 characters, with a letter and a number. You stay signed in here; other devices are signed out." />
          <CardBody>
            <form onSubmit={submit} noValidate className="space-y-4">
              {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
              <FormField label="Current password" required error={errors.currentPassword?.message}>
                {(f) => <Input {...f} type="password" autoComplete="current-password" {...register('currentPassword')} />}
              </FormField>
              <FormField label="New password" required error={errors.newPassword?.message}>
                {(f) => <Input {...f} type="password" autoComplete="new-password" {...register('newPassword')} />}
              </FormField>
              <FormField label="Confirm new password" required error={errors.confirmPassword?.message}>
                {(f) => <Input {...f} type="password" autoComplete="new-password" {...register('confirmPassword')} />}
              </FormField>
              <div className="flex justify-end">
                <Button type="submit" loading={isSubmitting}>Change password</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  )
}

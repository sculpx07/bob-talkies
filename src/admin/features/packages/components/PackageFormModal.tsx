import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, ChipGroup, FormField, Input, Modal, MoneyInput, Select, Switch, TagInput, Textarea, useToast } from '@/admin/components/ui'
import { useTheatreOptions } from '@/admin/features/theatres/api'
import { applyServerErrors } from '@/admin/lib/forms'
import { useCreatePackage, useUpdatePackage } from '../api'
import { TIER_OPTIONS } from '../constants'
import { PACKAGE_FORM_FIELDS, formToPackage, packageFieldMap, packageFormSchema, packageToForm, type PackageFormValues } from '../schema'
import type { CelebrationPackage } from '../types'

const num = { valueAsNumber: true } as const

/** Add or edit a website package. */
export function PackageFormModal({ open, onOpenChange, pkg }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  /** given = edit */
  pkg?: CelebrationPackage
}) {
  const toast = useToast()
  const create = useCreatePackage()
  const update = useUpdatePackage()
  const theatres = useTheatreOptions()
  const [formError, setFormError] = useState('')

  const { register, control, handleSubmit, reset, setError, watch, formState: { errors, isSubmitting } } = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: packageToForm(pkg),
  })
  useEffect(() => { if (open) { reset(packageToForm(pkg)); setFormError('') } }, [open, pkg, reset])
  const allTheatres = watch('allTheatres')

  const submit = handleSubmit(async (v) => {
    setFormError('')
    try {
      const input = formToPackage(v)
      if (pkg) await update.mutateAsync({ id: pkg.id, ...input })
      else await create.mutateAsync(input)
      toast.success(pkg ? 'Package updated' : 'Package added')
      onOpenChange(false)
    } catch (err) {
      setFormError(applyServerErrors(err, setError, PACKAGE_FORM_FIELDS, packageFieldMap).join(' '))
    }
  })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={pkg ? `Edit ${pkg.name}` : 'Add package'}
      description="Shown on the website's Packages page."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={isSubmitting}>{pkg ? 'Save' : 'Add package'}</Button></>}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Name" required error={errors.name?.message}>{(f) => <Input {...f} placeholder="Gold" {...register('name')} />}</FormField>
          <FormField label="Tier" required hint="Sets the colour on the website" error={errors.tier?.message}>
            {(f) => <Select {...f} options={TIER_OPTIONS.map(({ value, label }) => ({ value, label }))} {...register('tier')} />}
          </FormField>
          <FormField label="Badge" hint="Optional, e.g. Most Popular" error={errors.badge?.message}>{(f) => <Input {...f} maxLength={30} {...register('badge')} />}</FormField>
        </div>
        <FormField label="Description" error={errors.description?.message}>{(f) => <Textarea {...f} rows={2} maxLength={500} {...register('description')} />}</FormField>
        <FormField label="What's included" required hint="Type one item and press Enter" error={errors.inclusions?.message}>
          {(f) => (
            <Controller control={control} name="inclusions" render={({ field }) => (
              <TagInput id={f.id} invalid={f.invalid} describedBy={f.describedBy} value={field.value} onChange={field.onChange} max={30} placeholder="e.g. 1 bouquet" />
            )} />
          )}
        </FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Weekday price" required error={errors.price?.message}>{(f) => <MoneyInput {...f} {...register('price', num)} />}</FormField>
          <FormField label="Weekend price" required hint="Saturday and Sunday" error={errors.weekendPrice?.message}>{(f) => <MoneyInput {...f} {...register('weekendPrice', num)} />}</FormField>
          <FormField label="Guests included" required error={errors.includedGuests?.message}>{(f) => <Input {...f} type="number" min={1} {...register('includedGuests', num)} />}</FormField>
        </div>
        <div className="space-y-2">
          <Controller control={control} name="allTheatres" render={({ field }) => (
            <Switch checked={field.value} onChange={field.onChange} label="Available in every theatre" />
          )} />
          {!allTheatres && (
            <FormField label="Theatres" required error={errors.theatres?.message}>
              {(f) => (
                <Controller control={control} name="theatres" render={({ field }) => (
                  <ChipGroup label="Theatres" invalid={f.invalid} value={field.value} onChange={field.onChange}
                    options={(theatres.data ?? []).map((t) => ({ value: t.id, label: t.name }))} />
                )} />
              )}
            </FormField>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Display order" hint="Lower shows first" error={errors.sortOrder?.message}>{(f) => <Input {...f} type="number" min={0} {...register('sortOrder', num)} />}</FormField>
          <div className="flex items-end pb-2 sm:col-span-2">
            <Controller control={control} name="isAvailable" render={({ field }) => (
              <Switch checked={field.value} onChange={field.onChange} label="Show on the website" />
            )} />
          </div>
        </div>
      </form>
    </Modal>
  )
}

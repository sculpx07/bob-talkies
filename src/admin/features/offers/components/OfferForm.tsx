import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button, ChipGroup, FormField, FormSection, FullWidth, Input, MoneyInput, SegmentedControl, Switch, Textarea,
} from '@/admin/components/ui'
import { useTheatreOptions } from '@/admin/features/theatres/api'
import { DAY_OPTIONS } from '@/admin/features/slots/utils'
import { applyServerErrors } from '@/admin/lib/forms'
import { OFFER_FORM_FIELDS, offerFieldMap, offerFormSchema, type OfferFormValues } from '../schema'

const num = { valueAsNumber: true } as const

/** Create / edit form for a coupon. */
export function OfferForm({ defaultValues, submitLabel, onSubmit, onCancel, codeLocked }: {
  defaultValues: OfferFormValues
  submitLabel: string
  onSubmit: (values: OfferFormValues) => Promise<void>
  onCancel?: () => void
  /** the code was already used by bookings, so it cannot be renamed */
  codeLocked?: boolean
}) {
  const [formErrors, setFormErrors] = useState<string[]>([])
  const theatres = useTheatreOptions()

  const { register, control, handleSubmit, reset, setError, watch, formState: { errors, isSubmitting, isDirty } } =
    useForm<OfferFormValues>({ resolver: zodResolver(offerFormSchema), defaultValues })

  useEffect(() => { reset(defaultValues) }, [defaultValues, reset])

  const [discountType, allTheatres, validFrom] = watch(['discountType', 'allTheatres', 'validFrom'])
  const percent = discountType === 'percent'

  const submit = handleSubmit(async (values) => {
    setFormErrors([])
    try {
      await onSubmit(values)
    } catch (err) {
      setFormErrors(applyServerErrors(err, setError, OFFER_FORM_FIELDS, offerFieldMap))
    }
  })

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {formErrors.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formErrors.map((m) => <p key={m}>{m}</p>)}
        </div>
      )}

      <FormSection title="Code & text" description="What customers type and see on the offers page.">
        <FormField label="Code" required hint={codeLocked ? 'Already used by bookings, so it cannot be renamed' : 'Customers type this at checkout'} error={errors.code?.message}>
          {(f) => <Input {...f} placeholder="e.g. DIWALI300" className="font-mono uppercase" disabled={codeLocked} {...register('code')} />}
        </FormField>
        <FormField label="Badge" hint='Small label, e.g. "New User"' error={errors.badge?.message}>
          {(f) => <Input {...f} {...register('badge')} />}
        </FormField>
        <FullWidth>
          <FormField label="Title" required error={errors.title?.message}>
            {(f) => <Input {...f} placeholder="e.g. ₹300 off this Diwali" {...register('title')} />}
          </FormField>
        </FullWidth>
        <FullWidth>
          <FormField label="Description" error={errors.description?.message}>
            {(f) => <Textarea {...f} rows={2} {...register('description')} />}
          </FormField>
        </FullWidth>
      </FormSection>

      <FormSection title="Discount" description="Taken off the order subtotal, before GST. Never more than the order.">
        <FullWidth>
          <Controller control={control} name="discountType" render={({ field }) => (
            <SegmentedControl label="Discount type" value={field.value} onChange={field.onChange} options={[{ value: 'flat', label: '₹ off' }, { value: 'percent', label: '% off' }]} />
          )} />
        </FullWidth>
        <FormField label={percent ? 'Percent off' : 'Amount off'} required error={errors.discountValue?.message}>
          {(f) => percent
            ? <Input {...f} type="number" min={1} max={100} trailing="%" {...register('discountValue', num)} />
            : <MoneyInput {...f} placeholder="500" {...register('discountValue', num)} />}
        </FormField>
        {percent && (
          <FormField label="Maximum discount" hint="Optional cap" error={errors.maxDiscount?.message}>
            {(f) => <MoneyInput {...f} placeholder="1000" {...register('maxDiscount', num)} />}
          </FormField>
        )}
        <FormField label="Minimum order" hint="Optional; subtotal needed for the code to work" error={errors.minOrder?.message}>
          {(f) => <MoneyInput {...f} {...register('minOrder', num)} />}
        </FormField>
      </FormSection>

      <FormSection title="Who and when it applies" description="Days are the days of the booked slot.">
        <FullWidth>
          <Controller control={control} name="allTheatres" render={({ field }) => (
            <Switch id="offerAllTheatres" checked={field.value} onChange={field.onChange} label="Works at every theatre" description="Turn off to pick specific theatres." />
          )} />
        </FullWidth>
        {!allTheatres && (
          <FullWidth>
            <FormField label="Theatres" required error={errors.theatres?.message}>
              {() => (
                <Controller control={control} name="theatres" render={({ field }) => (
                  <ChipGroup label="Theatres" value={field.value} onChange={field.onChange} invalid={Boolean(errors.theatres)} options={(theatres.data ?? []).map((t) => ({ value: t.id, label: t.name }))} />
                )} />
              )}
            </FormField>
          </FullWidth>
        )}
        <FullWidth>
          <FormField label="Days" required error={errors.applicableDays?.message}>
            {() => (
              <Controller control={control} name="applicableDays" render={({ field }) => (
                <ChipGroup label="Days" options={DAY_OPTIONS} value={field.value} onChange={field.onChange} invalid={Boolean(errors.applicableDays)} />
              )} />
            )}
          </FormField>
        </FullWidth>
        <FullWidth>
          <Controller control={control} name="firstBookingOnly" render={({ field }) => (
            <Switch id="firstBookingOnly" checked={field.value} onChange={field.onChange} label="First booking only" description="Only customers (by mobile number) with no earlier booking." />
          )} />
        </FullWidth>
      </FormSection>

      <FormSection title="Validity & limits" description="Dates are when the code can be used (venue time, both days included). Empty limits mean unlimited.">
        <FormField label="Valid from" required error={errors.validFrom?.message}>
          {(f) => <Input {...f} type="date" {...register('validFrom')} />}
        </FormField>
        <FormField label="Valid until" required error={errors.validUntil?.message}>
          {(f) => <Input {...f} type="date" min={validFrom} {...register('validUntil')} />}
        </FormField>
        <FormField label="Total uses" hint="Across all customers" error={errors.usageLimit?.message}>
          {(f) => <Input {...f} type="number" min={1} placeholder="Unlimited" {...register('usageLimit', num)} />}
        </FormField>
        <FormField label="Uses per customer" error={errors.perCustomerLimit?.message}>
          {(f) => <Input {...f} type="number" min={1} placeholder="Unlimited" {...register('perCustomerLimit', num)} />}
        </FormField>
      </FormSection>

      <FormSection title="Display">
        <FormField label="Display order" hint="Lower numbers are listed first" error={errors.sortOrder?.message}>
          {(f) => <Input {...f} type="number" min={0} {...register('sortOrder', num)} />}
        </FormField>
        <div />
        <FullWidth>
          <Controller control={control} name="isPublic" render={({ field }) => (
            <Switch id="isPublic" checked={field.value} onChange={field.onChange} label="Show on the offers page" description="Off: a hidden code that still works when typed." />
          )} />
        </FullWidth>
        <FullWidth>
          <Controller control={control} name="isActive" render={({ field }) => (
            <Switch id="offerActive" checked={field.value} onChange={field.onChange} label="Active" description="Off switches the code off everywhere." />
          )} />
        </FullWidth>
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {onCancel && <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
        <Button type="submit" loading={isSubmitting} disabled={!isDirty && !isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  )
}

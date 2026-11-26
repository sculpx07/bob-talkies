import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, ChipGroup, FormField, Input, Modal, MoneyInput, SegmentedControl, Switch, useToast } from '@/admin/components/ui'
import { applyServerErrors } from '@/admin/lib/forms'
import { paiseToRupees, rupeesToPaise } from '@/admin/lib/utils/money'
import { useCreateSlot, useUpdateSlot } from '../api'
import type { Slot, SlotOffer, SlotOfferDiscountType, TheatreRef } from '../types'
import { DAY_OPTIONS, durationBetween, endsNextDay, formatDuration } from '../utils'

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const optionalRupees = z.number().min(0, 'Cannot be negative').max(10_000_000).or(z.nan())
const DATE = /^\d{4}-\d{2}-\d{2}$/
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
const OFFER_MAX_PERCENT = 90

const schema = z
  .object({
    startTime: z.string().regex(TIME, 'Pick a start time'),
    endTime: z.string().regex(TIME, 'Pick an end time'),
    label: z.string().trim().max(50),
    daysOfWeek: z.array(z.number()).min(1, 'Pick at least one day'),
    customPrice: z.boolean(),
    weekdayPrice: optionalRupees,
    weekendPrice: optionalRupees,
    isActive: z.boolean(),
    // slot offer (checked only when hasOffer is on)
    hasOffer: z.boolean(),
    offerActive: z.boolean(),
    offerLabel: z.string().trim().max(30, 'At most 30 characters'),
    offerType: z.enum(['percent', 'flat']),
    offerValue: z.number().or(z.nan()),
    offerDays: z.array(z.number()),
    offerFrom: z.string(),
    offerUntil: z.string(),
  })
  .superRefine((v, ctx) => {
    if (TIME.test(v.startTime) && TIME.test(v.endTime)) {
      const minutes = durationBetween(v.startTime, v.endTime)
      if (minutes < 30 || minutes > 12 * 60) ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'A slot must be 30 minutes to 12 hours long' })
    }
    if (v.customPrice && Number.isNaN(v.weekdayPrice) && Number.isNaN(v.weekendPrice)) {
      ctx.addIssue({ code: 'custom', path: ['weekdayPrice'], message: 'Enter at least one price, or use the theatre price' })
    }
    if (!v.hasOffer) return
    const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })
    if (v.offerLabel.length < 2) issue('offerLabel', 'Give the offer a short name, e.g. Happy hours')
    if (Number.isNaN(v.offerValue) || v.offerValue <= 0) issue('offerValue', 'Enter the discount')
    else if (v.offerType === 'percent' && (v.offerValue > OFFER_MAX_PERCENT || !Number.isInteger(v.offerValue))) {
      issue('offerValue', `A whole number from 1 to ${OFFER_MAX_PERCENT}`)
    }
    if (!v.offerDays.length) issue('offerDays', 'Pick at least one day')
    if (v.offerFrom && v.offerUntil && v.offerUntil < v.offerFrom) issue('offerUntil', 'Cannot be before the start date')
  })

type FormValues = z.infer<typeof schema>
const FIELDS = Object.keys(schema.shape) as Array<keyof FormValues>

function toForm(slot?: Slot): FormValues {
  const hasCustom = slot ? slot.weekdayPricePaise !== null || slot.weekendPricePaise !== null : false
  return {
    startTime: slot?.startTime ?? '',
    endTime: slot?.endTime ?? '',
    label: slot?.label ?? '',
    daysOfWeek: slot?.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6],
    customPrice: hasCustom,
    weekdayPrice: slot?.weekdayPricePaise != null ? Number(paiseToRupees(slot.weekdayPricePaise)) : NaN,
    weekendPrice: slot?.weekendPricePaise != null ? Number(paiseToRupees(slot.weekendPricePaise)) : NaN,
    isActive: slot?.isActive ?? true,
    ...offerToForm(slot?.offer ?? null),
  }
}

function offerToForm(o: SlotOffer | null) {
  return {
    hasOffer: Boolean(o),
    offerActive: o?.isActive ?? true,
    offerLabel: o?.label ?? '',
    offerType: (o?.discountType ?? 'percent') as SlotOfferDiscountType,
    offerValue: !o ? NaN : o.discountType === 'flat' ? Number(paiseToRupees(o.discountValue)) : o.discountValue,
    offerDays: o?.days ?? ALL_DAYS,
    offerFrom: o?.validFrom ?? '',
    offerUntil: o?.validUntil ?? '',
  }
}

function offerFromForm(v: FormValues): SlotOffer | null {
  if (!v.hasOffer) return null
  return {
    isActive: v.offerActive,
    label: v.offerLabel.trim(),
    discountType: v.offerType,
    discountValue: v.offerType === 'flat' ? (rupeesToPaise(v.offerValue) ?? 0) : v.offerValue,
    days: v.offerDays,
    validFrom: DATE.test(v.offerFrom) ? v.offerFrom : null,
    validUntil: DATE.test(v.offerUntil) ? v.offerUntil : null,
  }
}

/** API field (e.g. "offer.label") -> form field */
const SERVER_FIELDS: Record<string, string> = {
  weekdayPricePaise: 'weekdayPrice',
  weekendPricePaise: 'weekendPrice',
  offer: 'offerLabel',
  'offer.label': 'offerLabel',
  'offer.discountValue': 'offerValue',
  'offer.days': 'offerDays',
  'offer.validFrom': 'offerFrom',
  'offer.validUntil': 'offerUntil',
}

const priceOrNull = (custom: boolean, rupees: number) => (custom && !Number.isNaN(rupees) ? rupeesToPaise(rupees) : null)

/** Add or edit a daily slot of one theatre. */
export function SlotFormModal({ open, onOpenChange, theatre, slot }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  theatre: TheatreRef
  /** given = edit */
  slot?: Slot
}) {
  const toast = useToast()
  const create = useCreateSlot()
  const update = useUpdateSlot()
  const [formError, setFormError] = useState('')

  const { register, control, handleSubmit, reset, setError, watch, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toForm(slot) })

  useEffect(() => {
    if (open) { reset(toForm(slot)); setFormError('') }
  }, [open, slot, reset])

  const [start, end, customPrice, hasOffer, offerType] = watch(['startTime', 'endTime', 'customPrice', 'hasOffer', 'offerType'])
  const validTimes = TIME.test(start) && TIME.test(end)

  const submit = handleSubmit(async (v) => {
    setFormError('')
    const input = {
      startTime: v.startTime,
      endTime: v.endTime,
      label: v.label,
      daysOfWeek: v.daysOfWeek,
      weekdayPricePaise: priceOrNull(v.customPrice, v.weekdayPrice),
      weekendPricePaise: priceOrNull(v.customPrice, v.weekendPrice),
      offer: offerFromForm(v),
      isActive: v.isActive,
    }
    try {
      if (slot) await update.mutateAsync({ id: slot.id, ...input })
      else await create.mutateAsync({ theatre: theatre.id, ...input })
      toast.success(slot ? 'Slot updated' : `Slot added to ${theatre.name}`)
      onOpenChange(false)
    } catch (err) {
      setFormError(applyServerErrors(err, setError, FIELDS, SERVER_FIELDS).join(' '))
    }
  })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={slot ? 'Edit slot' : 'Add slot'}
      description={theatre.name}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={submit} loading={isSubmitting}>{slot ? 'Save slot' : 'Add slot'}</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Starts" required error={errors.startTime?.message}>
            {(f) => <Input {...f} type="time" step={300} {...register('startTime')} />}
          </FormField>
          <FormField
            label="Ends"
            required
            error={errors.endTime?.message}
            hint={validTimes ? `${formatDuration(durationBetween(start, end))}${endsNextDay(start, end) ? ', ends after midnight' : ''}` : undefined}
          >
            {(f) => <Input {...f} type="time" step={300} {...register('endTime')} />}
          </FormField>
        </div>

        <FormField label="Label" hint='Optional, e.g. "Late night"' error={errors.label?.message}>
          {(f) => <Input {...f} {...register('label')} />}
        </FormField>

        <FormField label="Runs on" required error={errors.daysOfWeek?.message}>
          {() => (
            <Controller control={control} name="daysOfWeek" render={({ field }) => (
              <ChipGroup label="Days" options={DAY_OPTIONS} value={field.value} onChange={field.onChange} invalid={Boolean(errors.daysOfWeek)} />
            )} />
          )}
        </FormField>

        <Controller control={control} name="customPrice" render={({ field }) => (
          <Switch
            id="customPrice"
            checked={field.value}
            onChange={field.onChange}
            label="Custom price for this slot"
            description="Off: the theatre's weekday / weekend price is used."
          />
        )} />
        {customPrice && (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Weekday price" hint="Empty = theatre price" error={errors.weekdayPrice?.message}>
              {(f) => <MoneyInput {...f} {...register('weekdayPrice', { valueAsNumber: true })} />}
            </FormField>
            <FormField label="Weekend price" hint="Empty = theatre price" error={errors.weekendPrice?.message}>
              {(f) => <MoneyInput {...f} {...register('weekendPrice', { valueAsNumber: true })} />}
            </FormField>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 p-4">
          <Controller control={control} name="hasOffer" render={({ field }) => (
            <Switch
              id="slotHasOffer"
              checked={field.value}
              onChange={field.onChange}
              label="Slot offer"
              description="An automatic discount on this slot's price, e.g. Happy hours. Shown on the website; no code needed."
            />
          )} />
          {hasOffer && (
            <div className="mt-4 space-y-4">
              <FormField label="Offer name" required hint="Shown to customers" error={errors.offerLabel?.message}>
                {(f) => <Input {...f} placeholder="e.g. Happy hours" maxLength={30} {...register('offerLabel')} />}
              </FormField>
              <Controller control={control} name="offerType" render={({ field }) => (
                <SegmentedControl label="Discount type" value={field.value} onChange={field.onChange} options={[{ value: 'percent', label: '% off' }, { value: 'flat', label: '₹ off' }]} />
              )} />
              <FormField
                label={offerType === 'percent' ? 'Percent off' : 'Amount off'}
                required
                hint="Taken off the slot price only, not add-ons or decoration"
                error={errors.offerValue?.message}
              >
                {(f) => offerType === 'percent'
                  ? <Input {...f} type="number" min={1} max={OFFER_MAX_PERCENT} trailing="%" {...register('offerValue', { valueAsNumber: true })} />
                  : <MoneyInput {...f} placeholder="300" {...register('offerValue', { valueAsNumber: true })} />}
              </FormField>
              <FormField label="Offer days" required hint="Only the days the slot runs matter" error={errors.offerDays?.message}>
                {() => (
                  <Controller control={control} name="offerDays" render={({ field }) => (
                    <ChipGroup label="Offer days" options={DAY_OPTIONS} value={field.value} onChange={field.onChange} invalid={Boolean(errors.offerDays)} />
                  )} />
                )}
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="From" hint="Optional" error={errors.offerFrom?.message}>
                  {(f) => <Input {...f} type="date" {...register('offerFrom')} />}
                </FormField>
                <FormField label="Until" hint="Optional" error={errors.offerUntil?.message}>
                  {(f) => <Input {...f} type="date" {...register('offerUntil')} />}
                </FormField>
              </div>
              <Controller control={control} name="offerActive" render={({ field }) => (
                <Switch id="slotOfferActive" checked={field.value} onChange={field.onChange} label="Offer on" description="Turn off to pause the offer and keep its settings." />
              )} />
            </div>
          )}
        </div>

        <Controller control={control} name="isActive" render={({ field }) => (
          <Switch id="slotActive" checked={field.value} onChange={field.onChange} label="Active" description="Inactive slots cannot be booked." />
        )} />
      </form>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, ChipGroup, FormField, Input, Modal, MoneyInput, Switch, useToast } from '@/admin/components/ui'
import { applyServerErrors } from '@/admin/lib/forms'
import { paiseToRupees, rupeesToPaise } from '@/admin/lib/utils/money'
import { useCreateSlot, useUpdateSlot } from '../api'
import type { Slot, TheatreRef } from '../types'
import { DAY_OPTIONS, durationBetween, endsNextDay, formatDuration } from '../utils'

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const optionalRupees = z.number().min(0, 'Cannot be negative').max(10_000_000).or(z.nan())

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
  })
  .superRefine((v, ctx) => {
    if (TIME.test(v.startTime) && TIME.test(v.endTime)) {
      const minutes = durationBetween(v.startTime, v.endTime)
      if (minutes < 30 || minutes > 12 * 60) ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'A slot must be 30 minutes to 12 hours long' })
    }
    if (v.customPrice && Number.isNaN(v.weekdayPrice) && Number.isNaN(v.weekendPrice)) {
      ctx.addIssue({ code: 'custom', path: ['weekdayPrice'], message: 'Enter at least one price, or use the theatre price' })
    }
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
  }
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

  const [start, end, customPrice] = watch(['startTime', 'endTime', 'customPrice'])
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
      isActive: v.isActive,
    }
    try {
      if (slot) await update.mutateAsync({ id: slot.id, ...input })
      else await create.mutateAsync({ theatre: theatre.id, ...input })
      toast.success(slot ? 'Slot updated' : `Slot added to ${theatre.name}`)
      onOpenChange(false)
    } catch (err) {
      setFormError(applyServerErrors(err, setError, FIELDS, { weekdayPricePaise: 'weekdayPrice', weekendPricePaise: 'weekendPrice' }).join(' '))
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

        <Controller control={control} name="isActive" render={({ field }) => (
          <Switch id="slotActive" checked={field.value} onChange={field.onChange} label="Active" description="Inactive slots cannot be booked." />
        )} />
      </form>
    </Modal>
  )
}

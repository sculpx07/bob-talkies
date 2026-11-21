import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, FormField, Input, Modal, Select, Textarea, useToast } from '@/admin/components/ui'
import { applyServerErrors } from '@/admin/lib/forms'
import { formatTime, todayISO } from '@/admin/lib/utils/date'
import { cn } from '@/admin/lib/utils/cn'
import { useCreateBlock, useSlots } from '../api'
import type { TheatreRef } from '../types'

const SCOPES = [
  { value: 'all', label: 'All theatres', hint: 'e.g. a holiday' },
  { value: 'theatre', label: 'This theatre', hint: 'the whole day' },
  { value: 'slot', label: 'One slot', hint: 'of this theatre' },
] as const

const schema = z
  .object({
    scope: z.enum(['all', 'theatre', 'slot']),
    slot: z.string(),
    startDate: z.string().min(1, 'Pick a start date'),
    endDate: z.string().min(1, 'Pick an end date'),
    reason: z.string().trim().min(3, 'Give a short reason').max(300),
  })
  .superRefine((v, ctx) => {
    if (v.scope === 'slot' && !v.slot) ctx.addIssue({ code: 'custom', path: ['slot'], message: 'Pick the slot to block' })
    if (v.startDate && v.endDate && v.endDate < v.startDate) ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'Cannot be before the start date' })
  })

type FormValues = z.infer<typeof schema>
const FIELDS = ['slot', 'startDate', 'endDate', 'reason'] as const

/** Close all theatres, one theatre, or one slot for a date range. */
export function BlockFormModal({ open, onOpenChange, theatre }: { open: boolean; onOpenChange: (o: boolean) => void; theatre: TheatreRef }) {
  const toast = useToast()
  const create = useCreateBlock()
  const slots = useSlots(theatre.id)
  const [formError, setFormError] = useState('')
  const today = todayISO()

  const { register, handleSubmit, reset, setError, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { scope: 'theatre', slot: '', startDate: today, endDate: today, reason: '' },
  })

  useEffect(() => {
    if (open) { reset({ scope: 'theatre', slot: '', startDate: today, endDate: today, reason: '' }); setFormError('') }
  }, [open, reset, today])

  const scope = watch('scope')
  const startDate = watch('startDate')

  const submit = handleSubmit(async (v) => {
    setFormError('')
    try {
      await create.mutateAsync({
        theatre: v.scope === 'all' ? null : theatre.id,
        slot: v.scope === 'slot' ? v.slot : null,
        startDate: v.startDate,
        endDate: v.endDate,
        reason: v.reason,
      })
      toast.success('Dates blocked')
      onOpenChange(false)
    } catch (err) {
      setFormError(applyServerErrors(err, setError, FIELDS).join(' '))
    }
  })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Block dates"
      description="Blocked slots cannot be booked. Existing bookings are not affected."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={submit} loading={isSubmitting}>Block</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">Applies to</legend>
          <div className="grid grid-cols-3 gap-2">
            {SCOPES.map((s) => (
              <label
                key={s.value}
                className={cn(
                  'flex cursor-pointer flex-col rounded-lg border px-3 py-2 text-sm transition-colors',
                  scope === s.value ? 'border-violet-600 bg-violet-50 text-violet-800' : 'border-slate-300 hover:border-violet-400',
                )}
              >
                <input type="radio" value={s.value} className="sr-only" {...register('scope')} />
                <span className="font-medium">{s.label}</span>
                <span className="text-xs text-slate-500">{s.value === 'all' ? s.hint : `${theatre.name}, ${s.hint}`}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {scope === 'slot' && (
          <FormField label="Slot" required error={errors.slot?.message}>
            {(f) => (
              <Select
                {...f}
                placeholder="Pick a slot"
                options={(slots.data ?? []).map((s) => ({ value: s.id, label: `${formatTime(s.startTime)} – ${formatTime(s.endTime)}${s.label ? ` (${s.label})` : ''}` }))}
                {...register('slot')}
              />
            )}
          </FormField>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="From" required error={errors.startDate?.message}>
            {(f) => (
              <Input
                {...f}
                type="date"
                {...register('startDate', {
                  onChange: (e) => { if (watch('endDate') < e.target.value) setValue('endDate', e.target.value) },
                })}
              />
            )}
          </FormField>
          <FormField label="To" required error={errors.endDate?.message} hint="Same day for a single date">
            {(f) => <Input {...f} type="date" min={startDate} {...register('endDate')} />}
          </FormField>
        </div>

        <FormField label="Reason" required error={errors.reason?.message}>
          {(f) => <Textarea {...f} rows={2} placeholder="e.g. Projector maintenance" {...register('reason')} />}
        </FormField>
      </form>
    </Modal>
  )
}

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button, Checkbox, FormField, Input, Modal, Select, StatusBadge, Textarea, useToast } from '@/admin/components/ui'
import { OCCASIONS } from '@/admin/constants/catalog'
import { BOOKING_STATUS_BADGE } from '@/admin/features/bookings/constants'
import { useStaffOptions } from '@/admin/features/users/api'
import { applyServerErrors } from '@/admin/lib/forms'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDate, formatTime } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { cn } from '@/admin/lib/utils/cn'
import { useChangeLeadStatus, useConvertLead, useCreateLead, useUpdateLead } from '../api'
import { LEAD_SOURCE_LABELS, LEAD_STATUS_BADGE, LEAD_TRANSITIONS, MANUAL_LEAD_SOURCES } from '../constants'
import type { Lead, LeadDetail, LeadPriority, LeadSource, LeadStatus } from '../types'

/** <input type="datetime-local"> value <-> ISO timestamp */
export const toLocalInput = (iso: string | null | undefined) => (iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : '')
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null)

const PRIORITY_OPTIONS = [{ value: 'high', label: 'High' }, { value: 'normal', label: 'Normal' }, { value: 'low', label: 'Low' }]

// ---------------------------------------------------------------- log / edit an enquiry

const leadSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(100),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().trim().toLowerCase().email('Enter a valid email').or(z.literal('')),
  occasion: z.string(),
  message: z.string().trim().max(1000),
  source: z.string(),
  priority: z.enum(['low', 'normal', 'high']),
  assignedTo: z.string(),
  followUpAt: z.string(),
  consentWhatsapp: z.boolean(),
})
type LeadFormValues = z.infer<typeof leadSchema>

/** Log a phone / WhatsApp / walk-in enquiry, or edit an existing lead. */
export function LeadFormModal({ open, onOpenChange, lead, onCreated }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  /** given = edit */
  lead?: Lead
  onCreated?: (lead: Lead) => void
}) {
  const toast = useToast()
  const create = useCreateLead()
  const update = useUpdateLead()
  const staff = useStaffOptions()
  const [formError, setFormError] = useState('')

  const defaults = (): LeadFormValues => ({
    name: lead?.name ?? '', mobile: lead?.mobile ?? '', email: lead?.email ?? '', occasion: lead?.occasion ?? '',
    message: lead?.message ?? '', source: lead?.source ?? 'phone', priority: lead?.priority ?? 'normal',
    assignedTo: lead?.assignedTo?.id ?? '', followUpAt: toLocalInput(lead?.followUpAt), consentWhatsapp: lead?.consentWhatsapp ?? true,
  })
  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<LeadFormValues>({ resolver: zodResolver(leadSchema), defaultValues: defaults() })
  useEffect(() => { if (open) { reset(defaults()); setFormError('') } }, [open, lead]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = handleSubmit(async (v) => {
    setFormError('')
    const common = {
      name: v.name, mobile: v.mobile, email: v.email, occasion: v.occasion, message: v.message,
      priority: v.priority as LeadPriority, followUpAt: fromLocalInput(v.followUpAt), consentWhatsapp: v.consentWhatsapp,
    }
    try {
      if (lead) {
        await update.mutateAsync({ id: lead.id, ...common })
        toast.success('Lead updated')
      } else {
        const created = await create.mutateAsync({ ...common, source: v.source as LeadSource, ...(v.assignedTo && { assignedTo: v.assignedTo }) })
        toast.success('Enquiry logged')
        onCreated?.(created)
      }
      onOpenChange(false)
    } catch (err) {
      setFormError(applyServerErrors(err, setError, Object.keys(leadSchema.shape)).join(' '))
    }
  })

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg" title={lead ? 'Edit lead' : 'Log an enquiry'} description={lead ? undefined : 'A call, WhatsApp message or walk-in that has not booked yet.'}
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={isSubmitting}>{lead ? 'Save' : 'Log enquiry'}</Button></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Name" required error={errors.name?.message}>{(f) => <Input {...f} {...register('name')} />}</FormField>
          <FormField label="Mobile" required error={errors.mobile?.message}>{(f) => <Input {...f} inputMode="numeric" maxLength={10} {...register('mobile')} />}</FormField>
          <FormField label="Email" error={errors.email?.message}>{(f) => <Input {...f} type="email" {...register('email')} />}</FormField>
          <FormField label="Occasion">{(f) => <Select {...f} placeholder="Not known" options={OCCASIONS.map((o) => ({ value: o.slug, label: o.label }))} {...register('occasion')} />}</FormField>
          {!lead && <FormField label="Came via">{(f) => <Select {...f} options={MANUAL_LEAD_SOURCES.map((s) => ({ value: s, label: LEAD_SOURCE_LABELS[s] }))} {...register('source')} />}</FormField>}
          <FormField label="Priority">{(f) => <Select {...f} options={PRIORITY_OPTIONS} {...register('priority')} />}</FormField>
          {!lead && (
            <FormField label="Assign to">{(f) => <Select {...f} placeholder="Nobody yet" options={(staff.data ?? []).map((u) => ({ value: u.id, label: u.name }))} {...register('assignedTo')} />}</FormField>
          )}
          <FormField label="Follow up at" error={errors.followUpAt?.message}>{(f) => <Input {...f} type="datetime-local" {...register('followUpAt')} />}</FormField>
          <div className="flex items-end pb-2">
            <Controller control={control} name="consentWhatsapp" render={({ field }) => (
              <Checkbox id="leadConsent" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} label="OK to WhatsApp" />
            )} />
          </div>
        </div>
        <FormField label="What they asked" error={errors.message?.message}>{(f) => <Textarea {...f} rows={3} placeholder="e.g. Birthday for 6 on Saturday evening, wants a cake" {...register('message')} />}</FormField>
      </form>
    </Modal>
  )
}

// ---------------------------------------------------------------- status

/** Move a lead along the pipeline. Lost needs a reason; follow-up needs a time. */
export function LeadStatusModal({ lead, open, onOpenChange, initialStatus }: { lead: Lead; open: boolean; onOpenChange: (o: boolean) => void; initialStatus?: LeadStatus }) {
  const toast = useToast()
  const change = useChangeLeadStatus()
  const options = LEAD_TRANSITIONS[lead.status]
  const [status, setStatus] = useState<LeadStatus>(initialStatus ?? options[0])
  const [note, setNote] = useState('')
  const [lostReason, setLostReason] = useState('')
  const [followUpAt, setFollowUpAt] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setStatus(initialStatus && options.includes(initialStatus) ? initialStatus : options[0])
      setNote(''); setLostReason(''); setError('')
      setFollowUpAt(toLocalInput(lead.followUpAt))
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (status === 'lost' && lostReason.trim().length < 3) { setError('Say why the lead was lost'); return }
    if (status === 'follow_up' && !followUpAt) { setError('Pick when to follow up'); return }
    try {
      await change.mutateAsync({
        id: lead.id,
        status: status as Exclude<LeadStatus, 'converted'>,
        ...(note.trim() && { note: note.trim() }),
        ...(status === 'lost' && { lostReason: lostReason.trim() }),
        ...(status === 'follow_up' && { followUpAt: fromLocalInput(followUpAt)! }),
      })
      toast.success(`Lead moved to ${LEAD_STATUS_BADGE[status].label}`)
      onOpenChange(false)
    } catch (err) { setError(errorMessage(err)) }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Change status" description={`Now: ${LEAD_STATUS_BADGE[lead.status].label}`}
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={change.isPending}>Save</Button></>}>
      <div className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div role="radiogroup" aria-label="New status" className="flex flex-wrap gap-2">
          {options.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={status === s} onClick={() => setStatus(s)}
              className={cn('focus-ring rounded-lg border px-3 py-1.5 text-sm', status === s ? 'border-violet-600 bg-violet-50 font-medium text-violet-800' : 'border-slate-300 hover:border-violet-400')}>
              {LEAD_STATUS_BADGE[s].label}
            </button>
          ))}
        </div>
        {status === 'lost' && <FormField label="Why was it lost?" required>{(f) => <Input {...f} value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder="e.g. Booked another venue" />}</FormField>}
        {status === 'follow_up' && <FormField label="Follow up at" required>{(f) => <Input {...f} type="datetime-local" value={followUpAt} onChange={(e) => setFollowUpAt(e.target.value)} />}</FormField>}
        <FormField label="Note">{(f) => <Input {...f} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional, kept in the timeline" />}</FormField>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------- link a booking

/** Mark the lead converted by linking one of the customer's bookings. */
export function LinkBookingModal({ detail, open, onOpenChange }: { detail: LeadDetail; open: boolean; onOpenChange: (o: boolean) => void }) {
  const toast = useToast()
  const convert = useConvertLead()
  const [bookingId, setBookingId] = useState('')
  const [error, setError] = useState('')
  useEffect(() => { if (open) { setBookingId(detail.bookings[0]?.id ?? ''); setError('') } }, [open, detail.bookings])

  const submit = async () => {
    if (!bookingId) return
    try {
      await convert.mutateAsync({ id: detail.lead.id, booking: bookingId })
      toast.success('Lead converted')
      onOpenChange(false)
    } catch (err) { setError(errorMessage(err)) }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Link a booking" description={`Bookings made with ${detail.lead.mobile}`}
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={convert.isPending} disabled={!bookingId}>Mark converted</Button></>}>
      <div className="space-y-3">
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {detail.bookings.length === 0 ? <p className="text-sm text-slate-500">No bookings with this mobile yet. Use "Create booking" instead.</p> : (
          <div role="radiogroup" aria-label="Booking" className="space-y-2">
            {detail.bookings.map((b) => (
              <button key={b.id} type="button" role="radio" aria-checked={bookingId === b.id} onClick={() => setBookingId(b.id)}
                className={cn('focus-ring flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm', bookingId === b.id ? 'border-violet-600 bg-violet-50' : 'border-slate-300')}>
                <span><span className="font-mono font-semibold">{b.bookingNumber}</span> · {formatDate(b.date)} {formatTime(b.slotStart)} · {b.theatreName}</span>
                <span className="flex items-center gap-2">{formatPaise(b.totalPaise)} <StatusBadge status={b.status} map={BOOKING_STATUS_BADGE} /></span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

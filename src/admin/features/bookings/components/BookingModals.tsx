import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle } from 'lucide-react'
import {
  Button, Checkbox, FormField, Input, Modal, MoneyInput, Select, Switch, Textarea, useToast,
} from '@/admin/components/ui'
import { OCCASIONS } from '@/admin/constants/catalog'
import { useSettings } from '@/admin/features/settings/api'
import { formatTime } from '@/admin/lib/utils/date'
import { formatPaise, paiseToRupees, rupeesToPaise } from '@/admin/lib/utils/money'
import { cn } from '@/admin/lib/utils/cn'
import {
  useAddPayment, useCancelBooking, useCompleteBooking, useConfirmBooking, useMarkNoShow, useRescheduleBooking, useUpdateBookingDetails,
} from '../api'
import { MANUAL_PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../constants'
import type { BookingDetail, PaymentInput } from '../types'
import { bookingErrorMessages, hoursUntilSlot, needsOverride } from '../utils'
import { SlotPicker } from './SlotPicker'

interface ModalProps {
  booking: BookingDetail
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ErrorList = ({ messages }: { messages: string[] }) =>
  messages.length ? (
    <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {messages.map((m) => <p key={m}>{m}</p>)}
    </div>
  ) : null

const METHOD_OPTIONS = MANUAL_PAYMENT_METHODS.map((m) => ({ value: m, label: PAYMENT_METHOD_LABELS[m] }))

// ---------------------------------------------------------------- payment fields (shared by record + confirm)

const paymentSchema = (dueRupees: number) => z.object({
  amount: z.number({ error: 'Enter the amount' }).positive('Must be more than 0').max(dueRupees, `At most the ₹${dueRupees} due`),
  method: z.enum(MANUAL_PAYMENT_METHODS),
  reference: z.string().trim().max(100),
  note: z.string().trim().max(300),
})
type PaymentValues = z.infer<ReturnType<typeof paymentSchema>>

const toPaymentInput = (v: PaymentValues): PaymentInput => ({
  amountPaise: rupeesToPaise(v.amount) ?? 0,
  method: v.method,
  ...(v.reference && { reference: v.reference }),
  ...(v.note && { note: v.note }),
})

/** Money received at the venue / by UPI / bank transfer. */
export function RecordPaymentModal({ booking, open, onOpenChange }: ModalProps) {
  const toast = useToast()
  const add = useAddPayment()
  const [errorsTop, setErrorsTop] = useState<string[]>([])
  const due = Number(paiseToRupees(booking.balanceDuePaise))
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema(due)),
    defaultValues: { amount: due, method: 'cash', reference: '', note: '' },
  })
  useEffect(() => { if (open) { reset({ amount: due, method: 'cash', reference: '', note: '' }); setErrorsTop([]) } }, [open, due, reset])

  const submit = handleSubmit(async (v) => {
    try {
      const b = await add.mutateAsync({ id: booking.id, ...toPaymentInput(v) })
      toast.success(`${formatPaise(rupeesToPaise(v.amount))} recorded`, b.balanceDuePaise ? `${formatPaise(b.balanceDuePaise)} still due` : 'Fully paid')
      onOpenChange(false)
    } catch (err) { setErrorsTop(bookingErrorMessages(err)) }
  })

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Record payment" description={`${formatPaise(booking.balanceDuePaise)} due on ${booking.bookingNumber}`}
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={isSubmitting}>Record payment</Button></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <ErrorList messages={errorsTop} />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Amount" required error={errors.amount?.message}>{(f) => <MoneyInput {...f} {...register('amount', { valueAsNumber: true })} />}</FormField>
          <FormField label="Method" required error={errors.method?.message}>{(f) => <Select {...f} options={METHOD_OPTIONS} {...register('method')} />}</FormField>
        </div>
        <FormField label="Reference" hint="UPI / card / transfer reference" error={errors.reference?.message}>{(f) => <Input {...f} {...register('reference')} />}</FormField>
        <FormField label="Note" error={errors.note?.message}>{(f) => <Input {...f} {...register('note')} />}</FormField>
      </form>
    </Modal>
  )
}

// ---------------------------------------------------------------- confirm a held booking

export function ConfirmBookingModal({ booking, open, onOpenChange }: ModalProps) {
  const toast = useToast()
  const confirm = useConfirmBooking()
  const [withPayment, setWithPayment] = useState(true)
  const [note, setNote] = useState('')
  const [errorsTop, setErrorsTop] = useState<string[]>([])
  const advance = Number(paiseToRupees(Math.min(booking.pricing.advancePaise, booking.balanceDuePaise)))
  const due = Number(paiseToRupees(booking.balanceDuePaise))
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema(due)),
    defaultValues: { amount: advance, method: 'upi', reference: '', note: '' },
  })
  useEffect(() => {
    if (open) { reset({ amount: advance, method: 'upi', reference: '', note: '' }); setErrorsTop([]); setNote(''); setWithPayment(booking.balanceDuePaise > 0) }
  }, [open, advance, reset, booking.balanceDuePaise])

  const run = async (payment?: PaymentInput) => {
    try {
      await confirm.mutateAsync({ id: booking.id, ...(payment && { payment }), ...(note && { note }) })
      toast.success(`${booking.bookingNumber} confirmed`)
      onOpenChange(false)
    } catch (err) { setErrorsTop(bookingErrorMessages(err)) }
  }
  const submit = withPayment ? handleSubmit((v) => run(toPaymentInput(v))) : () => run()

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Confirm booking" description="The slot stops being a temporary hold and the customer gets their pass."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={isSubmitting || confirm.isPending}>Confirm booking</Button></>}>
      <div className="space-y-4">
        <ErrorList messages={errorsTop} />
        <Switch id="withPayment" checked={withPayment} onChange={setWithPayment} label="Record a payment now" description={`Advance is ${formatPaise(booking.pricing.advancePaise)} (${booking.pricing.advancePercent}%).`} />
        {withPayment && (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Amount" required error={errors.amount?.message}>{(f) => <MoneyInput {...f} {...register('amount', { valueAsNumber: true })} />}</FormField>
            <FormField label="Method" required error={errors.method?.message}>{(f) => <Select {...f} options={METHOD_OPTIONS} {...register('method')} />}</FormField>
            <div className="col-span-2"><FormField label="Reference" error={errors.reference?.message}>{(f) => <Input {...f} {...register('reference')} />}</FormField></div>
          </div>
        )}
        <FormField label="Note">{(f) => <Input {...f} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional, kept in the history" />}</FormField>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------- cancel

export function CancelBookingModal({ booking, open, onOpenChange }: ModalProps) {
  const toast = useToast()
  const cancel = useCancelBooking()
  const settings = useSettings()
  const [reason, setReason] = useState('')
  const [errorsTop, setErrorsTop] = useState<string[]>([])
  useEffect(() => { if (open) { setReason(''); setErrorsTop([]) } }, [open])

  const cutoff = settings.data?.booking.refundCutoffHours
  const hoursLeft = Math.floor(hoursUntilSlot(booking.date, booking.slotStart))
  const eligible = cutoff !== undefined && hoursLeft >= cutoff

  const submit = async () => {
    if (reason.trim().length < 3) { setErrorsTop(['Give a short reason']); return }
    try {
      const b = await cancel.mutateAsync({ id: booking.id, reason: reason.trim() })
      toast.success(`${b.bookingNumber} cancelled`, 'The slot is free again.')
      onOpenChange(false)
    } catch (err) { setErrorsTop(bookingErrorMessages(err)) }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={`Cancel ${booking.bookingNumber}?`} description="The slot becomes free for others. This cannot be undone."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Keep booking</Button><Button variant="danger" onClick={submit} loading={cancel.isPending}>Cancel booking</Button></>}>
      <div className="space-y-4">
        <ErrorList messages={errorsTop} />
        {booking.amountPaidPaise > 0 && cutoff !== undefined && (
          <div className={cn('flex gap-2 rounded-lg px-3 py-2 text-sm', eligible ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800')}>
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {formatPaise(booking.amountPaidPaise)} was paid. Cancelling now is {Math.max(0, hoursLeft)} h before the slot:{' '}
              <strong>{eligible ? 'refund due' : 'not refundable'}</strong> under the {cutoff} h policy. Refunds are paid back outside this screen for now.
            </p>
          </div>
        )}
        <FormField label="Reason" required>{(f) => <Textarea {...f} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Customer's plans changed" />}</FormField>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------- complete / no-show

export function CloseBookingModal({ booking, open, onOpenChange, outcome }: ModalProps & { outcome: 'completed' | 'no_show' }) {
  const toast = useToast()
  const complete = useCompleteBooking()
  const noShow = useMarkNoShow()
  const action = outcome === 'completed' ? complete : noShow
  const [note, setNote] = useState('')
  const [errorsTop, setErrorsTop] = useState<string[]>([])
  useEffect(() => { if (open) { setNote(''); setErrorsTop([]) } }, [open])

  const submit = async () => {
    try {
      await action.mutateAsync({ id: booking.id, ...(note && { note }) })
      toast.success(outcome === 'completed' ? 'Marked as completed' : 'Marked as no-show')
      onOpenChange(false)
    } catch (err) { setErrorsTop(bookingErrorMessages(err)) }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}
      title={outcome === 'completed' ? 'Mark as completed?' : 'Mark as no-show?'}
      description={outcome === 'completed' ? 'The celebration happened.' : 'The customer never came. The slot stays used.'}
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant={outcome === 'completed' ? 'primary' : 'danger'} onClick={submit} loading={action.isPending}>{outcome === 'completed' ? 'Mark completed' : 'Mark no-show'}</Button></>}>
      <div className="space-y-4">
        <ErrorList messages={errorsTop} />
        {booking.balanceDuePaise > 0 && outcome === 'completed' && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{formatPaise(booking.balanceDuePaise)} is still due. Record the payment if it was collected.</p>
        )}
        <FormField label="Note">{(f) => <Input {...f} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />}</FormField>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------- edit details (no price change)

const detailsSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().trim().toLowerCase().email('Enter a valid email').or(z.literal('')),
  occasion: z.string(),
  kids: z.number({ error: 'Enter a number' }).int().min(0),
  consentWhatsapp: z.boolean(),
  specialInstructions: z.string().trim().max(1000),
  cakeRequest: z.string().trim().max(400),
  addonRequest: z.string().trim().max(400),
  internalNotes: z.string().trim().max(2000),
})
type DetailsValues = z.infer<typeof detailsSchema>

export function EditDetailsModal({ booking, open, onOpenChange }: ModalProps) {
  const toast = useToast()
  const update = useUpdateBookingDetails()
  const [errorsTop, setErrorsTop] = useState<string[]>([])
  const defaults = (): DetailsValues => ({
    ...booking.customer, occasion: booking.occasion, kids: booking.kids, consentWhatsapp: booking.consentWhatsapp,
    specialInstructions: booking.specialInstructions, cakeRequest: booking.cakeRequest, addonRequest: booking.addonRequest, internalNotes: booking.internalNotes,
  })
  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<DetailsValues>({ resolver: zodResolver(detailsSchema), defaultValues: defaults() })
  useEffect(() => { if (open) { reset(defaults()); setErrorsTop([]) } }, [open, booking]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = handleSubmit(async ({ name, mobile, email, ...rest }) => {
    if (rest.kids > booking.guests) { setError('kids', { message: `At most the ${booking.guests} guests` }); return }
    try {
      await update.mutateAsync({ id: booking.id, customer: { name, mobile, email }, ...rest })
      toast.success('Details saved')
      onOpenChange(false)
    } catch (err) { setErrorsTop(bookingErrorMessages(err)) }
  })

  const occasionOptions = [...OCCASIONS.map((o) => ({ value: o.slug, label: o.label })), ...(booking.occasion && !OCCASIONS.some((o) => o.slug === booking.occasion) ? [{ value: booking.occasion, label: booking.occasion }] : [])]

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg" title="Edit details" description="Customer and notes. Price, guests and extras are changed separately."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={isSubmitting}>Save details</Button></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <ErrorList messages={errorsTop} />
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Customer name" required error={errors.name?.message}>{(f) => <Input {...f} {...register('name')} />}</FormField>
          <FormField label="Mobile" required error={errors.mobile?.message}>{(f) => <Input {...f} inputMode="numeric" maxLength={10} {...register('mobile')} />}</FormField>
          <FormField label="Email" error={errors.email?.message}>{(f) => <Input {...f} type="email" {...register('email')} />}</FormField>
          <FormField label="Occasion" error={errors.occasion?.message}>{(f) => <Select {...f} options={occasionOptions} {...register('occasion')} />}</FormField>
          <FormField label="Kids (3-10 yrs)" hint={`Of the ${booking.guests} guests`} error={errors.kids?.message}>{(f) => <Input {...f} type="number" min={0} {...register('kids', { valueAsNumber: true })} />}</FormField>
          <div className="flex items-end pb-2">
            <Controller control={control} name="consentWhatsapp" render={({ field }) => (
              <Checkbox id="consentWhatsapp" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} label="WhatsApp updates" />
            )} />
          </div>
        </div>
        <FormField label="Special instructions" error={errors.specialInstructions?.message}>{(f) => <Textarea {...f} rows={2} {...register('specialInstructions')} />}</FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Cake request" error={errors.cakeRequest?.message}>{(f) => <Textarea {...f} rows={2} {...register('cakeRequest')} />}</FormField>
          <FormField label="Add-on request" error={errors.addonRequest?.message}>{(f) => <Textarea {...f} rows={2} {...register('addonRequest')} />}</FormField>
        </div>
        <FormField label="Internal notes" hint="Staff only, never shown to the customer" error={errors.internalNotes?.message}>{(f) => <Textarea {...f} rows={2} {...register('internalNotes')} />}</FormField>
      </form>
    </Modal>
  )
}

// ---------------------------------------------------------------- reschedule

export function RescheduleModal({ booking, open, onOpenChange }: ModalProps) {
  const toast = useToast()
  const reschedule = useRescheduleBooking()
  const [date, setDate] = useState(booking.date)
  const [slotId, setSlotId] = useState('')
  const [reason, setReason] = useState('')
  const [override, setOverride] = useState(false)
  const [errorsTop, setErrorsTop] = useState<string[]>([])
  const [offerOverride, setOfferOverride] = useState(false)

  useEffect(() => {
    if (open) { setDate(booking.date); setSlotId(''); setReason(''); setOverride(false); setOfferOverride(false); setErrorsTop([]) }
  }, [open, booking.date])

  const submit = async () => {
    const problems = [!slotId && 'Pick a slot', reason.trim().length < 3 && 'Give a short reason'].filter(Boolean) as string[]
    if (problems.length) { setErrorsTop(problems); return }
    try {
      const r = await reschedule.mutateAsync({ id: booking.id, date, slot: slotId, reason: reason.trim(), allowOverride: override })
      const diff = r.priceDifferencePaise
      toast.success(`Moved to ${formatTime(r.booking.slotStart)}, ${r.booking.date}`, diff ? `Price kept. This slot would cost ${formatPaise(Math.abs(diff))} ${diff > 0 ? 'more' : 'less'} today.` : 'Price kept.')
      onOpenChange(false)
    } catch (err) {
      setErrorsTop(bookingErrorMessages(err))
      setOfferOverride(needsOverride(err))
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="lg" title="Reschedule" description={`${booking.theatre.name} · the price stays as booked`}
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={reschedule.isPending}>Move booking</Button></>}>
      <div className="space-y-4">
        <ErrorList messages={errorsTop} />
        {offerOverride && <Checkbox id="override" checked={override} onChange={(e) => setOverride(e.target.checked)} label="Book anyway (staff override)" description="Only for notice / booking-window rules; taken or blocked slots can never be overridden." />}
        <FormField label="New date">{(f) => <Input {...f} type="date" value={date} onChange={(e) => { if (e.target.value) { setDate(e.target.value); setSlotId('') } }} className="w-44" />}</FormField>
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">Slot</legend>
          <SlotPicker
            theatreId={booking.theatre.id}
            date={date}
            value={slotId}
            onChange={setSlotId}
            currentSlotId={date === booking.date ? booking.slot.id : undefined}
          />
        </fieldset>
        <FormField label="Reason" required>{(f) => <Textarea {...f} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Customer asked for the next day" />}</FormField>
      </div>
    </Modal>
  )
}

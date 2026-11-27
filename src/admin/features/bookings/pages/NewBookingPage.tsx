import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tag, X } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, CardBody, CardHeader, Checkbox, FormField, Input, MoneyInput, SegmentedControl, Select, Switch, Textarea, useToast,
} from '@/admin/components/ui'
import { OCCASIONS } from '@/admin/constants/catalog'
import { useTheatreOptions } from '@/admin/features/theatres/api'
import { TheatreSelect } from '@/admin/features/theatres/components/TheatreSelect'
import { formatDate, todayISO } from '@/admin/lib/utils/date'
import { formatPaise, paiseToRupees, rupeesToPaise } from '@/admin/lib/utils/money'
import { useCreateBooking } from '../api'
import { MANUAL_PAYMENT_METHODS, PAYMENT_METHOD_LABELS, SOURCE_LABELS } from '../constants'
import { AddonPicker } from '../components/AddonPicker'
import { QuotePanel } from '../components/QuotePanel'
import { SlotPicker } from '../components/SlotPicker'
import { blockingIssues, onlyOverridable, useQuote, type AddonLine } from '../quote'
import { bookingErrorMessages } from '../utils'
import { useConvertLead, useLead } from '@/admin/features/leads/api'
import { errorMessage } from '@/admin/lib/api/errors'

const STAFF_SOURCES = ['phone', 'whatsapp', 'walk_in', 'admin'] as const

const schema = z
  .object({
    theatre: z.string().min(1, 'Pick a theatre'),
    date: z.string().min(1, 'Pick a date'),
    slot: z.string().min(1, 'Pick a slot'),
    guests: z.number({ error: 'Enter guests' }).int().min(1, 'At least 1'),
    kids: z.number({ error: 'Enter a number' }).int().min(0),
    decoration: z.boolean(),
    addons: z.array(z.object({ addon: z.string(), variant: z.string().optional(), quantity: z.number() })),
    couponCode: z.string(),
    name: z.string().trim().min(2, 'Enter the customer name').max(100),
    mobile: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    email: z.string().trim().toLowerCase().email('Enter a valid email').or(z.literal('')),
    occasion: z.string().min(1, 'Pick the occasion'),
    consentWhatsapp: z.boolean(),
    specialInstructions: z.string().trim().max(1000),
    cakeRequest: z.string().trim().max(400),
    addonRequest: z.string().trim().max(400),
    internalNotes: z.string().trim().max(2000),
    source: z.enum(STAFF_SOURCES),
    mode: z.enum(['confirm', 'hold']),
    recordPayment: z.boolean(),
    payAmount: z.number().positive('Must be more than 0').or(z.nan()),
    payMethod: z.enum(MANUAL_PAYMENT_METHODS),
    payReference: z.string().trim().max(100),
    allowOverride: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.kids > v.guests) ctx.addIssue({ code: 'custom', path: ['kids'], message: 'Cannot be more than the guests' })
    if (v.recordPayment && Number.isNaN(v.payAmount)) ctx.addIssue({ code: 'custom', path: ['payAmount'], message: 'Enter the amount received' })
  })
type FormValues = z.infer<typeof schema>

const num = { valueAsNumber: true } as const

/** Phone / WhatsApp / walk-in booking with a live quote. ?theatre=&date=&slot= pre-fills from the board. */
export default function NewBookingPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const theatres = useTheatreOptions()
  const create = useCreateBooking()
  // ?lead=<id>: booking for an enquiry; the lead is marked converted once saved
  const leadId = params.get('lead') ?? ''
  const leadQuery = useLead(leadId)
  const convertLead = useConvertLead()
  const lead = leadQuery.data?.lead
  const [couponText, setCouponText] = useState('')
  const [submitErrors, setSubmitErrors] = useState<string[]>([])

  const { register, control, handleSubmit, watch, setValue, getFieldState, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      theatre: params.get('theatre') ?? '', date: params.get('date') ?? todayISO(), slot: params.get('slot') ?? '',
      guests: 2, kids: 0, decoration: true, addons: [], couponCode: '',
      name: '', mobile: '', email: '', occasion: '', consentWhatsapp: true,
      specialInstructions: '', cakeRequest: '', addonRequest: '', internalNotes: '',
      source: 'phone', mode: 'confirm', recordPayment: true, payAmount: NaN, payMethod: 'upi', payReference: '', allowOverride: false,
    },
  })

  const [theatreId, date, slot, guests, decoration, addons, couponCode, mode, recordPayment, allowOverride, mobile] =
    watch(['theatre', 'date', 'slot', 'guests', 'decoration', 'addons', 'couponCode', 'mode', 'recordPayment', 'allowOverride', 'mobile'])
  // regular-customer discount: once a full mobile number is typed
  const customerMobile = /^[6-9]\d{9}$/.test(mobile?.trim() ?? '') ? mobile.trim() : undefined
  const theatre = theatres.data?.find((t) => t.id === theatreId)

  const quoteInput = useMemo(() => (
    theatreId && date && slot && guests >= 1
      ? { theatre: theatreId, date, slot, guests, decoration, addons, ...(couponCode && { couponCode }), ...(customerMobile && { customerMobile }) }
      : null
  ), [theatreId, date, slot, guests, decoration, addons, couponCode, customerMobile])
  const quote = useQuote(quoteInput)
  const q = quoteInput ? quote.data : undefined

  // pre-fill the customer from the enquiry (fields staff already typed are left alone)
  useEffect(() => {
    if (!lead) return
    const fill = (field: 'name' | 'mobile' | 'email' | 'occasion', value: string) => {
      if (value && !getFieldState(field).isDirty) setValue(field, value)
    }
    fill('name', lead.name)
    fill('mobile', lead.mobile)
    fill('email', lead.email)
    fill('occasion', lead.occasion)
    setValue('consentWhatsapp', lead.consentWhatsapp)
    if ((STAFF_SOURCES as readonly string[]).includes(lead.source)) setValue('source', lead.source as (typeof STAFF_SOURCES)[number])
    if (lead.message && !getFieldState('internalNotes').isDirty) setValue('internalNotes', `From enquiry: ${lead.message}`)
  }, [lead?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // the payment defaults to the advance until staff type their own amount
  useEffect(() => {
    if (q && !getFieldState('payAmount').isDirty) setValue('payAmount', Number(paiseToRupees(q.advancePaise)))
  }, [q?.advancePaise]) // eslint-disable-line react-hooks/exhaustive-deps

  const blocking = q ? blockingIssues(q) : []
  const overridable = q ? blocking.length > 0 && onlyOverridable(q) : false
  const couponProblem = q?.coupon && !q.coupon.applied ? `Coupon ${q.coupon.code} cannot be used: ${q.coupon.reason}` : null
  const canSubmit = Boolean(q) && !quote.isFetching && !couponProblem && (blocking.length === 0 || (overridable && allowOverride))

  const submit = handleSubmit(async (v) => {
    setSubmitErrors([])
    try {
      const booking = await create.mutateAsync({
        theatre: v.theatre, date: v.date, slot: v.slot, guests: v.guests, kids: v.kids, decoration: v.decoration, addons: v.addons,
        ...(v.couponCode && { couponCode: v.couponCode }),
        customer: { name: v.name, mobile: v.mobile, email: v.email },
        occasion: v.occasion, consentWhatsapp: v.consentWhatsapp,
        specialInstructions: v.specialInstructions, cakeRequest: v.cakeRequest, addonRequest: v.addonRequest, internalNotes: v.internalNotes,
        source: v.source, mode: v.mode, allowOverride: v.allowOverride,
        ...(v.recordPayment && { payment: { amountPaise: rupeesToPaise(v.payAmount) ?? 0, method: v.payMethod, ...(v.payReference && { reference: v.payReference }) } }),
      })
      toast.success(`${booking.bookingNumber} ${booking.status === 'CONFIRMED' ? 'confirmed' : 'created, slot held'}`)
      if (leadId) {
        await convertLead.mutateAsync({ id: leadId, booking: booking.id })
          .then(() => toast.success('Enquiry marked as converted'))
          .catch((err) => toast.info('Booking saved, but the enquiry was not marked converted', errorMessage(err)))
      }
      navigate(`/bookings/${booking.id}`, { replace: true })
    } catch (err) {
      setSubmitErrors(bookingErrorMessages(err))
      quote.refetch()
    }
  })

  const applyCoupon = () => setValue('couponCode', couponText.trim().toUpperCase())
  const clearCoupon = () => { setValue('couponCode', ''); setCouponText('') }

  return (
    <>
      <PageHeader
        title="New booking"
        description="Phone, WhatsApp or walk-in. The price updates as you choose."
        back={lead ? { to: `/leads/${lead.id}`, label: `${lead.name}'s enquiry` } : { to: '/bookings', label: 'Bookings' }}
      />
      {lead && (
        <div className="mb-6 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-800">
          Booking for <strong>{lead.name}</strong>'s enquiry. Their details are filled in, and the enquiry is marked converted when you save.
        </div>
      )}
      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="When" />
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Theatre" required error={errors.theatre?.message}>
                  {(f) => (
                    <Controller control={control} name="theatre" render={({ field }) => (
                      <TheatreSelect id={f.id} invalid={f.invalid} value={field.value} allLabel="Pick a theatre" onChange={(id) => { field.onChange(id); setValue('slot', ''); setValue('addons', []) }} />
                    )} />
                  )}
                </FormField>
                <FormField label="Date" required error={errors.date?.message} hint={date ? formatDate(date) : undefined}>
                  {(f) => <Input {...f} type="date" {...register('date', { onChange: () => setValue('slot', '') })} />}
                </FormField>
              </div>
              <FormField label="Slot" required error={errors.slot?.message}>
                {() => (
                  <Controller control={control} name="slot" render={({ field }) => (
                    <SlotPicker theatreId={theatreId} date={date} value={field.value} onChange={field.onChange} invalid={Boolean(errors.slot)} />
                  )} />
                )}
              </FormField>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Guests & decoration" description={theatre ? `${theatre.name}: ${theatre.capacityMin}–${theatre.capacityMax} guests, ${theatre.includedGuests} included in the price` : undefined} />
            <CardBody className="grid gap-4 sm:grid-cols-3">
              <FormField label="Guests (total)" required error={errors.guests?.message}>{(f) => <Input {...f} type="number" min={1} max={theatre?.capacityMax} {...register('guests', num)} />}</FormField>
              <FormField label="of which kids (3-10)" error={errors.kids?.message}>{(f) => <Input {...f} type="number" min={0} {...register('kids', num)} />}</FormField>
              <div className="flex items-end pb-1.5">
                <Controller control={control} name="decoration" render={({ field }) => <Switch id="decoration" checked={field.value} onChange={field.onChange} label="Decoration" />} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Cakes & add-ons" description="Only what this theatre offers. Out-of-stock items cannot be added." />
            <CardBody>
              {theatreId
                ? <Controller control={control} name="addons" render={({ field }) => <AddonPicker theatreId={theatreId} value={field.value as AddonLine[]} onChange={field.onChange} />} />
                : <p className="text-sm text-slate-500">Pick a theatre first.</p>}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField label="Cake request" hint="Message on the cake, flavour wishes…">{(f) => <Textarea {...f} rows={2} {...register('cakeRequest')} />}</FormField>
                <FormField label="Add-on request">{(f) => <Textarea {...f} rows={2} {...register('addonRequest')} />}</FormField>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Customer" />
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Name" required error={errors.name?.message}>{(f) => <Input {...f} {...register('name')} />}</FormField>
                <FormField label="Mobile" required error={errors.mobile?.message}>{(f) => <Input {...f} inputMode="numeric" maxLength={10} placeholder="10 digits" {...register('mobile')} />}</FormField>
                <FormField label="Email" error={errors.email?.message}>{(f) => <Input {...f} type="email" {...register('email')} />}</FormField>
                <FormField label="Occasion" required error={errors.occasion?.message}>{(f) => <Select {...f} placeholder="Pick one" options={OCCASIONS.map((o) => ({ value: o.slug, label: o.label }))} {...register('occasion')} />}</FormField>
                <FormField label="Booked via">{(f) => <Select {...f} options={STAFF_SOURCES.map((s) => ({ value: s, label: SOURCE_LABELS[s] }))} {...register('source')} />}</FormField>
                <div className="flex items-end pb-2">
                  <Controller control={control} name="consentWhatsapp" render={({ field }) => (
                    <Checkbox id="consentWhatsapp" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} label="WhatsApp updates" />
                  )} />
                </div>
              </div>
              <FormField label="Special instructions">{(f) => <Textarea {...f} rows={2} {...register('specialInstructions')} />}</FormField>
              <FormField label="Internal notes" hint="Staff only">{(f) => <Textarea {...f} rows={2} {...register('internalNotes')} />}</FormField>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardHeader title="Coupon" />
            <CardBody>
              {couponCode ? (
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={q?.coupon?.applied ? 'success' : 'warning'}>{couponCode}{q?.coupon?.applied ? ` −${formatPaise(q.coupon.discountPaise)}` : ''}</Badge>
                  <Button size="sm" variant="ghost" leftIcon={<X className="h-4 w-4" />} onClick={clearCoupon}>Remove</Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input aria-label="Coupon code" placeholder="Code" value={couponText} onChange={(e) => setCouponText(e.target.value)} className="font-mono uppercase" leading={<Tag className="h-4 w-4" />}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon() } }} />
                  <Button variant="secondary" onClick={applyCoupon} disabled={!couponText.trim()}>Apply</Button>
                </div>
              )}
              {couponProblem && <p className="mt-2 text-xs text-amber-700">{q?.coupon?.reason}. Remove it to continue.</p>}
            </CardBody>
          </Card>

          <QuotePanel quote={q} loading={quote.isLoading} error={quoteInput ? quote.error : undefined} refreshing={quote.isFetching && Boolean(q)} />

          <Card>
            <CardHeader title="Save as" />
            <CardBody className="space-y-4">
              <Controller control={control} name="mode" render={({ field }) => (
                <SegmentedControl label="Save as" value={field.value} onChange={field.onChange} options={[{ value: 'confirm', label: 'Confirm now' }, { value: 'hold', label: 'Hold slot' }]} />
              )} />
              <p className="text-xs text-slate-500">{mode === 'confirm' ? 'Confirmed straight away; the customer gets their pass.' : 'The slot is held for a few minutes while payment is awaited; confirm it from the booking page.'}</p>
              <Controller control={control} name="recordPayment" render={({ field }) => (
                <Switch id="recordPayment" checked={field.value} onChange={field.onChange} label="Payment received now" />
              )} />
              {recordPayment && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Amount" error={errors.payAmount?.message}>{(f) => <MoneyInput {...f} {...register('payAmount', num)} />}</FormField>
                  <FormField label="Method">{(f) => <Select {...f} options={MANUAL_PAYMENT_METHODS.map((m) => ({ value: m, label: PAYMENT_METHOD_LABELS[m] }))} {...register('payMethod')} />}</FormField>
                  <div className="col-span-2"><FormField label="Reference">{(f) => <Input {...f} placeholder="UPI / card ref" {...register('payReference')} />}</FormField></div>
                </div>
              )}
              {overridable && (
                <Controller control={control} name="allowOverride" render={({ field }) => (
                  <Checkbox id="allowOverride" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} label="Book anyway (staff override)" description="Only for notice and booking-window rules." />
                )} />
              )}
              {submitErrors.length > 0 && (
                <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitErrors.map((m) => <p key={m}>{m}</p>)}</div>
              )}
              <Button type="submit" fullWidth size="lg" loading={isSubmitting} disabled={!canSubmit || isSubmitting}>
                {mode === 'confirm' ? 'Confirm booking' : 'Hold slot'}{q ? ` · ${formatPaise(q.totalPaise)}` : ''}
              </Button>
              {q && blocking.length > 0 && !overridable && <p className="text-xs text-red-600">Fix the problems in the price panel to continue.</p>}
            </CardBody>
          </Card>
        </div>
      </form>
    </>
  )
}

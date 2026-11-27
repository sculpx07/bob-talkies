import { useParams } from 'react-router-dom'
import {
  AlertTriangle, CalendarClock, CheckCircle2, ExternalLink, Gift, IndianRupee, MessageCircle, MoreHorizontal, Pencil, Phone, RotateCcw, Timer, Trash2, UserX, XCircle,
} from 'lucide-react'
import { useBookingRefunds } from '@/admin/features/payments/api'
import { RefundModal } from '@/admin/features/payments/components/RefundModal'
import { REFUND_METHOD_SHORT, REFUND_STATUS_BADGE } from '@/admin/features/payments/constants'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, CardBody, CardHeader, ConfirmDialog, ErrorState, IconButton, LoadingBlock, Menu, StatusBadge, useToast, type MenuItem,
} from '@/admin/components/ui'
import { useAuth } from '@/admin/auth/AuthProvider'
import { PERMISSIONS } from '@/admin/types/permissions'
import { occasionLabel } from '@/admin/constants/catalog'
import { useDisclosure, useDisclosureWith } from '@/admin/hooks/useDisclosure'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDate, formatDateTime, formatTime } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { cn } from '@/admin/lib/utils/cn'
import { useBooking, usePaymentAttempts, useRemovePayment } from '../api'
import {
  BOOKING_STATUS_BADGE, EDITABLE_STATUSES, MANUAL_PAYMENT_METHODS, PAYABLE_STATUSES, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_BADGE, SOURCE_LABELS, canMoveTo,
} from '../constants'
import type { BookingDetail, BookingPayment, PaymentAttempt } from '../types'
import { formatCountdown, hoursUntilSlot, useNow, whatsappLink } from '../utils'
import {
  CancelBookingModal, CloseBookingModal, ConfirmBookingModal, EditDetailsModal, RecordPaymentModal, RescheduleModal,
} from '../components/BookingModals'
import { ExtrasModal } from '../components/ExtrasModal'

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm">
    <dt className="text-slate-500">{label}</dt>
    <dd className="text-right font-medium text-slate-900">{children}</dd>
  </div>
)

function BillCard({ b }: { b: BookingDetail }) {
  return (
    <Card>
      <CardHeader title="Bill" description={`Priced when booked · GST ${b.pricing.gstPercent}%${b.pricing.pricesIncludeGst ? ' included' : ''}`} />
      <CardBody>
        <ul className="divide-y divide-slate-100 text-sm">
          {b.pricing.lineItems.map((l, i) => (
            <li key={i} className="flex justify-between gap-4 py-1.5">
              <span className={cn('text-slate-600', l.paise < 0 && 'text-emerald-700')}>{l.label}</span>
              <span className={cn('tabular-nums', l.paise < 0 && 'text-emerald-700', l.included && 'text-slate-400')}>
                {l.paise < 0 ? `−${formatPaise(-l.paise)}` : formatPaise(l.paise)}{l.included ? ' (incl.)' : ''}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-base font-semibold"><span>Total</span><span className="tabular-nums">{formatPaise(b.totalPaise)}</span></div>
        <p className="mt-1 text-xs text-slate-500">Advance at booking: {formatPaise(b.pricing.advancePaise)} ({b.pricing.advancePercent}%)</p>
        {b.rewards && (b.rewards.pointsRedeemed > 0 || b.rewards.earnedAt) && (
          <div className="mt-3 space-y-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            {b.rewards.pointsRedeemed > 0 && (
              <p>
                BOB Points used: <strong>{b.rewards.pointsRedeemed.toLocaleString('en-IN')} pts</strong> (−{formatPaise(b.rewards.pointsRedeemed * b.rewards.pointValuePaise)})
                {b.rewards.returnedAt && <> · given back {formatDateTime(b.rewards.returnedAt)}</>}
              </p>
            )}
            {b.rewards.earnedAt && (
              <p>
                Earned on completion: <strong>{(b.rewards.pointsEarned + (b.rewards.regularBonusPoints ?? 0)).toLocaleString('en-IN')} pts</strong>
                {b.rewards.regularBonusPoints ? ` (incl. ${b.rewards.regularBonusPoints} regular bonus)` : ''}
              </p>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function PaymentsCard({ b, onRecord, onRemove, canRemove, onRefund }: { b: BookingDetail; onRecord?: () => void; onRemove: (p: BookingPayment) => void; canRemove: boolean; onRefund?: () => void }) {
  const refunds = useBookingRefunds(b.id)
  const list = refunds.data?.refunds ?? []
  const canStillRefund = (refunds.data?.payments ?? []).some((p) => p.refundablePaise > 0)
  return (
    <Card>
      <CardHeader
        title="Payments"
        description={<><StatusBadge status={b.paymentStatus} map={PAYMENT_STATUS_BADGE} /> <span className="ml-1">{formatPaise(b.amountPaidPaise)} paid · {formatPaise(b.balanceDuePaise)} due{b.refundedPaise ? ` · ${formatPaise(b.refundedPaise)} refunded` : ''}</span></>}
        actions={
          <div className="flex gap-2">
            {onRefund && canStillRefund && <Button size="sm" variant="secondary" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={onRefund}>Refund</Button>}
            {onRecord && b.balanceDuePaise > 0 && <Button size="sm" leftIcon={<IndianRupee className="h-4 w-4" />} onClick={onRecord}>Record payment</Button>}
          </div>
        }
      />
      <CardBody>
        {b.payments.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {b.payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                <div>
                  <p className="font-medium text-slate-900">{formatPaise(p.amountPaise)} · {PAYMENT_METHOD_LABELS[p.method]}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(p.receivedAt)}{p.recordedBy ? ` · by ${p.recordedBy.name}` : ''}{p.reference ? ` · ref ${p.reference}` : ''}{p.note ? ` · ${p.note}` : ''}
                  </p>
                </div>
                {canRemove && (MANUAL_PAYMENT_METHODS as readonly string[]).includes(p.method) && !list.some((r) => r.source.paymentId === p.id && r.status !== 'failed') && (
                  <IconButton size="sm" label="Remove payment" onClick={() => onRemove(p)}><Trash2 className="h-4 w-4" /></IconButton>
                )}
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-slate-500">No payments yet.</p>}
        {list.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Refunds</p>
            <ul className="divide-y divide-slate-100 text-sm">
              {list.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <p className="font-medium text-slate-900">−{formatPaise(r.amountPaise)} · {REFUND_METHOD_SHORT[r.method]}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(r.createdAt)}{r.createdBy ? ` · by ${r.createdBy.name}` : ''} · {r.reason}{r.reference ? ` · ref ${r.reference}` : ''}</p>
                  </div>
                  <StatusBadge status={r.status} map={REFUND_STATUS_BADGE} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

const ATTEMPT_BADGE = {
  created: { label: 'Open', tone: 'neutral' },
  paid: { label: 'Paid', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
} as const

const VIA_LABEL: Record<PaymentAttempt['confirmedVia'], string> = {
  '': '', test_screen: 'test screen', checkout: 'Razorpay checkout', webhook: 'Razorpay webhook',
}

/** Online payment attempts (website bookings): what the gateway did, and any refund owed. */
function OnlinePaymentsCard({ attempts }: { attempts: PaymentAttempt[] }) {
  const refunds = attempts.filter((a) => a.refundNeeded)
  return (
    <Card>
      <CardHeader title="Online payment attempts" description="Payments started on the website, newest first." />
      <CardBody className="space-y-3">
        {refunds.length > 0 && (
          <p role="alert" className="flex gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span><strong>Refund needed:</strong> {refunds.map((a) => `${formatPaise(a.amountPaise)} (${a.gatewayPaymentId})`).join(', ')} was paid after the slot hold expired. Refund it from the Razorpay dashboard.</span>
          </p>
        )}
        <ul className="divide-y divide-slate-100 text-sm">
          {attempts.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {formatPaise(a.amountPaise)} · {a.payFull ? 'full amount' : 'advance'}
                  <span className="ml-2 text-xs font-normal text-slate-500">{a.provider === 'razorpay' ? `Razorpay${a.mode === 'test' ? ' (test)' : ''}` : 'Test screen'}</span>
                </p>
                <p className="truncate text-xs text-slate-500">
                  {formatDateTime(a.paidAt ?? a.failedAt ?? a.createdAt)} · order {a.orderId}
                  {a.gatewayPaymentId ? ` · payment ${a.gatewayPaymentId}` : ''}
                  {a.confirmedVia && a.status === 'paid' ? ` · confirmed by ${VIA_LABEL[a.confirmedVia]}` : ''}
                </p>
                {a.status === 'failed' && a.failureReason && <p className="text-xs text-red-600">{a.failureReason}</p>}
                {a.status === 'created' && a.lastFailure && <p className="text-xs text-amber-700">Last try failed: {a.lastFailure.description}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                {a.refundNeeded && <Badge tone="danger">Refund needed</Badge>}
                <Badge tone={ATTEMPT_BADGE[a.status].tone} dot>{ATTEMPT_BADGE[a.status].label}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  )
}

function HistoryCard({ b }: { b: BookingDetail }) {
  const events = [
    ...b.statusHistory.map((h) => ({ at: h.at, text: `${h.from ? `${BOOKING_STATUS_BADGE[h.from].label} → ` : ''}${BOOKING_STATUS_BADGE[h.to].label}`, note: h.note, by: h.by?.name })),
    ...b.reschedules.map((r) => ({ at: r.at, text: `Moved ${formatDate(r.fromDate)} ${formatTime(r.fromTime)} → ${formatDate(r.toDate)} ${formatTime(r.toTime)}`, note: r.reason, by: r.by?.name })),
    // guests / decoration / add-ons changes and what they did to the total
    ...(b.edits ?? []).map((e) => ({
      at: e.at,
      text: `${e.by === 'customer' ? 'Changed by the customer' : 'Changed'}: ${formatPaise(e.fromTotalPaise)} → ${formatPaise(e.toTotalPaise)}`,
      note: e.summary,
      by: e.by === 'customer' ? 'Customer (website)' : e.user?.name,
    })),
  ].sort((a, c) => new Date(c.at).getTime() - new Date(a.at).getTime())
  return (
    <Card>
      <CardHeader title="History" />
      <CardBody>
        <ol className="space-y-3 border-l border-slate-200 pl-4">
          {events.map((e, i) => (
            <li key={i} className="relative text-sm">
              <span className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full bg-violet-500" />
              <p className="font-medium text-slate-900">{e.text}</p>
              {e.note && <p className="text-slate-600">{e.note}</p>}
              <p className="text-xs text-slate-500">{formatDateTime(e.at)}{e.by ? ` · ${e.by}` : ''}</p>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  )
}

export default function BookingDetailPage() {
  const { id = '' } = useParams()
  const toast = useToast()
  const { can } = useAuth()
  const now = useNow()
  const query = useBooking(id)
  const attempts = usePaymentAttempts(id)
  const removePayment = useRemovePayment()

  const confirm = useDisclosure()
  const cancel = useDisclosure()
  const complete = useDisclosure()
  const noShow = useDisclosure()
  const pay = useDisclosure()
  const edit = useDisclosure()
  const reschedule = useDisclosure()
  const extras = useDisclosure()
  const refundModal = useDisclosure()
  const confirmRemovePayment = useDisclosureWith<BookingPayment>()

  const b = query.data
  if (query.isLoading) return <LoadingBlock />
  if (query.error || !b) return <ErrorState error={query.error} retry={() => query.refetch()} title="Could not load this booking" />

  // what the role allows (the backend checks the same permissions)
  const mayEdit = can(PERMISSIONS.BOOKINGS_EDIT)
  const mayCancel = can(PERMISSIONS.BOOKINGS_CANCEL)
  const mayRecordPayment = can(PERMISSIONS.BOOKINGS_PAYMENTS)
  const editable = mayEdit && EDITABLE_STATUSES.includes(b.status)
  const slotStarted = hoursUntilSlot(b.date, b.slotStart, now) <= 0
  const holdLeft = b.holdExpiresAt ? formatCountdown(b.holdExpiresAt, now) : null

  const moreItems: MenuItem[] = [
    ...(editable ? [
      { label: 'Edit details', icon: <Pencil />, onSelect: edit.open },
      { label: 'Change guests & extras', icon: <Gift />, onSelect: extras.open },
      { label: 'Reschedule', icon: <CalendarClock />, onSelect: reschedule.open },
    ] : []),
    ...(mayEdit && canMoveTo(b.status, 'NO_SHOW') ? [{ label: 'Mark no-show', icon: <UserX />, onSelect: noShow.open, disabled: !slotStarted }] : []),
    ...(mayCancel && canMoveTo(b.status, 'CANCELLED') ? [{ label: 'Cancel booking', icon: <XCircle />, danger: true, onSelect: cancel.open }] : []),
  ]

  return (
    <>
      <PageHeader
        title={b.bookingNumber}
        back={{ to: '/bookings?view=list', label: 'Bookings' }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={b.status} map={BOOKING_STATUS_BADGE} />
            <StatusBadge status={b.paymentStatus} map={PAYMENT_STATUS_BADGE} />
            <span>{SOURCE_LABELS[b.source]} booking · created {formatDateTime(b.createdAt)}{b.createdBy ? ` by ${b.createdBy.name}` : ''}</span>
          </span>
        }
        actions={
          <>
            {mayEdit && canMoveTo(b.status, 'CONFIRMED') && <Button leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={confirm.open}>Confirm</Button>}
            {mayEdit && canMoveTo(b.status, 'COMPLETED') && (
              <Button variant="secondary" leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={complete.open} disabled={!slotStarted} title={slotStarted ? undefined : 'Available once the slot has started'}>
                Mark completed
              </Button>
            )}
            {mayRecordPayment && PAYABLE_STATUSES.includes(b.status) && b.balanceDuePaise > 0 && <Button variant="secondary" leftIcon={<IndianRupee className="h-4 w-4" />} onClick={pay.open}>Record payment</Button>}
            {moreItems.length > 0 && <Menu trigger={<IconButton label="More actions" variant="secondary"><MoreHorizontal className="h-4 w-4" /></IconButton>} items={moreItems} />}
          </>
        }
      />

      {holdLeft && (
        <div className={cn('mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm', holdLeft === 'expired' ? 'bg-slate-100 text-slate-700' : 'bg-amber-50 text-amber-800')}>
          <Timer className="h-4 w-4" />
          {holdLeft === 'expired' ? 'The slot hold has expired; this booking will be marked failed.' : <>Slot held for <strong className="tabular-nums">{holdLeft}</strong> more. Confirm once the customer pays.</>}
        </div>
      )}
      {b.cancellation && (
        <div className="mb-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          Cancelled {formatDateTime(b.cancellation.at)}{b.cancellation.by ? ` by ${b.cancellation.by.name}` : ''}, {b.cancellation.hoursBeforeSlot} h before the slot: {b.cancellation.reason}.{' '}
          {b.amountPaidPaise > 0 && (
            <strong>
              {(b.refundedPaise ?? 0) >= b.amountPaidPaise
                ? `Refunded ${formatPaise(b.refundedPaise ?? 0)}.`
                : b.cancellation.refundEligible
                  ? `Refund due: ${formatPaise(b.amountPaidPaise - (b.refundedPaise ?? 0))}${b.refundedPaise ? ` (${formatPaise(b.refundedPaise)} already refunded)` : ''}.`
                  : `Not refundable under the policy${b.refundedPaise ? `; ${formatPaise(b.refundedPaise)} refunded anyway` : ''}.`}
            </strong>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Booking"
              actions={editable ? (
                <>
                  <Button size="sm" variant="secondary" leftIcon={<Gift className="h-4 w-4" />} onClick={extras.open}>Guests & extras</Button>
                  <Button size="sm" variant="secondary" leftIcon={<CalendarClock className="h-4 w-4" />} onClick={reschedule.open}>Reschedule</Button>
                </>
              ) : undefined}
            />
            <CardBody>
              <dl className="grid gap-x-8 sm:grid-cols-2">
                <Row label="Theatre">{b.theatre.name}</Row>
                <Row label="Date">{formatDate(b.date)}</Row>
                <Row label="Time">{formatTime(b.slotStart)} – {formatTime(b.slotEnd)}</Row>
                <Row label="Occasion">{b.occasion ? occasionLabel(b.occasion) : '—'}</Row>
                <Row label="Guests">{b.guests}{b.kids ? ` (incl. ${b.kids} kids)` : ''}</Row>
                <Row label="Decoration">{b.decoration ? 'Yes' : 'No'}</Row>
                {b.coupon && <Row label="Coupon"><Badge tone="brand">{b.coupon.code}</Badge> −{formatPaise(b.coupon.discountPaise)}</Row>}
              </dl>
              {b.addons.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Add-ons</p>
                  <ul className="text-sm text-slate-700">{b.addons.map((a, i) => <li key={i}>{a.name}{a.quantity > 1 ? ` × ${a.quantity}` : ''}</li>)}</ul>
                </div>
              )}
              {(b.specialInstructions || b.cakeRequest || b.addonRequest || b.internalNotes) && (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-sm">
                  {b.specialInstructions && <p><span className="text-slate-500">Instructions:</span> {b.specialInstructions}</p>}
                  {b.cakeRequest && <p><span className="text-slate-500">Cake request:</span> {b.cakeRequest}</p>}
                  {b.addonRequest && <p><span className="text-slate-500">Add-on request:</span> {b.addonRequest}</p>}
                  {b.internalNotes && <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900"><span className="font-medium">Staff note:</span> {b.internalNotes}</p>}
                </div>
              )}
            </CardBody>
          </Card>
          <BillCard b={b} />
          <PaymentsCard
            b={b}
            onRecord={mayRecordPayment && PAYABLE_STATUSES.includes(b.status) ? pay.open : undefined}
            canRemove={can(PERMISSIONS.BOOKINGS_REMOVE_PAYMENT)}
            onRemove={(p) => confirmRemovePayment.open(p)}
            onRefund={can(PERMISSIONS.PAYMENTS_REFUND) ? refundModal.open : undefined}
          />
          {attempts.data && attempts.data.length > 0 && <OnlinePaymentsCard attempts={attempts.data} />}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Customer" actions={editable ? <IconButton size="sm" label="Edit details" onClick={edit.open}><Pencil className="h-4 w-4" /></IconButton> : undefined} />
            <CardBody className="space-y-2 text-sm">
              <p className="text-base font-medium text-slate-900">{b.customer.name}</p>
              <p className="text-slate-600">{b.customer.mobile}{b.customer.email ? ` · ${b.customer.email}` : ''}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a href={`tel:+91${b.customer.mobile}`}><Button size="sm" variant="secondary" leftIcon={<Phone className="h-4 w-4" />}>Call</Button></a>
                <a href={whatsappLink(b.customer.mobile, `Hi ${b.customer.name}, about your BOB Talkies booking ${b.bookingNumber}`)} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="secondary" leftIcon={<MessageCircle className="h-4 w-4" />}>WhatsApp</Button>
                </a>
              </div>
              <p className="pt-1 text-xs text-slate-500">WhatsApp updates: {b.consentWhatsapp ? 'agreed' : 'not agreed'}</p>
              {b.passToken && (
                <a href={`/pass/${b.passToken}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 hover:underline">
                  Customer's entry pass <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </CardBody>
          </Card>
          <HistoryCard b={b} />
        </div>
      </div>

      <ConfirmBookingModal booking={b} open={confirm.isOpen} onOpenChange={confirm.setOpen} />
      <CancelBookingModal booking={b} open={cancel.isOpen} onOpenChange={cancel.setOpen} />
      <CloseBookingModal booking={b} open={complete.isOpen} onOpenChange={complete.setOpen} outcome="completed" />
      <CloseBookingModal booking={b} open={noShow.isOpen} onOpenChange={noShow.setOpen} outcome="no_show" />
      <RecordPaymentModal booking={b} open={pay.isOpen} onOpenChange={pay.setOpen} />
      <RefundModal open={refundModal.isOpen} onOpenChange={refundModal.setOpen} bookingId={b.id} bookingNumber={b.bookingNumber} defaultReason={b.status === 'CANCELLED' ? 'Booking cancelled' : ''} />
      <EditDetailsModal booking={b} open={edit.isOpen} onOpenChange={edit.setOpen} />
      <RescheduleModal booking={b} open={reschedule.isOpen} onOpenChange={reschedule.setOpen} />
      <ExtrasModal booking={b} open={extras.isOpen} onOpenChange={extras.setOpen} />
      <ConfirmDialog
        open={confirmRemovePayment.isOpen}
        onOpenChange={(o) => !o && confirmRemovePayment.close()}
        title="Remove this payment?"
        description="Only for a payment recorded by mistake. The amount becomes due again."
        confirmLabel="Remove payment"
        tone="danger"
        loading={removePayment.isPending}
        onConfirm={() => confirmRemovePayment.item && removePayment.mutate({ id: b.id, paymentId: confirmRemovePayment.item.id }, {
          onSuccess: () => { toast.success('Payment removed'); confirmRemovePayment.close() },
          onError: (err) => toast.error('Could not remove it', errorMessage(err)),
        })}
      />
    </>
  )
}

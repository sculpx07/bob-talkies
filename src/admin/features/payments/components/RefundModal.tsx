import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button, FormField, Input, LoadingBlock, Modal, MoneyInput, Select, Textarea, useToast } from '@/admin/components/ui'
import { ApiError, errorMessage } from '@/admin/lib/api/errors'
import { formatDateTime } from '@/admin/lib/utils/date'
import { formatPaise, paiseToRupees, rupeesToPaise } from '@/admin/lib/utils/money'
import { cn } from '@/admin/lib/utils/cn'
import { PAYMENT_METHOD_LABELS } from '@/admin/features/bookings/constants'
import { useBookingRefunds, useCreateRefund } from '../api'
import { MANUAL_REFUND_METHODS, REFUND_METHOD_LABELS } from '../constants'
import type { RefundablePayment, RefundMethod } from '../types'

const keyOf = (p: RefundablePayment) => p.paymentId ?? p.paymentOrderId ?? ''

/**
 * Give money back from one payment of a booking. Online payments go back through Razorpay
 * (real money, to the customer's card / UPI); otherwise staff record the refund they made.
 */
export function RefundModal({ open, onOpenChange, bookingId, bookingNumber, preselect, defaultReason = '' }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId: string
  bookingNumber: string
  /** payment id or payment order id to start with */
  preselect?: string
  defaultReason?: string
}) {
  const toast = useToast()
  const info = useBookingRefunds(bookingId, open)
  const create = useCreateRefund()
  const refundable = useMemo(() => (info.data?.payments ?? []).filter((p) => p.refundablePaise > 0), [info.data])

  const [chosen, setChosen] = useState('')
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<RefundMethod | ''>('')
  const [reason, setReason] = useState(defaultReason)
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')

  const payment = refundable.find((p) => keyOf(p) === chosen)

  // start on the requested (or only) payment, with everything that can still be refunded
  useEffect(() => {
    if (!open || !refundable.length) return
    const first = refundable.find((p) => keyOf(p) === preselect) ?? refundable[0]
    setChosen(keyOf(first))
  }, [open, refundable, preselect])
  useEffect(() => {
    if (!payment) return
    setAmount(paiseToRupees(payment.refundablePaise))
    setMethod(payment.methods[0])
  }, [payment])
  useEffect(() => {
    if (open) { setReason(defaultReason); setReference(''); setNote(''); setErrors({}); setFormError('') }
  }, [open, defaultReason])

  const amountPaise = rupeesToPaise(amount) ?? 0
  const manual = method !== '' && MANUAL_REFUND_METHODS.includes(method)

  const submit = () => {
    const errs: Record<string, string> = {}
    if (!payment) errs.payment = 'Choose a payment'
    if (amountPaise < 100) errs.amount = 'At least ₹1'
    else if (payment && amountPaise > payment.refundablePaise) errs.amount = `At most ${formatPaise(payment.refundablePaise)}`
    if (reason.trim().length < 3) errs.reason = 'Say why (at least 3 characters)'
    if (manual && !reference.trim()) errs.reference = 'Add the UPI / bank / receipt reference'
    setErrors(errs)
    if (Object.keys(errs).length || !payment || !method) return
    setFormError('')
    create.mutate({
      booking: bookingId,
      ...(payment.kind === 'order' ? { paymentOrder: payment.paymentOrderId } : { paymentId: payment.paymentId }),
      amountPaise,
      method,
      reason: reason.trim(),
      ...(reference.trim() && { reference: reference.trim() }),
      ...(note.trim() && { note: note.trim() }),
    }, {
      onSuccess: (r) => {
        toast.success(
          r.status === 'processed' ? `${formatPaise(r.amountPaise)} refunded` : `Refund of ${formatPaise(r.amountPaise)} started`,
          r.status === 'pending' ? 'Razorpay is processing it; banks usually take 5–7 working days.' : undefined,
        )
        onOpenChange(false)
      },
      onError: (err) => {
        if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k === 'amountPaise' ? 'amount' : k, v])))
        setFormError(errorMessage(err))
      },
    })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Refund · ${bookingNumber}`}
      description="Money goes back from one payment. You can refund part of it."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={create.isPending}>Cancel</Button>
          <Button variant={method === 'razorpay' ? 'danger' : 'primary'} onClick={submit} loading={create.isPending} disabled={!payment}>
            {method === 'razorpay' ? `Refund ${formatPaise(amountPaise)} through Razorpay` : `Record refund of ${formatPaise(amountPaise)}`}
          </Button>
        </>
      }
    >
      {info.isLoading ? <LoadingBlock /> : !refundable.length ? (
        <p className="text-sm text-slate-600">Nothing left to refund on this booking.</p>
      ) : (
        <div className="space-y-4">
          {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">From payment</legend>
            <div className="space-y-2">
              {refundable.map((p) => (
                <label key={keyOf(p)} className={cn('flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm', chosen === keyOf(p) ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500' : 'border-slate-200 hover:border-slate-300')}>
                  <input type="radio" className="mt-0.5 accent-violet-600" checked={chosen === keyOf(p)} onChange={() => setChosen(keyOf(p))} />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-slate-900">
                      {formatPaise(p.amountPaise)} · {PAYMENT_METHOD_LABELS[p.method]}{p.provider === 'razorpay' ? ' (Razorpay)' : p.provider === 'dev' ? ' (test screen)' : ''}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {formatDateTime(p.receivedAt)}{p.reference ? ` · ref ${p.reference}` : ''} · {formatPaise(p.refundablePaise)} can be refunded
                    </span>
                    {p.note && <span className="block text-xs text-amber-700">{p.note}</span>}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Amount" required error={errors.amount} hint={payment ? `Up to ${formatPaise(payment.refundablePaise)}` : undefined}>
              {(f) => <MoneyInput {...f} value={amount} onChange={(e) => setAmount(e.target.value)} />}
            </FormField>
            <FormField label="Refund by" required error={errors.method}>
              {(f) => (
                <Select {...f} value={method} onChange={(e) => setMethod(e.target.value as RefundMethod)}
                  options={(payment?.methods ?? []).map((m) => ({ value: m, label: REFUND_METHOD_LABELS[m] }))} />
              )}
            </FormField>
          </div>

          {method === 'razorpay' && (
            <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Razorpay sends this money back to the customer’s card / UPI. It cannot be undone. Banks usually take 5–7 working days.
            </p>
          )}

          <FormField label="Reason" required error={errors.reason} hint="Shown on the booking and in the refunds list">
            {(f) => <Input {...f} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Cancelled within the refund window" maxLength={300} />}
          </FormField>
          {manual && (
            <FormField label="Reference" required error={errors.reference} hint="UPI / bank transaction id, or receipt number for cash">
              {(f) => <Input {...f} value={reference} onChange={(e) => setReference(e.target.value)} maxLength={120} />}
            </FormField>
          )}
          <FormField label="Note" hint="Optional, for staff">
            {(f) => <Textarea {...f} rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} />}
          </FormField>
        </div>
      )}
    </Modal>
  )
}

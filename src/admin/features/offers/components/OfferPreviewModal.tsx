import { useEffect, useState } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { Button, FormField, Input, Modal, MoneyInput, Select } from '@/admin/components/ui'
import { TheatreSelect } from '@/admin/features/theatres/components/TheatreSelect'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDate, todayISO } from '@/admin/lib/utils/date'
import { formatPaise, rupeesToPaise } from '@/admin/lib/utils/money'
import { useOfferOptions, usePreviewOffer } from '../api'

/** "Would this code work for this booking, and how much would it take off?" */
export function OfferPreviewModal({ open, onOpenChange, initialCode = '' }: { open: boolean; onOpenChange: (o: boolean) => void; initialCode?: string }) {
  const offers = useOfferOptions()
  const preview = usePreviewOffer()
  const [code, setCode] = useState(initialCode)
  const [theatre, setTheatre] = useState('')
  const [date, setDate] = useState(todayISO())
  const [subtotal, setSubtotal] = useState('')

  useEffect(() => {
    if (open) { setCode(initialCode); preview.reset() }
  }, [open, initialCode]) // eslint-disable-line react-hooks/exhaustive-deps

  const subtotalPaise = rupeesToPaise(subtotal)
  const canRun = Boolean(code && date && subtotalPaise !== null && subtotalPaise >= 0)
  const run = () => canRun && preview.mutate({ code, theatre: theatre || undefined, date, subtotalPaise: subtotalPaise! })
  const result = preview.data

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Try a code"
      description="Check whether a code applies to a booking, and how much it takes off."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={run} loading={preview.isPending} disabled={!canRun}>Check</Button>
        </>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); run() }} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Code">
            {(f) => (
              <Select {...f} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Pick a code" options={(offers.data ?? []).map((o) => ({ value: o.code, label: o.code }))} />
            )}
          </FormField>
          <FormField label="Booking subtotal" hint="Before discount and GST">
            {(f) => <MoneyInput {...f} value={subtotal} onChange={(e) => setSubtotal(e.target.value)} placeholder="2500" />}
          </FormField>
          <FormField label="Theatre">
            {(f) => <TheatreSelect id={f.id} value={theatre} onChange={setTheatre} allLabel="Not chosen" />}
          </FormField>
          <FormField label="Slot date">
            {(f) => <Input {...f} type="date" value={date} onChange={(e) => setDate(e.target.value)} />}
          </FormField>
        </div>
        <button type="submit" hidden />
      </form>

      {preview.error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage(preview.error)}</p>}

      {result && (
        <div className={`mt-4 rounded-xl border p-4 ${result.applicable ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`} role="status">
          <p className="flex items-center gap-2 font-medium text-slate-900">
            {result.applicable ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-amber-600" />}
            {result.applicable ? `${result.offer.code} applies` : `${result.offer.code} does not apply`}
          </p>
          {result.applicable ? (
            <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div><dt className="text-slate-500">Subtotal</dt><dd className="font-medium tabular-nums">{formatPaise(result.input.subtotalPaise)}</dd></div>
              <div><dt className="text-slate-500">Discount</dt><dd className="font-medium tabular-nums text-emerald-700">−{formatPaise(result.discountPaise)}</dd></div>
              <div><dt className="text-slate-500">After discount</dt><dd className="font-semibold tabular-nums">{formatPaise(result.totalAfterDiscountPaise)}</dd></div>
            </dl>
          ) : (
            <p className="mt-1 text-sm text-slate-700">{result.reason}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">For a booking on {formatDate(result.input.date)}. GST is added after the discount.</p>
          {result.checkedAtCheckout.length > 0 && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Also checked when booking: {result.checkedAtCheckout.join(', ')}.
            </p>
          )}
        </div>
      )}
    </Modal>
  )
}

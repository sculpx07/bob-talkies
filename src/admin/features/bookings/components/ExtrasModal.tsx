import { useEffect, useMemo, useState } from 'react'
import { Button, Checkbox, FormField, Input, Modal, Switch, useToast } from '@/admin/components/ui'
import { formatPaise } from '@/admin/lib/utils/money'
import { useUpdateExtras } from '../api'
import { blockingIssues, onlyOverridable, useQuote, type AddonLine } from '../quote'
import type { BookingDetail } from '../types'
import { bookingErrorMessages } from '../utils'
import { AddonPicker } from './AddonPicker'
import { QuotePanel } from './QuotePanel'

const linesOf = (b: BookingDetail): AddonLine[] =>
  b.addons.map((a) => ({ addon: a.addon, ...(a.variant && { variant: a.variant }), quantity: a.quantity }))

/** Change guests / decoration / add-ons, with a live re-price against the booking's own slot and coupon. */
export function ExtrasModal({ booking, open, onOpenChange }: { booking: BookingDetail; open: boolean; onOpenChange: (o: boolean) => void }) {
  const toast = useToast()
  const save = useUpdateExtras()
  const [guests, setGuests] = useState(booking.guests)
  const [kids, setKids] = useState(booking.kids)
  const [decoration, setDecoration] = useState(booking.decoration)
  const [addons, setAddons] = useState<AddonLine[]>(linesOf(booking))
  const [override, setOverride] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setGuests(booking.guests); setKids(booking.kids); setDecoration(booking.decoration)
      setAddons(linesOf(booking)); setOverride(false); setErrors([])
    }
  }, [open, booking])

  const input = useMemo(() => (open && guests >= 1
    ? { theatre: booking.theatre.id, date: booking.date, slot: booking.slot.id, guests, decoration, addons, booking: booking.id }
    : null), [open, guests, decoration, addons, booking])
  const quote = useQuote(input)
  const q = input ? quote.data : undefined
  const blocking = q ? blockingIssues(q) : []
  const overridable = q ? blocking.length > 0 && onlyOverridable(q) : false
  const belowPaid = q ? q.totalPaise < booking.amountPaidPaise : false
  const kidsInvalid = kids > guests
  const canSave = Boolean(q) && !quote.isFetching && !belowPaid && !kidsInvalid && (blocking.length === 0 || (overridable && override))

  const submit = async () => {
    setErrors([])
    try {
      const r = await save.mutateAsync({ id: booking.id, guests, kids, decoration, addons, allowOverride: override })
      const d = r.differencePaise
      toast.success('Extras updated', d ? `Total ${d > 0 ? 'up' : 'down'} by ${formatPaise(Math.abs(d))}, now ${formatPaise(r.booking.totalPaise)}` : 'Total unchanged')
      onOpenChange(false)
    } catch (err) { setErrors(bookingErrorMessages(err)) }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} size="xl" title="Change guests & extras" description="Re-priced with today's prices; an applied coupon is kept."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={save.isPending} disabled={!canSave}>Save changes</Button></>}>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Guests (total)">{(f) => <Input {...f} type="number" min={1} value={Number.isNaN(guests) ? '' : guests} onChange={(e) => setGuests(e.target.valueAsNumber)} />}</FormField>
            <FormField label="of which kids" error={kidsInvalid ? 'More than the guests' : undefined}>{(f) => <Input {...f} type="number" min={0} value={kids} onChange={(e) => setKids(e.target.valueAsNumber || 0)} />}</FormField>
            <div className="flex items-end pb-1.5"><Switch id="extrasDecoration" checked={decoration} onChange={setDecoration} label="Decoration" /></div>
          </div>
          <AddonPicker theatreId={booking.theatre.id} value={addons} onChange={setAddons} />
        </div>
        <div className="space-y-3">
          <QuotePanel title="New price" quote={q} loading={quote.isLoading} error={input ? quote.error : undefined} refreshing={quote.isFetching && Boolean(q)} compareTotalPaise={booking.totalPaise} />
          {belowPaid && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">The new total is below the {formatPaise(booking.amountPaidPaise)} already paid. Refund the difference first.</p>}
          {overridable && <Checkbox id="extrasOverride" checked={override} onChange={(e) => setOverride(e.target.checked)} label="Save anyway (staff override)" />}
          {errors.length > 0 && <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{errors.map((m) => <p key={m}>{m}</p>)}</div>}
        </div>
      </div>
    </Modal>
  )
}

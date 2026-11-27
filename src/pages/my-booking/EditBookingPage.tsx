import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Check, Minus, Plus, Sparkles, Users } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/EmptyState'
import { PageShell } from '@/components/layout/PageShell'
import { useToast } from '@/components/ui/Toast'
import { useBookingStatus } from '@/features/booking/hooks/useBookingStatus'
import { bookingApi, type BookingEditRequest } from '@/features/booking/api'
import { useAddons, useTheatres } from '@/features/catalog/api'
import { useSiteConfig } from '@/features/site/api'
import { useCustomerSession } from '@/features/auth/session'
import { bookingKeys } from '@/lib/api/queryKeys'
import { ApiError } from '@/lib/api/client'
import { formatINR } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import type { Addon } from '@/schemas/addon'

/*
 * A customer changes their confirmed booking: guests, decoration and add-ons, until the
 * cut-off before the slot (Admin → Settings → Booking rules). Nothing is paid here: the
 * new total is shown, and the balance is paid at the venue.
 */

const CATEGORY_LABELS: Record<string, string> = {
  cake: 'Cakes', decoration: 'Decoration', decor: 'Decor', flowers: 'Flowers', photography: 'Photography', videography: 'Videography',
  food: 'Food & drinks', surprise: 'Surprises', effects: 'Effects', signage: 'Signage', gifts: 'Gifts',
}

const counted = (ids: string[]) => ids.reduce<Record<string, number>>((m, id) => ({ ...m, [id]: (m[id] ?? 0) + 1 }), {})
const toIds = (counts: Record<string, number>) => Object.entries(counts).flatMap(([id, n]) => Array<string>(n).fill(id)).sort()
const untilText = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : ''

/** Waits until the value stops changing (so the bill is not re-priced on every tap). */
function useSettled<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return v
}

export default function EditBookingPage() {
  const { bookingId = '' } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const session = useCustomerSession()
  const token = session?.token ?? ''
  const { data: booking, isLoading, isError, refetch } = useBookingStatus(bookingId || null)
  const { data: theatres = [] } = useTheatres()
  const theatre = theatres.find((t) => t.id === booking?.theatreId)
  const { data: addons = [] } = useAddons(booking?.theatreId)
  const { data: site } = useSiteConfig()

  // the selection being edited, starting from the booking
  const [guests, setGuests] = useState<number | null>(null)
  const [decoration, setDecoration] = useState<boolean | null>(null)
  const [counts, setCounts] = useState<Record<string, number> | null>(null)
  useEffect(() => {
    if (!booking || counts) return
    setGuests(booking.guests)
    setDecoration(hasDecoration(booking))
    setCounts(counted(booking.addonIds))
  }, [booking, counts])

  const request: BookingEditRequest | null = booking && guests !== null && decoration !== null && counts
    ? { guests, decoration, addonIds: toIds(counts) }
    : null
  const original = useMemo(() => (booking ? JSON.stringify({ guests: booking.guests, addonIds: [...booking.addonIds].sort() }) : ''), [booking])
  const changed = Boolean(request && booking && (JSON.stringify({ guests: request.guests, addonIds: request.addonIds }) !== original || request.decoration !== hasDecoration(booking)))

  const settled = useSettled(request)
  const preview = useQuery({
    queryKey: ['booking-edit-preview', bookingId, settled],
    queryFn: () => bookingApi.previewEdit(bookingId, settled!, token),
    enabled: Boolean(settled && token && booking?.canEdit),
    placeholderData: (prev) => prev,
    retry: false,
  })
  const bill = preview.data

  const save = useMutation({
    mutationFn: () => bookingApi.editBooking(bookingId, request!, token),
    onSuccess: (updated) => {
      queryClient.setQueryData(bookingKeys.detail(bookingId), updated)
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
      toast('success', 'Booking updated', `New total ${formatINR(updated.totalPaise)} · ${formatINR(updated.balancePaise)} to pay at the venue.`)
      navigate(`/my-booking/${encodeURIComponent(bookingId)}`)
    },
    onError: (e: Error) => toast('error', 'Could not update the booking', e.message),
  })

  const byCategory = useMemo(() => {
    const groups = new Map<string, Addon[]>()
    for (const a of addons) {
      // show what can be added now, and anything already on the booking
      if (!(a.isAvailable && !a.isOutOfStock) && !counts?.[a.id]) continue
      groups.set(a.category, [...(groups.get(a.category) ?? []), a])
    }
    return [...groups.entries()]
  }, [addons, counts])

  const setQty = (id: string, n: number) => setCounts((c) => {
    const next = { ...(c ?? {}) }
    if (n <= 0) delete next[id]
    else next[id] = Math.min(n, 10)
    return next
  })

  const min = theatre?.capacityMin ?? 1
  const max = theatre?.capacityMax ?? 20
  const decorationPrice = site?.pricing.decorationPricePaise ?? 0

  return (
    <>
      <Seo title="Change Booking" description="Change guests, decoration or add-ons of your BOB Talkies booking." noindex />
      <div style={{
        backgroundColor: '#430948',
        backgroundImage: 'radial-gradient(ellipse 48% 18% at 78% 20%, rgba(150,14,128,0.62), rgba(150,14,128,0) 100%), linear-gradient(180deg, #2a0430 0%, #430948 100%)',
        backgroundSize: '100% 1600px, 100% 600px',
        backgroundRepeat: 'repeat-y, no-repeat',
      }}>
        <PageShell>
          <div className="mx-auto max-w-5xl">
            <Link to={`/my-booking/${encodeURIComponent(bookingId)}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#f5d7a1] hover:underline">
              <ArrowLeft size={15} /> Back to booking
            </Link>

            {!token ? (
              <Notice title="Please sign in" text="Sign in with your mobile number on My Booking to change this booking." action={<Link to="/my-booking" className="font-bold underline">Go to My Booking</Link>} />
            ) : isLoading ? (
              <Skeleton className="h-80 w-full" rounded="lg" />
            ) : isError || !booking ? (
              <ErrorState title="Booking not found" retry={refetch} />
            ) : !booking.canEdit ? (
              <Notice title="This booking can no longer be changed" text={booking.editNote || 'Message us on WhatsApp for help.'} />
            ) : (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="font-display text-3xl font-bold !text-white md:text-4xl">Change your booking</h1>
                <p className="mt-2 text-sm text-white/80">
                  {booking.theatreName} · {new Date(`${booking.date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {formatTime(booking.slotStart)}
                  {booking.bookingNumber && <> · Booking no. <span className="font-mono">{booking.bookingNumber}</span></>}
                </p>
                <p className="mt-1 text-xs text-[#f5d7a1]">You can make changes until {untilText(booking.editableUntil)}. Nothing is charged now — the new balance is paid at the venue.</p>

                <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="space-y-5">
                    {/* guests */}
                    <section className="rounded-3xl bg-[#fff8f9] p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="flex items-center gap-2 font-bold text-[#3d0a24]"><Users size={16} /> Guests</p>
                          <p className="mt-0.5 text-xs text-[#7d4555]">{theatre ? `${theatre.name} fits ${min}–${max} guests. ${theatre.includedGuests} included, ${formatINR(theatre.extraGuestPricePaise)} per extra guest.` : 'Everyone attending, kids included.'}</p>
                        </div>
                        <Stepper value={guests ?? 1} min={1} max={max} onChange={setGuests} label="guests" />
                      </div>
                    </section>

                    {/* decoration */}
                    <section className="rounded-3xl bg-[#fff8f9] p-5 sm:p-6">
                      <button type="button" role="switch" aria-checked={Boolean(decoration)} onClick={() => setDecoration((d) => !d)} className="flex w-full items-center justify-between gap-4 text-left">
                        <span>
                          <span className="flex items-center gap-2 font-bold text-[#3d0a24]"><Sparkles size={16} /> Theme decoration</span>
                          <span className="mt-0.5 block text-xs text-[#7d4555]">{decorationPrice ? `${formatINR(decorationPrice)}` : 'Balloons, lights and setup'}</span>
                        </span>
                        <span className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', decoration ? 'bg-[#8b1a3a]' : 'bg-[#e8c9d3]')} aria-hidden="true">
                          <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', decoration ? 'left-[1.375rem]' : 'left-0.5')} />
                        </span>
                      </button>
                    </section>

                    {/* add-ons */}
                    <section className="rounded-3xl bg-[#fff8f9] p-5 sm:p-6">
                      <p className="font-bold text-[#3d0a24]">Add-ons</p>
                      <p className="mt-0.5 text-xs text-[#7d4555]">Some items need notice to prepare; those can no longer be added close to your slot.</p>
                      <div className="mt-4 space-y-5">
                        {byCategory.map(([cat, list]) => (
                          <div key={cat}>
                            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#8b1a3a]">{CATEGORY_LABELS[cat] ?? cat}</p>
                            <ul className="divide-y divide-[#f5d5e0]">
                              {list.map((a) => {
                                const n = counts?.[a.id] ?? 0
                                return (
                                  <li key={a.id} className="flex items-center gap-3 py-2.5">
                                    {a.image ? <img src={a.image} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" /> : <span className="h-11 w-11 shrink-0 rounded-xl bg-[#f5d5e0]" />}
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-semibold text-[#3d0a24]">{a.cakeName ? `${a.cakeName} (${a.sizeLabel})` : a.name}</p>
                                      <p className="text-xs text-[#7d4555]">{formatINR(a.pricePaise)}{a.leadTimeHours ? ` · needs ${a.leadTimeHours}h notice` : ''}</p>
                                    </div>
                                    {n > 0
                                      ? <Stepper value={n} min={0} max={10} onChange={(v) => setQty(a.id, v)} label={a.name} small />
                                      : <button type="button" onClick={() => setQty(a.id, 1)} className="rounded-full border border-[#8b1a3a] px-3.5 py-1.5 text-xs font-bold text-[#8b1a3a] hover:bg-[#8b1a3a] hover:text-white">Add</button>}
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        ))}
                        {!byCategory.length && <p className="text-sm text-[#7d4555]">No add-ons for this theatre.</p>}
                      </div>
                    </section>
                  </div>

                  {/* the new bill */}
                  <aside className="rounded-3xl bg-[#fff8f9] p-5 sm:p-6 lg:sticky lg:top-24">
                    <p className="font-bold text-[#3d0a24]">New bill</p>
                    <div className={cn('mt-3 space-y-2 text-sm transition-opacity', preview.isFetching && 'opacity-60')}>
                      {!bill ? (
                        [1, 2, 3].map((i) => <Skeleton key={i} className="h-4 w-full" />)
                      ) : (
                        <>
                          {bill.lineItems.map((l, i) => (
                            <div key={i} className={cn('flex justify-between gap-3', l.paise < 0 ? 'text-emerald-700' : 'text-[#5b2535]')}>
                              <span>{l.label}</span>
                              <span className="tabular-nums">{l.paise < 0 ? '−' : ''}{formatINR(Math.abs(l.paise))}</span>
                            </div>
                          ))}
                          <div className="mt-2 flex justify-between border-t border-dashed border-[#d9b8e0] pt-2 text-base font-bold text-[#3d0a24]">
                            <span>New total</span><span className="tabular-nums">{formatINR(bill.totalPaise)}</span>
                          </div>
                          {bill.differencePaise !== 0 && (
                            <p className={cn('text-xs', bill.differencePaise > 0 ? 'text-[#b0701c]' : 'text-emerald-700')}>
                              {bill.differencePaise > 0 ? '+' : '−'}{formatINR(Math.abs(bill.differencePaise))} compared with {formatINR(bill.previousTotalPaise)}
                            </p>
                          )}
                          <div className="flex justify-between text-[#5b2535]"><span>Already paid</span><span className="tabular-nums">{formatINR(bill.paidPaise)}</span></div>
                          <div className="flex justify-between font-bold text-[#8b1a3a]"><span>Pay at the venue</span><span className="tabular-nums">{formatINR(bill.balancePaise)}</span></div>
                        </>
                      )}
                    </div>
                    {bill && bill.problems.length > 0 && (
                      <ul className="mt-4 space-y-1.5" role="alert">
                        {bill.problems.map((p) => (
                          <li key={p} className="flex gap-2 rounded-xl bg-[#fdecf2] px-3 py-2 text-xs text-[#c2255c]"><AlertCircle size={14} className="mt-0.5 shrink-0" />{p}</li>
                        ))}
                      </ul>
                    )}
                    {preview.error && <p className="mt-4 rounded-xl bg-[#fdecf2] px-3 py-2 text-xs text-[#c2255c]">{previewError(preview.error)}</p>}
                    <button
                      type="button"
                      onClick={() => save.mutate()}
                      disabled={!changed || !bill || bill.problems.length > 0 || preview.isFetching || save.isPending}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#8b1a3a,#d9126a)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(107,35,152,0.3)] disabled:opacity-50"
                    >
                      <Check size={16} /> {save.isPending ? 'Saving…' : changed ? 'Save changes' : 'No changes yet'}
                    </button>
                    <p className="mt-2 text-center text-[11px] text-[#7d4555]">No payment now. Pay the balance at the venue.</p>
                  </aside>
                </div>
              </motion.div>
            )}
          </div>
        </PageShell>
      </div>
    </>
  )
}

/** The decoration line is on the bill when the booking has decoration. */
function hasDecoration(booking: { decoration?: boolean }): boolean {
  return Boolean(booking.decoration)
}

function previewError(e: unknown): string {
  if (e instanceof ApiError && e.status === 401) return 'Your sign-in has expired. Sign in again on My Booking.'
  return (e as Error)?.message || 'Could not price the change.'
}

function Stepper({ value, min, max, onChange, label, small }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string; small?: boolean }) {
  const size = small ? 'h-8 w-8' : 'h-10 w-10'
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className={cn(size, 'flex items-center justify-center rounded-full border border-[#d9b8e0] text-[#8b1a3a] disabled:opacity-40')}><Minus size={14} /></button>
      <span className={cn('w-8 text-center font-bold tabular-nums text-[#3d0a24]', small ? 'text-sm' : 'text-lg')} aria-live="polite">{value}</span>
      <button type="button" aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className={cn(size, 'flex items-center justify-center rounded-full border border-[#d9b8e0] text-[#8b1a3a] disabled:opacity-40')}><Plus size={14} /></button>
    </div>
  )
}

function Notice({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-[#fff8f9] p-8 text-center">
      <p className="font-display text-2xl font-bold text-[#3d0a24]">{title}</p>
      <p className="mt-2 text-sm text-[#5b2535]">{text}</p>
      {action && <p className="mt-4 text-sm text-[#8b1a3a]">{action}</p>}
    </div>
  )
}

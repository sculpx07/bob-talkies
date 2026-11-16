import type { CSSProperties } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Ticket, Users, Clock, MapPin } from 'lucide-react'
import { useBookingStatus } from '@/features/booking/hooks/useBookingStatus'
import { Seo } from '@/components/seo/Seo'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/EmptyState'
import { PageShell } from '@/components/layout/PageShell'
import { theatreKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Theatre } from '@/schemas/theatre'
import { formatTime } from '@/lib/utils/date'
import { formatINR } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { config } from '@/lib/config'

const EASE = [0.22, 1, 0.36, 1] as const
const NOTCH = 16 // px radius of the ticket cut-outs

/** Round cut-outs on the two corners that meet the tear line. */
function notchMask(edge: 'bottom' | 'top'): CSSProperties {
  const y = edge === 'bottom' ? '100%' : '0'
  const m = `radial-gradient(circle ${NOTCH}px at 0 ${y}, transparent 97%, #000), radial-gradient(circle ${NOTCH}px at 100% ${y}, transparent 97%, #000)`
  return { WebkitMaskImage: m, maskImage: m, WebkitMaskComposite: 'source-in', maskComposite: 'intersect' }
}

/** Decorative barcode drawn from the booking id (the same id always gives the same bars). */
function Barcode({ value }: { value: string }) {
  const bars = Array.from({ length: 36 }, (_, i) => {
    const c = value.charCodeAt(i % value.length) + i * 7
    return { w: (c % 3) + 1, gap: (c % 2) + 1 }
  })
  return (
    <div className="flex h-14 items-stretch" aria-hidden="true">
      {bars.map((b, i) => (
        <span key={i} className="bg-[#2a0e4f]" style={{ width: b.w * 1.6, marginRight: b.gap * 1.4 }} />
      ))}
    </div>
  )
}

export default function MyBookingDetailPage() {
  const { bookingId } = useParams()
  const { data: booking, isLoading, isError, refetch } = useBookingStatus(bookingId ?? null)
  const { data: theatres = [] } = useQuery({ queryKey: theatreKeys.list(), queryFn: () => api.get<Theatre[]>('/theatres') })
  const theatre = theatres.find((t) => t.id === booking?.theatreId)
  const waLink = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(`Hi! I need help with my booking ${bookingId}.`)}`

  const d = booking ? new Date(`${booking.date}T00:00:00`) : null
  const paidPct = booking && booking.totalPaise > 0 ? Math.min(100, Math.round((booking.advancePaidPaise / booking.totalPaise) * 100)) : 0
  const confirmed = booking?.status === 'CONFIRMED'

  return (
    <>
      <Seo title="Booking Details" description="View your BOB Talkies booking details." noindex />
      <PageShell>
        {isLoading ? (
          <div className="mx-auto max-w-3xl space-y-4">
            <Skeleton className="h-64 w-full" rounded="lg" />
            <Skeleton className="h-44 w-full" rounded="lg" />
          </div>
        ) : isError ? (
          <ErrorState title="Booking not found" retry={refetch} />
        ) : booking && d ? (
          <motion.div
            initial={{ opacity: 0, y: 36, rotate: -1.2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="mx-auto max-w-3xl drop-shadow-[0_26px_50px_rgba(42,14,79,0.28)]"
          >
            {/* ── Ticket top: the show ── */}
            <div
              className="relative overflow-hidden rounded-t-[2rem] bg-[#1b0b3a] px-6 pb-9 pt-7 text-white sm:px-9"
              style={notchMask('bottom')}
            >
              {theatre?.images[0] && <img src={theatre.images[0]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
              <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(27,11,58,0.92),rgba(74,26,138,0.75)_60%,rgba(142,57,199,0.55))]" />
              <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border border-[#f5d7a1]/25" />
              <span className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-[#f5d7a1]/20" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 text-[14px] font-medium  tracking-[0.06em] text-[#f5d7a1]">
                    Admit <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true" /> Private Screening
                  </p>
                  <h1 className="mt-2 font-display text-4xl font-normal leading-none !text-white sm:text-6xl">{booking.theatreName}</h1>
                </div>
                <span className={cn(
                  'shrink-0 -rotate-6 rounded-md border-2 px-3 py-1 text-xs font-black uppercase tracking-[0.2em]',
                  confirmed ? 'border-[#7ee2a8] text-[#7ee2a8]' : 'border-[#f5d7a1] text-[#f5d7a1]',
                )}>
                  {booking.status}
                </span>
              </div>

              <div className="relative mt-8 grid grid-cols-[auto_1fr] items-end gap-x-6 gap-y-5 sm:gap-x-9">
                {/* big date block */}
                <div className="text-center">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f5d7a1]">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                  <p className="font-display text-6xl font-bold leading-none sm:text-7xl">{d.getDate()}</p>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                </div>
                <ul className="space-y-2.5 border-l border-white/20 pl-6 text-sm sm:pl-9 sm:text-base">
                  <li className="flex items-center gap-3"><Clock size={16} className="text-[#f5d7a1]" /> {formatTime(booking.slotStart)} – {formatTime(booking.slotEnd)}</li>
                  <li className="flex items-center gap-3"><Users size={16} className="text-[#f5d7a1]" /> {booking.guests} guests</li>
                  <li className="flex items-center gap-3"><MapPin size={16} className="text-[#f5d7a1]" /> Kukatpally, Hyderabad</li>
                </ul>
              </div>
            </div>

            {/* ── Tear line ── */}
            <div className="relative h-0">
              <span className="absolute inset-x-5 top-0 border-t-2 border-dashed border-[#c9a84c]/70" />
            </div>

            {/* ── Ticket stub: payment + barcode ── */}
            <div
              className="grid gap-6 rounded-b-[2rem] bg-[#fffaf4] px-6 pb-7 pt-9 sm:grid-cols-[1fr_auto] sm:px-9"
              style={notchMask('top')}
            >
              <div>
                <div className="grid grid-cols-3 gap-4">
                  <Money label="Total" value={formatINR(booking.totalPaise)} />
                  <Money label="Paid" value={formatINR(booking.advancePaidPaise)} tone="text-emerald-700" />
                  <Money label="Balance" value={formatINR(booking.balancePaise)} tone="text-[#b0701c]" />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#ecd9ec]" role="progressbar" aria-valuenow={paidPct} aria-valuemin={0} aria-valuemax={100} aria-label="Payment progress">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#c9a84c,#6b2398)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${paidPct}%` }}
                    transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
                  />
                </div>
                <p className="mt-2 text-xs text-[#7d7094]">{paidPct}% paid · balance is payable at the venue</p>
              </div>

              <div className="flex flex-col items-start sm:items-end">
                <Barcode value={booking.id} />
                <p className="mt-2 font-mono text-xs font-semibold tracking-[0.18em] text-[#2a0e4f]">{booking.id}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {booking.passToken && (
                <Link
                  to={`/pass/${booking.passToken}`}
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#32105f,#6b2398)] text-sm font-bold text-white shadow-[0_12px_28px_rgba(50,16,95,0.3)] transition-transform hover:-translate-y-0.5"
                >
                  <Ticket size={16} /> View Pass
                </Link>
              )}
              <a
                href={waLink} target="_blank" rel="noopener noreferrer"
                className={cn(
                  'flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-bold text-white shadow-[0_12px_28px_rgba(37,211,102,0.3)] transition-transform hover:-translate-y-0.5',
                  !booking.passToken && 'sm:col-span-2',
                )}
              >
                <MessageCircle size={16} /> Support on WhatsApp
              </a>
            </div>
            <p className="mt-4 text-center text-xs text-[#7d7094]">To reschedule or cancel, contact us on WhatsApp.</p>
          </motion.div>
        ) : null}
      </PageShell>
    </>
  )
}

function Money({ label, value, tone = 'text-[#2a0e4f]' }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7d7094]">{label}</p>
      <p className={cn('mt-0.5 font-display text-xl font-bold tabular-nums sm:text-2xl', tone)}>{value}</p>
    </div>
  )
}

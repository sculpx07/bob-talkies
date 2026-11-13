import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useBookingStatus } from '@/features/booking/hooks/useBookingStatus'
import { Seo } from '@/components/seo/Seo'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatINR } from '@/lib/utils/currency'
import { formatDate, formatTime } from '@/lib/utils/date'
import { Check, Calendar, MapPin, MessageCircle, QrCode, Users, ArrowRight, Sparkles } from 'lucide-react'
import { config } from '@/lib/config'

const EASE = [0.22, 1, 0.36, 1] as const
const CONFETTI = [
  { c: '#f472b6', x: '12%', y: '10%', r: 12 }, { c: '#f5bd61', x: '86%', y: '8%', r: 45 },
  { c: '#8e39c7', x: '6%', y: '48%', r: -20 }, { c: '#f5bd61', x: '94%', y: '46%', r: 30 },
  { c: '#d946ef', x: '20%', y: '88%', r: 60 }, { c: '#f472b6', x: '80%', y: '90%', r: -35 },
]

export default function BookSuccessPage() {
  const { bookingId } = useParams()
  const { data: booking, isLoading } = useBookingStatus(bookingId ?? null)

  const waLink = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(`Hi! I just booked a private theatre (Booking ID: ${bookingId}). Need help with my booking.`)}`
  const confirmed = booking?.status === 'CONFIRMED'

  return (
    <>
      <Seo title="Booking Confirmed" description="Your private theatre booking is confirmed." noindex />
      <div className="relative flex min-h-screen items-center justify-center px-4 pb-16 pt-24 md:pt-28">
        {confirmed && CONFETTI.map((d, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute h-3 w-3 rounded-sm"
            style={{ left: d.x, top: d.y, background: d.c, rotate: d.r }}
            initial={{ opacity: 0, y: -60, scale: 0 }}
            animate={{ opacity: [0, 1, 1], y: [-60, 0, -10, 0], scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 + i * 0.1, ease: EASE }}
            aria-hidden="true"
          />
        ))}

        <div className="w-full max-w-xl">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="mx-auto h-20 w-20" rounded="full" />
              <Skeleton className="mx-auto h-8 w-2/3" />
              <Skeleton className="h-56 w-full" rounded="lg" />
            </div>
          ) : !confirmed ? (
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[#c026d3] border-t-transparent" />
              <p className="mb-2 font-display text-2xl font-bold text-[#2a0e4f]">Verifying your payment…</p>
              <p className="text-sm text-[#5b4578]">Please wait while we confirm your booking. This usually takes a few seconds.</p>
            </div>
          ) : (
            <>
              {/* Success header */}
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6b2398,#d946ef)] text-white shadow-[0_16px_40px_rgba(107,35,152,0.4)]"
                >
                  <motion.span
                    className="absolute inset-0 rounded-full ring-4 ring-[#d946ef]/40"
                    animate={{ scale: [1, 1.35], opacity: [0.8, 0] }}
                    transition={{ duration: 1.6, repeat: 2, ease: 'easeOut', delay: 0.5 }}
                    aria-hidden="true"
                  />
                  <Check size={44} strokeWidth={3} aria-hidden="true" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
                  className="font-cursive text-3xl font-semibold text-[#6b2398] md:text-4xl"
                >
                  Hooray!
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
                  className="font-display text-4xl font-bold text-[#2a0e4f] md:text-5xl"
                >
                  Booking Confirmed
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-2 text-[#5b4578]"
                >
                  Your private theatre experience is all set. Get ready to celebrate!
                </motion.p>
              </div>

              {/* Ticket */}
              <motion.div
                initial={{ opacity: 0, y: 60, rotateX: -15 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 0.5, duration: 0.9, ease: EASE }}
                style={{ transformPerspective: 1200 }}
                className="relative overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(107,35,152,0.2)] ring-1 ring-[#ecd9ec]"
              >
                <div className="relative flex items-center justify-between overflow-hidden bg-[linear-gradient(135deg,#32105f,#6b2398_60%,#d946ef)] px-6 py-5 text-white">
                  <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
                  <div className="relative">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">Booking ID</p>
                    <p className="font-mono text-lg font-bold tracking-wider">{booking.id}</p>
                  </div>
                  <span className="relative flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
                    <Sparkles size={12} /> CONFIRMED
                  </span>
                </div>

                <div className="space-y-4 p-6">
                  {[
                    { icon: MapPin, title: booking.theatreName, sub: 'Kukatpally, Hyderabad' },
                    { icon: Calendar, title: formatDate(booking.date), sub: `${formatTime(booking.slotStart)} – ${formatTime(booking.slotEnd)}` },
                    { icon: Users, title: `${booking.guests} Guests`, sub: booking.packageName },
                  ].map((row, i) => (
                    <motion.div
                      key={row.title}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.12, duration: 0.6, ease: EASE }}
                      className="flex items-center gap-4"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f6e6ef] text-[#6b2398]">
                        <row.icon size={20} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-semibold text-[#2a0e4f]">{row.title}</p>
                        <p className="text-xs text-[#7d7094]">{row.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* perforation */}
                <div className="relative">
                  <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#fff7f0] ring-1 ring-[#ecd9ec]" aria-hidden="true" />
                  <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#fff7f0] ring-1 ring-[#ecd9ec]" aria-hidden="true" />
                  <div className="mx-6 border-t-2 border-dashed border-[#e3cbe6]" />
                </div>

                <div className="grid grid-cols-3 gap-3 p-6 text-center">
                  <div className="rounded-2xl bg-[#fdf6ff] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#7d7094]">Total</p>
                    <p className="mt-1 text-lg font-bold text-[#32105f]">{formatINR(booking.totalPaise)}</p>
                  </div>
                  <div className="rounded-2xl bg-[#e7f7ee] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Advance paid</p>
                    <p className="mt-1 text-lg font-bold text-emerald-800">{formatINR(booking.advancePaidPaise)}</p>
                  </div>
                  <div className="rounded-2xl bg-[#fff1d6] p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8f6420]">At venue</p>
                    <p className="mt-1 text-lg font-bold text-[#4a2a00]">{formatINR(booking.balancePaise)}</p>
                  </div>
                </div>
              </motion.div>

              {/* Digital pass */}
              {booking.passToken && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.7, ease: EASE }}
                  className="mt-5 flex items-center gap-4 rounded-3xl bg-white/85 p-4 shadow-[0_10px_30px_rgba(107,35,152,0.1)] ring-1 ring-[#ecd9ec]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#32105f] text-white"><QrCode size={22} aria-hidden="true" /></span>
                  <div className="flex-1">
                    <p className="font-semibold text-[#2a0e4f]">Your Digital Pass</p>
                    <p className="text-xs text-[#7d7094]">Show this at the venue for entry</p>
                  </div>
                  <Link to={`/pass/${booking.passToken}`} className="group flex items-center gap-1.5 rounded-full bg-[#32105f] px-4 py-2 text-sm font-medium text-white">
                    View <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.7, ease: EASE }}
                className="mt-5 grid gap-3 sm:grid-cols-2"
              >
                <Link
                  to={`/my-booking/${booking.id}`}
                  className="flex items-center justify-center rounded-full border border-[#32105f]/40 px-6 py-3 text-sm font-semibold text-[#32105f] transition-colors hover:bg-[#32105f]/5"
                >
                  View Booking
                </Link>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,211,102,0.35)]"
                >
                  <MessageCircle size={16} /> WhatsApp Support
                </a>
              </motion.div>

              {/* Upsell */}
              <div className="mt-9">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6b2398]">Add more to your experience</p>
                <div className="grid grid-cols-2 gap-3">
                  {['Premium Decoration', 'Photographer', 'Surprise Cake', 'LED Name Board'].map((item, i) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 1.5 + i * 0.08 }}
                      whileHover={{ y: -4 }}
                    >
                      <Link
                        to={`/my-booking/${booking.id}`}
                        className="block rounded-2xl bg-white/85 p-3.5 text-center text-sm font-semibold text-[#32105f] shadow-sm ring-1 ring-[#ecd9ec] transition-shadow hover:shadow-[0_10px_24px_rgba(107,35,152,0.15)]"
                      >
                        + {item}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

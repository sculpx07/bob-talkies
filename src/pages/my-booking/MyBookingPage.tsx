import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { formatDate, formatTime } from '@/lib/utils/date'
import { formatINR } from '@/lib/utils/currency'
import { Phone, Ticket, Calendar, ChevronRight, Star, Gift, Users, RotateCcw, Bookmark, ArrowRight, Share2 } from 'lucide-react'
import { getPoints, getBookingCount, buildReferralUrl } from '@/lib/utils/bobRewards'
import { useSavedPlan } from '@/features/booking/useSavedPlan'
import { OCCASIONS } from '@/content/occasions'
import { useRequestOtp, useVerifyOtp } from '@/features/auth/api'
import { bookingApi } from '@/features/booking/api'

type AuthState = 'idle' | 'otp_sent' | 'authenticated'

function RewardsSidebar({ bookingCount }: { bookingCount: number }) {
  const pts = getPoints()
  const bookings = bookingCount === 0 ? 0 : Math.max(getBookingCount(), bookingCount)
  const { plan, resume } = useSavedPlan()
  const occasion = plan ? OCCASIONS.find(o => o.slug === plan.occasion) : null

  async function shareRef() {
    const url = buildReferralUrl()
    const text = '🎬 Book a private theatre at BOB Talkies — use my link and we both earn BOB Points!'
    try {
      if (navigator.share) await navigator.share({ title: 'BOB Talkies', text, url })
      else await navigator.clipboard.writeText(url)
    } catch { /* dismissed */ }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Points card: horizontal plum member card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="relative flex flex-col gap-6 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#5c1535_0%,#5a1f9a_60%,#a81a3a_100%)] p-6 text-white shadow-[0_26px_60px_rgba(50,16,95,0.35)] lg:flex-row lg:items-center lg:gap-8"
      >
        <motion.span
          className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-white/10"
          animate={{ left: ['-50%', '130%'] }}
          transition={{ duration: 5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <span className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#f5bd61]/25 blur-2xl" aria-hidden="true" />
        <div className="relative shrink-0 lg:pr-8 lg:border-r lg:border-white/20">
          <div className="flex items-start gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#f5d7a1]">BOB Points</p>
              <p className="mt-1 font-display text-5xl font-bold leading-none">{pts}</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25"><Star size={20} fill="#f5d7a1" stroke="none" /></span>
          </div>
          {bookings >= 2 && (
            <span className="relative mt-3 inline-block rounded-full bg-emerald-400/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-200 ring-1 ring-emerald-300/30">Repeat Guest ✓</span>
          )}
        </div>

        <ul className="relative grid flex-1 gap-5 border-t border-white/20 pt-5 text-sm sm:grid-cols-2 lg:border-t-0 lg:pt-0 xl:grid-flow-col xl:auto-cols-fr">
          {/* Refer & Earn is only offered once the guest has at least one booking */}
          {bookings >= 1 && (
            <li className="flex items-start gap-3">
              <Users size={15} className="mt-0.5 shrink-0 text-[#f5d7a1]" />
              <div>
                <p className="font-bold">Refer &amp; Earn</p>
                <p className="mt-0.5 text-xs leading-snug text-white/75">Share your link. Friend books → you both earn credits.</p>
                <button type="button" onClick={shareRef} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold text-[#3d0a24]">
                  <Share2 size={11} /> Share referral link
                </button>
              </div>
            </li>
          )}
          <li className="flex items-start gap-3">
            <RotateCcw size={15} className="mt-0.5 shrink-0 text-[#f5d7a1]" />
            <div>
              <p className="font-bold">Repeat Guest Offers {bookings >= 2 && <span className="ml-1 text-[10px] font-bold text-emerald-300">Active</span>}</p>
              <p className="mt-0.5 text-xs leading-snug text-white/75">
                {bookings >= 2 ? `${bookings} bookings completed — you qualify for upgrades & special offers.` : 'Complete 2+ bookings to unlock repeat guest upgrades.'}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Gift size={15} className="mt-0.5 shrink-0 text-[#f5d7a1]" />
            <div>
              <p className="font-bold">Earn BOB Points</p>
              <p className="mt-0.5 text-xs leading-snug text-white/75">+50 pts every eligible booking. {pts > 0 ? `${pts} earned so far.` : 'Book to start earning.'}</p>
            </div>
          </li>
        </ul>

        <Link to="/rewards" className="relative inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#f5d7a1] hover:underline">
          View all rewards <ArrowRight size={12} />
        </Link>
      </motion.div>

      {/* Saved plan card */}
      {plan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-[#5c1535]/20 bg-white"
        >
          <div className="flex items-center gap-2 border-b border-[#f0e6cc] px-5 py-3 bg-[#fff0f5]">
            <Bookmark size={13} className="text-[#8b1a3a]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8b1a3a]">Saved Plan</span>
          </div>
          <div className="px-5 py-4 space-y-1.5">
            <p className="font-black text-[#3d0a24] text-sm">
              {occasion ? `${occasion.emoji} ${occasion.label}` : plan.occasion}
            </p>
            <p className="text-[11px] text-[#5b2535]/70">
              {plan.guests} guests ·{' '}
              {plan.date ? new Date(`${plan.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
            </p>
            <button
              type="button"
              onClick={resume}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg,#5c1535,#7b1535)' }}
            >
              Resume booking <ArrowRight size={11} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function MyBookingPage() {
  const [authState, setAuthState] = useState<AuthState>('idle')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [token, setToken] = useState('')
  const [mobileError, setMobileError] = useState('')
  const [otpError, setOtpError] = useState('')

  const requestOtp = useRequestOtp()
  const verify = useVerifyOtp()
  const sendingOtp = requestOtp.isPending
  const verifyingOtp = verify.isPending

  const sendOtp = (m: string) =>
    requestOtp.mutate(m, {
      onSuccess: () => setAuthState('otp_sent'),
      onError: (e) => setMobileError(e.message || 'Could not send OTP. Please try again.'),
    })

  const verifyOtp = (vars: { mobile: string; otp: string }) =>
    verify.mutate(vars, {
      onSuccess: (data) => {
        setToken(data.token)
        setAuthState('authenticated')
      },
      onError: (e) => setOtpError(e.message || 'Invalid OTP. Please try again.'),
    })

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['my-bookings', token],
    queryFn: () => bookingApi.myBookings(token),
    enabled: authState === 'authenticated',
  })

  const bookings = bookingsData?.data ?? []

  const statusColors: Record<string, 'success' | 'warning' | 'crimson' | 'muted' | 'gold'> = {
    CONFIRMED: 'success', PENDING: 'warning', SLOT_HELD: 'warning',
    CANCELLED: 'crimson', FAILED: 'muted', COMPLETED: 'gold',
  }

  if (authState !== 'authenticated') {
    return (
      <>
        <Seo title="My Booking" description="View and manage your BOB Talkies bookings." canonical="/my-booking" />
        <PageShell>
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto max-w-md overflow-hidden rounded-[2rem] bg-white p-8 text-[#3d0a24] shadow-[0_30px_80px_rgba(107,35,152,0.2)] ring-1 ring-[#f8dce4] sm:p-10"
          >
            <div className="relative">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fce8f0] ring-1 ring-[#f5d5e0]">
                <Ticket size={26} className="text-[#8b1a3a]" />
              </span>
              <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-[#c9933a]">My Bookings</p>
              <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-[#3d0a24]">Access Your Bookings</h1>
              <p className="mt-2 text-sm text-[#5b2535]">Enter your mobile number to view your upcoming and past bookings.</p>

              {/* step progress */}
              <div className="mt-6 flex items-center gap-2" aria-hidden="true">
                {[0, 1].map((i) => (
                  <span key={i} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#f8dce4]">
                    <motion.span
                      className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#8b1a3a,#d9126a)]"
                      initial={false}
                      animate={{ width: authState === 'otp_sent' || i === 0 ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs font-semibold text-[#7d4555]">{authState === 'otp_sent' ? 'Step 2 of 2 · Verify OTP' : 'Step 1 of 2 · Mobile number'}</p>

              <div className="mt-6 space-y-4 text-left">
                <div>
                  <label htmlFor="mb-mobile" className="mb-1.5 block text-sm font-medium text-[#3d0a24]">Mobile Number</label>
                  <div className="relative">
                    <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a81a3a]" />
                    <input
                      id="mb-mobile"
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-2xl border border-[#f5d5e0] bg-[#fff7f0] py-3.5 pl-11 pr-4 text-[#160730] placeholder:text-[#b0a0c8] outline-none transition-colors focus:border-[#c0125a] focus:ring-2 focus:ring-[#c0125a]/25"
                    />
                  </div>
                  {mobileError && <p role="alert" className="mt-1.5 text-xs text-[#c2255c]">{mobileError}</p>}
                </div>

                {authState === 'otp_sent' && (
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                    <label htmlFor="mb-otp" className="mb-1.5 block text-sm font-medium text-[#3d0a24]">Enter OTP</label>
                    <input
                      id="mb-otp"
                      placeholder="------"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full rounded-2xl border border-[#c4b5fd] bg-[#ede8ff] py-3.5 text-center font-mono text-2xl tracking-[0.6rem] text-[#5c1535] placeholder:text-[#b0a0c8] outline-none transition-colors focus:border-[#c0125a] focus:ring-2 focus:ring-[#c0125a]/25"
                    />
                    {otpError ? <p role="alert" className="mt-1.5 text-xs text-[#c2255c]">{otpError}</p> : <p className="mt-1.5 text-xs text-[#7d4555]">Use 123456 in test mode</p>}
                  </motion.div>
                )}

                {authState === 'idle' ? (
                  <button
                    type="button"
                    disabled={mobile.length < 10 || sendingOtp}
                    onClick={() => { setMobileError(''); sendOtp(mobile) }}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#5c1535,#8b1a3a)] text-base font-bold text-white shadow-[0_14px_30px_rgba(50,16,95,0.3)] transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
                  >
                    {sendingOtp ? 'Sending…' : <>Send OTP <ArrowRight size={17} /></>}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={otp.length < 6 || verifyingOtp}
                    onClick={() => { setOtpError(''); verifyOtp({ mobile, otp }) }}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#5c1535,#8b1a3a)] text-base font-bold text-white shadow-[0_14px_30px_rgba(50,16,95,0.3)] transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
                  >
                    {verifyingOtp ? 'Checking…' : <>Verify & View Bookings <ArrowRight size={17} /></>}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </PageShell>
      </>
    )
  }

  return (
    <>
      <Seo title="My Bookings" description="View and manage your BOB Talkies bookings." canonical="/my-booking" noindex />
      <PageShell>
        <SectionHeader eyebrow="My Account" title="Your Bookings" className="!mb-6 md:!mb-6" eyebrowClassName="!tracking-normal" titleClassName="!font-medium" />
        <div className="mb-6"><RewardsSidebar bookingCount={bookings.length} /></div>
        <div className="grid grid-cols-1 items-stretch gap-6">
          {/* Bookings list */}
          <div className="flex flex-col">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" rounded="lg" />)}
              </div>
            ) : bookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-white/85 px-6 py-14 text-center shadow-[0_24px_60px_rgba(107,35,152,0.14)] ring-1 ring-[#f8dce4] backdrop-blur md:py-20"
              >
                <motion.span className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#d9126a]/15 blur-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 9, repeat: Infinity }} aria-hidden="true" />
                <motion.span className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-[#f5bd61]/25 blur-3xl" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 11, repeat: Infinity }} aria-hidden="true" />

                {/* floating ticket with a dashed ring */}
                <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
                  <motion.span className="absolute inset-0 rounded-full border-2 border-dashed border-[#d9b8e0]" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} aria-hidden="true" />
                  <motion.span
                    className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[linear-gradient(145deg,#5c1535,#a81a3a)] shadow-[0_18px_36px_rgba(50,16,95,0.35)]"
                    animate={{ y: [0, -10, 0], rotate: [-6, 6, -6] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Ticket size={34} className="text-[#f5d7a1]" />
                  </motion.span>
                  {['🍿', '🎬'].map((e, i) => (
                    <motion.span key={e} className="absolute text-2xl" style={{ left: i ? '88%' : '-6%', top: i ? '66%' : '12%' }} animate={{ y: [0, -8, 0] }} transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6 }} aria-hidden="true">{e}</motion.span>
                  ))}
                </div>

                <h2 className="relative font-display text-3xl font-bold text-[#3d0a24]">No bookings yet</h2>
                <p className="relative mx-auto mt-3 max-w-sm text-[#5b2535]">When you book a theatre, your bookings will appear here.</p>
                <Link
                  to="/book"
                  className="group relative mt-8 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#5c1535,#8b1a3a)] px-8 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(50,16,95,0.32)] transition-transform hover:-translate-y-0.5"
                >
                  Book Now <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b, i) => {
                  const d = new Date(`${b.date}T00:00:00`)
                  const ok = b.status === 'CONFIRMED' || b.status === 'COMPLETED'
                  return (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ y: -4 }}
                    >
                      <Link
                        to={`/my-booking/${b.id}`}
                        className="group relative flex overflow-hidden rounded-[1.5rem] bg-white shadow-[0_14px_36px_rgba(107,35,152,0.14)] ring-1 ring-[#f8dce4] transition-shadow hover:shadow-[0_22px_50px_rgba(107,35,152,0.22)]"
                      >
                        {/* date block */}
                        <div className="flex w-24 shrink-0 flex-col items-center justify-center bg-[linear-gradient(160deg,#5c1535,#8b1a3a)] px-3 py-5 text-white sm:w-28">
                          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5d7a1]">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                          <span className="font-display text-4xl font-bold leading-none">{d.getDate()}</span>
                          <span className="mt-1 text-[11px] text-white/70">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                        </div>

                        {/* tear line with notches */}
                        <span className="pointer-events-none absolute left-24 top-0 h-full border-l-2 border-dashed border-[#e9d9f1] sm:left-28" aria-hidden="true" />
                        <span className="pointer-events-none absolute -top-2.5 left-24 h-5 w-5 -translate-x-1/2 rounded-full bg-[#fff6f0] sm:left-28" aria-hidden="true" />
                        <span className="pointer-events-none absolute -bottom-2.5 left-24 h-5 w-5 -translate-x-1/2 rounded-full bg-[#fff6f0] sm:left-28" aria-hidden="true" />

                        <div className="flex min-w-0 flex-1 items-center gap-4 p-5">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex flex-wrap items-center gap-2">
                              <p className="font-display text-xl font-bold text-[#3d0a24]">{b.theatreName}</p>
                              <Badge variant={statusColors[b.status] ?? 'muted'}>{b.status}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#5b2535]">
                              <span className="flex items-center gap-1.5"><Calendar size={13} className="text-[#a81a3a]" />{formatTime(b.slotStart)}</span>
                              <span className="font-bold text-[#3d0a24]">{formatINR(b.totalPaise)}</span>
                              {ok && <span className="flex items-center gap-1 text-xs font-bold text-[#c9933a]"><Star size={11} fill="#c9a84c" stroke="none" /> +50 pts</span>}
                            </div>
                            <p className="mt-2 font-mono text-[11px] tracking-wide text-[#9a6575]">{b.id}</p>
                          </div>
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e6d4ee] text-[#8b1a3a] transition-colors group-hover:border-transparent group-hover:bg-[#8b1a3a] group-hover:text-white">
                            <ChevronRight size={18} />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </PageShell>
    </>
  )
}

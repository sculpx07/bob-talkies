import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { api } from '@/lib/api/client'
import { formatDate, formatTime } from '@/lib/utils/date'
import { formatINR } from '@/lib/utils/currency'
import { Phone, Ticket, Calendar, ChevronRight, Star, Gift, Users, RotateCcw, Bookmark, ArrowRight, Share2 } from 'lucide-react'
import type { Booking } from '@/schemas/booking'
import { getPoints, getBookingCount, buildReferralUrl } from '@/lib/utils/bobRewards'
import { useSavedPlan } from '@/features/booking/useSavedPlan'
import { OCCASIONS } from '@/content/occasions'

type AuthState = 'idle' | 'otp_sent' | 'authenticated'

function RewardsSidebar() {
  const pts = getPoints()
  const bookings = getBookingCount()
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
    <div className="space-y-4">
      {/* Points card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-3xl border border-[#c9a84c]/30 bg-gradient-to-br from-[#fffaf0] to-[#fdf4e3]"
      >
        {/* header */}
        <div className="flex items-center gap-3 border-b border-[#c9a84c]/15 px-5 py-4 bg-gradient-to-r from-[#c9a84c]/15 to-transparent">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#c9a84c]/20">
            <Star size={18} fill="#c9a84c" stroke="none" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#c9933a]">BOB Points</p>
            <p className="font-black text-[#2a0e4f] text-2xl leading-tight">{pts}</p>
          </div>
          {bookings >= 2 && (
            <span className="rounded-full bg-[#34d399]/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#2a7a4f]">
              Repeat Guest ✓
            </span>
          )}
        </div>

        {/* perks list */}
        <ul className="px-5 py-4 space-y-3">
          <li className="flex items-start gap-2.5">
            <Users size={13} className="mt-0.5 shrink-0 text-[#c9a84c]" />
            <div>
              <p className="text-xs font-black text-[#2a0e4f]">Refer &amp; Earn</p>
              <p className="text-[11px] text-[#5b4578]/70 leading-snug mt-0.5">Share your link. Friend books → you both earn credits.</p>
              <button
                type="button"
                onClick={shareRef}
                className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#32105f] px-3 py-1 text-[10px] font-black text-white"
              >
                <Share2 size={9} /> Share referral link
              </button>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <RotateCcw size={13} className="mt-0.5 shrink-0" style={{ color: bookings >= 2 ? '#34d399' : '#c9a84c' }} />
            <div>
              <p className="text-xs font-black text-[#2a0e4f]">
                Repeat Guest Offers
                {bookings >= 2 && <span className="ml-1.5 text-[9px] text-[#34d399] font-black">Active</span>}
              </p>
              <p className="text-[11px] text-[#5b4578]/70 leading-snug mt-0.5">
                {bookings >= 2
                  ? `${bookings} bookings completed — you qualify for upgrades & special offers.`
                  : 'Complete 2+ bookings to unlock repeat guest upgrades.'}
              </p>
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <Gift size={13} className="mt-0.5 shrink-0 text-[#c9a84c]" />
            <div>
              <p className="text-xs font-black text-[#2a0e4f]">Earn BOB Points</p>
              <p className="text-[11px] text-[#5b4578]/70 leading-snug mt-0.5">+50 pts every eligible booking. {pts > 0 ? `${pts} earned so far.` : 'Book to start earning.'}</p>
            </div>
          </li>
        </ul>

        <div className="border-t border-[#c9a84c]/15 px-5 py-3">
          <Link to="/rewards" className="inline-flex items-center gap-1 text-[11px] font-black text-[#c9933a] hover:underline">
            View all rewards <ArrowRight size={10} />
          </Link>
        </div>
      </motion.div>

      {/* Saved plan card */}
      {plan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className="overflow-hidden rounded-3xl border border-[#32105f]/20 bg-white"
        >
          <div className="flex items-center gap-2 border-b border-[#f0e6cc] px-5 py-3 bg-[#f8f0ff]">
            <Bookmark size={13} className="text-[#6b2398]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6b2398]">Saved Plan</span>
          </div>
          <div className="px-5 py-4 space-y-1.5">
            <p className="font-black text-[#2a0e4f] text-sm">
              {occasion ? `${occasion.emoji} ${occasion.label}` : plan.occasion}
            </p>
            <p className="text-[11px] text-[#5b4578]/70">
              {plan.guests} guests ·{' '}
              {plan.date ? new Date(`${plan.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
            </p>
            <button
              type="button"
              onClick={resume}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg,#32105f,#5b1fa3)' }}
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

  const { mutate: sendOtp, isPending: sendingOtp } = useMutation({
    mutationFn: (m: string) => api.post('/auth/otp/request', { mobile: m }),
    onSuccess: () => setAuthState('otp_sent'),
    onError: () => setMobileError('Could not send OTP. Please try again.'),
  })

  const { mutate: verifyOtp, isPending: verifyingOtp } = useMutation({
    mutationFn: ({ mobile, otp }: { mobile: string; otp: string }) =>
      api.post<{ token: string }>('/auth/otp/verify', { mobile, otp }),
    onSuccess: (data) => {
      setToken(data.token)
      setAuthState('authenticated')
    },
    onError: () => setOtpError('Invalid OTP. Use 123456 for testing.'),
  })

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['my-bookings', token],
    queryFn: () => api.get<{ data: Booking[] }>('/me/bookings', token),
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
          <div className="max-w-sm mx-auto text-center">
            <SectionHeader
              eyebrow="My Bookings"
              title="Access Your Bookings"
              subtitle="Enter your mobile number to view your upcoming and past bookings."
              centered
            />
            <div className="space-y-4 text-left">
              <Input
                label="Mobile Number"
                placeholder="10-digit mobile number"
                leftIcon={<Phone size={15} />}
                inputMode="numeric"
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                error={mobileError}
              />
              {authState === 'otp_sent' && (
                <Input
                  label="Enter OTP"
                  placeholder="6-digit OTP"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  error={otpError}
                  hint="Use 123456 in test mode"
                  className="font-mono tracking-widest text-center text-lg"
                />
              )}
              {authState === 'idle' ? (
                <Button
                  fullWidth
                  size="lg"
                  loading={sendingOtp}
                  disabled={mobile.length < 10}
                  onClick={() => { setMobileError(''); sendOtp(mobile) }}
                >
                  Send OTP
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="lg"
                  loading={verifyingOtp}
                  disabled={otp.length < 6}
                  onClick={() => { setOtpError(''); verifyOtp({ mobile, otp }) }}
                >
                  Verify & View Bookings
                </Button>
              )}
            </div>
          </div>
        </PageShell>
      </>
    )
  }

  return (
    <>
      <Seo title="My Bookings" description="View and manage your BOB Talkies bookings." canonical="/my-booking" noindex />
      <PageShell>
        <SectionHeader eyebrow="My Account" title="Your Bookings" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* Bookings list */}
          <div>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" rounded="lg" />)}
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState
                icon={<Ticket size={40} />}
                title="No bookings yet"
                description="When you book a theatre, your bookings will appear here."
                action={<Button asChild><Link to="/book">Book Now</Link></Button>}
              />
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    whileHover={{ y: -2 }}
                  >
                    <Link
                      to={`/my-booking/${b.id}`}
                      className="flex items-center gap-4 p-4 bg-white border border-[#f0e6cc] rounded-2xl hover:border-[#c9a84c]/50 transition-all group shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black text-[#2a0e4f]">{b.theatreName}</p>
                          <Badge variant={statusColors[b.status] ?? 'muted'}>{b.status}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#5b4578]/60">
                          <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(b.date)}</span>
                          <span>{formatTime(b.slotStart)}</span>
                          <span className="font-semibold text-[#2a0e4f]">{formatINR(b.totalPaise)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-[#5b4578]/40 font-mono">{b.id}</p>
                          {b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? (
                            <span className="text-[9px] font-black text-[#c9933a] flex items-center gap-0.5">
                              <Star size={8} fill="#c9a84c" stroke="none" /> +50 pts
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#5b4578]/30 group-hover:text-[#c9a84c] transition-colors shrink-0" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-28">
            <RewardsSidebar />
          </div>
        </div>
      </PageShell>
    </>
  )
}

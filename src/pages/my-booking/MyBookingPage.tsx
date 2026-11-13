import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
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
import { Phone, Ticket, Calendar, ChevronRight } from 'lucide-react'
import type { Booking } from '@/schemas/booking'

type AuthState = 'idle' | 'otp_sent' | 'authenticated'

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
              <Link
                key={b.id}
                to={`/my-booking/${b.id}`}
                className="flex items-center gap-4 p-4 bg-bg-surface border border-border-subtle rounded-card hover:border-gold-500/40 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-text-primary">{b.theatreName}</p>
                    <Badge variant={statusColors[b.status] ?? 'muted'}>{b.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(b.date)}</span>
                    <span>{formatTime(b.slotStart)}</span>
                    <span>{formatINR(b.totalPaise)}</span>
                  </div>
                  <p className="text-xs text-text-muted font-mono mt-1">{b.id}</p>
                </div>
                <ChevronRight size={18} className="text-text-muted group-hover:text-gold-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </PageShell>
    </>
  )
}

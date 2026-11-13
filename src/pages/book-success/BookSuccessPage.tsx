import { useParams, Link } from 'react-router-dom'
import { useBookingStatus } from '@/features/booking/hooks/useBookingStatus'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatINR } from '@/lib/utils/currency'
import { formatDate, formatTime } from '@/lib/utils/date'
import { Check, Calendar, MapPin, MessageCircle, Download, QrCode, Users, Gift } from 'lucide-react'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils/cn'

export default function BookSuccessPage() {
  const { bookingId } = useParams()
  const { data: booking, isLoading } = useBookingStatus(bookingId ?? null)

  const waLink = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(`Hi! I just booked a private theatre (Booking ID: ${bookingId}). Need help with my booking.`)}`
  const confirmed = booking?.status === 'CONFIRMED'

  return (
    <>
      <Seo title="Booking Confirmed" description="Your private theatre booking is confirmed." noindex />
      <div className="min-h-screen pt-16 md:pt-20 pb-16 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-20 mx-auto" rounded="full" />
              <Skeleton className="h-8 w-2/3 mx-auto" />
              <Skeleton className="h-56 w-full" rounded="lg" />
            </div>
          ) : !confirmed ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-gold-500 border-t-transparent animate-spin mx-auto mb-4" />
              <h1 className="font-display text-2xl text-text-primary mb-2">Verifying your payment…</h1>
              <p className="text-text-secondary text-sm">Please wait while we confirm your booking. This usually takes a few seconds.</p>
            </div>
          ) : (
            <>
              {/* Success header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-success/15 border-2 border-success flex items-center justify-center mx-auto mb-4">
                  <Check size={36} className="text-success" aria-hidden="true" />
                </div>
                <h1 className="font-display text-3xl text-text-primary mb-2">Booking Confirmed!</h1>
                <p className="text-text-secondary">Your private theatre experience is all set. Get ready to celebrate!</p>
              </div>

              {/* Booking card */}
              <div className="bg-bg-surface border border-border-subtle rounded-card p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-text-muted">Booking ID</p>
                    <p className="font-mono text-gold-400 font-bold">{booking.id}</p>
                  </div>
                  <Badge variant="success">CONFIRMED</Badge>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gold-400 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-text-primary font-medium">{booking.theatreName}</p>
                      <p className="text-text-muted text-xs">Kukatpally, Hyderabad</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gold-400 shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-text-primary font-medium">{formatDate(booking.date)}</p>
                      <p className="text-text-muted text-xs">{formatTime(booking.slotStart)} – {formatTime(booking.slotEnd)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-gold-400 shrink-0" aria-hidden="true" />
                    <p className="text-text-primary">{booking.guests} Guests</p>
                  </div>
                </div>

                <div className="border-t border-border-subtle mt-4 pt-4 flex justify-between text-sm">
                  <div>
                    <p className="text-text-muted">Total</p>
                    <p className="text-text-primary font-semibold">{formatINR(booking.totalPaise)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-muted">Advance Paid</p>
                    <p className="text-success font-semibold">{formatINR(booking.advancePaidPaise)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-muted">Balance at Venue</p>
                    <p className="text-text-primary font-semibold">{formatINR(booking.balancePaise)}</p>
                  </div>
                </div>
              </div>

              {/* QR pass preview */}
              {booking.passToken && (
                <div className="bg-bg-elevated border border-gold-500/30 rounded-card p-4 text-center mb-6">
                  <QrCode size={20} className="text-gold-400 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm font-medium text-text-primary mb-1">Your Digital Pass</p>
                  <p className="text-xs text-text-muted mb-3">Show this at the venue for entry</p>
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/pass/${booking.passToken}`}>View Full Pass</Link>
                  </Button>
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="secondary" size="md">
                  <Link to={`/my-booking/${booking.id}`}>
                    View Booking
                  </Link>
                </Button>
                <Button asChild variant="whatsapp" size="md">
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={16} /> WhatsApp Support
                  </a>
                </Button>
              </div>

              {/* Post-booking upsell */}
              <div className="mt-8">
                <p className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-2">
                  <Gift size={16} className="text-gold-400" /> Add more to your experience
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Premium Decoration', 'Photographer', 'Surprise Cake', 'LED Name Board'].map((item) => (
                    <Link
                      key={item}
                      to={`/my-booking/${booking.id}`}
                      className="p-3 bg-bg-surface border border-border-subtle rounded-xl text-text-secondary hover:border-gold-500/40 hover:text-gold-400 transition-all text-center"
                    >
                      Add {item}
                    </Link>
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

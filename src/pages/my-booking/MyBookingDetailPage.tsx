import { useParams, Link } from 'react-router-dom'
import { useBookingStatus } from '@/features/booking/hooks/useBookingStatus'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/EmptyState'
import { PageShell } from '@/components/layout/PageShell'
import { formatDate, formatTime } from '@/lib/utils/date'
import { formatINR } from '@/lib/utils/currency'
import { Calendar, MapPin, Users, MessageCircle, Download, ExternalLink } from 'lucide-react'
import { config } from '@/lib/config'

export default function MyBookingDetailPage() {
  const { bookingId } = useParams()
  const { data: booking, isLoading, isError, refetch } = useBookingStatus(bookingId ?? null)
  const waLink = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(`Hi! I need help with my booking ${bookingId}.`)}`

  return (
    <>
      <Seo title="Booking Details" description="View your BOB Talkies booking details." noindex />
      <PageShell>
        {isLoading ? (
          <div className="max-w-lg mx-auto space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-56 w-full" rounded="lg" />
          </div>
        ) : isError ? (
          <ErrorState title="Booking not found" retry={refetch} />
        ) : booking ? (
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <h1 className="font-display text-2xl text-text-primary">{booking.theatreName}</h1>
              <Badge variant={booking.status === 'CONFIRMED' ? 'success' : 'warning'}>{booking.status}</Badge>
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-card p-5 space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-gold-400" />
                <div>
                  <p className="text-text-primary font-medium">{formatDate(booking.date)}</p>
                  <p className="text-text-muted text-xs">{formatTime(booking.slotStart)} – {formatTime(booking.slotEnd)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-gold-400" />
                <p className="text-text-primary">Kukatpally, Hyderabad</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users size={16} className="text-gold-400" />
                <p className="text-text-primary">{booking.guests} Guests</p>
              </div>

              <div className="border-t border-border-subtle pt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-text-muted mb-1">Total</p>
                  <p className="font-semibold text-text-primary">{formatINR(booking.totalPaise)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Paid</p>
                  <p className="font-semibold text-success">{formatINR(booking.advancePaidPaise)}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted mb-1">Balance</p>
                  <p className="font-semibold text-gold-400">{formatINR(booking.balancePaise)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {booking.passToken && (
                <Button asChild variant="secondary">
                  <Link to={`/pass/${booking.passToken}`}>
                    <ExternalLink size={15} /> View Pass
                  </Link>
                </Button>
              )}
              <Button asChild variant="whatsapp">
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={15} /> Support
                </a>
              </Button>
            </div>

            <p className="text-xs text-text-muted text-center mt-4">
              To reschedule or cancel, contact us on WhatsApp.
            </p>
          </div>
        ) : null}
      </PageShell>
    </>
  )
}

import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, FlaskConical, XCircle } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { bookingApi, type TestPaymentResult } from '@/features/booking/api'
import { useBookingStatus } from '@/features/booking/hooks/useBookingStatus'
import { clearBookingState } from '@/features/booking/state/booking.storage'
import { trackEvent } from '@/features/tracking/events'
import { formatINR } from '@/lib/utils/currency'
import { formatDate, formatTime } from '@/lib/utils/date'

/**
 * Stands in for the payment gateway while the backend uses the 'dev' payment
 * provider (no Razorpay account yet). No money moves: the customer picks the
 * outcome and the backend records it exactly as it will for a real gateway.
 */
export default function TestPaymentPage() {
  const { bookingId = '' } = useParams()
  const [params] = useSearchParams()
  const orderId = params.get('order') ?? ''
  const amount = Number(params.get('amount') ?? 0)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { data: booking } = useBookingStatus(bookingId || null)

  const { mutate: complete, isPending, variables } = useMutation({
    mutationFn: (result: TestPaymentResult) => bookingApi.completeTestPayment(orderId, result),
    onSuccess: (_, result) => {
      if (result === 'success') {
        trackEvent('purchase', { bookingId, transactionId: orderId, value: amount })
        clearBookingState()
        navigate(`/book/success/${encodeURIComponent(bookingId)}`, { replace: true })
      } else {
        navigate(`/book/failed/${encodeURIComponent(bookingId)}`, { replace: true })
      }
    },
    onError: (e: Error) => setError(e.message),
  })

  return (
    <>
      <Seo title="Test Payment" description="Test payment for your BOB Talkies booking." noindex />
      <div className="flex min-h-screen items-center justify-center px-4 pb-16 pt-24 md:pt-28">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-7 text-center shadow-[0_24px_60px_rgba(107,35,152,0.18)] ring-1 ring-[#f0e1f3]">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f3ecf8] text-[#6b2398]">
            <FlaskConical size={26} aria-hidden="true" />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#8e39c7]">Test payment</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-[#2a0e4f]">{formatINR(amount)}</h1>
          {booking && (
            <p className="mt-2 text-sm text-[#5b4578]">
              {booking.theatreName} · {formatDate(booking.date)} · {formatTime(booking.slotStart)}
            </p>
          )}
          <p className="mt-4 rounded-2xl bg-[#fff6e0] px-4 py-3 text-xs leading-relaxed text-[#8f6420]">
            No real money is taken. This screen stands in for the payment gateway until online payments are switched on.
            Choose what should happen to this payment.
          </p>

          {error && <p role="alert" className="mt-4 rounded-2xl bg-[#fdecf2] px-4 py-3 text-sm font-medium text-[#c2255c]">{error}</p>}

          <div className="mt-6 space-y-3">
            <Button fullWidth size="lg" disabled={!orderId || isPending} loading={isPending && variables === 'success'} onClick={() => complete('success')}>
              <CheckCircle2 size={18} aria-hidden="true" /> Payment successful
            </Button>
            <Button fullWidth size="lg" variant="danger" disabled={!orderId || isPending} loading={isPending && variables === 'failed'} onClick={() => complete('failed')}>
              <XCircle size={18} aria-hidden="true" /> Payment failed
            </Button>
            <Button asChild variant="ghost" fullWidth size="md">
              <Link to="/book">Back to booking</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../../state/booking.context'
import { bookingApi } from '../../api'
import { PriceSummary } from '../PriceSummary'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/lib/utils/currency'
import { CreditCard, Building2, Shield } from 'lucide-react'
import { trackEvent } from '@/features/tracking/events'
import { clearBookingState } from '../../state/booking.storage'

export function PaymentStep() {
  const { state, dispatch } = useBooking()
  const navigate = useNavigate()
  const [payFull, setPayFull] = useState(false)
  const payLock = useRef(false)

  const quote = state.serverQuote
  const advanceAmount = quote?.advancePaise ?? 0
  const totalAmount = quote?.totalPaise ?? 0
  const payAmount = payFull ? totalAmount : advanceAmount

  const { mutate: createBooking, isPending: creating } = useMutation({
    mutationFn: () =>
      bookingApi.createBooking({
        theatreId: state.theatreId!,
        packageId: state.packageId!,
        date: state.date!,
        slotId: state.slotId!,
        occasion: state.occasion!,
        guests: state.guests,
        addonIds: state.addonIds,
        couponCode: state.couponCode ?? undefined,
        customerName: state.customerName,
        customerMobile: state.customerMobile,
        customerEmail: state.customerEmail || undefined,
        specialInstructions: state.specialInstructions || undefined,
        consentTnC: state.consentTnC,
        consentWhatsapp: state.consentWhatsapp,
      }),
    onSuccess: (booking) => {
      dispatch({ type: 'SET_BOOKING_ID', bookingId: booking.id, expiresAt: booking.slotHoldExpiresAt ?? '' })
      proceedToPayment(booking.id)
    },
  })

  const { mutate: payOrder, isPending: paying } = useMutation({
    mutationFn: (bookingId: string) => bookingApi.payBooking(bookingId, { payFull }),
    onSuccess: (order, bookingId) => {
      trackEvent('payment_started', { bookingId, amount: payAmount, payFull })
      openGateway(order, bookingId)
    },
  })

  function proceedToPayment(bookingId: string) {
    payOrder(bookingId)
  }

  function openGateway(order: { gatewayOrderId: string; amount: number; key: string }, bookingId: string) {
    // In dev/mocks, simulate payment success
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      trackEvent('purchase', { bookingId, transactionId: order.gatewayOrderId, value: payAmount })
      clearBookingState()
      navigate(`/book/success/${bookingId}`)
      return
    }

    // Real Razorpay integration
    const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay({
      key: order.key,
      order_id: order.gatewayOrderId,
      amount: order.amount,
      currency: 'INR',
      name: 'BOB Talkies',
      description: 'Private Theatre Booking',
      handler: (response: { razorpay_payment_id: string }) => {
        trackEvent('purchase', { bookingId, transactionId: response.razorpay_payment_id, value: payAmount })
        clearBookingState()
        navigate(`/book/success/${bookingId}`)
      },
      modal: {
        ondismiss: () => navigate(`/book/failed/${bookingId}`),
      },
      theme: { color: '#C9A24B' },
    })
    rzp.open()
  }

  function handlePay() {
    if (payLock.current) return
    payLock.current = true
    dispatch({ type: 'SET_PAY_FULL', payFull })
    if (state.bookingId) {
      proceedToPayment(state.bookingId)
    } else {
      createBooking()
    }
  }

  const isLoading = creating || paying

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-2">
        Confirm and Pay
      </h2>
      <p className="text-text-secondary mb-6">
        Review your booking and choose how much to pay.
      </p>

      <PriceSummary />

      {/* Payment choice */}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary">How would you like to pay?</h3>
        <label className={`flex items-start gap-4 p-4 rounded-card border-2 cursor-pointer transition-all ${!payFull ? 'border-gold-500 bg-gold-500/10' : 'border-border-subtle bg-bg-surface'}`}>
          <input
            type="radio"
            name="payChoice"
            checked={!payFull}
            onChange={() => setPayFull(false)}
            className="mt-1 accent-[var(--gold-500)]"
            aria-label="Pay advance only"
          />
          <div>
            <p className="font-medium text-text-primary">Pay Advance (30%)</p>
            <p className="text-sm text-text-secondary">Pay {formatINR(advanceAmount)} now. Remaining {formatINR(totalAmount - advanceAmount)} at the venue.</p>
          </div>
        </label>
        <label className={`flex items-start gap-4 p-4 rounded-card border-2 cursor-pointer transition-all ${payFull ? 'border-gold-500 bg-gold-500/10' : 'border-border-subtle bg-bg-surface'}`}>
          <input
            type="radio"
            name="payChoice"
            checked={payFull}
            onChange={() => setPayFull(true)}
            className="mt-1 accent-[var(--gold-500)]"
            aria-label="Pay full amount"
          />
          <div>
            <p className="font-medium text-text-primary">Pay Full Amount</p>
            <p className="text-sm text-text-secondary">Pay {formatINR(totalAmount)} now. Nothing due at the venue.</p>
          </div>
        </label>
      </div>

      {/* Security notice */}
      <div className="flex items-center gap-2 mt-4 text-xs text-text-muted">
        <Shield size={14} className="text-success" aria-hidden="true" />
        Payments are secured by Razorpay. We never store your card details.
      </div>

      <Button
        fullWidth
        size="xl"
        loading={isLoading}
        onClick={handlePay}
        className="mt-6 gap-2"
      >
        <CreditCard size={18} aria-hidden="true" />
        Pay {formatINR(payAmount)} Securely
      </Button>
    </div>
  )
}

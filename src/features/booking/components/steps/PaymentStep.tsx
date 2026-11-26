import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../../state/booking.context'
import { bookingApi } from '../../api'
import { PriceSummary } from '../PriceSummary'
import { motion } from 'framer-motion'
import { formatINR } from '@/lib/utils/currency'
import { Check, CreditCard, Shield } from 'lucide-react'
import { trackEvent } from '@/features/tracking/events'
import { clearBookingState } from '../../state/booking.storage'
import { ApiError } from '@/lib/api/client'
import { useSiteConfig } from '@/features/site/api'

export function PaymentStep() {
  const { state, dispatch } = useBooking()
  const navigate = useNavigate()
  const [payFull, setPayFull] = useState(false)
  const payLock = useRef(false)
  const [error, setError] = useState('')
  const { data: site } = useSiteConfig()
  const advancePercent = site?.pricing.advancePercent
  const allowFullPayment = site?.pricing.allowFullPayment ?? true

  const quote = state.serverQuote
  const advanceAmount = quote?.advancePaise ?? 0
  const totalAmount = quote?.totalPaise ?? 0
  const payAmount = payFull ? totalAmount : advanceAmount

  const { mutate: createBooking, isPending: creating } = useMutation({
    mutationFn: () =>
      bookingApi.createBooking({
        theatreId: state.theatreId!,
        date: state.date!,
        slotId: state.slotId!,
        occasion: state.occasion!,
        guests: state.guests + state.kids,
        decoration: state.decoration,
        addonIds: state.addonIds,
        couponCode: state.couponCode ?? undefined,
        customerName: state.customerName,
        customerMobile: state.customerMobile,
        customerEmail: state.customerEmail || undefined,
        specialInstructions: [
          state.kids > 0 && `Kids (3-10 yrs): ${state.kids}`,
          state.personalMessage?.trim() && `Personalised message: ${state.personalMessage.trim()}`,
          state.customRequest && `Cake request: ${state.customRequest}`,
          state.addonRequest && `Add-on request: ${state.addonRequest}`,
          state.specialInstructions,
        ].filter(Boolean).join('\n') || undefined,
        consentTnC: state.consentTnC,
        consentWhatsapp: state.consentWhatsapp,
      }),
    onSuccess: (booking) => {
      dispatch({ type: 'SET_BOOKING_ID', bookingId: booking.id, expiresAt: booking.slotHoldExpiresAt ?? '' })
      proceedToPayment(booking.id)
    },
    onError: (e: Error) => failed(e),
  })

  const { mutate: payOrder, isPending: paying } = useMutation({
    mutationFn: (bookingId: string) => bookingApi.payBooking(bookingId, { payFull }),
    onSuccess: (order, bookingId) => {
      trackEvent('payment_started', { bookingId, amount: payAmount, payFull })
      openGateway(order, bookingId)
    },
    onError: (e: Error) => failed(e),
  })

  /** Shows the reason and unlocks the button; an expired hold means the next tap creates a new booking. */
  function failed(e: Error) {
    if (e instanceof ApiError && e.code === 'HOLD_EXPIRED') dispatch({ type: 'CLEAR_BOOKING' })
    setError(e.message || 'Something went wrong. Please try again.')
    payLock.current = false
  }

  function proceedToPayment(bookingId: string) {
    payOrder(bookingId)
  }

  function openGateway(order: { gatewayOrderId: string; amount: number; key: string; provider: string }, bookingId: string) {
    // Until Razorpay is set up the backend uses the 'dev' provider: a test screen with "Payment successful" / "Payment failed"
    if (order.provider === 'dev') {
      navigate(`/book/test-payment/${encodeURIComponent(bookingId)}?order=${encodeURIComponent(order.gatewayOrderId)}&amount=${order.amount}`)
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
    setError('')
    dispatch({ type: 'SET_PAY_FULL', payFull })
    if (state.bookingId) {
      proceedToPayment(state.bookingId)
    } else {
      createBooking()
    }
  }

  const isLoading = creating || paying

  const options = [
    { full: false, title: `Pay Advance (${advancePercent ?? '…'}%)`, amount: advanceAmount, note: `Remaining ${formatINR(totalAmount - advanceAmount)} at the venue.` },
    { full: true, title: 'Pay Full Amount', amount: totalAmount, note: 'Nothing due at the venue.' },
  ].filter((o) => !o.full || allowFullPayment)

  return (
    <div>
      <h2 className="mb-1 font-display text-3xl font-bold text-[#3d0a24] md:text-4xl">Confirm and Pay</h2>
      <p className="mb-7 text-sm text-[#5b2535]">Review your booking and choose how much to pay.</p>

      <PriceSummary />

      {/* Payment choice */}
      <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[#8b1a3a]">How would you like to pay?</p>
      <div role="radiogroup" aria-label="Payment option" className="grid gap-4 sm:grid-cols-2">
        {options.map((o, i) => {
          const active = payFull === o.full
          return (
            <motion.button
              key={o.title}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPayFull(o.full)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative rounded-3xl p-5 text-left transition-shadow duration-300 ${
                active
                  ? 'bg-[linear-gradient(135deg,#faf0ff,#fff)] shadow-[0_16px_38px_rgba(192,38,211,0.28)] ring-2 ring-[#c0125a]'
                  : 'bg-white/85 shadow-[0_8px_24px_rgba(107,35,152,0.1)] ring-1 ring-[#f5d5e0]'
              }`}
            >
              <span
                className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                  active ? 'border-[#c0125a] bg-[#c0125a]' : 'border-[#d9b8e0]'
                }`}
                aria-hidden="true"
              >
                {active && <Check size={13} strokeWidth={3} className="text-white" />}
              </span>
              <p className="text-sm font-semibold text-[#5b2535]">{o.title}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-[#5c1535]">{formatINR(o.amount)}</p>
              <p className="mt-1 text-xs text-[#7d4555]">{o.note}</p>
            </motion.button>
          )
        })}
      </div>

      {/* Security notice */}
      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#e7f7ee] px-4 py-3 text-xs text-emerald-800">
        <Shield size={15} className="shrink-0 text-emerald-600" aria-hidden="true" />
        Payments are secured by Razorpay. We never store your card details.
      </div>

      {error && <p role="alert" className="mt-5 rounded-2xl bg-[#fdecf2] px-4 py-3 text-center text-sm font-medium text-[#c2255c]">{error}</p>}

      <motion.button
        type="button"
        onClick={handlePay}
        disabled={isLoading}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 mb-24 flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#8b1a3a,#d9126a)] px-6 py-4 text-base font-semibold text-white shadow-[0_14px_34px_rgba(107,35,152,0.4)] disabled:opacity-60"
      >
        <CreditCard size={18} aria-hidden="true" />
        {isLoading ? 'Processing…' : `Pay ${formatINR(payAmount)} Securely`}
      </motion.button>
    </div>
  )
}

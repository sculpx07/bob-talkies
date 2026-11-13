import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { OCCASIONS } from '@/content/occasions'
import { Stepper } from '@/components/ui/Stepper'
import { Seo } from '@/components/seo/Seo'
import { useBooking } from '@/features/booking/state/booking.context'
import { StickyPriceBar } from '@/features/booking/components/StickyPriceBar'
import { TheatreSlotStep } from '@/features/booking/components/steps/TheatreSlotStep'
import { PackageStep } from '@/features/booking/components/steps/PackageStep'
import { AddonsStep } from '@/features/booking/components/steps/AddonsStep'
import { CouponStep } from '@/features/booking/components/steps/CouponStep'
import { PriceSummary } from '@/features/booking/components/PriceSummary'
import { CustomerDetailsStep } from '@/features/booking/components/steps/CustomerDetailsStep'
import { PaymentStep } from '@/features/booking/components/steps/PaymentStep'
import { trackEvent } from '@/features/tracking/events'
import { cn } from '@/lib/utils/cn'

/* Occasion, guests and date are collected on the home page ("Find Your Perfect
   Theatre"), so the booking flow starts at the theatre step (index 3). */
const FIRST_STEP = 3

const STEPS = [
  { id: 'occasion', label: 'Occasion' },
  { id: 'guests', label: 'Guests' },
  { id: 'date', label: 'Date' },
  { id: 'theatre', label: 'Theatre' },
  { id: 'package', label: 'Package' },
  { id: 'addons', label: 'Add-ons' },
  { id: 'coupon', label: 'Coupon' },
  { id: 'summary', label: 'Summary' },
  { id: 'details', label: 'Details' },
  { id: 'payment', label: 'Payment' },
]

function canProceed(step: number, state: ReturnType<typeof useBooking>['state']): boolean {
  switch (step) {
    case 0: return Boolean(state.occasion)
    case 1: return state.guests > 0
    case 2: return Boolean(state.date)
    case 3: return Boolean(state.theatreId && state.slotId)
    case 4: return Boolean(state.packageId)
    case 5: return true // addons optional
    case 6: return true // coupon optional
    case 7: return Boolean(state.serverQuote)
    case 8: return Boolean(state.customerName && state.customerMobile && state.consentTnC)
    case 9: return true
    default: return false
  }
}

export default function BookPage() {
  const { state, dispatch } = useBooking()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Details chosen on the home page arrive as query params (they win over stale state)
  const occasion = searchParams.get('occasion') ?? state.occasion
  const guests = parseInt(searchParams.get('guests') ?? '') || state.guests
  const date = searchParams.get('date') ?? state.date

  useEffect(() => {
    const qOccasion = searchParams.get('occasion')
    const qGuests = parseInt(searchParams.get('guests') ?? '')
    const qDate = searchParams.get('date')
    if (qOccasion && qOccasion !== state.occasion) dispatch({ type: 'SET_OCCASION', occasion: qOccasion })
    if (qGuests && qGuests !== state.guests) dispatch({ type: 'SET_GUESTS', guests: qGuests })
    if (qDate && qDate !== state.date) dispatch({ type: 'SET_DATE', date: qDate })
    if (state.step < FIRST_STEP) dispatch({ type: 'GO_STEP', step: FIRST_STEP })
  }, []) // only on mount

  if (!occasion || !date) return <Navigate to="/" state={{ highlightPlan: true }} replace />

  const step = Math.max(state.step, FIRST_STEP)
  const visibleSteps = STEPS.slice(FIRST_STEP)
  const occasionData = OCCASIONS.find((o) => o.slug === occasion)
  const prettyDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

  const stepContent = [
    null,
    null,
    null,
    <TheatreSlotStep key="theatre" />,
    <PackageStep key="package" />,
    <AddonsStep key="addons" />,
    <CouponStep key="coupon" />,
    <div key="summary">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-[#2a0e4f] mb-6">Review your booking</h2>
      <PriceSummary />
    </div>,
    <CustomerDetailsStep
      key="details"
      onVerified={() => dispatch({ type: 'NEXT_STEP' })}
    />,
    <PaymentStep key="payment" />,
  ]

  function handleNext() {
    if (!canProceed(step, state)) return
    if (step === 8) return // CustomerDetailsStep calls onVerified itself
    trackEvent('select_occasion', { step, stepName: STEPS[step]?.id })
    dispatch({ type: 'NEXT_STEP' })
  }

  function handleBack() {
    if (step <= FIRST_STEP) navigate('/', { state: { highlightPlan: true } })
    else dispatch({ type: 'PREV_STEP' })
  }

  return (
    <>
      <Seo
        title="Book Your Private Theatre"
        description="Book a private theatre at BOB Talkies in Hyderabad. Customise your celebration step by step."
        canonical="/book"
        noindex
      />
      <div className="min-h-screen pt-16 md:pt-20 pb-32">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
          {/* Your celebration summary */}
          <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-[0_8px_24px_rgba(107,35,152,0.1)] backdrop-blur">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-[#32105f]">
              <span>{occasionData?.emoji} {occasionData?.label ?? occasion}</span>
              <span className="text-[#c58be6]">•</span>
              <span>{guests} guests</span>
              <span className="text-[#c58be6]">•</span>
              <span>{prettyDate}</span>
            </p>
            <Link
              to="/"
              state={{ highlightPlan: true }}
              className="flex shrink-0 items-center gap-1 rounded-full bg-[#f6e6ef] px-3 py-1.5 text-xs font-semibold text-[#6b2398] transition-colors hover:bg-[#efd3e6]"
            >
              <Pencil size={12} /> Edit
            </Link>
          </div>

          {/* Stepper */}
          <div className="mb-8 overflow-x-auto pb-1">
            <Stepper steps={visibleSteps} currentStep={step - FIRST_STEP} />
          </div>

          {/* Step content */}
          <div className={cn('animate-fade-in')}>
            {stepContent[step]}
          </div>
        </div>
      </div>

      {/* Not showing sticky bar on payment step (it has its own CTA) */}
      {step < 9 && (
        <StickyPriceBar
          onNext={handleNext}
          onBack={handleBack}
          canProceed={canProceed(step, state)}
          stepIndex={step - FIRST_STEP}
          totalSteps={visibleSteps.length}
          nextLabel={step === 8 ? 'Verify & Continue' : step === 7 ? 'Proceed to Payment' : 'Continue'}
          showTotal={step >= 7}
        />
      )}
    </>
  )
}

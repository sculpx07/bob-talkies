import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Stepper } from '@/components/ui/Stepper'
import { Seo } from '@/components/seo/Seo'
import { useBooking } from '@/features/booking/state/booking.context'
import { StickyPriceBar } from '@/features/booking/components/StickyPriceBar'
import { OccasionStep } from '@/features/booking/components/steps/OccasionStep'
import { GuestsStep } from '@/features/booking/components/steps/GuestsStep'
import { DateStep } from '@/features/booking/components/steps/DateStep'
import { TheatreSlotStep } from '@/features/booking/components/steps/TheatreSlotStep'
import { PackageStep } from '@/features/booking/components/steps/PackageStep'
import { AddonsStep } from '@/features/booking/components/steps/AddonsStep'
import { CouponStep } from '@/features/booking/components/steps/CouponStep'
import { PriceSummary } from '@/features/booking/components/PriceSummary'
import { CustomerDetailsStep } from '@/features/booking/components/steps/CustomerDetailsStep'
import { PaymentStep } from '@/features/booking/components/steps/PaymentStep'
import { trackEvent } from '@/features/tracking/events'
import { cn } from '@/lib/utils/cn'

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

  // Pre-fill from quick widget
  useEffect(() => {
    const occasion = searchParams.get('occasion')
    const guests = searchParams.get('guests')
    const date = searchParams.get('date')
    if (occasion && !state.occasion) dispatch({ type: 'SET_OCCASION', occasion })
    if (guests && !state.guests) dispatch({ type: 'SET_GUESTS', guests: parseInt(guests) || 2 })
    if (date && !state.date) dispatch({ type: 'SET_DATE', date })
  }, []) // only on mount

  const step = state.step

  const stepContent = [
    <OccasionStep key="occasion" />,
    <GuestsStep key="guests" />,
    <DateStep key="date" />,
    <TheatreSlotStep key="theatre" />,
    <PackageStep key="package" />,
    <AddonsStep key="addons" />,
    <CouponStep key="coupon" />,
    <div key="summary">
      <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-6">Review your booking</h2>
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
          {/* Stepper */}
          <div className="mb-8 overflow-x-auto">
            <Stepper steps={STEPS} currentStep={step} />
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
          onBack={() => dispatch({ type: 'PREV_STEP' })}
          canProceed={canProceed(step, state)}
          stepIndex={step}
          totalSteps={STEPS.length}
          nextLabel={step === 8 ? 'Verify & Continue' : step === 7 ? 'Proceed to Payment' : 'Continue'}
          showTotal={step >= 7}
        />
      )}
    </>
  )
}

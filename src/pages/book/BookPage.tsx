import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Pencil, Users, CalendarDays, Clapperboard, Share2, Bookmark, BookmarkCheck } from 'lucide-react'
import { SAVED_KEY, SAVED_EVENT } from '@/features/booking/useSavedPlan'
import { useToast } from '@/components/ui/Toast'
import { theatreKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import { formatINR } from '@/lib/utils/currency'
import type { Theatre } from '@/schemas/theatre'
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

/* Occasion, guests and date are collected on the home page ("Find Your Perfect
   Theatre"), so the booking flow starts at the theatre step (index 3). */
const FIRST_STEP = 3

// Heading shown above the progress bar for each step
const STEP_HEADINGS: Record<number, { kicker: string; title: string }> = {
  3: { kicker: 'Almost there', title: 'Pick your theatre' },
  4: { kicker: 'Great choice', title: 'Choose your package' },
  5: { kicker: 'Make it yours', title: 'Add the finishing touches' },
  6: { kicker: 'Save more', title: 'Apply a coupon' },
  7: { kicker: 'Looking good', title: 'Review your booking' },
  8: { kicker: 'Just a few details', title: 'Tell us about you' },
  9: { kicker: 'Last step', title: 'Confirm and pay' },
}

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
  const { toast } = useToast()
  const [saved, setSaved] = useState(() => {
    try { return Boolean(localStorage.getItem(SAVED_KEY)) } catch { return false }
  })

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


  const { data: allTheatres = [] } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })
  const chosenTheatre = allTheatres.find((t) => t.id === state.theatreId) ?? null

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

  async function sharePlan() {
    const url = `${window.location.origin}/book?occasion=${occasion}&guests=${guests}&date=${date}`
    const text = `My ${occasionData?.label ?? 'celebration'} plan at BOB Talkies — ${guests} guests on ${prettyDate}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'BOB Talkies', text, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast('success', 'Link copied', 'Paste it anywhere to share your plan.')
      }
    } catch {
      /* share sheet dismissed */
    }
  }

  function toggleSave() {
    try {
      if (saved) {
        localStorage.removeItem(SAVED_KEY)
        setSaved(false)
        window.dispatchEvent(new Event(SAVED_EVENT))
        toast('info', 'Removed from saved')
      } else {
        localStorage.setItem(SAVED_KEY, JSON.stringify({
          occasion, guests, date, theatreId: state.theatreId, slotId: state.slotId,
          packageId: state.packageId, addonIds: state.addonIds, savedAt: Date.now(),
        }))
        setSaved(true)
        window.dispatchEvent(new Event(SAVED_EVENT))
        toast('success', 'Plan saved', 'Tap Saved in the menu bar to see it.')
      }
    } catch {
      toast('error', 'Could not save', 'Your browser blocked saving.')
    }
  }

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
      <div className="min-h-screen pt-20 md:pt-28 pb-40">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 text-center md:mb-8"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-cursive text-3xl font-semibold text-[#6b2398] md:text-4xl">{STEP_HEADINGS[step]?.kicker}</p>
                <h1 className="font-display text-3xl font-bold text-[#2a0e4f] md:text-5xl">{STEP_HEADINGS[step]?.title}</h1>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Stepper */}
          <div className="mx-auto mb-8 max-w-3xl overflow-x-auto rounded-3xl border border-white/70 bg-white/60 px-4 py-4 shadow-[0_10px_30px_rgba(107,35,152,0.1)] backdrop-blur-xl">
            <Stepper
              steps={visibleSteps}
              currentStep={step - FIRST_STEP}
              onStepClick={(i) => dispatch({ type: 'GO_STEP', step: FIRST_STEP + i })}
            />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Step content */}
            <div className="rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-[0_20px_60px_rgba(107,35,152,0.12)] backdrop-blur-xl md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {stepContent[step]}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Your celebration */}
            <motion.aside
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_20px_60px_rgba(107,35,152,0.14)] backdrop-blur-xl lg:sticky lg:top-28"
              aria-label="Your celebration"
            >
              <div className="relative overflow-hidden bg-[linear-gradient(135deg,#32105f,#6b2398_60%,#d946ef)] p-5 text-white">
                <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">Your celebration</p>
                <p className="mt-1 font-display text-2xl font-bold">
                  {occasionData?.emoji} {occasionData?.label ?? occasion}
                </p>
              </div>
              <ul className="space-y-3.5 p-5 text-sm">
                <li className="flex items-center gap-3 text-[#2a0e4f]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6e6ef] text-[#6b2398]"><Users size={16} /></span>
                  <span><span className="block text-[11px] font-bold uppercase tracking-wider text-[#7d7094]">Guests</span>{guests}</span>
                </li>
                <li className="flex items-center gap-3 text-[#2a0e4f]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6e6ef] text-[#6b2398]"><CalendarDays size={16} /></span>
                  <span><span className="block text-[11px] font-bold uppercase tracking-wider text-[#7d7094]">Date</span>{prettyDate}</span>
                </li>
                <li className="flex items-center gap-3 text-[#2a0e4f]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6e6ef] text-[#6b2398]"><Clapperboard size={16} /></span>
                  <span>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7d7094]">Theatre</span>
                    {chosenTheatre ? chosenTheatre.name : <span className="text-[#7d7094]">Not chosen yet</span>}
                  </span>
                  {step > FIRST_STEP && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'GO_STEP', step: FIRST_STEP })}
                      className="ml-auto rounded-full bg-[#f6e6ef] px-3 py-1 text-xs font-semibold text-[#6b2398] transition-colors hover:bg-[#efd3e6]"
                    >
                      Change
                    </button>
                  )}
                </li>
                {state.serverQuote && (
                  <li className="flex items-center justify-between rounded-2xl bg-[#fdf6ff] px-4 py-3 text-[#32105f]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7d7094]">Total</span>
                    <span className="text-lg font-bold">{formatINR(state.serverQuote.totalPaise)}</span>
                  </li>
                )}
              </ul>
              <div className="space-y-2.5 border-t border-[#f1e2f0] p-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={sharePlan}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-[#32105f]/25 px-4 py-2.5 text-sm font-semibold text-[#32105f] transition-colors hover:bg-[#32105f]/5"
                  >
                    <Share2 size={15} /> Share
                  </button>
                  <button
                    type="button"
                    onClick={toggleSave}
                    aria-pressed={saved}
                    className={`flex items-center justify-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
                      saved ? 'border-transparent bg-[#32105f] text-white' : 'border-[#32105f]/25 text-[#32105f] hover:bg-[#32105f]/5'
                    }`}
                  >
                    {saved ? <><BookmarkCheck size={15} /> Saved</> : <><Bookmark size={15} /> Save</>}
                  </button>
                </div>
                <Link
                  to="/"
                  state={{ highlightPlan: true }}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-[#f6e6ef] px-4 py-2.5 text-sm font-semibold text-[#6b2398] transition-colors hover:bg-[#efd3e6]"
                >
                  <Pencil size={14} /> Edit details
                </Link>
              </div>
            </motion.aside>
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

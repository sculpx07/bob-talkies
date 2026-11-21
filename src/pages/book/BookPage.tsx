import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Pencil, Users, CalendarDays, Clapperboard, Share2, Bookmark, BookmarkCheck, Gift, Zap, RotateCcw, Star } from 'lucide-react'
import { getPoints, getBookingCount, buildReferralUrl } from '@/lib/utils/bobRewards'
import { SAVED_KEY, SAVED_EVENT } from '@/features/booking/useSavedPlan'
import { useToast } from '@/components/ui/Toast'
import { addonKeys, theatreKeys } from '@/lib/api/queryKeys'
import { useSlots } from '@/features/booking/hooks/useAvailability'
import { formatTime } from '@/lib/utils/date'
import type { Addon } from '@/schemas/addon'
import { api } from '@/lib/api/client'
import { formatINR } from '@/lib/utils/currency'
import type { Theatre } from '@/schemas/theatre'
import { OCCASIONS } from '@/content/occasions'
import { Stepper } from '@/components/ui/Stepper'
import { Seo } from '@/components/seo/Seo'
import { useBooking } from '@/features/booking/state/booking.context'
import { StickyPriceBar } from '@/features/booking/components/StickyPriceBar'
import { TheatreSlotStep } from '@/features/booking/components/steps/TheatreSlotStep'
import { AddonsStep } from '@/features/booking/components/steps/AddonsStep'
import { BasicDetailsStep } from '@/features/booking/components/steps/BasicDetailsStep'
import { CakeStep } from '@/features/booking/components/steps/CakeStep'
import { hasExtraGuestLine } from '@/content/bookingInclusions'
import { PersonalisedMessageSummary } from '@/features/booking/components/PersonalisedMessage'
import { BookingSummaryCard } from '@/features/booking/components/BookingSummaryCard'
import { PaymentStep } from '@/features/booking/components/steps/PaymentStep'
import { trackEvent } from '@/features/tracking/events'

/* Occasion, guests and date are chosen on the home page finder, so this booking
   flow starts at the theatre step (index 3). Stages: theatre, basic details,
   cake, add-ons, payment. Step index 5 (celebration details) is retired and skipped,
   so the indexes are 3, 4, 6, 7, 8. There are no packages. */
const FIRST_STEP = 3

// Heading shown above the progress bar for each step
const STEP_HEADINGS: Record<number, { kicker: string; title: string }> = {
  3: { kicker: 'Almost there', title: 'Pick your theatre' },
  4: { kicker: 'Just a few details', title: 'Basic details' },
  6: { kicker: 'Something sweet', title: 'Pick your cake' },
  7: { kicker: 'Make it yours', title: 'Add the finishing touches' },
  8: { kicker: 'Last step', title: 'Review and pay' },
}
const LAST_STEP = 8

const STEPS = [
  { id: 'theatre', label: 'Theatre' },
  { id: 'details', label: 'Basic Details' },
  { id: 'cake', label: 'Cake' },
  { id: 'addons', label: 'Add-ons' },
  { id: 'payment', label: 'Payment' },
]
// internal step index for each stage
const STAGE_STEP = [3, 4, 6, 7, 8]
const stageOf = (step: number) => (step <= 4 ? step - FIRST_STEP : step - FIRST_STEP - 1)

function canProceed(step: number, state: ReturnType<typeof useBooking>['state']): boolean {
  switch (step) {
    case 3: return Boolean(state.theatreId && state.slotId)
    case 6: case 7: return true // cake and add-ons are optional
    case 8: return true
    default: return false // step 4 has its own Next step button
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
    // a booking always starts at the theatre step; the home page finder already collected the rest
    if (state.step < FIRST_STEP || qOccasion || qGuests || qDate) dispatch({ type: 'GO_STEP', step: FIRST_STEP })
  }, []) // only on mount


  // every step starts at the top of the page (the details form is long, so the old scroll position would land near the footer)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [state.step])

  const { data: allTheatres = [] } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })
  const chosenTheatre = allTheatres.find((t) => t.id === state.theatreId) ?? null

  // data for the "what you picked" summary shown in the bottom bar
  const { data: addonList = [] } = useQuery({
    queryKey: addonKeys.list(state.theatreId ?? undefined),
    queryFn: () => api.get<Addon[]>(`/addons${state.theatreId ? `?theatreId=${state.theatreId}` : ''}`),
    enabled: Boolean(state.theatreId),
  })
  const { data: slotList = [] } = useSlots(state.theatreId, state.date)
  const chosenSlot = slotList.find((sl) => sl.id === state.slotId) ?? null
  const chosenAddons = addonList.filter((ad) => state.addonIds.includes(ad.id))

  if (!occasion || !date) return <Navigate to="/" state={{ highlightPlan: true }} replace />

  const step = Math.min(Math.max(state.step, FIRST_STEP), LAST_STEP)
  const visibleSteps = STEPS
  const occasionData = OCCASIONS.find((o) => o.slug === occasion)
  const prettyDate = date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : null

  const chosenOccasionLabel = occasionData ? `${occasionData.emoji} ${occasionData.label}` : '—'
  const reviewRows: Array<{ label: string; value: string; step: number }> = [
    { label: 'Occasion', value: chosenOccasionLabel, step: 0 },
    { label: 'Guests', value: state.kids > 0 ? `${state.guests} + ${state.kids} kids` : String(state.guests), step: 1 },
    { label: 'Date', value: prettyDate ?? '—', step: 2 },
    { label: 'Theatre & time', value: chosenTheatre ? `${chosenTheatre.name}${chosenSlot ? ` · ${formatTime(chosenSlot.start)}` : ''}` : '—', step: 3 },
    { label: 'Booked by', value: state.customerName || '—', step: 4 },
    { label: 'Decoration', value: state.decoration ? 'Yes' : 'No', step: 4 },
    { label: 'Add-ons & cake', value: chosenAddons.length ? chosenAddons.map((a) => a.name).join(', ') : 'None', step: 6 },
  ]

  const stepContent: Array<React.ReactNode> = [
    null,
    null,
    null,
    <TheatreSlotStep key="theatre" />,
    <BasicDetailsStep
      key="details"
      onBack={() => dispatch({ type: 'GO_STEP', step: 3 })}
      onDone={() => dispatch({ type: 'GO_STEP', step: 6 })}
    />,
    null,
    <CakeStep
      key="cake"
      onBack={() => dispatch({ type: 'GO_STEP', step: 4 })}
      onSkip={() => dispatch({ type: 'GO_STEP', step: 7 })}
    />,
    <AddonsStep key="addons" />,
    <div key="payment">
      <h2 className="mb-5 font-display text-3xl font-bold text-[#2a0e4f] md:text-4xl">Review your booking</h2>
      <dl className="mb-6 divide-y divide-[#f1e2f0] overflow-hidden rounded-3xl bg-white ring-1 ring-[#ecd9ec]">
        {reviewRows.map((r) => (
          <div key={r.label} className="flex items-center gap-3 px-5 py-3 text-sm">
            <dt className="w-28 shrink-0 text-[11px] font-bold uppercase tracking-wider text-[#7d7094]">{r.label}</dt>
            <dd className="min-w-0 flex-1 truncate font-semibold text-[#2a0e4f]">{r.value}</dd>
            <button type="button" onClick={() => (r.step < FIRST_STEP ? navigate('/', { state: { highlightPlan: true } }) : dispatch({ type: 'GO_STEP', step: r.step }))} className="shrink-0 rounded-full bg-[#f6e6ef] px-3 py-1 text-xs font-semibold text-[#6b2398] hover:bg-[#efd3e6]">Edit</button>
          </div>
        ))}
      </dl>
      <PaymentStep />
    </div>,
  ]

  async function sharePlan() {
    if (!occasion || !date) { toast('info', 'Pick an occasion and date first'); return }
    const refUrl = buildReferralUrl()
    const url = `${refUrl}&occasion=${occasion}&guests=${guests}&date=${date}`
    const text = `🎬 Book a private theatre at BOB Talkies! ${guests} guests on ${prettyDate}. Use my link to book and we both earn BOB Points!`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'BOB Talkies — Private Theatre', text, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast('success', 'Referral link copied!', 'Share it — you both earn BOB Points when they book.')
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
          addonIds: state.addonIds, savedAt: Date.now(),
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
    trackEvent('select_occasion', { step, stepName: STEPS[step]?.id })
    dispatch({ type: 'NEXT_STEP' })
  }

  function handleBack() {
    if (step <= FIRST_STEP) navigate('/', { state: { highlightPlan: true } })
    else dispatch(step === 6 ? { type: 'GO_STEP', step: 4 } : { type: 'PREV_STEP' })
  }

  return (
    <>
      <Seo
        title="Book Your Private Theatre"
        description="Book a private theatre at BOB Talkies in Hyderabad. Customise your celebration step by step."
        canonical="/book"
        noindex
      />
      <div className="min-h-screen pt-20 md:pt-28 pb-12">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
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
              currentStep={stageOf(step)}
              onStepClick={(i) => dispatch({ type: 'GO_STEP', step: STAGE_STEP[i] })}
            />
          </div>

          {step >= 4 && step < LAST_STEP && state.serverQuote && (
            <p className="-mt-5 mb-6 text-center text-xs text-[#5b4578]">Note: pay only <strong className="text-[#6b2398]">{formatINR(state.serverQuote.advancePaise)}</strong> advance to reserve{hasExtraGuestLine(state.serverQuote.lineItems) && <span className="text-[#8f6420]"> (provisional until the extra guest rate is confirmed)</span>}</p>
          )}

          <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
            {/* Step content */}
            <div className="rounded-[2rem] border border-white/70 bg-white/65 p-5 shadow-[0_20px_60px_rgba(107,35,152,0.12)] backdrop-blur-xl md:p-10">
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

            {/* Back / Continue sit right under the card (cake and add-ons steps only; other steps have their own buttons) */}
            {step >= 6 && step < LAST_STEP && (
              <StickyPriceBar
                onNext={handleNext}
                onBack={handleBack}
                canProceed={canProceed(step, state)}
                nextLabel={step === 7 ? 'Review and pay' : 'Continue'}
              />
            )}
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
                  {occasionData ? `${occasionData.emoji} ${occasionData.label}` : 'Your booking'}
                </p>
              </div>
              <ul className="space-y-3.5 p-5 text-sm">
                <li className="flex items-center gap-3 text-[#2a0e4f]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6e6ef] text-[#6b2398]"><Users size={16} /></span>
                  <span><span className="block text-[11px] font-bold uppercase tracking-wider text-[#7d7094]">Guests</span>{guests}</span>
                </li>
                <li className="flex items-center gap-3 text-[#2a0e4f]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6e6ef] text-[#6b2398]"><CalendarDays size={16} /></span>
                  <span><span className="block text-[11px] font-bold uppercase tracking-wider text-[#7d7094]">Date</span>{prettyDate ?? <span className="text-[#7d7094]">Not chosen yet</span>}</span>
                </li>
                <li className="flex items-center gap-3 text-[#2a0e4f]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6e6ef] text-[#6b2398]"><Clapperboard size={16} /></span>
                  <span>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#7d7094]">Theatre</span>
                    {chosenTheatre ? chosenTheatre.name : <span className="text-[#7d7094]">Not chosen yet</span>}
                  </span>
                  {step > 3 && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'GO_STEP', step: 3 })}
                      className="ml-auto rounded-full bg-[#f6e6ef] px-3 py-1 text-xs font-semibold text-[#6b2398] transition-colors hover:bg-[#efd3e6]"
                    >
                      Change
                    </button>
                  )}
                </li>
              </ul>
              <PersonalisedMessageSummary />
              {step >= 4 && step < LAST_STEP && <div className="px-4 pb-4"><BookingSummaryCard /></div>}

              {/* Rewards strip */}
              {(() => {
                const pts = getPoints()
                const bookings = getBookingCount()
                return (
                  <div className="mx-4 mb-3 overflow-hidden rounded-2xl border border-[#c9a84c]/30 bg-gradient-to-br from-[#fffaf0] to-[#fdf4e3]">
                    {/* header */}
                    <div className="flex items-center justify-between border-b border-[#c9a84c]/15 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Gift size={13} className="text-[#c9a84c]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#c9933a]">BOB Rewards</span>
                      </div>
                      {pts > 0 && (
                        <div className="flex items-center gap-1 rounded-full bg-[#c9a84c]/15 px-2.5 py-0.5">
                          <Star size={9} fill="#c9a84c" stroke="none" />
                          <span className="text-[10px] font-black text-[#8a6010]">{pts} pts</span>
                        </div>
                      )}
                    </div>

                    <ul className="px-4 py-3 space-y-2">
                      {/* 1. Refer & Earn — always first */}
                      <li className="flex items-start gap-2 text-[11px] text-[#5b4578]/80 font-medium">
                        <Users size={11} className="mt-0.5 shrink-0 text-[#c9a84c]" />
                        <span>Refer friends &amp; earn BOB credits when they book</span>
                      </li>
                      {/* 2. Repeat Guest Offers */}
                      <li className="flex items-start gap-2 text-[11px] font-medium" style={{ color: bookings >= 2 ? '#2a7a4f' : '#5b4578cc' }}>
                        <RotateCcw size={11} className="mt-0.5 shrink-0" style={{ color: bookings >= 2 ? '#34d399' : '#c9a84c' }} />
                        <span>
                          Repeat guest upgrades &amp; offers
                          {bookings >= 2 && <span className="ml-1 text-[9px] font-black text-[#34d399] uppercase tracking-wide">Active ✓</span>}
                        </span>
                      </li>
                      {/* 3. Earn BOB Points */}
                      <li className="flex items-start gap-2 text-[11px] text-[#5b4578]/80 font-medium">
                        <Zap size={11} className="mt-0.5 shrink-0 text-[#c9a84c]" />
                        <span>
                          +{50} BOB Points on this booking
                          {pts > 0 && <span className="ml-1 text-[9px] text-[#8a6010] font-black">({pts} earned so far)</span>}
                        </span>
                      </li>
                    </ul>

                    <div className="flex items-center justify-between border-t border-[#c9a84c]/15 px-4 py-2">
                      <Link to="/rewards" className="text-[10px] font-black text-[#c9933a] hover:underline">
                        View all rewards →
                      </Link>
                      <button
                        type="button"
                        onClick={sharePlan}
                        className="text-[10px] font-black text-[#6b2398] hover:underline"
                      >
                        Share &amp; refer →
                      </button>
                    </div>
                  </div>
                )
              })()}

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

    </>
  )
}

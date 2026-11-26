import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, MapPin, Phone, MessageCircle, Sparkles, PartyPopper, CalendarDays, Users, Clapperboard, ArrowRight } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { ReviewsSection } from '@/components/home/ReviewsSection'
import { CelebrationGallery } from '@/components/home/CelebrationGallery'
import { TheatreFinder } from '@/components/home/TheatreFinder'
import { BobPerks } from '@/components/home/BobPerks'
import { InstagramSection } from '@/components/home/InstagramSection'
import { ExperiencePicker } from '@/components/home/ExperiencePicker'
import { ExperienceCategories } from '@/components/home/ExperienceCategories'
import { ExperienceHighlights } from '@/components/home/ExperienceHighlights'
import { VibeHallSpotlight } from '@/components/home/VibeHallSpotlight'
import { VibeHallIntroPopup } from '@/components/home/VibeHallIntroPopup'
import { PersonaliseSurpriseSection } from '@/components/home/PersonaliseSurpriseSection'
import { useBooking } from '@/features/booking/state/booking.context'
import { OfferTicket } from '@/components/ui/OfferTicket'
import { PartyDatePicker } from '@/components/ui/PartyDatePicker'
import { SectionReveal } from '@/components/home/SectionReveal'
import { PartySelect } from '@/components/ui/PartySelect'
import { PartyCounter } from '@/components/ui/PartyCounter'
import { FeaturedTheatres } from '@/components/ui/FeaturedTheatres'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { PriceTag } from '@/components/ui/PriceTag'
import { Skeleton, TheatreCardSkeleton } from '@/components/ui/Skeleton'
import { Section, SectionHeader } from '@/components/layout/PageShell'
import { OCCASIONS } from '@/content/occasions'
import { HeroBackdropImage } from '@/components/home/HeroBackdropImage'
import { useOffers, useTheatres } from '@/features/catalog/api'
import { useWhatsappNumber } from '@/features/site/api'

const OCCASION_QUICK = OCCASIONS.map((o) => ({ label: o.label, slug: o.slug, emoji: o.emoji }))

const HERO_WORDS = [
  'Celebrations', 'Birthday Parties', 'Sports Nights', 'Movie Premieres',
  'Fan Screenings', 'Teaser Launches', 'Movie Marathons', 'Family Movie Nights',
  'Gaming Nights', 'Karaoke Nights', 'Date Nights', 'Proposal Moments',
  "Friends' Reunions", 'Corporate Events', 'Private Screenings',
  'Music Experiences', 'Grand Gatherings', 'Vibe Hall Events',
]

const CEL_ROW1 = [
  { slug: 'birthday',    label: 'Birthday',    sub: 'Celebrate',  img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&q=80', overlay: 'from-[#a855f7]/80' },
  { slug: 'anniversary', label: 'Anniversary', sub: 'Book for',   img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80', overlay: 'from-[#ec4899]/80' },
  { slug: 'date-night',  label: 'Date Night',  sub: 'Book for',   img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', overlay: 'from-[#9b1a3a]/80' },
  { slug: 'proposal',    label: 'Proposal',    sub: 'Book for',   img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80', overlay: 'from-[#db2777]/80' },
]
const CEL_ROW2 = [
  { slug: 'family',           label: 'Family',           sub: 'Book for', img: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=600&q=80', overlay: 'from-[#f97316]/80' },
  { slug: 'friends',          label: 'Friends',          sub: 'Book for', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', overlay: 'from-[#6366f1]/80' },
  { slug: 'sports-screening', label: 'Sports Screening', sub: 'Book for', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80', overlay: 'from-[#0ea5e9]/80' },
  { slug: 'corporate',        label: 'Corporate',        sub: 'Book for', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', overlay: 'from-[#334155]/80' },
]

export default function HomePage() {
  const whatsappNumber = useWhatsappNumber()
  const navigate = useNavigate()
  const { dispatch: bookingDispatch } = useBooking()
  const resetBooking = () => bookingDispatch({ type: 'RESET' })
  const location = useLocation()
  const [planHighlight, setPlanHighlight] = useState(false)

  // "Book Now" links here: make the planner pulse (no scrolling)
  useEffect(() => {
    if (!(location.state as { highlightPlan?: boolean } | null)?.highlightPlan) return
    const start = setTimeout(() => setPlanHighlight(true), 150)
    const stop = setTimeout(() => setPlanHighlight(false), 2600)
    return () => { clearTimeout(start); clearTimeout(stop) }
  }, [location.key, location.state])
  const [selectedOccasion, setSelectedOccasion] = useState('')
  const [guests, setGuests] = useState('2')
  const [date, setDate] = useState('')
  const offersScrollRef = useRef<HTMLDivElement>(null)
  const [offersActiveIndex, setOffersActiveIndex] = useState(0)
  const celRow1Ref = useRef<HTMLDivElement>(null)
  const celRow2Ref = useRef<HTMLDivElement>(null)

  // Section scroll-reveal refs
  const offersRevealRef = useRef(null)
  const offersInView = useInView(offersRevealRef, { once: true, margin: '0px 0px 18% 0px' })
  const celRevealRef = useRef(null)
  const celInView = useInView(celRevealRef, { once: true, margin: '0px 0px 18% 0px' })
  const locationRevealRef = useRef(null)
  const locationInView = useInView(locationRevealRef, { once: true, margin: '0px 0px 18% 0px' })
  const [heroWordIndex, setHeroWordIndex] = useState(0)
  const [heroKey, setHeroKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroWordIndex((i) => (i + 1) % HERO_WORDS.length)
      setHeroKey((k) => k + 1)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function makeScroller(ref: React.RefObject<HTMLDivElement | null>, dir: 1 | -1) {
      const el = ref.current
      if (!el) return () => {}
      const node = el
      let frameId: number
      let paused = false
      let initialized = false
      let pos = 0 // keep the position as a float; scrollLeft alone rounds small steps away on scaled displays
      function step() {
        const loop = node.scrollWidth / 3
        if (!initialized && loop > 0) {
          pos = dir === -1 ? loop : 0
          node.scrollLeft = pos
          initialized = true
        }
        if (initialized && !paused) {
          if (Math.abs(node.scrollLeft - pos) > 2) pos = node.scrollLeft // visitor scrolled by hand
          pos += 0.6 * dir
          if (dir === 1 && pos >= loop) pos = 0
          if (dir === -1 && pos <= 0) pos = loop
          node.scrollLeft = pos
        }
        frameId = requestAnimationFrame(step)
      }
      const pause = () => { paused = true }
      const resume = () => { paused = false }
      el.addEventListener('mouseenter', pause)
      el.addEventListener('mouseleave', resume)
      frameId = requestAnimationFrame(step)
      return () => {
        cancelAnimationFrame(frameId)
        el.removeEventListener('mouseenter', pause)
        el.removeEventListener('mouseleave', resume)
      }
    }
    const c1 = makeScroller(celRow1Ref, 1)
    const c2 = makeScroller(celRow2Ref, -1)
    return () => { c1(); c2() }
  }, [])

  const { data: theatres, isLoading: theatresLoading } = useTheatres()

  const { data: offers, isLoading: offersLoading } = useOffers()

  useEffect(() => {
    const el = offersScrollRef.current
    if (!el || !offers?.length) return
    const node = el
    const count = offers.length
    let paused = false
    let currentIdx = 0
    const cardW = 336
    const gap = 16
    const stepSize = cardW + gap

    function scrollToIdx(idx: number) {
      currentIdx = idx
      setOffersActiveIndex(idx)
      node.scrollTo({ left: idx * stepSize, behavior: 'smooth' })
    }

    let timerId: ReturnType<typeof setTimeout>
    function scheduleNext() {
      timerId = setTimeout(() => {
        if (!paused) {
          const next = (currentIdx + 1) % count
          scrollToIdx(next)
        }
        scheduleNext()
      }, 2000)
    }

    const pause = () => { paused = true }
    const resume = () => { paused = false }
    node.addEventListener('mouseenter', pause)
    node.addEventListener('mouseleave', resume)
    node.addEventListener('touchstart', pause, { passive: true })
    node.addEventListener('touchend', resume)

    const startId = setTimeout(() => scheduleNext(), 2500)
    return () => {
      clearTimeout(startId)
      clearTimeout(timerId)
      node.removeEventListener('mouseenter', pause)
      node.removeEventListener('mouseleave', resume)
      node.removeEventListener('touchstart', pause)
      node.removeEventListener('touchend', resume)
    }
  }, [offers])

  function handleQuickBook() {
    const params = new URLSearchParams()
    if (selectedOccasion) params.set('occasion', selectedOccasion)
    params.set('guests', guests || '2')
    if (date) params.set('date', date)
    // every new booking starts fresh, at the theatre step
    resetBooking()
    navigate(`/book?${params.toString()}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <VibeHallIntroPopup />
      <Seo
        title="BOB Talkies — Premium Private Theatre in Hyderabad"
        description="Book a private theatre in Hyderabad for birthdays, anniversaries, proposals, date nights and all celebrations. 4K projection, Dolby Atmos, in-house decoration and photography. Book online in minutes."
        canonical="/"
      />

      <div
        className="home-champagne"
        style={{
          // magenta-plum glow gradient (from the reference swatch), tiled down the page; first 600px eases in from the hero's dark base
          backgroundColor: '#430948',
          backgroundImage: [
            'linear-gradient(180deg, #2a0430 0%, #430948 100%)',
            'radial-gradient(ellipse 48% 22% at 78% 20%, rgba(150,14,128,0.62), rgba(150,14,128,0) 100%)',
            'radial-gradient(ellipse 42% 20% at 16% 50%, rgba(122,10,112,0.55), rgba(122,10,112,0) 100%)',
            'radial-gradient(ellipse 50% 20% at 68% 84%, rgba(140,12,120,0.55), rgba(140,12,120,0) 100%)',
            'radial-gradient(ellipse 36% 14% at 14% 8%, rgba(96,8,92,0.5), rgba(96,8,92,0) 100%)',
          ].join(','),
          backgroundSize: '100% 600px, 100% 1600px, 100% 1600px, 100% 1600px, 100% 1600px',
          backgroundRepeat: 'no-repeat, repeat-y, repeat-y, repeat-y, repeat-y',
        }}
      >
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroBackdropImage />
        <div className="film-grain absolute inset-0 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 w-full min-w-0 text-center px-4 max-w-[1600px] mx-auto pt-24">
          <div className="md:pl-14 md:text-left">
          <Badge variant="gold" className="mb-6 !border-0 !text-sm md:!text-lg !font-medium !text-[#f5d7a1] px-4 py-1.5 md:px-5 md:py-2 font-['Jost',sans-serif]">
            <Sparkles size={12} />
            Hyderabad's #1 Private Celebrations Venue
          </Badge>
          <h1 className="mb-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="block text-white">Your Theatre </span>
            <span className="block">
              Your{' '}
              <span key={heroKey} className="relative inline-block whitespace-nowrap">
                <span className="hero-shine-text">{HERO_WORDS[heroWordIndex]}</span>
                <span className="hero-sparkle sp1" aria-hidden="true">✦</span>
                <span className="hero-sparkle sp2" aria-hidden="true">✦</span>
                <span className="hero-sparkle sp3" aria-hidden="true">✦</span>
                <span className="hero-sparkle sp4" aria-hidden="true">✦</span>
              </span>
            </span>
          </h1>
          <p className="mb-8 text-sm md:text-base text-white/85 max-w-lg mx-auto md:mx-0 leading-relaxed">
            From intimate celebrations to exclusive screenings and grand gatherings, experience entertainment your way at BOB Talkies.
          </p>
          </div>

          {/* Plan your party — desktop pill (matches design) */}
          <div id="plan" className="relative mx-auto w-full max-w-4xl scroll-mt-28 font-['Jost',sans-serif]">
            {/* Left rays */}
            <div className="pointer-events-none absolute left-0 top-1/2 hidden -translate-x-9 -translate-y-1/2 flex-col items-center gap-[9px] md:flex" aria-hidden="true">
              <span className="block h-[2.5px] w-6 rotate-[30deg] rounded-full bg-[#d4a94a]" />
              <span className="block h-[2.5px] w-7 rounded-full bg-[#d4a94a]" />
              <span className="block h-[2.5px] w-6 -rotate-[30deg] rounded-full bg-[#d4a94a]" />
            </div>
            {/* Right rays (mirrored) */}
            <div className="pointer-events-none absolute right-0 top-1/2 hidden translate-x-9 -translate-y-1/2 flex-col items-center gap-[9px] md:flex" aria-hidden="true">
              <span className="block h-[2.5px] w-6 -rotate-[30deg] rounded-full bg-[#d4a94a]" />
              <span className="block h-[2.5px] w-7 rounded-full bg-[#d4a94a]" />
              <span className="block h-[2.5px] w-6 rotate-[30deg] rounded-full bg-[#d4a94a]" />
            </div>

            {/* Gold border shell */}
            <div
              className={`hidden rounded-full p-[1.5px] md:flex
                bg-[linear-gradient(135deg,#e8d48a,#f6e9b8_35%,#c9a84c_65%,#ecd98f)]
                shadow-[0_12px_32px_rgba(201,168,76,0.28),0_2px_8px_rgba(120,80,40,0.10)]
                ${planHighlight ? 'animate-plan-pulse' : ''}`}
            >
              {/* Soft cream inner surface */}
              <div className="flex w-full items-center rounded-full bg-[linear-gradient(180deg,#fffefd_0%,#fcf5ee_100%)] pl-2 pr-[12px] shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),inset_0_-2px_6px_rgba(201,168,76,0.10)]">

                {/* Occasion */}
                <div className="min-w-0 flex-1">
                  <PartySelect
                    id="plan-occasion"
                    value={selectedOccasion}
                    onValueChange={setSelectedOccasion}
                    placeholder="Select Occasion"
                    label="Occasion"
                    icon={<Clapperboard size={28} strokeWidth={1.6} className="text-[#5c1535]" />}
                    options={OCCASION_QUICK.map((o) => ({ value: o.slug, label: o.label }))}
                    className="h-[80px] rounded-full border-0 bg-transparent pl-16 pr-10 text-[#5c1535] transition-colors hover:bg-white/50"
                  />
                </div>

                <div className="h-12 w-px shrink-0 bg-[#e6d9c6]" />

                {/* Guests */}
                <div className="min-w-0 flex-1">
                  <PartyCounter
                    id="plan-guests"
                    value={guests}
                    onValueChange={setGuests}
                    min={1}
                    max={30}
                    label="Guests"
                    icon={<Users size={28} strokeWidth={1.6} className="text-[#5c1535]" />}
                    className="h-[80px] rounded-full border-0 bg-transparent pl-16 pr-4 text-[#5c1535] transition-colors hover:bg-white/50"
                  />
                </div>

                <div className="h-12 w-px shrink-0 bg-[#e6d9c6]" />

                {/* Date */}
                <div className="min-w-0 flex-1">
                  <PartyDatePicker
                    id="plan-date"
                    value={date}
                    onChange={setDate}
                    min={today}
                    placeholder="Select Date"
                    label="Date"
                    icon={<CalendarDays size={28} strokeWidth={1.6} className="text-[#5c1535]" />}
                    className="h-[80px] rounded-full border-0 bg-transparent pl-16 pr-10 text-[#5c1535] transition-colors hover:bg-white/50"
                  />
                </div>

                <div className="h-12 w-px shrink-0 bg-[#e6d9c6]" />

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleQuickBook}
                  disabled={!selectedOccasion || !date}
                  className="ml-2 flex h-[56px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full
                    bg-[linear-gradient(135deg,#5c1535_0%,#7b1535_100%)] px-6 text-[15px] font-semibold text-white
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_18px_rgba(59,18,120,0.35)]
                    transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Book Now <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Mobile: stacked card */}
            <div className={`md:hidden relative rounded-[2rem] bg-[linear-gradient(135deg,#a81a3a,#f472b6_50%,#f5bd61)] p-[2px] shadow-[0_24px_60px_rgba(107,35,152,0.22)] ${planHighlight ? 'animate-plan-pulse' : ''}`}>
              <div className="rounded-[calc(2rem-2px)] bg-white/95 p-5 text-left backdrop-blur-xl">
                <div className="grid gap-4">
                  <PartySelect
                    id="plan-occasion-m"
                    value={selectedOccasion}
                    onValueChange={setSelectedOccasion}
                    placeholder="Select occasion"
                    icon={<PartyPopper size={18} />}
                    options={OCCASION_QUICK.map((o) => ({ value: o.slug, label: o.label }))}
                  />
                  <PartyCounter
                    id="plan-guests-m"
                    value={guests}
                    onValueChange={setGuests}
                    min={1}
                    max={30}
                    icon={<Users size={18} />}
                  />
                  <PartyDatePicker
                    id="plan-date-m"
                    value={date}
                    onChange={setDate}
                    min={today}
                    icon={<CalendarDays size={18} />}
                  />
                  <button
                    type="button"
                    onClick={handleQuickBook}
                    disabled={!selectedOccasion || !date}
                    className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#3d0a24] px-7 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(42,14,79,0.30)] transition-all hover:bg-[#6b1535] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Book Now <ChevronRight size={18} />
                  </button>
                </div>
                {(!selectedOccasion || !date) && (
                  <p className="mt-3 text-xs text-[#5b2535]">Choose an occasion and a date to see available theatres.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      <FeaturedTheatres />

      {/* light — body bg shows */}
      <SectionReveal style="rise"><ExperienceCategories /></SectionReveal>

      <SectionReveal style="rise"><ExperiencePicker /></SectionReveal>

      {/* Live Offers */}
      {(offersLoading || (offers && offers.length > 0)) && (
        <SectionReveal style="curtain">
        <Section bg="base" className="relative overflow-hidden">
          {/* ── Celebration background ── */}
          {/* Floating balloons */}
          {[
            { left: '5%',  color: '#f472b6', w: 22, h: 28, delay: 0,   dur: 7 },
            { left: '15%', color: '#c9a84c', w: 18, h: 24, delay: 1.5, dur: 8 },
            { left: '30%', color: '#c9183a', w: 20, h: 26, delay: 3,   dur: 6.5 },
            { left: '55%', color: '#fb923c', w: 16, h: 22, delay: 0.8, dur: 7.5 },
            { left: '70%', color: '#f472b6', w: 22, h: 28, delay: 2.2, dur: 7 },
            { left: '82%', color: '#c9a84c', w: 18, h: 24, delay: 4,   dur: 6 },
            { left: '92%', color: '#8b1a3a', w: 20, h: 26, delay: 1,   dur: 8.5 },
          ].map((b, i) => (
            <motion.div
              key={`bal-${i}`}
              className="pointer-events-none absolute flex flex-col items-center"
              style={{ left: b.left, bottom: '-10%' }}
              animate={{ y: [0, -420], opacity: [0, 0.45, 0.45, 0] }}
              transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: 'easeOut', times: [0, 0.1, 0.85, 1] }}
              aria-hidden
            >
              <div style={{ width: b.w, height: b.h, background: b.color, borderRadius: '50% 50% 45% 45%', filter: 'blur(0.5px)' }} />
              <div style={{ width: 1, height: 14, background: b.color, opacity: 0.6, marginTop: 1 }} />
            </motion.div>
          ))}

          {/* Confetti ribbons */}
          {[
            { left: '8%',  top: '10%', color: '#fbbf24', w: 8,  h: 3,  delay: 0,   dur: 4.5, rot: 20  },
            { left: '20%', top: '65%', color: '#c9183a', w: 10, h: 3,  delay: 1.1, dur: 3.8, rot: -35 },
            { left: '38%', top: '20%', color: '#f472b6', w: 7,  h: 3,  delay: 2.3, dur: 5,   rot: 50  },
            { left: '52%', top: '75%', color: '#34d399', w: 9,  h: 3,  delay: 0.6, dur: 4.2, rot: -20 },
            { left: '65%', top: '15%', color: '#fbbf24', w: 8,  h: 3,  delay: 1.8, dur: 3.6, rot: 40  },
            { left: '78%', top: '55%', color: '#f472b6', w: 10, h: 3,  delay: 3,   dur: 4.8, rot: -55 },
            { left: '88%', top: '25%', color: '#8b1a3a', w: 7,  h: 3,  delay: 0.4, dur: 5.2, rot: 15  },
            { left: '44%', top: '45%', color: '#34d399', w: 8,  h: 3,  delay: 2.7, dur: 4,   rot: -30 },
          ].map((c, i) => (
            <motion.div
              key={`conf-${i}`}
              className="pointer-events-none absolute rounded-sm"
              style={{ left: c.left, top: c.top, width: c.w, height: c.h, background: c.color }}
              animate={{ rotate: [c.rot, c.rot + 360], y: [-8, 14, -8], opacity: [0.15, 0.5, 0.15] }}
              transition={{ duration: c.dur, repeat: Infinity, delay: c.delay, ease: 'easeInOut' }}
              aria-hidden
            />
          ))}

          {/* Popper burst sparkles */}
          {[
            { cx: '3%',  cy: '30%', color: '#fbbf24' },
            { cx: '95%', cy: '60%', color: '#f472b6' },
            { cx: '50%', cy: '5%',  color: '#c9183a' },
          ].map((pp, pi) => (
            <motion.div key={`pp-${pi}`} className="pointer-events-none absolute" style={{ left: pp.cx, top: pp.cy }} aria-hidden>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, si) => (
                <motion.div
                  key={si}
                  className="absolute rounded-full"
                  style={{ width: 4, height: 4, background: pp.color, left: 0, top: 0 }}
                  animate={{
                    x: [0, Math.cos(angle * Math.PI / 180) * 28, Math.cos(angle * Math.PI / 180) * 42],
                    y: [0, Math.sin(angle * Math.PI / 180) * 28, Math.sin(angle * Math.PI / 180) * 42],
                    opacity: [0, 0.5, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: pi * 1.6 + si * 0.05, ease: 'easeOut' }}
                />
              ))}
            </motion.div>
          ))}

          <motion.div
            ref={offersRevealRef}
            className="flex items-start justify-between mb-6"
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            animate={offersInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="relative">
                  <Clapperboard size={28} className="text-[#8b1a3a]" strokeWidth={1.8} />
                  <Sparkles size={11} className="text-[#d4a94a] absolute -top-1.5 -right-1.5" />
                </div>
                <p className="font-cursive text-2xl md:text-3xl text-[#c9933a]">Limited Time</p>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
                <span className="text-white">Current </span>
                <span className="text-[#ff9bb8]">Offers</span>
              </h2>
              <div className="mt-2 h-[3px] w-10 rounded-full bg-[#d4a94a]" />
            </div>
            <Link
              to="/offers"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#f5d7a1]/60 px-4 py-2 text-xs font-semibold text-[#f5d7a1] hover:bg-white/10 transition-colors mt-1"
            >
              View All <ChevronRight size={14} />
            </Link>
          </motion.div>

          <div ref={offersScrollRef} className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden scroll-smooth snap-x snap-mandatory">
            {offersLoading
              ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="w-[320px] h-44 shrink-0" rounded="lg" />)
              : offers?.map((offer, i) => (
                  <motion.div
                    key={offer.id}
                    className="w-[82vw] max-w-[320px] sm:w-[320px] sm:max-w-none md:w-[360px] shrink-0 snap-start"
                    initial={{ opacity: 0, y: 48, rotate: i % 2 === 0 ? -2 : 2 }}
                    animate={offersInView ? { opacity: 1, y: 0, rotate: 0 } : {}}
                    transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <OfferTicket offer={offer} index={i} />
                  </motion.div>
                ))}
          </div>

          {/* Centered bubble pagination dots */}
          {!offersLoading && offers && offers.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-5">
              {offers.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to offer ${i + 1}`}
                  onClick={() => {
                    const el = offersScrollRef.current
                    if (el) { el.scrollLeft = i * 336; setOffersActiveIndex(i) }
                  }}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === offersActiveIndex ? 24 : 8,
                    height: 8,
                    background: i === offersActiveIndex
                      ? 'linear-gradient(90deg,#c9a84c,#eed98a)'
                      : '#d4a94a40',
                    boxShadow: i === offersActiveIndex ? '0 0 8px rgba(201,168,76,0.5)' : 'none',
                  }}
                />
              ))}
            </div>
          )}
        </Section>
        </SectionReveal>
      )}

      {/* Our Theatres */}
  

      {/* Choose Your Celebration */}
      <SectionReveal style="zoom">
      <Section bg="base">
        {/* Section header */}
        <motion.div
          ref={celRevealRef}
          className="flex flex-col items-center text-center mb-10 md:mb-14"
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={celInView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              className="relative"
              animate={celInView ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <PartyPopper size={26} className="text-[#8b1a3a]" strokeWidth={1.8} />
              <Sparkles size={10} className="text-[#d4a94a] absolute -top-1.5 -right-1.5" />
            </motion.div>
            <p className="font-cursive text-2xl md:text-3xl text-[#c9933a]">Every Occasion</p>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
            <span className="text-white">Choose Your </span>
            <span className="text-[#ff9bb8]">Celebration</span>
          </h2>
          <motion.div
            className="mt-2 h-[3px] rounded-full bg-[#d4a94a]"
            initial={{ width: 0 }}
            animate={celInView ? { width: 40 } : {}}
            transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Row 1 — scrolls left */}
        <div
          ref={celRow1Ref}
          className="overflow-x-scroll [&::-webkit-scrollbar]:hidden mb-4"
          style={{
            scrollbarWidth: 'none',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
          }}
        >
          <div className="flex gap-4 w-max">
            {[...CEL_ROW1, ...CEL_ROW1, ...CEL_ROW1].map((c, i) => (
              <motion.div
                key={`r1-${i}`}
                whileHover={{ y: -6, scale: 1.03 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 w-[220px] sm:w-[250px]"
              >
                <Link
                  to={`/celebrations/${c.slug}`}
                  className="group relative block overflow-hidden rounded-2xl"
                  style={{ height: 300 }}
                >
                  <img
                    src={c.img}
                    alt={c.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${c.overlay} via-black/20 to-transparent`} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/60 mb-0.5">{c.sub}</p>
                    <p className="font-display text-lg font-bold text-white leading-tight">{c.label}</p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-[#3d0a24] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow">
                      Book Now <ArrowRight size={9} />
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/0 group-hover:ring-white/20 transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div
          ref={celRow2Ref}
          className="overflow-x-scroll [&::-webkit-scrollbar]:hidden"
          style={{
            scrollbarWidth: 'none',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
          }}
        >
          <div className="flex gap-4 w-max">
            {[...CEL_ROW2, ...CEL_ROW2, ...CEL_ROW2].map((c, i) => (
              <motion.div
                key={`r2-${i}`}
                whileHover={{ y: -6, scale: 1.03 }}
                transition={{ duration: 0.25 }}
                className="shrink-0 w-[220px] sm:w-[250px]"
              >
                <Link
                  to={`/celebrations/${c.slug}`}
                  className="group relative block overflow-hidden rounded-2xl"
                  style={{ height: 300 }}
                >
                  <img
                    src={c.img}
                    alt={c.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${c.overlay} via-black/20 to-transparent`} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-white/60 mb-0.5">{c.sub}</p>
                    <p className="font-display text-lg font-bold text-white leading-tight">{c.label}</p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-[#3d0a24] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow">
                      Book Now <ArrowRight size={9} />
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/0 group-hover:ring-white/20 transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </Section>
      </SectionReveal>

      <SectionReveal style="tilt"><ExperienceHighlights /></SectionReveal>

      <SectionReveal style="rise"><VibeHallSpotlight /></SectionReveal>

      {/* Real Moments gallery — right after the experience section */}
      <SectionReveal style="rise"><CelebrationGallery /></SectionReveal>

      {/* light — body bg */}
      <SectionReveal style="curtain"><PersonaliseSurpriseSection /></SectionReveal>

      {/* warm blush tint */}
      <div>
        <SectionReveal style="zoom"><ReviewsSection /></SectionReveal>
      </div>

      {/* light — body bg */}
      <SectionReveal style="unfold"><TheatreFinder /></SectionReveal>

      {/* warm gold tint — distinct from cream */}
      <div>
        <SectionReveal style="rise"><BobPerks /></SectionReveal>
      </div>

      <SectionReveal style="slide"><InstagramSection /></SectionReveal>

      {/* Location */}
      <SectionReveal style="tilt">
      <section ref={locationRevealRef} className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#c9a84c]/8 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#8b1a3a]/8 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 28 }}
            animate={locationInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[#c9a84c] text-xs font-bold uppercase tracking-[0.28em] mb-3">Find Us</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">Visit BOB Talkies</h2>
            <motion.div className="mx-auto h-[3px] rounded-full bg-gradient-to-r from-[#c9a84c] to-[#eed98a]"
              initial={{ width: 0 }} animate={locationInView ? { width: 64 } : {}} transition={{ delay: 0.3, duration: 0.5 }} />
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 overflow-hidden rounded-[2rem] bg-white"
            style={{ boxShadow: '0 20px 60px rgba(107,35,152,0.1)' }}
            initial={{ opacity: 0, y: 40 }}
            animate={locationInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Info panel */}
            <div className="flex flex-col justify-between p-6 md:p-10">
              <div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-[#3d0a24] mb-7">BOB Talkies — Kukatpally</h3>
                <div className="space-y-5">
                  {[
                    { icon: <MapPin size={20} className="text-[#8b1a3a]" />, label: 'Address', content: <p className="text-[#3d0a24] leading-relaxed">BOB Talkies, Kukatpally,<br />Hyderabad, Telangana 500072</p> },
                    { icon: <Phone size={20} className="text-[#8b1a3a]" />, label: 'Phone & WhatsApp', content: <a href={`tel:+${whatsappNumber}`} className="text-[#3d0a24] hover:text-[#8b1a3a] transition-colors">+91 {whatsappNumber.slice(2)}</a> },
                    { icon: <CalendarDays size={20} className="text-[#8b1a3a]" />, label: 'Operating Hours', content: <><p className="text-[#3d0a24]">10:00 AM – 1:00 AM</p><p className="text-[#8f6420] text-xs mt-0.5 font-semibold">Open 365 Days</p></> },
                  ].map((item, i) => (
                    <motion.div key={item.label} className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={locationInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.45 }}
                    >
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-[#f6e6ef]">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#5b2535] mb-0.5">{item.label}</p>
                        {item.content}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/book">Book a Theatre</Link>
                </Button>
                <Button asChild variant="whatsapp" size="lg" className="w-full sm:w-auto">
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            {/* Map */}
            <div className="relative h-72 md:h-auto" style={{ minHeight: 360 }}>
              <iframe
                title="BOB Talkies Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30449.63!2d78.3980!3d17.4849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688381b30a1!2sKukatpally%2C+Hyderabad!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin"
                className="absolute inset-0 h-full w-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </section>
      </SectionReveal>
      </div>
    </>
  )
}

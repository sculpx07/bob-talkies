import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Star, MapPin, Phone, MessageCircle, Sparkles, PartyPopper, CalendarDays, Camera, Cake, Music, Users, Tv, Shield, ChevronLeft, Clapperboard, ArrowRight } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { useBooking } from '@/features/booking/state/booking.context'
import { OfferTicket } from '@/components/ui/OfferTicket'
import { PartyDatePicker } from '@/components/ui/PartyDatePicker'
import { PartySelect } from '@/components/ui/PartySelect'
import { PartyCounter } from '@/components/ui/PartyCounter'
import { FeaturedTheatres } from '@/components/ui/FeaturedTheatres'
import { TheatreStrip } from '@/components/ui/TheatreStrip'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { PriceTag } from '@/components/ui/PriceTag'
import { Skeleton, TheatreCardSkeleton } from '@/components/ui/Skeleton'
import { Section, SectionHeader } from '@/components/layout/PageShell'
import { api } from '@/lib/api/client'
import { theatreKeys, offerKeys } from '@/lib/api/queryKeys'
import { OCCASIONS } from '@/content/occasions'
import { config } from '@/lib/config'
import type { Theatre } from '@/schemas/theatre'
import type { Offer } from '@/schemas/offer'

const OCCASION_QUICK = OCCASIONS.map((o) => ({ label: o.label, slug: o.slug, emoji: o.emoji }))

const HERO_WORDS = ['Celebration', 'Birthday', 'Anniversary', 'Proposal', 'Date Night', 'Movie Night', 'Sports Night']

const CEL_ROW1 = [
  { slug: 'birthday',    label: 'Birthday',    sub: 'Celebrate',  img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&q=80', overlay: 'from-[#a855f7]/80' },
  { slug: 'anniversary', label: 'Anniversary', sub: 'Book for',   img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80', overlay: 'from-[#ec4899]/80' },
  { slug: 'date-night',  label: 'Date Night',  sub: 'Book for',   img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', overlay: 'from-[#7c3aed]/80' },
  { slug: 'proposal',    label: 'Proposal',    sub: 'Book for',   img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80', overlay: 'from-[#db2777]/80' },
]
const CEL_ROW2 = [
  { slug: 'family',           label: 'Family',           sub: 'Book for', img: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=600&q=80', overlay: 'from-[#f97316]/80' },
  { slug: 'friends',          label: 'Friends',          sub: 'Book for', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', overlay: 'from-[#6366f1]/80' },
  { slug: 'sports-screening', label: 'Sports Screening', sub: 'Book for', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80', overlay: 'from-[#0ea5e9]/80' },
  { slug: 'corporate',        label: 'Corporate',        sub: 'Book for', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', overlay: 'from-[#334155]/80' },
]

const GUEST_STORIES = [
  { id: '1', name: 'Priya & Rohit', avatar: 'P', role: 'Anniversary Couple', rating: 5, occasion: 'Anniversary', theatre: 'The Delight', text: 'We booked The Delight for our 5th anniversary and it was absolutely magical. Rose petals, fairy lights, a custom "5 Years" banner — when my husband walked in, he was in tears. Best anniversary ever!', date: 'Oct 2024' },
  { id: '2', name: 'Karthik S.', avatar: 'K', role: 'Birthday Planner', rating: 5, occasion: 'Birthday Surprise', theatre: 'Heavens', text: 'BOB Talkies made it effortless. Balloons, a photo wall, the cake — everything. When she walked in and saw 12 friends sitting there, she burst out crying. I\'ve never seen her so happy.', date: 'Sep 2024' },
  { id: '3', name: 'Meera & Arjun', avatar: 'M', role: 'Engaged Couple', rating: 5, occasion: 'Proposal', theatre: 'The Delight', text: 'I proposed here and she said YES! Roses, candles, our favourite song playing — the entire theatre was ours. The team kept me calm and made the moment absolutely perfect.', date: 'Aug 2024' },
  { id: '4', name: 'Vikram & Team', avatar: 'V', role: 'Team Organiser', rating: 5, occasion: 'Farewell', theatre: 'Filmdom', text: 'An unforgettable farewell! We played a surprise video compilation on the big screen — there wasn\'t a dry eye in the room. The décor was elegant and staff made everything flawless.', date: 'Nov 2024' },
  { id: '5', name: 'Rahul M.', avatar: 'R', role: 'Sports Fan', rating: 5, occasion: 'Sports Screening', theatre: 'Cosmos', text: 'Watched the IPL final with 20 friends at Cosmos — absolute blast! The 250" screen and Atmos surround made every boundary feel like we were in the stadium. BOB Talkies totally nailed it.', date: 'May 2024' },
  { id: '6', name: 'Divya & Suresh', avatar: 'D', role: 'Date Night Couple', rating: 5, occasion: 'Date Night', theatre: 'The Delight', text: 'Intimate, romantic, absolutely perfect. Champagne, comfort food, recliners, and a surprise message on screen before the movie. The team thought of everything. Pure bliss!', date: 'Dec 2024' },
]

export default function HomePage() {
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
  const [storyIndex, setStoryIndex] = useState(0)
  const storyTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const offersScrollRef = useRef<HTMLDivElement>(null)
  const [offersActiveIndex, setOffersActiveIndex] = useState(0)
  const celRow1Ref = useRef<HTMLDivElement>(null)
  const celRow2Ref = useRef<HTMLDivElement>(null)

  // Section scroll-reveal refs
  const offersRevealRef = useRef(null)
  const offersInView = useInView(offersRevealRef, { once: true, margin: '-80px' })
  const celRevealRef = useRef(null)
  const celInView = useInView(celRevealRef, { once: true, margin: '-80px' })
  const reviewsRevealRef = useRef(null)
  const reviewsInView = useInView(reviewsRevealRef, { once: true, margin: '-80px' })
  const expRevealRef = useRef(null)
  const expInView = useInView(expRevealRef, { once: true, margin: '-80px' })
  const locationRevealRef = useRef(null)
  const locationInView = useInView(locationRevealRef, { once: true, margin: '-80px' })
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
      function step() {
        if (!initialized) {
          if (dir === -1) node.scrollLeft = node.scrollWidth / 3
          initialized = true
        }
        if (!paused) {
          node.scrollLeft += 0.55 * dir
          if (dir === 1 && node.scrollLeft >= node.scrollWidth / 3) node.scrollLeft = 0
          if (dir === -1 && node.scrollLeft <= 0) node.scrollLeft = node.scrollWidth / 3
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

  const { data: theatres, isLoading: theatresLoading } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: offerKeys.list(),
    queryFn: () => api.get<Offer[]>('/offers'),
  })

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

  function resetTimer() {
    if (storyTimer.current) clearInterval(storyTimer.current)
    storyTimer.current = setInterval(() => {
      setStoryIndex((i) => (i + 1) % GUEST_STORIES.length)
    }, 5000)
  }

  useEffect(() => {
    resetTimer()
    return () => { if (storyTimer.current) clearInterval(storyTimer.current) }
  }, [])

  function prevStory() {
    setStoryIndex((i) => (i - 1 + GUEST_STORIES.length) % GUEST_STORIES.length)
    resetTimer()
  }

  function nextStory() {
    setStoryIndex((i) => (i + 1) % GUEST_STORIES.length)
    resetTimer()
  }

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

  const visibleStories = [
    GUEST_STORIES[storyIndex],
    GUEST_STORIES[(storyIndex + 1) % GUEST_STORIES.length],
    GUEST_STORIES[(storyIndex + 2) % GUEST_STORIES.length],
  ]

  return (
    <>
      <Seo
        title="BOB Talkies — Premium Private Theatre in Hyderabad"
        description="Book a private theatre in Hyderabad for birthdays, anniversaries, proposals, date nights and all celebrations. 4K projection, Dolby Atmos, in-house decoration and photography. Book online in minutes."
        canonical="/"
      />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video
          className="hidden"
          autoPlay muted loop playsInline
          poster="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600"
          aria-hidden="true"
        >
          <source src="" type="video/mp4" />
        </video>
        <div className="film-grain absolute inset-0 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 w-full min-w-0 text-center px-4 max-w-5xl mx-auto pt-24">
          <Badge variant="gold" className="mb-6 !border-0 !text-sm md:!text-lg !font-medium !text-gold-600 px-4 py-1.5 md:px-5 md:py-2 font-['Jost',sans-serif]">
            <Sparkles size={12} />
            Hyderabad's #1 Private Celebrations Venue
          </Badge>
          <h1 className="mb-8 font-display text-3xl font-bold leading-tight tracking-tight text-[#2a0e4f] sm:text-4xl md:text-5xl lg:text-6xl">
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
            <span className="block">
              <span className="text-[#2a0e4f]">Your Theatre</span>
              <span className="text-[#8e39c7]"> Your Memories</span>
            </span>
          </h1>

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
              <div className="flex w-full items-center rounded-full bg-[linear-gradient(180deg,#fffefd_0%,#fcf5ee_100%)] pl-2 pr-[10px] shadow-[inset_0_2px_6px_rgba(255,255,255,0.9),inset_0_-2px_6px_rgba(201,168,76,0.10)]">

                {/* Occasion */}
                <div className="min-w-0 flex-1">
                  <PartySelect
                    id="plan-occasion"
                    value={selectedOccasion}
                    onValueChange={setSelectedOccasion}
                    placeholder="Select Occasion"
                    label="Occasion"
                    icon={<Clapperboard size={28} strokeWidth={1.6} className="text-[#3b1278]" />}
                    options={OCCASION_QUICK.map((o) => ({ value: o.slug, label: o.label }))}
                    className="h-[80px] rounded-full border-0 bg-transparent pl-16 pr-10 text-[#3b1278] transition-colors hover:bg-white/50"
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
                    icon={<Users size={28} strokeWidth={1.6} className="text-[#3b1278]" />}
                    className="h-[80px] rounded-full border-0 bg-transparent pl-16 pr-4 text-[#3b1278] transition-colors hover:bg-white/50"
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
                    icon={<CalendarDays size={28} strokeWidth={1.6} className="text-[#3b1278]" />}
                    className="h-[80px] rounded-full border-0 bg-transparent pl-16 pr-10 text-[#3b1278] transition-colors hover:bg-white/50"
                  />
                </div>

                <div className="h-12 w-px shrink-0 bg-[#e6d9c6]" />

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleQuickBook}
                  disabled={!selectedOccasion || !date}
                  className="ml-2 flex h-[56px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full
                    bg-[linear-gradient(135deg,#3b1278_0%,#5b1fa3_100%)] px-6 text-[15px] font-semibold text-white
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_18px_rgba(59,18,120,0.35)]
                    transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Book Your Theatre <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Mobile: stacked card */}
            <div className={`md:hidden relative rounded-[2rem] bg-[linear-gradient(135deg,#8e39c7,#f472b6_50%,#f5bd61)] p-[2px] shadow-[0_24px_60px_rgba(107,35,152,0.22)] ${planHighlight ? 'animate-plan-pulse' : ''}`}>
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
                    className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#2a0e4f] px-7 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(42,14,79,0.30)] transition-all hover:bg-[#3d1575] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Book Your Theatre <ChevronRight size={18} />
                  </button>
                </div>
                {(!selectedOccasion || !date) && (
                  <p className="mt-3 text-xs text-[#7d7094]">Choose an occasion and a date to see available theatres.</p>
                )}
              </div>
            </div>
          </div>

          <TheatreStrip theatres={theatres ?? []} />
        </div>
      </section>

      <FeaturedTheatres />

      {/* Live Offers */}
      {(offersLoading || (offers && offers.length > 0)) && (
        <Section bg="base" className="relative overflow-hidden">
          {/* ── Celebration background ── */}
          {/* Floating balloons */}
          {[
            { left: '5%',  color: '#f472b6', w: 22, h: 28, delay: 0,   dur: 7 },
            { left: '15%', color: '#c9a84c', w: 18, h: 24, delay: 1.5, dur: 8 },
            { left: '30%', color: '#a78bfa', w: 20, h: 26, delay: 3,   dur: 6.5 },
            { left: '55%', color: '#fb923c', w: 16, h: 22, delay: 0.8, dur: 7.5 },
            { left: '70%', color: '#f472b6', w: 22, h: 28, delay: 2.2, dur: 7 },
            { left: '82%', color: '#c9a84c', w: 18, h: 24, delay: 4,   dur: 6 },
            { left: '92%', color: '#a78bfa', w: 20, h: 26, delay: 1,   dur: 8.5 },
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
            { left: '20%', top: '65%', color: '#a78bfa', w: 10, h: 3,  delay: 1.1, dur: 3.8, rot: -35 },
            { left: '38%', top: '20%', color: '#f472b6', w: 7,  h: 3,  delay: 2.3, dur: 5,   rot: 50  },
            { left: '52%', top: '75%', color: '#34d399', w: 9,  h: 3,  delay: 0.6, dur: 4.2, rot: -20 },
            { left: '65%', top: '15%', color: '#fbbf24', w: 8,  h: 3,  delay: 1.8, dur: 3.6, rot: 40  },
            { left: '78%', top: '55%', color: '#f472b6', w: 10, h: 3,  delay: 3,   dur: 4.8, rot: -55 },
            { left: '88%', top: '25%', color: '#a78bfa', w: 7,  h: 3,  delay: 0.4, dur: 5.2, rot: 15  },
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
            { cx: '50%', cy: '5%',  color: '#a78bfa' },
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
                  <Clapperboard size={28} className="text-[#6b2398]" strokeWidth={1.8} />
                  <Sparkles size={11} className="text-[#d4a94a] absolute -top-1.5 -right-1.5" />
                </div>
                <p className="font-cursive text-2xl md:text-3xl text-[#c9933a]">Limited Time</p>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
                <span className="text-[#2a0e4f]">Current </span>
                <span className="text-[#7c3aed]">Offers</span>
              </h2>
              <div className="mt-2 h-[3px] w-10 rounded-full bg-[#d4a94a]" />
            </div>
            <Link
              to="/offers"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-[#32105f]/50 px-4 py-2 text-xs font-semibold text-[#32105f] hover:bg-[#32105f]/5 transition-colors mt-1"
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
      )}

      {/* Our Theatres */}
  

      {/* Choose Your Celebration */}
      <Section bg="base" className="bg-[#fffaf4]">
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
              <PartyPopper size={26} className="text-[#6b2398]" strokeWidth={1.8} />
              <Sparkles size={10} className="text-[#d4a94a] absolute -top-1.5 -right-1.5" />
            </motion.div>
            <p className="font-cursive text-2xl md:text-3xl text-[#c9933a]">Every Occasion</p>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
            <span className="text-[#2a0e4f]">Choose Your </span>
            <span className="text-[#7c3aed]">Celebration</span>
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
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-[#2a0e4f] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow">
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
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-[#2a0e4f] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow">
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

      {/* Guest Stories — Fan Carousel */}
      <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #fdf5e8 0%, #fffaf4 55%, #fdf5e8 100%)' }}>
        <style>{`
          @keyframes floatEmoji {
            0%   { transform: translateY(0px) rotate(0deg) scale(1); opacity: 0; }
            10%  { opacity: 1; }
            80%  { opacity: 0.8; }
            100% { transform: translateY(-120px) rotate(20deg) scale(0.6); opacity: 0; }
          }
          @keyframes glowPulse {
            0%, 100% { opacity: 0.55; transform: scale(1); }
            50%       { opacity: 0.85; transform: scale(1.08); }
          }
          @keyframes glowRing {
            0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.0), 0 0 60px 20px rgba(201,168,76,0.18); }
            50%       { box-shadow: 0 0 0 8px rgba(201,168,76,0.08), 0 0 80px 30px rgba(201,168,76,0.28); }
          }
        `}</style>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[#c9a84c]/7 blur-3xl" />
          {/* Ambient glow orbs */}
          <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-[#c9a84c]/10 blur-3xl" style={{ animation: 'glowPulse 4s ease-in-out infinite' }} />
          <div className="absolute bottom-1/4 right-1/3 w-56 h-56 rounded-full bg-[#8b5cf6]/8 blur-3xl" style={{ animation: 'glowPulse 5s ease-in-out infinite 1.5s' }} />
          {/* Floating emoji particles */}
          {(['🎉','🌟','❤️','🥳','🎊','⭐','✨','💫'] as const).map((emoji, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${8 + i * 12}%`,
              bottom: `${10 + (i % 3) * 15}%`,
              fontSize: i % 2 === 0 ? '20px' : '16px',
              animation: `floatEmoji ${3.5 + i * 0.6}s ease-in-out ${i * 0.8}s infinite`,
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              {emoji}
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">

          {/* Header */}
          <div ref={reviewsRevealRef} className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={reviewsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[#c9a84c] text-xs font-bold uppercase tracking-[0.22em] mb-1.5">Real Stories</p>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-black text-[#2a0e4f] leading-tight">What Our Guests Lived</h2>
              <motion.div
                className="mt-2 h-[3px] rounded-full bg-gradient-to-r from-[#c9a84c] to-[#eed98a]"
                initial={{ width: 0 }}
                animate={reviewsInView ? { width: 40 } : {}}
                transition={{ delay: 0.35, duration: 0.5 }}
              />
            </motion.div>
            {/* Rating badge */}
            <motion.div
              className="flex items-center gap-3 bg-white border border-[#f0e6cc] rounded-2xl px-5 py-3 shadow-sm shrink-0"
              initial={{ opacity: 0, scale: 0.75, x: 20 }}
              animate={reviewsInView ? { opacity: 1, scale: 1, x: 0 } : {}}
              transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 18 }}
            >
              <span className="font-display text-4xl font-black text-[#c9a84c] leading-none">4.9</span>
              <div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= 4 ? '#c9a84c' : 'none'} stroke="#c9a84c" strokeWidth="1.5">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
                <p className="text-[11px] text-[#5b4578]/50 mt-0.5">847+ Google reviews</p>
              </div>
            </motion.div>
          </div>

          {/* Fan carousel */}
          <div className="relative flex items-center">
            <button onClick={prevStory}
              className="relative z-20 shrink-0 w-10 h-10 rounded-full bg-white border border-[#f0e6cc] shadow-md hover:border-[#c9a84c] hover:text-[#c9a84c] text-[#5b4578]/50 flex items-center justify-center transition-all"
              aria-label="Previous">
              <ChevronLeft size={18} />
            </button>

            {/* Cards stage */}
            <div className="relative flex-1 h-[320px] sm:h-[290px] md:h-[260px] overflow-hidden mx-1 sm:mx-2">
              {GUEST_STORIES.map((story, i) => {
                let pos = i - storyIndex
                if (pos > GUEST_STORIES.length / 2) pos -= GUEST_STORIES.length
                if (pos < -GUEST_STORIES.length / 2) pos += GUEST_STORIES.length
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
                if (Math.abs(pos) > (isMobile ? 1 : 2)) return null
                const isCenter = pos === 0
                const absPos = Math.abs(pos)
                const scale = isCenter ? 1 : absPos === 1 ? 0.86 : 0.72
                const opacity = isCenter ? 1 : absPos === 1 ? 0.78 : 0.45
                const zIndex = isCenter ? 10 : absPos === 1 ? 6 : 3
                const spread = isMobile ? 44 : 48
                return (
                  <motion.div
                    key={story.id}
                    animate={{
                      x: `calc(-50% + ${pos * spread}%)`,
                      scale,
                      rotate: pos * -4,
                      opacity,
                      zIndex,
                    }}
                    transition={{ type: 'spring', stiffness: 240, damping: 28 }}
                    style={{ position: 'absolute', left: '50%', top: 0, width: '100%', maxWidth: 440, cursor: !isCenter ? 'pointer' : 'default' }}
                    onClick={() => { if (!isCenter) { pos < 0 ? prevStory() : nextStory() } }}
                  >
                    <div className={`bg-white rounded-3xl p-5 md:p-6 h-full transition-shadow duration-300 ${
                      isCenter
                        ? 'border-2 border-[#c9a84c]'
                        : absPos === 1
                        ? 'border border-[#f0e6cc] shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
                        : 'border border-[#f5efe3] shadow-sm'
                    }`} style={isCenter ? { animation: 'glowRing 2.8s ease-in-out infinite' } : undefined}>
                      {/* Top: avatar + name + stars */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center font-bold text-base border-2 ${isCenter ? 'bg-[#c9a84c] text-white border-[#c9a84c]' : 'bg-[#f9f4ec] text-[#c9a84c] border-[#f0e6cc]'}`}>
                          {story.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#2a0e4f] text-sm truncate">{story.name}</p>
                          <p className="text-xs text-[#5b4578]/50 truncate">{story.role}</p>
                        </div>
                        {isCenter && (
                          <div className="flex gap-0.5 shrink-0">
                            {Array.from({ length: 5 }).map((_, s) => (
                              <motion.svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#c9a84c" stroke="none"
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ delay: s * 0.06, type: 'spring', stiffness: 320 }}>
                                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                              </motion.svg>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Quote */}
                      <div className="relative mb-3">
                        <span className="text-[#c9a84c] font-display text-4xl leading-none absolute -top-1 -left-0.5 select-none opacity-55">"</span>
                        <p className={`pl-5 leading-relaxed italic font-light line-clamp-3 ${isCenter ? 'text-[#2a0e4f] text-[15px]' : 'text-[#5b4578]/60 text-sm'}`}>
                          {story.text}
                        </p>
                      </div>
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#f8f0e0]">
                        <span className="text-[10px] text-[#5b4578]/40 font-medium">{story.date} · {story.theatre}</span>
                        {isCenter && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#7a5500] border border-[#c9a84c]/40 bg-[#c9a84c]/10 rounded-full px-2.5 py-0.5">
                            {story.occasion}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <button onClick={nextStory}
              className="relative z-20 shrink-0 w-10 h-10 rounded-full bg-white border border-[#f0e6cc] shadow-md hover:border-[#c9a84c] hover:text-[#c9a84c] text-[#5b4578]/50 flex items-center justify-center transition-all"
              aria-label="Next">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dots + all reviews */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex gap-1.5">
              {GUEST_STORIES.map((_, i) => (
                <button key={i} onClick={() => { setStoryIndex(i); resetTimer() }}
                  className={`rounded-full transition-all duration-300 ${i === storyIndex ? 'bg-[#c9a84c] w-5 h-1.5' : 'bg-[#c9a84c]/25 w-1.5 h-1.5 hover:bg-[#c9a84c]/50'}`}
                  aria-label={`Story ${i + 1}`} />
              ))}
            </div>
            <Link to="/reviews" className="text-xs font-bold text-[#c9a84c] hover:text-[#a07830] transition-colors flex items-center gap-1">
              All Reviews <ChevronRight size={12} />
            </Link>
          </div>

        </div>
      </section>

      {/* Location */}
      <section ref={locationRevealRef} className="py-16 md:py-24 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #fdf5e8 0%, #fffaf4 55%, #fdf5e8 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#c9a84c]/8 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#8b5cf6]/8 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 28 }}
            animate={locationInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[#c9a84c] text-xs font-bold uppercase tracking-[0.28em] mb-3">Find Us</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-[#2a0e4f] leading-tight mb-4">Visit BOB Talkies</h2>
            <motion.div className="mx-auto h-[3px] rounded-full bg-gradient-to-r from-[#c9a84c] to-[#eed98a]"
              initial={{ width: 0 }} animate={locationInView ? { width: 64 } : {}} transition={{ delay: 0.3, duration: 0.5 }} />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5 md:gap-8 items-stretch">
            {/* Info panel */}
            <motion.div
              className="rounded-3xl p-5 md:p-8 flex flex-col justify-between"
              style={{ background: 'linear-gradient(135deg, #2a0e4f 0%, #32105f 60%, #4a1a8a 100%)', border: '1px solid rgba(201,168,76,0.2)' }}
              initial={{ opacity: 0, x: -40 }}
              animate={locationInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="space-y-6">
                {[
                  { icon: <MapPin size={22} className="text-[#c9a84c]" />, label: 'Address', content: <p className="text-white/60 text-sm leading-relaxed">BOB Talkies, Kukatpally,<br />Hyderabad, Telangana 500072</p> },
                  { icon: <Phone size={22} className="text-[#c9a84c]" />, label: 'Phone & WhatsApp', content: <a href={`tel:+${config.whatsappNumber}`} className="text-[#c9a84c] hover:text-[#eed98a] text-sm transition-colors">+91 {config.whatsappNumber.slice(2)}</a> },
                  { icon: <CalendarDays size={22} className="text-[#c9a84c]" />, label: 'Operating Hours', content: <><p className="text-white/60 text-sm">10:00 AM – 1:00 AM</p><p className="text-[#c9a84c] text-xs mt-0.5 font-semibold">Open 365 Days</p></> },
                ].map((item, i) => (
                  <motion.div key={item.label} className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={locationInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.45 }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(201,168,76,0.18)', boxShadow: '0 0 20px rgba(201,168,76,0.22)' }}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-white mb-1">{item.label}</p>
                      {item.content}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/book">Book a Theatre</Link>
                </Button>
                <Button asChild variant="whatsapp" size="lg" className="w-full sm:w-auto">
                  <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Map */}
            <motion.div
              className="rounded-3xl overflow-hidden relative h-72 md:h-auto"
              style={{ border: '1px solid rgba(201,168,76,0.25)', minHeight: 320 }}
              initial={{ opacity: 0, x: 40 }}
              animate={locationInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <iframe
                title="BOB Talkies Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30449.63!2d78.3980!3d17.4849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688381b30a1!2sKukatpally%2C+Hyderabad!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

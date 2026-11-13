import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Rating } from '@/components/ui/Rating'
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
  {
    id: '1',
    name: 'Priya & Rohit',
    avatar: 'P',
    rating: 5,
    occasion: 'Anniversary',
    theatre: 'The Delight',
    text: 'We booked The Delight for our 5th anniversary and it was absolutely magical. The team had decorated with rose petals, fairy lights, and even a custom "5 Years" banner. When my husband walked in, he was in tears. The screen was huge, the sound was incredible, and we had the whole place to ourselves. Best anniversary ever!',
    date: 'October 2024',
  },
  {
    id: '2',
    name: 'Karthik S.',
    avatar: 'K',
    rating: 5,
    occasion: 'Birthday Surprise',
    theatre: 'Heavens',
    text: 'Planned a birthday surprise for my best friend and BOB Talkies made it effortless. I described what I wanted over WhatsApp and they handled EVERYTHING — balloons, a photo wall with our old pictures, the cake, everything. When she walked in and saw 12 of her friends sitting there, she burst out crying. I\'ve never seen her so happy.',
    date: 'September 2024',
  },
  {
    id: '3',
    name: 'Meera & Arjun',
    avatar: 'M',
    rating: 5,
    occasion: 'Proposal',
    theatre: 'The Delight',
    text: 'I proposed here and she said YES! I was so nervous but the team at BOB Talkies kept me calm. They set up a beautiful arrangement with roses and candles, played our favourite song before I got down on one knee. The entire theatre was ours, completely private. I could not have asked for a better moment.',
    date: 'August 2024',
  },
  {
    id: '4',
    name: 'Vikram & Team',
    avatar: 'V',
    rating: 5,
    occasion: 'Farewell',
    theatre: 'Filmdom',
    text: 'Organised a farewell for our manager at Filmdom and the entire team was blown away. We played a surprise video compilation of his 8 years with us on the big screen — there wasn\'t a dry eye in the room. The décor was elegant, the food was great and the staff made sure everything ran perfectly. It was the best send-off we could have given him.',
    date: 'November 2024',
  },
  {
    id: '5',
    name: 'Rahul M.',
    avatar: 'R',
    rating: 5,
    occasion: 'Sports Screening',
    theatre: 'Cosmos',
    text: 'Watched the IPL final with 20 friends at Cosmos and it was an absolute blast. The 250" screen and Atmos surround made every boundary feel like we were in the stadium. No rowdy strangers, no queue for the bar — just us, our snacks and the best cricket experience of our lives. BOB Talkies totally nailed it.',
    date: 'May 2024',
  },
  {
    id: '6',
    name: 'Divya & Suresh',
    avatar: 'D',
    rating: 5,
    occasion: 'Date Night',
    theatre: 'The Delight',
    text: 'Celebrated our first date anniversary here. It was intimate, romantic, and absolutely perfect. We had champagne, our favourite comfort food, and watched a movie cuddled up in those amazing recliners. The team even added a small surprise message on screen before the movie. Pure bliss!',
    date: 'December 2024',
  },
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
    if (!el) return
    let frameId: number
    let paused = false
    let prevIdx = -1
    const cardW = 336
    function step() {
      if (!paused && el) {
        el.scrollLeft += 0.3
        const idx = Math.round(el.scrollLeft / cardW) % Math.max(offers?.length ?? 1, 1)
        if (idx !== prevIdx) { prevIdx = idx; setOffersActiveIndex(idx) }
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) el.scrollLeft = 0
      }
      frameId = requestAnimationFrame(step)
    }
    const pause = () => { paused = true }
    const resume = () => { paused = false }
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)
    el.addEventListener('touchstart', pause, { passive: true })
    el.addEventListener('touchend', resume)
    const startId = setTimeout(() => { frameId = requestAnimationFrame(step) }, 2500)
    return () => {
      clearTimeout(startId)
      cancelAnimationFrame(frameId)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
      el.removeEventListener('touchstart', pause)
      el.removeEventListener('touchend', resume)
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

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-24">
          <Badge variant="gold" className="mb-6 !border-0 !text-lg md:!text-xl !font-medium !text-gold-600 px-5 py-2 font-['Jost',sans-serif]">
            <Sparkles size={12} />
            Hyderabad's #1 Private Celebrations Venue
          </Badge>
          <h1 className="mb-8 font-display text-4xl font-bold leading-tight tracking-tight text-[#2a0e4f] sm:text-5xl md:text-6xl">
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

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="relative">
                  <Clapperboard size={28} className="text-[#6b2398]" strokeWidth={1.8} />
                  <Sparkles size={11} className="text-[#d4a94a] absolute -top-1.5 -right-1.5" />
                </div>
                <p className="font-cursive text-2xl md:text-3xl text-[#c9933a]">Limited Time</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-black leading-tight">
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
          </div>

          <div ref={offersScrollRef} className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden">
            {offersLoading
              ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="w-[320px] h-44 shrink-0" rounded="lg" />)
              : offers?.map((offer, i) => (
                  <div key={offer.id} className="w-[320px] sm:w-[360px] shrink-0 snap-start">
                    <OfferTicket offer={offer} index={i} />
                  </div>
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


      {/* Choose Your Celebration */}
      <Section bg="base">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14">
          <div className="flex items-center gap-2 mb-1">
            <div className="relative">
              <PartyPopper size={26} className="text-[#6b2398]" strokeWidth={1.8} />
              <Sparkles size={10} className="text-[#d4a94a] absolute -top-1.5 -right-1.5" />
            </div>
            <p className="font-cursive text-2xl md:text-3xl text-[#c9933a]">Every Occasion</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-black leading-tight">
            <span className="text-[#2a0e4f]">Choose Your </span>
            <span className="text-[#7c3aed]">Celebration</span>
          </h2>
          <div className="mt-2 h-[3px] w-10 rounded-full bg-[#d4a94a]" />
        </div>

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

      {/* Guest Stories Slider */}
      <Section bg="navy">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-gold-500 text-xs font-semibold uppercase tracking-widest mb-1">Real Stories</p>
            <h2 className="font-display text-3xl md:text-4xl text-text-primary leading-tight">What Our Guests Lived</h2>
          </div>
          <div className="flex items-center gap-3 shrink-0 bg-bg-surface/60 border border-border-subtle rounded-2xl px-4 py-3">
            <span className="font-display text-4xl text-gold-400 font-bold leading-none">4.9</span>
            <div>
              <Rating value={4.9} size="sm" />
              <p className="text-xs text-text-muted mt-0.5">847+ Google reviews</p>
            </div>
          </div>
        </div>

        {/* Spotlight layout */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* Featured story */}
          <div className="lg:col-span-2">
            {/* Progress strips */}
            <div className="flex gap-1.5 mb-5">
              {GUEST_STORIES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setStoryIndex(i); resetTimer() }}
                  aria-label={`Story ${i + 1}`}
                  className="flex-1 h-[3px] rounded-full bg-border-subtle overflow-hidden relative"
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gold-400"
                    animate={{ width: i === storyIndex ? '100%' : i < storyIndex ? '100%' : '0%' }}
                    transition={i === storyIndex ? { duration: 5, ease: 'linear' } : { duration: 0.2 }}
                  />
                </button>
              ))}
            </div>

            {/* Story card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={storyIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-bg-surface border border-border-subtle rounded-3xl p-7 md:p-9 relative overflow-hidden"
              >
                {/* Decorative quote mark */}
                <span className="absolute top-5 right-7 font-display text-[96px] leading-none text-gold-500/10 select-none pointer-events-none" aria-hidden>"</span>

                <p className="text-text-primary text-lg md:text-xl leading-relaxed italic font-light mb-7">
                  "{GUEST_STORIES[storyIndex].text}"
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500/30 to-gold-500/10 border border-gold-500/30 flex items-center justify-center font-bold text-gold-400 text-lg">
                      {GUEST_STORIES[storyIndex].avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{GUEST_STORIES[storyIndex].name}</p>
                      <p className="text-xs text-text-muted">{GUEST_STORIES[storyIndex].theatre} · {GUEST_STORIES[storyIndex].date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Rating value={GUEST_STORIES[storyIndex].rating} size="sm" />
                    <span className="text-xs font-semibold text-gold-500 border border-gold-500/30 bg-gold-500/10 rounded-full px-3 py-1">
                      {GUEST_STORIES[storyIndex].occasion}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next */}
            <div className="flex items-center gap-3 mt-4">
              <button onClick={prevStory} className="w-9 h-9 rounded-full border border-border-subtle bg-bg-surface hover:border-gold-500 hover:text-gold-400 text-text-muted flex items-center justify-center transition-all" aria-label="Previous"><ChevronLeft size={16} /></button>
              <button onClick={nextStory} className="w-9 h-9 rounded-full border border-border-subtle bg-bg-surface hover:border-gold-500 hover:text-gold-400 text-text-muted flex items-center justify-center transition-all" aria-label="Next"><ChevronRight size={16} /></button>
              <Link to="/reviews" className="ml-auto text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1">
                All Reviews <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* Reviewer roster — all stories visible, tap to switch */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
            {GUEST_STORIES.map((story, i) => (
              <button
                key={story.id}
                type="button"
                onClick={() => { setStoryIndex(i); resetTimer() }}
                className={`group relative flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 ${
                  i === storyIndex
                    ? 'border-gold-500/60 bg-gold-500/8 shadow-[0_0_16px_rgba(201,168,76,0.15)]'
                    : 'border-border-subtle bg-bg-surface/50 hover:border-gold-500/30 hover:bg-bg-surface'
                }`}
              >
                {/* Active glow ring */}
                {i === storyIndex && (
                  <motion.div layoutId="roster-ring" className="absolute inset-0 rounded-2xl border-2 border-gold-500/50 pointer-events-none" transition={{ duration: 0.3 }} />
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base mb-2 transition-all ${i === storyIndex ? 'bg-gold-500 text-bg-base' : 'bg-bg-elevated text-gold-400 border border-border-subtle'}`}>
                  {story.avatar}
                </div>
                <p className="text-xs font-semibold text-text-primary leading-tight mb-1">{story.name}</p>
                <p className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${i === storyIndex ? 'bg-gold-500/20 text-gold-400' : 'bg-bg-elevated text-text-muted'}`}>
                  {story.occasion}
                </p>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* The Experience */}
      <Section bg="surface">
        <SectionHeader eyebrow="The BOB Experience" title="More Than a Movie" centered />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Tv size={24} />, title: 'Private 4K Cinema', desc: 'Your own massive screen, no strangers.' },
            { icon: <Sparkles size={24} />, title: 'Premium Decoration', desc: 'Florals, LED boards, cold fire entry.' },
            { icon: <Cake size={24} />, title: 'Custom Cakes', desc: 'Freshly baked for your occasion.' },
            { icon: <Camera size={24} />, title: 'Photography', desc: 'Every smile, every surprise, captured.' },
            { icon: <Music size={24} />, title: 'Dolby Atmos', desc: 'Immersive surround sound.' },
            { icon: <Shield size={24} />, title: 'Complete Privacy', desc: 'Your space, fully secured.' },
            { icon: <Users size={24} />, title: 'Groups 2–40', desc: 'Intimate or grand — we have it.' },
            { icon: <Star size={24} />, title: '4.9★ Rated', desc: '847+ happy celebrations hosted.' },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center p-5 rounded-card bg-bg-elevated border border-border-subtle hover:border-gold-500/30 transition-colors group">
              <div className="text-gold-500 mb-3 group-hover:scale-110 transition-transform duration-200">{f.icon}</div>
              <h3 className="font-semibold text-text-primary text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Location */}
      <Section bg="base">
        <SectionHeader eyebrow="Find Us" title="Visit BOB Talkies" centered />
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-gold-400" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary mb-0.5">Address</p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    BOB Talkies, Kukatpally,<br />Hyderabad, Telangana 500072
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-gold-400" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary mb-0.5">Phone & WhatsApp</p>
                  <a href={`tel:+${config.whatsappNumber}`} className="text-gold-400 hover:text-gold-500 text-sm">
                    +91 {config.whatsappNumber.slice(2)}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-gold-400 text-xs font-bold">hrs</span>
                </div>
                <div>
                  <p className="font-semibold text-text-primary mb-0.5">Operating Hours</p>
                  <p className="text-text-secondary text-sm">10:00 AM – 1:00 AM · 365 Days</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button asChild size="lg">
                <Link to="/book">Book a Theatre</Link>
              </Button>
              <Button asChild variant="whatsapp" size="lg">
                <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
          <div className="rounded-card overflow-hidden border border-border-subtle h-72">
            <iframe
              title="BOB Talkies Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30449.63!2d78.3980!3d17.4849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688381b30a1!2sKukatpally%2C+Hyderabad!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Section>
    </>
  )
}

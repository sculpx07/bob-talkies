import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Star, MapPin, Phone, MessageCircle, Sparkles, PartyPopper, CalendarDays, Camera, Cake, Music, Users, Tv, Shield, ChevronLeft, Clapperboard, ArrowRight } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
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

  const [heroWordIndex, setHeroWordIndex] = useState(0)
  const [heroKey, setHeroKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroWordIndex((i) => (i + 1) % HERO_WORDS.length)
      setHeroKey((k) => k + 1)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const { data: theatres, isLoading: theatresLoading } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: offerKeys.list(),
    queryFn: () => api.get<Offer[]>('/offers'),
  })

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
        <Section bg="base">
          <SectionHeader
            eyebrow="Limited Time"
            eyebrowClassName="font-cursive normal-case tracking-normal text-3xl md:text-4xl font-semibold text-[#6b2398]"
            title="Current Offers"
            titleClassName="text-4xl md:text-5xl font-bold"
            subtitle="Exclusive deals for your next celebration."
            centered
          />
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            {offersLoading
              ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-52" rounded="lg" />)
              : offers?.map((offer, i) => <OfferTicket key={offer.id} offer={offer} index={i} />)}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 rounded-full border border-[#32105f]/50 px-6 py-2.5 text-sm font-semibold text-[#32105f]"
            >
              View All Offers <ChevronRight size={16} />
            </Link>
          </div>
        </Section>
      )}

      {/* Our Theatres */}
      <Section bg="surface">
        <SectionHeader
          eyebrow="5 Premium Theatres"
          title="Explore Our Theatres"
          subtitle="Every theatre is a world of its own — pick the one that matches your celebration."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {theatresLoading
            ? Array.from({ length: 3 }, (_, i) => <TheatreCardSkeleton key={i} />)
            : theatres?.slice(0, 3).map((theatre) => (
                <Card key={theatre.id} hover className="flex flex-col overflow-hidden">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={theatre.images[0]}
                      alt={`${theatre.name} private theatre`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 to-transparent" />
                    {theatre.currentOffer && (
                      <Badge variant="crimson" className="absolute top-3 right-3">Offer</Badge>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded-pill">
                        {theatre.capacityMin}–{theatre.capacityMax} guests
                      </span>
                      <PriceTag paise={theatre.startingPricePaise} className="text-white text-xs" />
                    </div>
                  </div>
                  <CardBody className="flex-1 flex flex-col">
                    <h3 className="font-display text-xl text-text-primary mb-1">{theatre.name}</h3>
                    <p className="text-sm text-text-secondary mb-3 flex-1 line-clamp-2">{theatre.tagline}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Badge variant="muted">{theatre.resolution}</Badge>
                      <Badge variant="muted">{theatre.soundSystem.split(' ').slice(0, 2).join(' ')}</Badge>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button asChild variant="secondary" size="sm" className="flex-1">
                        <Link to={`/theatres/${theatre.slug}`}>View</Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1">
                        <Link to={`/book?theatre=${theatre.id}`}>Book Now</Link>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="secondary" size="lg">
            <Link to="/theatres">View All Theatres <ChevronRight size={18} /></Link>
          </Button>
        </div>
      </Section>

      {/* Choose Your Celebration */}
      <Section bg="base">
        <SectionHeader eyebrow="Every Occasion" title="Choose Your Celebration" centered />
        {(() => {
          const cards = [
            { slug: 'birthday',         label: 'Birthday',         emoji: '🎂', grad: 'linear-gradient(135deg,#f472b6,#a855f7)', glow: '#d946ef' },
            { slug: 'anniversary',      label: 'Anniversary',      emoji: '💑', grad: 'linear-gradient(135deg,#ef4444,#ec4899)', glow: '#f43f5e' },
            { slug: 'date-night',       label: 'Date Night',       emoji: '🌹', grad: 'linear-gradient(135deg,#7c3aed,#db2777)', glow: '#a21caf' },
            { slug: 'proposal',         label: 'Proposal',         emoji: '💍', grad: 'linear-gradient(135deg,#e879f9,#9333ea)', glow: '#d946ef' },
            { slug: 'family',           label: 'Family',           emoji: '👨‍👩‍👧‍👦', grad: 'linear-gradient(135deg,#f97316,#eab308)', glow: '#f59e0b' },
            { slug: 'friends',          label: 'Friends',          emoji: '🥳', grad: 'linear-gradient(135deg,#8b5cf6,#6366f1)', glow: '#818cf8' },
            { slug: 'sports-screening', label: 'Sports Screening', emoji: '⚽', grad: 'linear-gradient(135deg,#0ea5e9,#2563eb)', glow: '#38bdf8' },
            { slug: 'corporate',        label: 'Corporate',        emoji: '💼', grad: 'linear-gradient(135deg,#334155,#1e293b)',  glow: '#64748b' },
          ]
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
              {cards.map((c, i) => (
                <Link
                  key={c.slug}
                  to={`/celebrations/${c.slug}`}
                  className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                  style={{ background: c.grad, '--glow': c.glow, minHeight: i < 2 ? 180 : 150 } as React.CSSProperties}
                >
                  {/* subtle noise texture */}
                  <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.08]"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
                    aria-hidden="true" />
                  {/* glow on hover */}
                  <span className="pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-400 group-hover:opacity-60"
                    style={{ background: c.glow }} aria-hidden="true" />
                  {/* emoji */}
                  <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur-sm ring-1 ring-white/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 shadow-md">
                    {c.emoji}
                  </span>
                  {/* label */}
                  <div className="relative z-10 mt-auto">
                    <p className="text-[13px] font-black uppercase tracking-widest text-white/60 leading-none mb-1">{i === 0 ? 'celebrate' : 'book for'}</p>
                    <p className="text-base font-bold text-white leading-tight">{c.label}</p>
                  </div>
                  {/* arrow */}
                  <span className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-white/25">
                    <ArrowRight size={13} className="text-white" />
                  </span>
                </Link>
              ))}
            </div>
          )
        })()}
      </Section>

      {/* Guest Stories Slider */}
      <Section bg="navy">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <SectionHeader
            eyebrow="Real Stories"
            title="What Our Guests Lived"
            subtitle="Every booking is a story. Here are a few we'll never forget."
            className="mb-0"
          />
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center">
              <span className="font-display text-5xl text-gold-400 font-bold">4.9</span>
              <span className="block text-xs text-text-muted">out of 5</span>
            </div>
            <div>
              <Rating value={4.9} size="lg" />
              <p className="text-sm text-text-secondary mt-1">847+ Google reviews</p>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="relative">
          <div className="grid md:grid-cols-3 gap-5">
            {visibleStories.map((story, i) => (
              <Card
                key={story.id + i}
                className={`flex flex-col transition-all duration-300 ${i === 0 ? 'opacity-100' : i === 1 ? 'opacity-100' : 'opacity-70 hidden md:flex'}`}
              >
                <CardBody>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-gold-500/20 flex items-center justify-center font-bold text-gold-400 text-lg shrink-0">
                      {story.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{story.name}</p>
                      <p className="text-xs text-text-muted">{story.theatre} · {story.date}</p>
                    </div>
                    <Rating value={story.rating} size="sm" className="ml-auto" />
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-5 italic">"{story.text}"</p>
                  <Badge variant="gold" className="mt-4">{story.occasion}</Badge>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevStory}
              className="w-10 h-10 rounded-full border border-border-subtle bg-bg-surface hover:border-gold-500 hover:text-gold-400 text-text-muted flex items-center justify-center transition-all"
              aria-label="Previous story"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {GUEST_STORIES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setStoryIndex(i); resetTimer() }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === storyIndex ? 'bg-gold-400 w-6' : 'bg-border-subtle'}`}
                  aria-label={`Story ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextStory}
              className="w-10 h-10 rounded-full border border-border-subtle bg-bg-surface hover:border-gold-500 hover:text-gold-400 text-text-muted flex items-center justify-center transition-all"
              aria-label="Next story"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="ghost">
            <Link to="/reviews">Read All Reviews <ChevronRight size={16} /></Link>
          </Button>
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

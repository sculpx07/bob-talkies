import { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Cake,
  Clapperboard,
  Film,
  Gamepad2,
  Gem,
  Gift,
  Heart,
  Mic2,
  Music,
  PartyPopper,
  Briefcase,
  Popcorn,
  Sparkles,
  Trophy,
  Users,
  Wand2,
  Tv,
  Rocket,
  Eye,
  Flame,
  Handshake,
  Moon,
  Crown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const PERSONALISE_ROUTE = '/personalise'
const BOOK_ROUTE = '/book'

type EventItem = { label: string; slug: string; icon: LucideIcon; tag?: string }

type Category = {
  id: string
  label: string
  icon: LucideIcon
  headline: string
  sub: string
  img: string
  accent: string
  glow: string
  events: EventItem[]
}

const CATEGORIES: Category[] = [
  {
    id: 'celebrations',
    label: 'Celebrations',
    icon: Heart,
    headline: 'Make every moment unforgettable',
    sub: 'Birthdays, dates and proposals — wrapped in your own private big screen.',
    img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1200&q=80',
    accent: 'from-[#1b0838] via-[#2a0e4f]/70',
    glow: '#f472b6',
    events: [
      { label: 'Birthday Parties',  slug: 'birthday-parties',  icon: Cake,       tag: 'Most booked' },
      { label: 'Date Nights',       slug: 'date-nights',       icon: Moon },
      { label: 'Proposal Moments',  slug: 'proposal-moments',  icon: Gem,        tag: 'She said yes' },
      { label: 'Grand Gatherings',  slug: 'grand-gatherings',  icon: Crown },
    ],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Clapperboard,
    headline: 'Your screen. Your premiere.',
    sub: 'Premieres, marathons and family nights in 4K with Dolby Atmos sound.',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
    accent: 'from-[#14072b] via-[#3b1278]/70',
    glow: '#a78bfa',
    events: [
      { label: 'Movie Premieres',    slug: 'movie-premieres',    icon: Film,    tag: 'Red carpet vibes' },
      { label: 'Movie Marathons',    slug: 'movie-marathons',    icon: Popcorn },
      { label: 'Family Movie Nights',slug: 'family-movie-nights',icon: Tv },
      { label: 'Music Experiences',  slug: 'music-experiences',  icon: Music },
    ],
  },
  {
    id: 'sports',
    label: 'Sports & Fans',
    icon: Trophy,
    headline: 'Every match feels like the stadium',
    sub: 'Watch with your squad on a giant screen — cheer, shout, celebrate.',
    img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80',
    accent: 'from-[#071c33] via-[#0b3b66]/70',
    glow: '#38bdf8',
    events: [
      { label: 'Sports Nights',   slug: 'sports-nights',   icon: Trophy,   tag: 'Match day' },
      { label: 'Fan Screenings',  slug: 'fan-screenings',  icon: Flame },
      { label: 'Gaming Nights',   slug: 'gaming-nights',   icon: Gamepad2 },
    ],
  },
  {
    id: 'social',
    label: 'Social & Groups',
    icon: Users,
    headline: 'Bring the whole gang along',
    sub: 'Reunions, karaoke and vibe-filled nights with your favourite people.',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    accent: 'from-[#1e1245] via-[#4338ca]/65',
    glow: '#fb923c',
    events: [
      { label: "Friends' Reunions", slug: 'friends-reunions', icon: Users },
      { label: 'Karaoke Nights',    slug: 'karaoke-nights',   icon: Mic2,       tag: 'Sing loud' },
      { label: 'Vibe Hall Events',  slug: 'vibe-hall-events', icon: PartyPopper },
    ],
  },
  {
    id: 'corporate',
    label: 'Corporate',
    icon: Briefcase,
    headline: 'Launch it. Screen it. Own the room.',
    sub: 'Teasers, team events and private screenings with a premium feel.',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    accent: 'from-[#0f172a] via-[#334155]/70',
    glow: '#c9a84c',
    events: [
      { label: 'Corporate Events',   slug: 'corporate-events',   icon: Handshake },
      { label: 'Teaser Launches',    slug: 'teaser-launches',    icon: Rocket,   tag: 'Launch day' },
      { label: 'Private Screenings', slug: 'private-screenings', icon: Eye },
    ],
  },
]

const EASE = [0.22, 1, 0.36, 1] as const

const SPARKS = [
  { left: '12%', top: '18%', size: 14, delay: 0 },
  { left: '82%', top: '14%', size: 10, delay: 0.8 },
  { left: '70%', top: '42%', size: 16, delay: 1.6 },
  { left: '20%', top: '48%', size: 9,  delay: 2.2 },
  { left: '90%', top: '66%', size: 12, delay: 1.1 },
]

export function ExperienceCategories() {
  const [activeId, setActiveId] = useState(CATEGORIES[0].id)
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-80px' })
  const reduce = useReducedMotion()

  const active = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0]

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#fffaf4] py-10 font-['Jost',sans-serif] md:py-14"
    >
      {/* Ambient glow that follows the active tab */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full blur-3xl"
        animate={{ backgroundColor: active.glow, opacity: 0.12 }}
        transition={{ duration: 0.8 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(#d4a94a33 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'linear-gradient(to bottom, black, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">

        {/* Heading */}
        <motion.div
          className="mb-10 text-center md:mb-12"
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="mb-1 flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-[#d4a94a]" />
            <p className="font-cursive text-2xl text-[#c9933a] md:text-3xl">Every Experience</p>
            <Sparkles size={16} className="text-[#d4a94a]" />
          </div>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-[#2a0e4f] md:text-5xl">
            One Theatre.{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#6b2398] via-[#a855f7] to-[#d4a94a] bg-clip-text text-transparent">
                Endless Possibilities.
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-[#d4a94a]"
                initial={{ width: 0 }}
                animate={inView ? { width: '100%' } : {}}
                transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
              />
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#5b4578] md:text-base">
            Not just a place to watch movies. A space to celebrate, cheer, connect and create
            unforgettable experiences.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="-mx-4 mb-8 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden md:mb-10 md:overflow-visible"
          style={{ scrollbarWidth: 'none' }}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
        >
          <div
            role="tablist"
            aria-label="Experience categories"
            className="mx-auto flex w-max items-center gap-2 rounded-full border border-[#e9dcc4] bg-white/70 p-1.5 shadow-[0_8px_30px_rgba(107,35,152,0.08)] backdrop-blur"
          >
            {CATEGORIES.map((c) => {
              const isActive = c.id === activeId
              const Icon = c.icon
              return (
                <button
                  key={c.id}
                  role="tab"
                  type="button"
                  aria-selected={isActive}
                  onClick={() => setActiveId(c.id)}
                  className={`relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors md:px-5 ${
                    isActive ? 'text-white' : 'text-[#3b1278] hover:text-[#6b2398]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="exp-tab-pill"
                      className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#2a0e4f,#5b1fa3)] shadow-[0_8px_20px_rgba(59,18,120,0.35)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <motion.span
                    className="relative z-10"
                    animate={isActive && !reduce ? { rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    key={isActive ? 'on' : 'off'}
                  >
                    <Icon size={16} />
                  </motion.span>
                  <span className="relative z-10 whitespace-nowrap">{c.label}</span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-6">

          {/* Hero card */}
          <motion.div
            className="relative min-h-[340px] overflow-hidden rounded-[2rem] shadow-[0_24px_60px_rgba(42,14,79,0.28)] lg:min-h-[430px]"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.7, ease: EASE }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                <motion.img
                  src={active.img}
                  alt={active.label}
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ scale: 1.15 }}
                  animate={{ scale: reduce ? 1.05 : [1.05, 1.14] }}
                  transition={{ duration: 14, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${active.accent} to-transparent`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.18),transparent_45%)]" />
              </motion.div>
            </AnimatePresence>

            {/* Floating sparkles */}
            {!reduce &&
              SPARKS.map((s, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="pointer-events-none absolute text-[#f6e9b8]"
                  style={{ left: s.left, top: s.top, fontSize: s.size }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], y: [0, -10, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
                >
                  ✦
                </motion.span>
              ))}

            {/* Text overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    <active.icon size={13} className="text-[#f6e9b8]" />
                    {active.label}
                  </span>
                  <h3 className="font-display text-2xl font-bold leading-tight text-white md:text-4xl">
                    {active.headline}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80 md:text-base">
                    {active.sub}
                  </p>
                  <Link
                    to={BOOK_ROUTE}
                    className="group/btn relative mt-6 inline-flex items-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(135deg,#e8d48a,#c9a84c)] px-6 py-3 text-sm font-bold text-[#2a0e4f] shadow-[0_10px_24px_rgba(201,168,76,0.45)] transition-transform hover:scale-[1.04]"
                  >
                    <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/50 transition-all duration-700 group-hover/btn:left-[130%]" />
                    <span className="relative">Book Now</span>
                    <ArrowRight size={15} className="relative transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Events + personalise banner */}
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="grid gap-3 sm:grid-cols-2"
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
              >
                {active.events.map((ev) => {
                  const Icon = ev.icon
                  return (
                    <motion.div
                      key={ev.slug}
                      variants={{
                        hidden: { opacity: 0, y: 22, scale: 0.94 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
                      }}
                      whileHover={{ y: -4 }}
                    >
                      <Link
                        to={`${BOOK_ROUTE}?occasion=${ev.slug}`}
                        className="group relative flex h-[86px] items-center gap-4 overflow-hidden rounded-2xl border border-[#efe3cd] bg-white/90 px-4 shadow-[0_2px_10px_rgba(107,35,152,0.05)] transition-all duration-300 hover:border-[#c9a84c]/60 hover:shadow-[0_14px_32px_rgba(107,35,152,0.16)]"
                      >
                        <span
                          aria-hidden
                          className="absolute inset-0 -z-0 bg-[linear-gradient(120deg,transparent,rgba(201,168,76,0.12),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        />
                        <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#f6e6ef,#efe3ff)] text-[#6b2398] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-[linear-gradient(135deg,#2a0e4f,#5b1fa3)] group-hover:text-white">
                          <Icon size={22} strokeWidth={1.8} />
                        </span>
                        <span className="relative min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold text-[#2a0e4f]">{ev.label}</span>
                          {ev.tag && (
                            <span className="mt-0.5 inline-block rounded-full bg-[#fff3d6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8f6420]">
                              {ev.tag}
                            </span>
                          )}
                        </span>
                        <ArrowRight
                          size={16}
                          className="relative shrink-0 -translate-x-2 text-[#c9933a] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            {/* Personalise surprise banner */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
              className="mt-auto"
            >
              <Link
                to={PERSONALISE_ROUTE}
                className="group relative block overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#2a0e4f_0%,#6b2398_55%,#c0399a_100%)] p-[1.5px] shadow-[0_16px_40px_rgba(107,35,152,0.35)] transition-transform duration-300 hover:-translate-y-1"
              >
                {!reduce && (
                  <motion.span
                    aria-hidden
                    className="absolute -inset-[60%] bg-[conic-gradient(from_0deg,transparent_0deg,#f6e9b8_40deg,transparent_90deg)] opacity-70"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  />
                )}
                <div className="relative flex items-center gap-4 rounded-[calc(1rem-1px)] bg-[linear-gradient(135deg,#2a0e4f_0%,#4a1a85_60%,#7a2a9e_100%)] px-5 py-4">
                  <motion.span
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/12 text-[#f6e9b8] ring-1 ring-white/20 backdrop-blur"
                    animate={reduce ? {} : { rotate: [0, -8, 8, -4, 0], y: [0, -3, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2 }}
                  >
                    <Gift size={26} strokeWidth={1.7} />
                  </motion.span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f6e9b8]">
                      <Wand2 size={12} /> Made just for you
                    </p>
                    <p className="font-display text-lg font-bold leading-tight text-white md:text-xl">
                      We personalise your surprise
                    </p>
                    <p className="mt-0.5 text-xs text-white/75 md:text-sm">
                      Decor, cake, photos, name on screen &amp; more — tailored to your moment.
                    </p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f6e9b8] text-[#2a0e4f] transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110">
                    <ArrowRight size={18} />
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExperienceCategories

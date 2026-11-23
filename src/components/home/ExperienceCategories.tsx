import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Cake,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Crown,
  Eye,
  Film,
  Flame,
  Gamepad2,
  Gem,
  Handshake,
  Heart,
  Mic2,
  Moon,
  Music,
  PartyPopper,
  Popcorn,
  Rocket,
  Sparkles,
  Trophy,
  Tv,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const PERSONALISE_ROUTE = '/personalise'
const BOOK_ROUTE = '/book'

/** How long each card stays in front (ms). Raise it to make the carousel slower. */
const AUTOPLAY_MS = 4800
/** How long a single slide movement takes (s). Raise it to make the move slower. */
const MOVE_SECONDS = 1.25

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`

type EventItem = {
  label: string
  slug: string
  icon: LucideIcon
  img: string
  desc: string
  tag?: string
}

type Category = {
  id: string
  label: string
  icon: LucideIcon
  headline: string
  sub: string
  /** Fallback image — also used if an event image fails to load */
  img: string
  glow: string
  events: EventItem[]
}

/**
 * All 18 events are listed once, grouped by category.
 * To add a new category: copy one object below, give it an id/label/icon/glow and its events.
 * To change a picture: replace the `img: u('…')` id with any Unsplash photo id.
 */
const CATEGORIES: Category[] = [
  {
    id: 'celebrations',
    label: 'Celebrations',
    icon: Heart,
    headline: 'Make every moment unforgettable',
    sub: 'Birthdays, dates and proposals — wrapped in your own private big screen.',
    img: u('1464349153735-7db50ed83c84'),
    glow: '#f472b6',
    events: [
      { label: 'Birthday Parties', slug: 'birthday-parties', icon: Cake, tag: 'Most booked', img: u('1464349153735-7db50ed83c84'), desc: 'Balloons, cake and a movie of your choice on a giant private screen.' },
      { label: 'Date Nights', slug: 'date-nights', icon: Moon, img: u('1414235077428-338989a2e8c0'), desc: 'A cosy, candle-lit evening for two — just you, the screen and the moment.' },
      { label: 'Proposal Moments', slug: 'proposal-moments', icon: Gem, tag: 'She said yes', img: u('1515934751635-c81c6bc9a2d8'), desc: 'We stage the surprise, you ask the question. Photography included.' },
      { label: 'Grand Gatherings', slug: 'grand-gatherings', icon: Crown, img: u('1511795409834-ef04bbd61622'), desc: 'Anniversaries and big family occasions, celebrated in style.' },
    ],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Clapperboard,
    headline: 'Your screen. Your premiere.',
    sub: 'Premieres, marathons and family nights in 4K with Dolby Atmos sound.',
    img: u('1489599849927-2ee91cede3ba'),
    glow: '#a78bfa',
    events: [
      { label: 'Movie Premieres', slug: 'movie-premieres', icon: Film, tag: 'Red carpet vibes', img: u('1489599849927-2ee91cede3ba'), desc: 'Watch the first-day-first-show release with your whole crew.' },
      { label: 'Movie Marathons', slug: 'movie-marathons', icon: Popcorn, img: u('1536440136628-849c177e76a1'), desc: 'Back-to-back favourites, endless popcorn, zero interruptions.' },
      { label: 'Family Movie Nights', slug: 'family-movie-nights', icon: Tv, img: u('1511895426328-dc8714191011'), desc: 'A comfy cinema night the whole family can enjoy together.' },
      { label: 'Music Experiences', slug: 'music-experiences', icon: Music, img: u('1493225457124-a3eb161ffa5f'), desc: 'Concert films and live sets with theatre-grade surround sound.' },
    ],
  },
  {
    id: 'sports',
    label: 'Sports & Fans',
    icon: Trophy,
    headline: 'Every match feels like the stadium',
    sub: 'Watch with your squad on a giant screen — cheer, shout, celebrate.',
    img: u('1540747913346-19e32dc3e97e'),
    glow: '#38bdf8',
    events: [
      { label: 'Sports Nights', slug: 'sports-nights', icon: Trophy, tag: 'Match day', img: u('1540747913346-19e32dc3e97e'), desc: 'Cricket, football and every big match on a stadium-size screen.' },
      { label: 'Fan Screenings', slug: 'fan-screenings', icon: Flame, img: u('1522778119026-d647f0596c20'), desc: 'First-day shows with fellow fans — cheer, whistle and go wild.' },
      { label: 'Gaming Nights', slug: 'gaming-nights', icon: Gamepad2, img: u('1511512578047-dfb367046420'), desc: 'Console tournaments and co-op sessions on the big screen.' },
    ],
  },
  {
    id: 'social',
    label: 'Social & Groups',
    icon: Users,
    headline: 'Bring the whole gang along',
    sub: 'Reunions, karaoke and vibe-filled nights with your favourite people.',
    img: u('1529156069898-49953e39b3ac'),
    glow: '#fb923c',
    events: [
      { label: "Friends' Reunions", slug: 'friends-reunions', icon: Users, img: u('1529156069898-49953e39b3ac'), desc: 'Catch up, laugh loud and relive the old days in private.' },
      { label: 'Karaoke Nights', slug: 'karaoke-nights', icon: Mic2, tag: 'Sing loud', img: u('1516450360452-9312f5e86fc7'), desc: 'Grab the mic and sing along with lyrics on the big screen.' },
      { label: 'Vibe Hall Events', slug: 'vibe-hall-events', icon: PartyPopper, img: u('1492684223066-81342ee5ff30'), desc: 'Lights, music and a dance-floor feel for your group party.' },
    ],
  },
  {
    id: 'corporate',
    label: 'Corporate',
    icon: Briefcase,
    headline: 'Launch it. Screen it. Own the room.',
    sub: 'Teasers, team events and private screenings with a premium feel.',
    img: u('1540575467063-178a50c2df87'),
    glow: '#c9a84c',
    events: [
      { label: 'Corporate Events', slug: 'corporate-events', icon: Handshake, img: u('1540575467063-178a50c2df87'), desc: 'Team outings, town-halls and client evenings with a premium feel.' },
      { label: 'Teaser Launches', slug: 'teaser-launches', icon: Rocket, tag: 'Launch day', img: u('1505373877841-8d25f7d46678'), desc: 'Unveil your teaser or trailer to press and fans in cinema quality.' },
      { label: 'Private Screenings', slug: 'private-screenings', icon: Eye, img: u('1517604931442-7e0c8ed2963c'), desc: 'Exclusive, invite-only screenings for your guests.' },
    ],
  },
]

const EASE = [0.22, 1, 0.36, 1] as const
const MOVE_EASE = [0.45, 0, 0.2, 1] as const

const SPARKS = [
  { left: '12%', top: '14%', size: 14, delay: 0 },
  { left: '84%', top: '12%', size: 10, delay: 0.8 },
  { left: '72%', top: '40%', size: 16, delay: 1.6 },
  { left: '8%', top: '44%', size: 9, delay: 2.2 },
  { left: '92%', top: '62%', size: 12, delay: 1.1 },
]

const mod = (a: number, n: number) => ((a % n) + n) % n

/** Measures an element's size so the 3D cards always fit the space they are given. */
function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    setSize({ w: el.clientWidth, h: el.clientHeight })
    const ro = new ResizeObserver(([entry]) =>
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height }),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, size.w, size.h] as const
}

/** Reflection height as a fraction of card height */
const REFL = 0.38

/* ───────────────────────── Personalise banner ───────────────────────── */

const STAR_PATH = 'M0,-10 C1.5,-3 3,-1.5 10,0 C3,1.5 1.5,3 0,10 C-1.5,3 -3,1.5 -10,0 C-3,-1.5 -1.5,-3 0,-10Z'

function TwinkleStar({
  className,
  size,
  delay,
  reduce,
}: {
  className: string
  size: number
  delay: number
  reduce: boolean | null
}) {
  return (
    <motion.svg
      aria-hidden
      viewBox="-10 -10 20 20"
      width={size}
      height={size}
      className={`pointer-events-none absolute ${className}`}
      animate={reduce ? { opacity: 0.9 } : { opacity: [0.2, 1, 0.2], scale: [0.6, 1.15, 0.6], rotate: [0, 20, 0] }}
      transition={{ duration: 2.6, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      <path d={STAR_PATH} fill="#f6d77a" />
    </motion.svg>
  )
}

/** Open gift box with glowing light rays, a floating lid and a film-reel emblem. */
function GiftBox({ reduce }: { reduce: boolean | null }) {
  const loop = (duration: number, delay = 0) =>
    reduce ? undefined : { duration, delay, repeat: Infinity, ease: 'easeInOut' as const }

  const rays = [
    { pts: '60,84 30,26 44,22', d: 0 },
    { pts: '60,84 46,14 58,12', d: 0.4 },
    { pts: '60,84 56,8 66,8', d: 0.8 },
    { pts: '60,84 70,12 80,16', d: 0.2 },
    { pts: '60,84 78,22 92,30', d: 0.6 },
  ]

  return (
    <svg viewBox="0 0 120 140" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="pb-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a2a66" />
          <stop offset="1" stopColor="#2d0e40" />
        </linearGradient>
        <linearGradient id="pb-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#40154f" />
          <stop offset="1" stopColor="#1b0830" />
        </linearGradient>
        <linearGradient id="pb-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.5" stopColor="#e6bb55" />
          <stop offset="1" stopColor="#b8832a" />
        </linearGradient>
        <radialGradient id="pb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.35" stopColor="#f9cf62" stopOpacity="0.85" />
          <stop offset="1" stopColor="#f9cf62" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pb-ray" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffe9a3" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffe9a3" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* body */}
      <g transform="translate(0 0)">
        <polygon points="22,84 60,100 60,138 22,122" fill="url(#pb-left)" />
        <polygon points="60,100 98,84 98,122 60,138" fill="url(#pb-right)" />
        <polygon points="34,89 46,94.1 46,132.1 34,127" fill="url(#pb-gold)" />
        <polygon points="60,70 98,84 60,100 22,84" fill="#2a0b3a" stroke="#f0c966" strokeWidth="1.4" strokeLinejoin="round" />
        {/* film-reel emblem on the right face */}
        <g transform="translate(79 112) skewY(-22.8)">
          <circle r="12" fill="none" stroke="url(#pb-gold)" strokeWidth="2.6" />
          <circle cx="-5" cy="-5" r="2.8" fill="url(#pb-gold)" />
          <circle cx="5" cy="-5" r="2.8" fill="url(#pb-gold)" />
          <circle cx="-5" cy="5" r="2.8" fill="url(#pb-gold)" />
          <circle cx="5" cy="5" r="2.8" fill="url(#pb-gold)" />
          <circle r="2.2" fill="url(#pb-gold)" />
        </g>
        <polyline points="22,84 60,100 98,84" fill="none" stroke="#f0c966" strokeOpacity="0.7" strokeWidth="1" />
      </g>

      {/* glow + rays coming out of the box */}
      <motion.ellipse
        cx="60"
        cy="84"
        rx="38"
        ry="15"
        fill="url(#pb-glow)"
        animate={reduce ? { opacity: 0.8 } : { opacity: [0.55, 1, 0.55], scale: [0.92, 1.08, 0.92] }}
        transition={loop(2.4)}
      />
      {rays.map((r, i) => (
        <motion.polygon
          key={i}
          points={r.pts}
          fill="url(#pb-ray)"
          style={{ originX: 0.5, originY: 1 }}
          animate={reduce ? { opacity: 0.5 } : { opacity: [0.15, 0.85, 0.15], scaleY: [0.82, 1.08, 0.82] }}
          transition={loop(2.2, r.d)}
        />
      ))}

      {/* floating lid with bow */}
      <motion.g
        style={{ translateY: 6 }}
        animate={reduce ? { y: 0, rotate: -10 } : { y: [0, -7, 0], rotate: [-10, -15, -10] }}
        transition={loop(3)}
      >
        <polygon points="20,20 58,36 58,48 20,32" fill="#5a2158" />
        <polygon points="58,36 96,20 96,32 58,48" fill="#3a1248" />
        <polygon points="58,6 96,20 58,36 20,20" fill="#7d3374" stroke="#f0c966" strokeWidth="1" strokeLinejoin="round" />
        <polygon points="73.2,11.6 80.8,14.4 42.8,29.4 35.2,26.6" fill="url(#pb-gold)" />
        <polygon points="35.2,26.6 42.8,29.6 42.8,41.6 35.2,38.4" fill="url(#pb-gold)" />
        <g transform="translate(57 17)">
          <ellipse cx="-9" cy="-4" rx="9" ry="4.6" transform="rotate(-25 -9 -4)" fill="url(#pb-gold)" stroke="#b8832a" strokeWidth="0.6" />
          <ellipse cx="9" cy="-4" rx="9" ry="4.6" transform="rotate(25 9 -4)" fill="url(#pb-gold)" stroke="#b8832a" strokeWidth="0.6" />
          <path d="M-2,2 L-9,12 L-4,10 L-2,15 Z" fill="url(#pb-gold)" />
          <path d="M2,2 L9,12 L4,10 L2,15 Z" fill="url(#pb-gold)" />
          <circle r="3.6" fill="url(#pb-gold)" stroke="#b8832a" strokeWidth="0.6" />
        </g>
      </motion.g>
    </svg>
  )
}

const BURST = [
  { x: -26, y: -46, c: '#f6d77a' },
  { x: 8, y: -58, c: '#f472b6' },
  { x: 34, y: -44, c: '#fbbf24' },
  { x: -40, y: -20, c: '#a78bfa' },
  { x: 46, y: -22, c: '#f6e9b8' },
  { x: 0, y: -40, c: '#fb923c' },
]

function PersonaliseBanner({ reduce, inView }: { reduce: boolean | null; inView: boolean }) {
  return (
    <motion.div
      className="relative shrink-0 pt-9"
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
    >
      <Link
        to={PERSONALISE_ROUTE}
        aria-label="Personalise your surprise"
        className="group relative block transition-transform duration-500 hover:-translate-y-1"
      >
        {/* breathing outer glow */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-x-8 bottom-[-6px] top-4 rounded-full bg-[#c0399a] blur-2xl"
          animate={reduce ? { opacity: 0.3 } : { opacity: [0.22, 0.55, 0.22] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* gold border shell with a light that travels around it */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#e8d48a,#8c5a1f_45%,#e8d48a)] p-[1.5px] shadow-[0_18px_44px_rgba(107,35,152,0.38)]">
          {!reduce && (
            <span aria-hidden className="absolute left-1/2 top-1/2 -ml-[420px] -mt-[420px] h-[840px] w-[840px]">
              <motion.span
                className="block h-full w-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg, #fff3c4 30deg, #f0c966 55deg, transparent 100deg, transparent 200deg, #fff3c4 230deg, #f0c966 255deg, transparent 300deg)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
              />
            </span>
          )}

          <div className="relative flex items-center gap-3 rounded-[calc(2.5rem-1.5px)] bg-[linear-gradient(100deg,#190733_0%,#33104d_55%,#5a1a74_100%)] py-3.5 pl-[112px] pr-3.5 sm:pl-[124px] sm:pr-4">
            {/* light sweep across the pill */}
            {!reduce && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                initial={{ left: '-30%' }}
                animate={{ left: ['-30%', '130%'] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 3.2, ease: 'easeInOut' }}
              />
            )}

            <div className="relative min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#f0c966]">
                <span className="h-px w-5 bg-[#f0c966]/70" />
                Add-on experience
                <span className="hidden h-px w-5 bg-[#f0c966]/70 sm:block" />
              </p>
              <h4 className="mt-0.5 font-display text-xl font-bold leading-tight text-white md:text-2xl">
                Personalise Your{' '}
                <motion.span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(90deg,#f0c966,#fff3c4,#f0c966,#e0a63a,#f0c966)',
                    backgroundSize: '250% 100%',
                  }}
                  animate={reduce ? {} : { backgroundPosition: ['0% 50%', '250% 50%'] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                >
                  Surprise
                </motion.span>
              </h4>
              <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/75 md:text-[13px]">
                Add your photos, videos and special messages to create a truly unique experience.
              </p>
            </div>

            {/* arrow button with a pulsing ring */}
            <span className="relative grid h-12 w-12 shrink-0 place-items-center">
              {!reduce && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-[#f0c966]"
                  animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <span className="grid h-full w-full place-items-center rounded-full bg-[linear-gradient(135deg,#fff1b8,#e6bb55_55%,#b8832a)] text-[#3d0a24] shadow-[0_6px_16px_rgba(240,201,102,0.45),inset_0_1px_0_rgba(255,255,255,0.6)] transition-transform duration-300 group-hover:scale-110">
                <motion.span
                  animate={reduce ? {} : { x: [0, 4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="grid place-items-center"
                >
                  <ArrowRight size={20} />
                </motion.span>
              </span>
            </span>
          </div>
        </div>

        {/* the gift box — pops out of the pill's left edge */}
        <div className="pointer-events-none absolute -left-1 bottom-[-6px] h-[128px] w-[110px] sm:-left-2 sm:w-[118px]">
          <motion.div
            className="h-full w-full"
            animate={reduce ? {} : { y: [0, -4, 0], rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <GiftBox reduce={reduce} />
          </motion.div>
          {/* confetti burst */}
          {!reduce &&
            BURST.map((b, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute left-1/2 top-[42%] h-1.5 w-1.5 rounded-sm"
                style={{ background: b.c }}
                animate={{ x: [0, b.x], y: [0, b.y], opacity: [0, 1, 0], scale: [0.4, 1, 0.3], rotate: [0, 180] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2, delay: i * 0.12, ease: 'easeOut' }}
              />
            ))}
        </div>

        {/* sparkles */}
        <TwinkleStar className="-left-3 top-3" size={16} delay={0} reduce={reduce} />
        <TwinkleStar className="left-[108px] top-1" size={12} delay={0.9} reduce={reduce} />
        <TwinkleStar className="-right-2 -top-1" size={22} delay={0.4} reduce={reduce} />
        <TwinkleStar className="right-6 top-0" size={11} delay={1.5} reduce={reduce} />
      </Link>
    </motion.div>
  )
}

export function ExperienceCategories() {
  const [activeId, setActiveId] = useState(CATEGORIES[0].id)
  const [pos, setPos] = useState(0) // absolute (unbounded) carousel position
  const [paused, setPaused] = useState(false)
  const [settled, setSettled] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '0px 0px 18% 0px' })
  const reduce = useReducedMotion()
  const [stageRef, stageW, stageH] = useSize<HTMLDivElement>()

  const active = CATEGORIES.find((c) => c.id === activeId) ?? CATEGORIES[0]
  const events = active.events
  const n = events.length
  const current = mod(pos, n)

  // ---- 3D geometry --------------------------------------------------------
  const TOP = 14
  const maxH = Math.max(150, (stageH - TOP - 10) / (1 + REFL)) // card + reflection must fit the stage
  const wantW = stageW < 460 ? 138 : stageW < 640 ? 170 : 200
  const H = Math.round(Math.min(wantW * 1.32, maxH)) // card height
  const W = Math.round(H / 1.32) // card width
  const base = stageW < 460 ? (stageW - W) / 2 : Math.max(W * 0.72, stageW * 0.27 - W / 2)
  const maxO = Math.min(4, n - 1) // furthest visible card to the right

  const slot = useCallback(
    (o: number) => {
      if (o < 0) return { x: base - W * 0.62, rotateY: -40, scale: 0.86, z: -70, opacity: 0.7 }
      if (o === 0) return { x: base, rotateY: 0, scale: 1, z: 40, opacity: 1 }
      const i = Math.min(o, 4)
      return {
        x: base + W * [0, 1.02, 1.5, 1.86, 2.12][i],
        rotateY: 42,
        scale: [1, 0.9, 0.82, 0.75, 0.68][i],
        z: -30 * i - 10,
        opacity: [1, 0.95, 0.85, 0.7, 0.5][i],
      }
    },
    [base, W],
  )

  // ---- controls -----------------------------------------------------------
  const next = useCallback(() => setPos((p) => p + 1), [])
  const prev = useCallback(() => setPos((p) => p - 1), [])
  const goToEvent = (idx: number) => {
    let d = mod(idx - current, n)
    if (d > n / 2) d -= n
    if (d !== 0) setPos(pos + d)
  }
  const changeCategory = (id: string) => {
    if (id === activeId) return
    setActiveId(id)
    setPos(0)
  }

  // slow autoplay (pauses on hover / touch, off for reduced-motion users)
  useEffect(() => {
    if (!inView || paused || reduce || n < 2) return
    const t = setTimeout(next, AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [pos, paused, inView, reduce, n, next, activeId])

  // stagger the cards in only on first show / category switch
  useEffect(() => {
    setSettled(false)
    const t = setTimeout(() => setSettled(true), 1400)
    return () => clearTimeout(t)
  }, [activeId])

  const activeEvent = events[current]
  const dur = reduce ? 0.01 : MOVE_SECONDS

  // visible window of absolute indexes: one behind, active, and up to 4 ahead
  const ks: number[] = []
  for (let k = pos - 1; k <= pos + maxO; k++) ks.push(k)

  return (
    <section
      ref={sectionRef}
      className="relative overflow-x-clip pb-16 pt-10 font-['Jost',sans-serif] md:pb-20 md:pt-14"
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
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-[#3d0a24] md:text-5xl">
            One Theatre.{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#8b1a3a] via-[#a855f7] to-[#d4a94a] bg-clip-text text-transparent">
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
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#5b2535] md:text-base">
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
                  onClick={() => changeCategory(c.id)}
                  className={`relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors md:px-5 ${
                    isActive ? 'text-white' : 'text-[#5c1535] hover:text-[#8b1a3a]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="exp-tab-pill"
                      className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#3d0a24,#7b1535)] shadow-[0_8px_20px_rgba(59,18,120,0.35)]"
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
        <div className="grid gap-5 lg:h-[clamp(470px,calc(100vh-190px),620px)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:grid-rows-1 lg:gap-6">
          {/* ───────── LEFT: 3D cover-flow panel ───────── */}
          <motion.div
            className="relative flex h-[540px] min-h-0 flex-col overflow-hidden rounded-[2rem] bg-[#0a0516] shadow-[0_24px_60px_rgba(42,14,79,0.32)] lg:h-full"
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.7, ease: EASE }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
          >
            {/* colour glow that follows the category */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -left-10 top-0 h-[360px] w-[420px] rounded-full blur-[90px]"
              animate={{ backgroundColor: active.glow, opacity: 0.32 }}
              transition={{ duration: 0.9 }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_5%,rgba(255,255,255,0.08),transparent_45%)]"
            />

            {/* floating sparkles */}
            {!reduce &&
              SPARKS.map((s, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="pointer-events-none absolute text-[#f6e9b8]"
                  style={{ left: s.left, top: s.top, fontSize: s.size }}
                  animate={{ opacity: [0, 0.9, 0], scale: [0.5, 1.2, 0.5], y: [0, -10, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
                >
                  ✦
                </motion.span>
              ))}

            {/* Stage */}
            <motion.div
              ref={stageRef}
              className="relative min-h-0 flex-1 touch-pan-y"
              style={{ perspective: 1400, perspectiveOrigin: '30% 40%' }}
              onPanEnd={(_, info) => {
                if (info.offset.x < -50) next()
                else if (info.offset.x > 50) prev()
              }}
            >
              {stageW > 0 && stageH > 0 && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.4 }}
                  >
                    <AnimatePresence initial>
                      {ks.map((k) => {
                        const o = k - pos
                        const ev = events[mod(k, n)]
                        const s = slot(o)
                        const isFront = o === 0
                        return (
                          <motion.div
                            key={k}
                            role="button"
                            tabIndex={-1}
                            aria-label={ev.label}
                            onClick={() => setPos(k)}
                            className="absolute left-0 cursor-pointer"
                            style={{ top: TOP, width: W, height: H, zIndex: 20 - Math.abs(o) * 2 - (o < 0 ? 1 : 0) }}
                            initial={{ ...slot(maxO + 1), opacity: 0, x: slot(maxO).x + W * 0.35 }}
                            animate={s}
                            exit={{
                              opacity: 0,
                              x: base - W * 1.25,
                              rotateY: -62,
                              scale: 0.7,
                              z: -170,
                              transition: { duration: dur * 0.8, ease: MOVE_EASE },
                            }}
                            transition={{
                              duration: dur,
                              ease: MOVE_EASE,
                              delay: settled ? 0 : Math.max(o, 0) * 0.09,
                            }}
                          >
                            {/* card */}
                            <div
                              className={`relative h-full w-full overflow-hidden rounded-2xl border bg-[#0b0618] transition-[border-color,box-shadow] duration-700 ${
                                isFront ? 'border-[#f6e9b8]/70' : 'border-white/20'
                              }`}
                              style={{
                                boxShadow: isFront
                                  ? `0 0 0 1px rgba(246,233,184,0.25), 0 24px 50px -10px ${active.glow}99`
                                  : '0 14px 30px -12px rgba(0,0,0,0.7)',
                              }}
                            >
                              <img
                                src={ev.img}
                                alt={ev.label}
                                draggable={false}
                                className="absolute inset-0 h-full w-full select-none object-cover"
                                onError={(e) => {
                                  const t = e.currentTarget
                                  if (t.dataset.fb !== '1') {
                                    t.dataset.fb = '1'
                                    t.src = active.img
                                  }
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0516]/90 via-[#0a0516]/10 to-transparent" />
                              <div
                                className={`absolute inset-0 bg-[#0a0516] transition-opacity duration-700 ${
                                  isFront ? 'opacity-0' : 'opacity-25'
                                }`}
                              />
                              <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                                {isFront && ev.tag && (
                                  <span className="mb-1.5 inline-block rounded-full bg-[#f6e9b8] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#3d0a24]">
                                    {ev.tag}
                                  </span>
                                )}
                                <p className="font-display text-sm font-bold leading-tight text-white md:text-base">
                                  {ev.label}
                                </p>
                              </div>
                            </div>

                            {/* reflection */}
                            <div
                              aria-hidden
                              className="pointer-events-none absolute left-0 right-0 overflow-hidden rounded-2xl"
                              style={{
                                top: H + 6,
                                height: Math.round(H * REFL),
                                opacity: isFront ? 0.34 : 0.22,
                                transform: 'scaleY(-1)',
                                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                                maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                              }}
                            >
                              <img
                                src={ev.img}
                                alt=""
                                draggable={false}
                                className="absolute left-0 w-full object-cover blur-[2px]"
                                style={{ height: H, top: -(H - Math.round(H * REFL)) }}
                                onError={(e) => {
                                  const t = e.currentTarget
                                  if (t.dataset.fb !== '1') {
                                    t.dataset.fb = '1'
                                    t.src = active.img
                                  }
                                }}
                              />
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>

            {/* Footer: headline + controls */}
            <div className="relative shrink-0 px-6 pb-5 pt-1 md:px-9 md:pb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    <active.icon size={13} className="text-[#f6e9b8]" />
                    {active.label}
                  </span>
                  <h3 className="font-display text-xl font-bold leading-tight text-white md:text-2xl">
                    {active.headline}
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/75 [@media(max-height:800px)]:hidden">{active.sub}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  to={`${BOOK_ROUTE}?occasion=${activeEvent.slug}`}
                  className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(135deg,#e8d48a,#c9a84c)] px-5 py-2.5 text-sm font-bold text-[#3d0a24] shadow-[0_10px_24px_rgba(201,168,76,0.45)] transition-transform hover:scale-[1.04]"
                >
                  <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/50 transition-all duration-700 group-hover/btn:left-[130%]" />
                  <span className="relative">Book {activeEvent.label}</span>
                  <ArrowRight size={15} className="relative transition-transform group-hover/btn:translate-x-1" />
                </Link>

                <div className="ml-auto flex items-center gap-3">
                  <div className="flex items-center gap-1.5" aria-hidden>
                    {events.map((ev, i) => (
                      <span
                        key={ev.slug}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i === current ? 'w-6 bg-[#f6e9b8]' : 'w-1.5 bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous event"
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next event"
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ───────── RIGHT: events of the chosen category + banner ───────── */}
          <div className="flex min-h-0 flex-col gap-3 lg:h-full">
            <div className="flex shrink-0 items-center justify-between px-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8f6420]">
                {active.label} · {n} experiences
              </p>
              <span className="hidden text-xs text-[#7d4555] sm:block">Tap an event to preview it</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="flex flex-col gap-3"
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
              >
                {events.map((ev, i) => {
                  const Icon = ev.icon
                  const isCurrent = i === current
                  return (
                    <motion.div
                      key={ev.slug}
                      variants={{
                        hidden: { opacity: 0, y: 22, scale: 0.96 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
                      }}
                      className={`group relative overflow-hidden rounded-2xl border transition-[border-color,box-shadow,background-color] duration-500 lg:flex lg:min-h-[68px] lg:flex-col lg:justify-center ${isCurrent ? 'lg:[flex:1.5_1_0%]' : 'lg:[flex:1_1_0%]'} ${
                        isCurrent
                          ? 'border-[#c9a84c]/70 bg-white shadow-[0_14px_32px_rgba(107,35,152,0.16)]'
                          : 'border-[#efe3cd] bg-white/80 shadow-[0_2px_10px_rgba(107,35,152,0.05)] hover:border-[#c9a84c]/50'
                      }`}
                    >
                      <div className="flex items-stretch">
                        <button
                          type="button"
                          onClick={() => goToEvent(i)}
                          aria-pressed={isCurrent}
                          className="flex min-w-0 flex-1 items-center gap-4 px-4 py-3.5 text-left"
                        >
                          <span
                            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-all duration-500 ${
                              isCurrent
                                ? 'bg-[linear-gradient(135deg,#3d0a24,#7b1535)] text-white'
                                : 'bg-[linear-gradient(135deg,#f6e6ef,#efe3ff)] text-[#8b1a3a] group-hover:scale-105'
                            }`}
                          >
                            <Icon size={22} strokeWidth={1.8} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-semibold text-[#3d0a24]">{ev.label}</span>
                            {ev.tag && (
                              <span className="mt-0.5 inline-block rounded-full bg-[#fff3d6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8f6420]">
                                {ev.tag}
                              </span>
                            )}
                            <AnimatePresence initial={false}>
                              {isCurrent && (
                                <motion.span
                                  className="block overflow-hidden text-[13px] leading-snug text-[#5b2535]"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.4, ease: EASE }}
                                >
                                  <span className="mt-1 block">{ev.desc}</span>
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                        </button>
                        <Link
                          to={`${BOOK_ROUTE}?occasion=${ev.slug}`}
                          aria-label={`Book ${ev.label}`}
                          className={`grid w-14 shrink-0 place-items-center transition-colors ${
                            isCurrent ? 'text-[#c9933a]' : 'text-[#c9933a]/50 hover:text-[#c9933a]'
                          }`}
                        >
                          <ArrowRight size={18} />
                        </Link>
                      </div>

                      {/* autoplay progress */}
                      {isCurrent && !reduce && (
                        <motion.span
                          key={`${pos}-${paused}`}
                          aria-hidden
                          className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-[linear-gradient(90deg,#c9a84c,#eed98a)]"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: paused ? 0 : 1 }}
                          transition={{ duration: paused ? 0.2 : AUTOPLAY_MS / 1000, ease: 'linear' }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            <PersonaliseBanner reduce={reduce} inView={inView} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExperienceCategories
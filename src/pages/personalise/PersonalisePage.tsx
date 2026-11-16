import { useRef, useState } from 'react'
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useInView,
  type MotionValue,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Play, ChevronDown } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { PageShell } from '@/components/layout/PageShell'

const EASE = [0.4, 0, 0.2, 1] as const

type Scene = {
  id: string
  num: string
  title: string
  tagline: string
  screenLabel: string
  color: string
  img: string
}

function VideoBg() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* same hero video used on homepage — already proven to work */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'saturate(1.2) brightness(1.1) contrast(1.05)' }}
      >
        <source src="/Hero%20section.mp4" type="video/mp4" />
      </video>

      {/* thin warm tint — video stays vivid, text stays readable */}
      <div className="absolute inset-0" style={{ background: 'rgba(255,245,232,0.42)' }} />

      {/* centre-clear vignette — edges darken softly */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 48%, transparent 35%, rgba(42,14,79,0.22) 100%)' }}
      />
    </div>
  )
}

// Floating "memory" photos that drift away as the screen opens
const POLAROIDS = [
  { src: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&q=70', left: '6%',  top: '24%', rot: -8, depth: 1.0, hideMobile: false },
  { src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=70', left: '80%', top: '20%', rot: 7,  depth: 0.7, hideMobile: false },
  { src: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=70', left: '2%',  top: '56%', rot: 5,  depth: 1.3, hideMobile: false },
  { src: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400&q=70', left: '85%', top: '54%', rot: -6, depth: 1.1, hideMobile: false },
  { src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=70', left: '19%', top: '74%', rot: 9,  depth: 0.8, hideMobile: true },
  { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=70', left: '70%', top: '76%', rot: -9, depth: 1.2, hideMobile: true },
]

// Stage timeline (0 → 1 of the pinned scroll range)
const STAGE_START = 0.32
const STAGE_END = 0.96

// ─── Floating photo ─────────────────────────────────────────────────────────

function Polaroid({ p, data, index }: { p: MotionValue<number>; data: (typeof POLAROIDS)[number]; index: number }) {
  const leftSide = parseFloat(data.left) < 50
  const dir = leftSide ? -1 : 1
  const y = useTransform(p, [0, 0.35], [0, -320 * data.depth])
  const x = useTransform(p, [0, 0.35], [0, dir * 160 * data.depth])
  const rotate = useTransform(p, [0, 0.35], [data.rot, data.rot + dir * 16])
  const scale = useTransform(p, [0, 0.35], [1, 0.75])
  const opacity = useTransform(p, [0.1, 0.3], [1, 0])

  return (
    <motion.div
      className={`absolute z-[1] ${data.hideMobile ? 'hidden md:block' : ''}`}
      style={{ left: data.left, top: data.top, x, y, rotate, scale, opacity }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.5 + index * 0.1, ease: EASE }}
      >
        {/* gentle idle float */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5 + index * 0.7, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-white p-1.5 pb-5 md:p-2 md:pb-7 rounded-md"
          style={{
            width: 'clamp(76px, 11vw, 160px)',
            boxShadow: '0 14px 40px rgba(42,14,79,0.16), 0 2px 6px rgba(42,14,79,0.08)',
          }}
        >
          <img src={data.src} alt="" aria-hidden className="w-full aspect-[4/5] object-cover rounded-[3px]" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ─── Film strip edge ────────────────────────────────────────────────────────

function FilmStrip({ p, side }: { p: MotionValue<number>; side: 'left' | 'right' }) {
  const y = useTransform(p, [0, 1], side === 'left' ? [0, -900] : [-900, 0])
  const opacity = useTransform(p, [0, 0.3, 1], [0.9, 0.35, 0.35])
  return (
    <motion.div
      aria-hidden
      className={`pointer-events-none absolute top-0 bottom-0 z-[2] hidden w-9 md:block ${side === 'left' ? 'left-3' : 'right-3'}`}
      style={{ opacity }}
    >
      <motion.div
        className="absolute inset-x-0 -top-[900px] -bottom-[900px] rounded-md"
        style={{
          y,
          background: 'rgba(42,14,79,0.07)',
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0 14px, #fffaf4 14px 34px, transparent 34px 48px)',
          backgroundSize: '14px 100%',
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'center',
        }}
      />
    </motion.div>
  )
}

// ─── Hero ───────────────────────────────────────────────────────────────────

export function PersonaliseHero({ experiences }: { experiences: Scene[] }) {
  const scenes = experiences.slice(0, 6)
  const n = scenes.length
  const reduce = useReducedMotion()

  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const spring = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 })
  const still = useMotionValue(0.02)
  const p = reduce ? still : spring

  const [idx, setIdx] = useState(0)
  useMotionValueEvent(p, 'change', v => {
    const t = (v - STAGE_START) / (STAGE_END - STAGE_START)
    const next = Math.max(0, Math.min(n - 1, Math.floor(t * n)))
    setIdx(prev => (prev === next ? prev : next))
  })

  // Headline
  const headOpacity = useTransform(p, [0, 0.16], [1, 0])
  const headY = useTransform(p, [0, 0.16], [0, -90])
  const headBlur = useTransform(p, [0, 0.16], ['blur(0px)', 'blur(8px)'])
  const hintOpacity = useTransform(p, [0, 0.06], [1, 0])

  // Screen reveal
  const screenScale = useTransform(p, [0, 0.3], [0.52, 1])
  const screenY = useTransform(p, [0, 0.3], ['25svh', '-2svh'])
  const screenRadius = useTransform(p, [0, 0.3], [32, 18])
  const idlePlay = useTransform(p, [0.02, 0.18], [1, 0])
  const screenUi = useTransform(p, [0.24, 0.34], [0, 1])
  const infoOpacity = useTransform(p, [0.28, 0.38], [0, 1])
  const infoY = useTransform(p, [0.28, 0.38], [24, 0])
  const progress = useTransform(p, [STAGE_START, STAGE_END], [0, 1])
  const glow = useTransform(p, [0, 0.3], [0.25, 0.9])

  // Background drift
  const orbA = useTransform(p, [0, 1], [0, 260])
  const orbB = useTransform(p, [0, 1], [0, -200])
  const orbC = useTransform(p, [0, 1], [0, 140])

  const scene = scenes[idx]

  const jumpTo = (i: number) => {
    const el = ref.current
    if (!el) return
    const range = el.offsetHeight - window.innerHeight
    const t = STAGE_START + ((i + 0.5) / n) * (STAGE_END - STAGE_START)
    window.scrollTo({ top: el.offsetTop + range * t, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section
      ref={ref}
      className="relative"
      style={{
        height: reduce ? '100svh' : `${280 + n * 40}svh`,
        background: 'linear-gradient(160deg,#fffaf4 0%,#fdf5e8 60%,#f8eedf 100%)',
      }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Ambient theatre / celebration video backdrop */}
        <VideoBg />

        {/* Soft drifting orbs */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div style={{ y: orbA }} className="absolute -top-32 -right-24 h-[520px] w-[520px] rounded-full bg-[#a78bfa]/15 blur-3xl" />
          <motion.div style={{ y: orbB }} className="absolute top-1/2 -left-32 h-96 w-96 rounded-full bg-[#f472b6]/12 blur-3xl" />
          <motion.div style={{ y: orbC }} className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[#c9a84c]/18 blur-3xl" />
        </div>

        {/* Projector glow behind the screen */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70svh] w-[90vw] max-w-[1200px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            opacity: glow,
            background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.28), rgba(167,139,250,0.14) 55%, transparent 75%)',
          }}
        />

        <FilmStrip p={p} side="left" />
        <FilmStrip p={p} side="right" />

        {POLAROIDS.map((data, i) => (
          <Polaroid key={data.src} p={p} data={data} index={i} />
        ))}

        {/* ── Headline block ── */}
        <motion.div
          className="absolute inset-x-0 top-0 z-[5] mx-auto flex max-w-3xl flex-col items-center px-5 pt-16 text-center md:pt-20"
          style={{ opacity: headOpacity, y: headY, filter: headBlur }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 flex items-center gap-2"
          >
            <Sparkles size={16} className="text-[#d4a94a]" />
            <span className="text-xs font-black tracking-[0.25em] text-[#c9933a]">PERSONALISE YOUR SURPRISE</span>
          </motion.div>

          <h1 className="font-display text-4xl font-black leading-[1.05] text-[#2a0e4f] sm:text-5xl md:text-6xl">
            <span className="block overflow-hidden pb-1">
              <motion.span
                className="block"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
              >
                Make the big screen
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-2">
              <motion.span
                className="block"
                style={{
                  backgroundImage: 'linear-gradient(90deg,#8a6010,#c9a84c 45%,#8a6010)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 8px rgba(201,168,76,0.55)) drop-shadow(0 0px 2px rgba(0,0,0,0.3))',
                }}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
              >
                all about you.
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-4 max-w-xl text-sm font-semibold leading-relaxed text-[#2a0e4f] md:text-lg"
          >
            Your memories, your messages, your surprises. Turn a private theatre into a screen filled with stories you will never forget.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-6 flex flex-row items-center justify-center gap-3"
          >
            <button
              type="button"
              onClick={() => jumpTo(0)}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white transition-all hover:scale-105 hover:brightness-110 md:px-7 md:py-3.5"
              style={{ background: 'linear-gradient(135deg,#2a0e4f 0%,#5b1fa3 100%)' }}
            >
              Start the show <ArrowRight size={14} />
            </button>
            <Link
              to="/"
              state={{ highlightPlan: true }}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#2a0e4f] bg-white/70 backdrop-blur-sm px-6 py-3 text-sm font-black text-[#2a0e4f] transition-all hover:bg-white/90 md:px-7 md:py-3.5"
            >
              Book my theatre
            </Link>
          </motion.div>
        </motion.div>

        {/* ── The screen ── */}
        <div className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center">
          <motion.div
            className="relative overflow-hidden bg-[#1a0b33]"
            style={{
              width: 'min(92vw, calc(62svh * 1.7778))',
              aspectRatio: '16 / 9',
              scale: screenScale,
              y: screenY,
              borderRadius: screenRadius,
              boxShadow: '0 30px 90px rgba(42,14,79,0.28), 0 0 0 6px rgba(255,255,255,0.9), 0 0 0 7px rgba(201,168,76,0.45)',
            }}
          >
            {/* Scene images */}
            {scenes.map((s, i) => (
              <motion.img
                key={s.id}
                src={s.img}
                alt={i === idx ? s.title : ''}
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
                style={{ opacity: i === idx ? 1 : 0 }}
                animate={{ scale: i === idx ? 1.1 : 1 }}
                transition={{ duration: 9, ease: 'linear' }}
              />
            ))}

            {/* Per-scene colour wash */}
            <motion.div
              key={scene.id + '-tint'}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{ background: `radial-gradient(ellipse at 25% 25%, ${scene.color}38, transparent 70%)` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0219]/85 via-[#0a0219]/15 to-transparent" />

            {/* Idle play badge */}
            <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: idlePlay }}>
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-white/15 backdrop-blur-sm">
                <Play size={28} className="ml-1 text-white" fill="white" />
              </div>
            </motion.div>

            {/* Screen UI (appears once the screen is full size) */}
            <motion.div className="absolute inset-0" style={{ opacity: screenUi }}>
              <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c9a84c]" />
                <span className="text-[10px] font-semibold tracking-wider text-white/85">NOW SHOWING</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={scene.id + '-label'}
                  initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="font-display absolute inset-x-0 bottom-8 px-6 text-center text-lg font-black italic leading-snug text-white drop-shadow-lg sm:text-2xl md:bottom-10 md:text-3xl"
                >
                  {scene.screenLabel}
                </motion.p>
              </AnimatePresence>

              <motion.div
                className="absolute inset-x-0 bottom-0 h-1 origin-left bg-gradient-to-r from-[#c9a84c] to-[#eed98a]"
                style={{ scaleX: progress }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Info row below the screen ── */}
        <motion.div
          className="absolute inset-x-0 bottom-4 z-[5] mx-auto flex max-w-4xl flex-col items-center gap-3 px-5 text-center md:bottom-6"
          style={{ opacity: infoOpacity, y: infoY }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={scene.id + '-info'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <h2 className="text-lg font-black text-[#2a0e4f] md:text-2xl">{scene.title}</h2>
              <p className="text-xs italic text-[#5b4578] md:text-sm" style={{ color: scene.color === '#fbbf24' ? '#a8780f' : undefined }}>
                {scene.tagline}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2" role="tablist" aria-label="Surprise ideas">
              {scenes.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={s.title}
                  onClick={() => jumpTo(i)}
                  className="h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a0e4f]"
                  style={{
                    width: i === idx ? 28 : 8,
                    background: i === idx ? '#c9a84c' : 'rgba(42,14,79,0.2)',
                  }}
                />
              ))}
            </div>
            <a
              href="#explore"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black text-[#2a0e4f] transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
            >
              See all ideas <ArrowRight size={12} />
            </a>
          </div>
        </motion.div>

        {/* ── Scroll hint ── */}
        <motion.div
          className="pointer-events-none absolute bottom-6 left-1/2 z-[5] flex -translate-x-1/2 flex-col items-center gap-2"
          style={{ opacity: hintOpacity }}
        >
          <span className="text-[10px] font-semibold tracking-[0.25em] text-[#5b4578]">SCROLL TO START THE SHOW</span>
          <div className="flex h-8 w-5 justify-center rounded-full border border-[#2a0e4f]/30 pt-1.5">
            <motion.span
              className="h-1.5 w-1 rounded-full bg-[#c9a84c]"
              animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Experience data ─────────────────────────────────────────────────────────

const EXPERIENCES: Scene[] = [
  {
    id: 'memory-reel',
    num: '01',
    title: 'The Memory Reel',
    tagline: 'A Journey Called Life.',
    screenLabel: '"A Journey Called Life"',
    color: '#a78bfa',
    img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80',
  },
  {
    id: 'video-wishes',
    num: '02',
    title: 'Video Wishes',
    tagline: 'Everyone. Even Those Far Away.',
    screenLabel: '"Surprise Messages Just for You"',
    color: '#34d399',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
  },
  {
    id: 'big-proposal',
    num: '03',
    title: 'The Big Proposal',
    tagline: 'Will You Be Mine Forever?',
    screenLabel: '"Will you be mine forever?"',
    color: '#f43f5e',
    img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200&q=80',
  },
  {
    id: 'birthday-surprise',
    num: '04',
    title: 'Birthday Surprise',
    tagline: 'Happy Birthday — You Are Loved.',
    screenLabel: '"Happy Birthday! You are loved more than you know."',
    color: '#fbbf24',
    img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1200&q=80',
  },
  {
    id: 'love-story',
    num: '05',
    title: 'Our Love Story',
    tagline: 'From the First Photo to Forever.',
    screenLabel: '"Our Story, Our Screen"',
    color: '#f472b6',
    img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80',
  },
  {
    id: 'grand-reveal',
    num: '06',
    title: 'Grand Announcement',
    tagline: 'Some News Deserves the Big Screen.',
    screenLabel: '"We Have Something to Tell You..."',
    color: '#c9a84c',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  },
  {
    id: 'friendship-reunion',
    num: '07',
    title: 'Friendship & Reunion',
    tagline: 'Old Friends. New Memories.',
    screenLabel: '"Here\'s to the Best Crew Ever"',
    color: '#818cf8',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
  },
  {
    id: 'custom-screen',
    num: '08',
    title: 'Your Custom Screen',
    tagline: 'Your Idea. Your Screen. Your Moment.',
    screenLabel: '"Your Story, Your Way"',
    color: '#fb923c',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
  },
]

const STEPS = [
  { num: '01', emoji: '🎁', title: 'Pick Your Surprise',  desc: 'Scroll through the 8 personalised experience ideas above and choose what fits.' },
  { num: '02', emoji: '🎬', title: 'Book Your Theatre',   desc: 'Pick your date and hall, then complete your booking online.' },
  { num: '03', emoji: '📤', title: 'Share Your Content',  desc: 'Send your photos, videos and messages after the booking is confirmed.' },
  { num: '04', emoji: '🌟', title: 'Watch the Magic',     desc: 'Arrive, settle in and experience your personalised surprise live on the big screen.' },
]

const FAQS = [
  { q: 'Can I bring my own photos and videos?',               a: 'Yes. Submit your own photos and videos for display on the theatre screen. Formats will be confirmed when you book.' },
  { q: 'Can I surprise someone with a proposal video?',       a: 'Yes. The Big Proposal is one of our most popular experiences. Book early to plan the sequence and content.' },
  { q: 'Can people from another city send video wishes?',     a: 'Yes. Friends from anywhere can record and send messages. You collect them and submit together as your content package.' },
  { q: 'How early should I submit my content?',               a: 'At least 3–5 days before your booking for review and preparation.' },
  { q: 'Are there additional charges for personalised experiences?', a: 'Charges depend on the experience type. Please enquire for a breakdown specific to your request.' },
]

// ─── Confetti particle ───────────────────────────────────────────────────────

const CONFETTI = [
  { emoji:'🎁', left:'5%',  top:'8%',  dur:3.8, delay:0    },
  { emoji:'✨', left:'18%', top:'3%',  dur:4.5, delay:0.6  },
  { emoji:'🎀', left:'32%', top:'7%',  dur:3.2, delay:1.1  },
  { emoji:'🎉', left:'50%', top:'2%',  dur:5.0, delay:0.3  },
  { emoji:'💫', left:'65%', top:'6%',  dur:4.1, delay:0.9  },
  { emoji:'🎊', left:'80%', top:'4%',  dur:3.6, delay:1.4  },
  { emoji:'🌟', left:'92%', top:'10%', dur:4.8, delay:0.2  },
  { emoji:'🎁', left:'10%', top:'88%', dur:4.2, delay:1.7  },
  { emoji:'💝', left:'45%', top:'92%', dur:3.9, delay:0.5  },
  { emoji:'🎈', left:'88%', top:'85%', dur:4.6, delay:1.2  },
  { emoji:'⭐', left:'75%', top:'50%', dur:5.2, delay:2.0  },
  { emoji:'🎀', left:'2%',  top:'50%', dur:4.0, delay:1.8  },
]

// ─── Video / preview overlay ──────────────────────────────────────────────────

function PreviewOverlay({ exp, onClose }: { exp: (typeof EXPERIENCES)[number]; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      {/* panel */}
      <motion.div
        className="relative z-10 w-full max-w-3xl rounded-3xl overflow-hidden"
        initial={{ scale: 0.88, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.88, y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 3px ${exp.color}` }}
      >
        {/* dummy placeholder — replace src with real video later */}
        <div className="relative bg-[#0d0618]" style={{ aspectRatio: '16/9' }}>
          <img
            src={exp.img}
            alt={exp.title}
            className="w-full h-full object-cover opacity-80"
          />
          {/* centre play placeholder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <motion.div
              className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-md"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Play size={32} className="text-white ml-1" fill="white" />
            </motion.div>
            <div className="rounded-full bg-black/50 backdrop-blur-sm px-5 py-2 text-center">
              <p className="text-white/60 text-xs mb-0.5 uppercase tracking-widest">Coming Soon</p>
              <p className="text-white font-black text-sm">{exp.screenLabel}</p>
            </div>
          </div>
          {/* colour accent bar at top */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: exp.color }} />
        </div>

        {/* info bar */}
        <div
          className="flex items-center justify-between gap-4 px-6 py-4"
          style={{ background: 'linear-gradient(135deg,#1a0840,#2a0e4f)' }}
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: exp.color }}>{exp.num} — Personalised Experience</span>
            <h3 className="text-white font-black text-lg leading-tight">{exp.title}</h3>
            <p className="text-white/55 text-xs italic">{exp.tagline}</p>
          </div>
          <Link
            to="/"
            state={{ highlightPlan: true }}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-black text-[#1a0840] hover:brightness-110 transition-all"
            style={{ background: exp.color }}
          >
            Book This <ArrowRight size={12} />
          </Link>
        </div>
      </motion.div>

      {/* close button */}
      <motion.button
        className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ✕
      </motion.button>
    </motion.div>
  )
}

// ─── Explore section ──────────────────────────────────────────────────────────

function ExploreSection() {
  const [active, setActive] = useState<(typeof EXPERIENCES)[number] | null>(null)

  return (
    <>
      <section
        id="explore"
        className="scroll-mt-20 relative overflow-hidden py-20 md:py-28"
        style={{ background: 'transparent' }}
      >
        <style>{`
          @keyframes pp-float-a  { 0%,100%{transform:translateY(0) scale(1);opacity:.7} 50%{transform:translateY(-28px) scale(1.3);opacity:1} }
          @keyframes pp-float-b  { 0%,100%{transform:translateY(0) rotate(0deg);opacity:.5} 50%{transform:translateY(-18px) rotate(180deg);opacity:.9} }
          @keyframes pp-float-c  { 0%,100%{transform:translateY(0) scale(0.8);opacity:.4} 60%{transform:translateY(-34px) scale(1.2);opacity:.8} }
          @keyframes pp-emoji    { 0%,100%{transform:translateY(0) rotate(-8deg) scale(1);opacity:.8} 50%{transform:translateY(-22px) rotate(8deg) scale(1.15);opacity:1} }
          @keyframes pp-shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
          @keyframes pp-badge    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
          @keyframes pp-glow-ring{ 0%{box-shadow:0 0 0 0px var(--gc)} 70%{box-shadow:0 0 0 10px transparent} 100%{box-shadow:0 0 0 0px transparent} }
          @keyframes pp-burst    { 0%{transform:scale(0) rotate(-15deg);opacity:0} 60%{opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        `}</style>

        {/* ambient blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-[#a78bfa]/12 blur-3xl" />
          <div className="absolute top-1/2 right-10 h-64 w-64 rounded-full bg-[#f472b6]/10 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-[#c9a84c]/14 blur-3xl" />
        </div>

        {/* floating surprise emojis */}
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            aria-hidden
            className="pointer-events-none absolute select-none text-xl"
            style={{
              left: c.left, top: c.top,
              animation: `pp-emoji ${c.dur}s ease-in-out infinite ${c.delay}s`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
            }}
          >
            {c.emoji}
          </span>
        ))}

        {/* dot sparkles */}
        {[
          { left:'8%',  top:'22%', size:7,  color:'#c9a84c', anim:'pp-float-a 3.1s ease-in-out infinite' },
          { left:'22%', top:'16%', size:5,  color:'#a78bfa', anim:'pp-float-b 4.2s ease-in-out infinite 0.5s' },
          { left:'72%', top:'19%', size:6,  color:'#34d399', anim:'pp-float-a 5s ease-in-out infinite 0.3s' },
          { left:'4%',  top:'65%', size:5,  color:'#f43f5e', anim:'pp-float-c 3.5s ease-in-out infinite 0.8s' },
          { left:'95%', top:'60%', size:7,  color:'#a78bfa', anim:'pp-float-a 4.8s ease-in-out infinite 0.2s' },
        ].map((s, i) => (
          <span key={i} aria-hidden style={{ position:'absolute', left:s.left, top:s.top, width:s.size, height:s.size, borderRadius:'50%', background:s.color, animation:s.anim }} />
        ))}

        <div className="relative max-w-6xl mx-auto px-4 md:px-8">

          {/* header */}
          <motion.div
            initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-3 rounded-full border border-[#c9a84c]/30 bg-[#fffaf4] px-5 py-1.5"
              whileHover={{ scale: 1.05 }}
            >
              <motion.span animate={{ rotate: [0, 20, -10, 20, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                <Sparkles size={14} className="text-[#c9a84c]" />
              </motion.span>
              <span className="font-cursive text-lg text-[#c9933a]">All Surprises</span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-black text-[#2a0e4f] leading-tight">
              What Can You Show on the{' '}
              <span style={{ background:'linear-gradient(135deg,#2a0e4f,#8e39c7,#c9a84c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Big Screen?
              </span>
            </h2>

            <motion.div
              className="mx-auto mt-4 h-1 rounded-full"
              style={{ background:'linear-gradient(90deg,#c9a84c,#a78bfa,#f472b6)', width:0 }}
              whileInView={{ width: 80 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }}
            />
          </motion.div>

          {/* cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {EXPERIENCES.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 40, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8, scale: 1.03 }}
                className="group relative rounded-2xl overflow-hidden bg-white cursor-pointer"
                style={{ boxShadow:'0 4px 16px rgba(42,14,79,0.07)', ['--gc' as string]: exp.color + '55' }}
                onClick={() => setActive(exp)}
              >
                {/* glow ring */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ boxShadow:`0 0 0 2px ${exp.color}`, animation:'pp-glow-ring 1.6s ease-out infinite' }}
                />

                {/* image */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={exp.img} alt={exp.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-30" style={{ background: exp.color }} />

                  {/* badge */}
                  <span
                    className="absolute top-2.5 left-2.5 text-[9px] font-black uppercase tracking-widest rounded-full px-2.5 py-1 text-white shadow-lg"
                    style={{ background: exp.color, animation:'pp-badge 2s ease-in-out infinite' }}
                  >
                    {exp.num}
                  </span>

                  {/* play button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white/25 backdrop-blur-sm"
                      whileHover={{ scale: 1.15 }}
                      style={{ animation:'pp-burst 0.3s ease-out' }}
                    >
                      <Play size={16} className="text-white ml-0.5" fill="white" />
                    </motion.div>
                  </div>

                  {/* screen-label ribbon */}
                  <div
                    className="absolute bottom-0 left-0 right-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0 px-3 py-2"
                    style={{ background:`linear-gradient(90deg,${exp.color}ee,${exp.color}99)` }}
                  >
                    <p className="text-[9px] font-semibold text-white leading-tight truncate">{exp.screenLabel}</p>
                  </div>
                </div>

                {/* body */}
                <div className="px-4 pt-3 pb-4">
                  <h3 className="font-black text-[#1a0840] text-base mb-1 group-hover:text-[#5b1fa3] transition-colors">{exp.title}</h3>
                  <p className="text-[#4a2d6e] text-xs font-semibold italic leading-snug">{exp.tagline}</p>
                </div>

                {/* shimmer bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px]"
                  style={{ background:`linear-gradient(90deg,${exp.color},${exp.color}88,${exp.color})`, backgroundSize:'200% auto', animation:'pp-shimmer 2s linear infinite' }}
                />
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="mt-14 text-center"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/" state={{ highlightPlan: true }}
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-10 py-4 text-sm font-black text-white"
                style={{ background:'linear-gradient(135deg,#2a0e4f 0%,#5b1fa3 60%,#8e39c7 100%)', boxShadow:'0 8px 32px rgba(91,31,163,0.35)' }}
              >
                <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[130%]" />
                <span className="relative">Book My Theatre &amp; Plan My Surprise</span>
                <motion.span animate={{ x:[0,4,0] }} transition={{ duration:1.4, repeat:Infinity }}>
                  <ArrowRight size={15} />
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* video / preview overlay */}
      <AnimatePresence>
        {active && <PreviewOverlay exp={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#f0e6cc] last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 py-4 text-left">
        <span className="text-[#2a0e4f] font-semibold text-sm">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 mt-0.5">
          <ChevronDown size={16} className="text-[#5b4578]" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-[#5b4578] text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Default export ───────────────────────────────────────────────────────────

export default function PersonalisePage() {
  const stepsRef = useRef(null)
  const faqRef   = useRef(null)
  const stepsInView = useInView(stepsRef, { once: true, margin: '-60px' })
  const faqInView   = useInView(faqRef,   { once: true, margin: '-60px' })

  return (
    <>
      <Seo
        title="Personalise Your Surprise | BOB Talkies — Private Theatre Hyderabad"
        description="Create unforgettable personalised screen experiences — from birthday surprises and proposals to memory reels and video wishes on the big private theatre screen."
        canonical="/personalise"
      />

      <PageShell fullWidth>

        {/* ── Hero (scroll-pinned) ── */}
        <PersonaliseHero experiences={EXPERIENCES} />

        {/* ── All 8 experiences list ─────────────────────────────────────── */}
        <ExploreSection />

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section
          ref={stepsRef}
          className="relative py-16 md:py-24 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#1a0840 0%,#2a0e4f 50%,#1e0a3c 100%)' }}
        >
          {/* animated star particles */}
          <style>{`
            @keyframes hiw-star { 0%,100%{transform:scale(1) rotate(0deg);opacity:.4} 50%{transform:scale(1.6) rotate(180deg);opacity:.9} }
            @keyframes hiw-orb  { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-30px);} }
            @keyframes hiw-line { 0%{width:0;opacity:0} 100%{width:100%;opacity:1} }
            @keyframes hiw-num  { 0%{transform:scale(0.6);opacity:0} 100%{transform:scale(1);opacity:1} }
          `}</style>

          {/* bg glow orbs */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-[#7c3aed]/20 blur-3xl" style={{ animation:'hiw-orb 6s ease-in-out infinite' }} />
            <div className="absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-[#c9a84c]/15 blur-3xl" style={{ animation:'hiw-orb 7s ease-in-out infinite 1s' }} />
            <div className="absolute top-1/2 right-10 h-40 w-40 rounded-full bg-[#f472b6]/12 blur-2xl" style={{ animation:'hiw-orb 5s ease-in-out infinite 2s' }} />
          </div>

          {/* floating star dots */}
          {[
            {left:'6%', top:'18%', size:5, delay:'0s'},   {left:'92%',top:'14%',size:4, delay:'0.8s'},
            {left:'18%',top:'80%', size:3, delay:'1.4s'},  {left:'78%',top:'75%',size:6, delay:'0.4s'},
            {left:'50%',top:'8%',  size:4, delay:'1.1s'},  {left:'35%',top:'88%',size:3, delay:'2s'},
          ].map((s,i)=>(
            <span key={i} aria-hidden style={{ position:'absolute', left:s.left, top:s.top, width:s.size, height:s.size, borderRadius:'50%', background:'#c9a84c', animation:`hiw-star 3.5s ease-in-out infinite ${s.delay}` }} />
          ))}

          <div className="relative max-w-6xl mx-auto px-4 md:px-8">

            {/* header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={stepsInView ? { opacity: 1, y: 0 } : {}}
              className="text-center mb-14"
            >
              <motion.p
                className="font-cursive text-xl text-[#e8c96a] mb-0.5"
                animate={{ opacity:[0.7,1,0.7] }} transition={{ duration:3, repeat:Infinity }}
              >Simple Process</motion.p>
              <h2 className="text-2xl md:text-3xl font-black text-white">How It Works</h2>
              <motion.div
                className="mx-auto mt-3 h-[3px] rounded-full bg-gradient-to-r from-[#c9a84c] via-[#f472b6] to-[#a78bfa]"
                initial={{ width: 0, opacity:0 }} animate={stepsInView ? { width: 80, opacity:1 } : {}}
                transition={{ duration:0.8, delay: 0.3 }}
              />
            </motion.div>

            {/* steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={stepsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ delay: 0.15 * i, duration: 0.55, ease: [0.22,1,0.36,1] }}
                  whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(201,168,76,0.18)' }}
                  className="group relative flex flex-col items-center text-center p-6 rounded-3xl border border-white/10 cursor-default"
                  style={{ background: 'rgba(255,255,255,0.06)', boxShadow: '0 2px 20px rgba(0,0,0,0.25)' }}
                >
                  {/* glow border on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow:'0 0 0 1.5px rgba(201,168,76,0.6)' }} />

                  {/* step number badge */}
                  <motion.div
                    className="absolute -top-3 -right-2 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-[#1a0840]"
                    style={{ background:'linear-gradient(135deg,#c9a84c,#eed98a)', animation:`hiw-num 0.5s ease-out ${0.15*i + 0.3}s both` }}
                  >
                    {i + 1}
                  </motion.div>

                  {/* emoji with float */}
                  <motion.div
                    className="text-5xl mb-4"
                    animate={{ y:[0,-6,0], rotate:[0,4,-4,0] }}
                    transition={{ duration: 3 + i*0.5, repeat:Infinity, ease:'easeInOut', delay: i*0.4 }}
                  >
                    {step.emoji}
                  </motion.div>

                  {/* gold shimmer line above step label */}
                  <motion.div
                    className="mb-2 h-px rounded-full"
                    style={{ background:'linear-gradient(90deg,transparent,#c9a84c,transparent)', width:0 }}
                    animate={stepsInView ? { width:'60%' } : {}}
                    transition={{ delay: 0.2*i + 0.5, duration:0.6 }}
                  />

                  <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a84c] mb-2">Step {step.num}</span>
                  <h3 className="font-black text-white text-base mb-2 group-hover:text-[#e8c96a] transition-colors">{step.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{step.desc}</p>

                  {/* connector arrow */}
                  {i < 3 && (
                    <motion.div
                      className="hidden lg:flex absolute top-12 -right-4 z-10 items-center"
                      initial={{ opacity:0, x:-8 }} animate={stepsInView ? { opacity:1, x:0 } : {}}
                      transition={{ delay: 0.15*i + 0.6 }}
                    >
                      <div className="h-px w-5 bg-gradient-to-r from-[#c9a84c]/60 to-[#c9a84c]/20" />
                      <div className="border-t-2 border-r-2 border-[#c9a84c]/50 h-2 w-2 rotate-45 -ml-1" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* ── FAQs ─────────────────────────────────────────────────────────── */}
        <section ref={faqRef} className="py-16 md:py-24" style={{ background: 'transparent' }}>
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={faqInView ? { opacity: 1, y: 0 } : {}}
              className="text-center mb-10"
            >
              <p className="font-cursive text-xl text-[#c9933a] mb-0.5">Common Questions</p>
              <h2 className="text-2xl md:text-3xl font-black text-[#2a0e4f]">Frequently Asked</h2>
              <motion.div className="mx-auto mt-3 h-[3px] w-10 rounded-full bg-[#c9a84c]"
                initial={{ width: 0 }} animate={faqInView ? { width: 40 } : {}} transition={{ delay: 0.3 }} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={faqInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-[#f0e6cc] bg-white px-6 py-2"
              style={{ boxShadow: '0 4px 20px rgba(42,14,79,0.07)' }}
            >
              {FAQS.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
            </motion.div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────────── */}
        <section
          className="py-16 md:py-24 relative overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#2a0e4f 0%,#3d1575 50%,#2a0e4f 100%)' }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/10 blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#a78bfa]/10 blur-3xl -translate-x-1/3 translate-y-1/3" />
          </div>
          <div className="relative max-w-2xl mx-auto px-4 md:px-8 text-center">
            <div className="text-5xl mb-6">🎁</div>
            <h2 className="font-display text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              Some Surprises Deserve the Big Screen.
            </h2>
            <p className="text-white/55 text-base max-w-md mx-auto mb-10">
              Bring your memories. Bring your idea. We'll help you make the moment unforgettable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                state={{ highlightPlan: true }}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-black text-[#2a0e4f] transition-all hover:brightness-110 hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
              >
                Plan My Surprise <ArrowRight size={14} />
              </Link>
              <a
                href="#explore"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
              >
                Explore All Surprises
              </a>
            </div>
          </div>
        </section>

      </PageShell>
    </>
  )
}
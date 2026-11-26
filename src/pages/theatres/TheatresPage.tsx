import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { guestRangeText, theatreFacts } from '@/features/catalog/theatre'
import { CONFIRM_TEXT } from '@/content/bookingInclusions'
import { ChevronLeft, ChevronRight, Ticket, X, Pause, Play, Images, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Seo } from '@/components/seo/Seo'
import { PriceTag } from '@/components/ui/PriceTag'
import { ErrorState } from '@/components/ui/EmptyState'
import { PageShell } from '@/components/layout/PageShell'
import type { Theatre } from '@/schemas/theatre'
import { useTheatres } from '@/features/catalog/api'

const AUTOPLAY_MS = 7000
const CONDENSED = "'Bebas Neue', 'Oswald', 'Anton', 'Arial Narrow', sans-serif"

const pad = (n: number) => String(n).padStart(2, '0')

/** Per-theatre visual identity — accent colour, badge label, short product description */
const IDENTITY: Record<string, {
  accent: string
  glow: string
  tint: string        // subtle image overlay tint (rgba)
  label: string       // identity badge
  desc: string        // short product description shown on the slide
}> = {
  delight: {
    accent: '#f43f5e',
    glow:   'rgba(244,63,94,0.40)',
    tint:   'rgba(136,19,55,0.18)',
    label:  'INTIMATE',
    desc:   'Intimate luxury for couples and small celebrations.',
  },
  heavens: {
    accent: '#a78bfa',
    glow:   'rgba(167,139,250,0.40)',
    tint:   'rgba(76,29,149,0.18)',
    label:  'STYLISH',
    desc:   'Comfortable and stylish group experiences.',
  },
  filmdom: {
    accent: '#fbbf24',
    glow:   'rgba(251,191,36,0.40)',
    tint:   'rgba(120,53,15,0.18)',
    label:  'CINEMATIC',
    desc:   'Premium group celebrations and movie experiences.',
  },
  cosmos: {
    accent: '#818cf8',
    glow:   'rgba(129,140,248,0.40)',
    tint:   'rgba(30,27,75,0.22)',
    label:  'GRAND',
    desc:   'A distinctive immersive group experience.',
  },
  'vibe-hall': {
    accent: '#34d399',
    glow:   'rgba(52,211,153,0.40)',
    tint:   'rgba(6,78,59,0.20)',
    label:  'PARTY HALL',
    desc:   'Large celebrations, sports screenings, seminars and private events.',
  },
}

const FALLBACK = IDENTITY['delight']

function getIdentity(theatre?: Theatre) {
  if (!theatre) return FALLBACK
  return IDENTITY[theatre.slug] ?? FALLBACK
}

// ─── Per-theatre reviews ──────────────────────────────────────────────────────

const THEATRE_REVIEWS: Record<string, {
  name: string; occasion: string; stars: number; text: string;
  avatar: string; thumb: string; hasVideo: boolean;
}[]> = {
  delight: [
    { name: 'Priya & Arjun', occasion: 'Surprise Proposal 💍', stars: 5, text: 'Absolutely magical! The intimate setting made every moment feel so personal. We were the only ones there and the decor was breathtaking.', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=480&q=80', hasVideo: true },
    { name: 'Sneha R.', occasion: 'Anniversary 🌹', stars: 5, text: 'Perfect cosy theatre for two. The rose petals, the LED board with our names — it was everything I dreamed of. Booked it twice already!', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=480&q=80', hasVideo: false },
    { name: 'Rahul M.', occasion: 'Birthday Surprise 🎂', stars: 5, text: 'My girlfriend had no idea. I set it all up and she walked in to her favourite song playing on the big screen. She cried happy tears!', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&q=80', hasVideo: true },
  ],
  heavens: [
    { name: 'Divya & Group', occasion: 'Bachelorette 🥂', stars: 5, text: 'We were 6 girls and the Heavens theatre was perfect. Great vibes, the screen is huge and the staff handled everything so smoothly.', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=480&q=80', hasVideo: false },
    { name: 'Kartik & Friends', occasion: 'Reunion Night 🎉', stars: 5, text: 'Old college gang back together after 5 years. We screened our trip photos and it was so emotional. Heavens was the perfect size for us.', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=480&q=80', hasVideo: true },
    { name: 'Meena Family', occasion: 'Family Movie Night 🍿', stars: 5, text: 'Booked for a family get-together. Everyone from grandparents to kids had a blast. Clean, comfortable and the sound was amazing.', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=480&q=80', hasVideo: false },
  ],
  filmdom: [
    { name: 'Suresh & 10 Friends', occasion: 'Birthday Bash 🎊', stars: 5, text: 'Big group, big screen, big fun! Filmdom lived up to the cinematic name. Stunning picture quality and the decor team went above and beyond.', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&q=80', hasVideo: true },
    { name: 'Ananya K.', occasion: 'Farewell Party 🌟', stars: 5, text: 'Organised a farewell for a colleague here. Everyone was so touched. The personal video reel on that giant screen had the whole room in tears.', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=480&q=80', hasVideo: false },
    { name: 'Vignesh B.', occasion: 'Corporate Screening 🎬', stars: 5, text: 'Used Filmdom for a team outing movie screening. Everyone loved it. Much better than a multiplex — private, premium and everyone gets the best seat.', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=480&q=80', hasVideo: true },
  ],
  cosmos: [
    { name: 'Harsha Family', occasion: 'Grand Anniversary 👑', stars: 5, text: 'Parents\' 25th anniversary in Cosmos was unforgettable. The sheer grandeur of the hall made them feel like royalty. Worth every rupee.', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=480&q=80', hasVideo: true },
    { name: 'Reena & 15 Guests', occasion: 'Baby Shower 🌸', stars: 5, text: 'Cosmos is so spacious and elegant. We had 15 guests and it still felt luxurious. The screen quality blew everyone away.', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&q=80', hasVideo: false },
    { name: 'Nikhil S.', occasion: 'Proposal 💍', stars: 5, text: 'Went all out for the proposal. Cosmos was the most dramatic and beautiful setting. She said yes immediately when she saw the screen message!', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=480&q=80', hasVideo: true },
  ],
  'vibe-hall': [
    { name: 'Rohit & 30 Friends', occasion: 'IPL Watch Party 🏏', stars: 5, text: 'Rented Vibe Hall for the IPL final. 30 of us watching on that massive screen with surround sound — it was better than being at the stadium!', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=480&q=80', hasVideo: true },
    { name: 'TechCorp HR Team', occasion: 'Team Outing 💼', stars: 5, text: 'Used it for a team-building session and movie. The hall has everything you need — presentation screen, great sound, comfortable seating.', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&q=80', hasVideo: false },
    { name: 'Swathi\'s Birthday Crew', occasion: 'Big Birthday Party 🎈', stars: 5, text: '40 people, one epic party. Vibe Hall delivered on every front. Decoration, sound, screen — all top notch. Everyone kept asking where we booked!', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=480&q=80', hasVideo: true },
  ],
}

function TheatreReviewsSection({ theatreSlug, accent }: { theatreSlug: string; accent: string }) {
  const reviews = THEATRE_REVIEWS[theatreSlug] ?? []
  const [videoReview, setVideoReview] = useState<(typeof reviews)[number] | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  if (!reviews.length) return null

  return (
    <>
      <section ref={ref} className="relative py-16 md:py-20 overflow-hidden" style={{ background: 'transparent' }}>
        <style>{`
          @keyframes tr-rise { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
        `}</style>

        {/* subtle blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full blur-3xl" style={{ background: accent + '12' }} />
          <div className="absolute bottom-0 right-10 h-56 w-56 rounded-full blur-3xl" style={{ background: accent + '0e' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 md:px-8">
          {/* header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={theatreSlug}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="h-px flex-1 max-w-[40px]" style={{ background: accent }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: accent }}>Guest Reviews</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#3d0a24]">
                What Guests Loved About{' '}
                <span style={{ background: `linear-gradient(135deg,${accent},${accent}99)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  This Theatre
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-2">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={accent} stroke="none" />)}
                <span className="text-sm font-black text-[#3d0a24]">5.0</span>
                <span className="text-xs text-[#5b2535]/60 ml-1">· All verified guests</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* reviews grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={theatreSlug + '-grid'}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {reviews.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -5 }}
                  className="group relative flex flex-col rounded-3xl overflow-hidden bg-white border border-[#f0e6cc]"
                  style={{ boxShadow: '0 4px 20px rgba(42,14,79,0.07)' }}
                >
                  {/* thumb */}
                  <div
                    className="relative h-40 overflow-hidden cursor-pointer"
                    onClick={() => r.hasVideo && setVideoReview(r)}
                  >
                    <img src={r.thumb} alt={r.occasion} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* occasion badge */}
                    <span
                      className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider rounded-full px-2.5 py-1 text-white"
                      style={{ background: accent }}
                    >{r.occasion}</span>

                    {/* video chip */}
                    {r.hasVideo && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1">
                        <Play size={9} className="text-white" fill="white" />
                        <span className="text-[9px] font-bold text-white">Watch Reel</span>
                      </div>
                    )}

                    {/* hover play */}
                    {r.hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/80 bg-white/20 backdrop-blur-sm">
                          <Play size={14} className="text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* body */}
                  <div className="flex flex-col flex-1 p-5 gap-3">
                    <div className="flex items-center gap-3">
                      <img src={r.avatar} alt={r.name} className="h-9 w-9 rounded-full object-cover ring-2" style={{ '--tw-ring-color': accent + '55' } as React.CSSProperties} />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[#250514] text-sm truncate">{r.name}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} size={9} fill="#f59e0b" stroke="none" />)}
                        </div>
                      </div>
                    </div>
                    <p className="text-[#4a2d6e] text-sm leading-relaxed flex-1">
                      <span className="text-xl font-serif leading-none mr-0.5" style={{ color: accent }}>"</span>
                      {r.text}
                      <span className="text-xl font-serif leading-none ml-0.5" style={{ color: accent }}>"</span>
                    </p>
                  </div>

                  {/* accent stripe */}
                  <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${accent},${accent}44)` }} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* video overlay */}
      <AnimatePresence>
        {videoReview && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setVideoReview(null)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden"
              initial={{ scale: 0.88, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{ boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 0 2px ${accent}` }}
            >
              <div className="relative bg-[#0d0618]" style={{ aspectRatio: '16/9' }}>
                <img src={videoReview.thumb} alt="" className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-md"
                    animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    <Play size={24} className="text-white ml-1" fill="white" />
                  </motion.div>
                  <div className="rounded-full bg-black/50 backdrop-blur-sm px-5 py-2 text-center">
                    <p className="text-white/60 text-xs uppercase tracking-widest mb-0.5">Guest Reel · Coming Soon</p>
                    <p className="text-white font-black text-sm">{videoReview.name} · {videoReview.occasion}</p>
                  </div>
                </div>
                <div className="absolute top-0 inset-x-0 h-1" style={{ background: accent }} />
              </div>
              <div className="flex items-center gap-4 px-6 py-4" style={{ background: 'linear-gradient(135deg,#250514,#3d0a24)' }}>
                <img src={videoReview.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="text-white font-black text-sm">{videoReview.name}</p>
                  <p className="text-white/50 text-xs">{videoReview.occasion}</p>
                </div>
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><Star key={s} size={12} fill="#f59e0b" stroke="none" />)}</div>
              </div>
            </motion.div>
            <button
              className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              onClick={() => setVideoReview(null)}
            >✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default function TheatresPage() {
  const { data: theatres, isLoading, isError, refetch } = useTheatres()

  const [active, setActive]         = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [autoPaused, setAutoPaused]   = useState(false)
  const [lightbox, setLightbox]       = useState<string | null>(null)
  const isPaused = showDetails || autoPaused
  const count    = theatres?.length ?? 0

  const go = useCallback(
    (dir: 1 | -1) => {
      if (!count) return
      setActive((i) => (i + dir + count) % count)
    },
    [count],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft')  go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const upcoming = useMemo(() => {
    if (!theatres?.length) return []
    return Array.from({ length: theatres.length - 1 }, (_, i) => {
      const index = (active + 1 + i) % theatres.length
      return { theatre: theatres[index], index }
    })
  }, [theatres, active])

  const current = theatres?.[active]
  const id      = getIdentity(current)

  return (
    <>
      <Seo
        title="Our Private Theatres | BOB Talkies Hyderabad"
        description="Explore 5 premium private theatres in Hyderabad — from intimate 2-person suites to grand 40-person celebration halls. 4K, Dolby Atmos, full decoration and photography."
        canonical="/theatres"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        @keyframes tp-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes tp-rise     { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes tp-card     { from { opacity: 0; transform: translateX(48px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes tp-zoom     { from { transform: scale(1.08) } to { transform: scale(1) } }
        .tp-rise { animation: tp-rise .8s cubic-bezier(.2,.7,.2,1) both }
        .tp-card { animation: tp-card .7s cubic-bezier(.2,.7,.2,1) both }
        .tp-zoom { animation: tp-zoom 1.6s ease-out both }
        .tp-hero:hover .tp-progress { animation-play-state: paused }
        @media (prefers-reduced-motion: reduce) {
          .tp-rise, .tp-card, .tp-zoom { animation: none }
        }
      `}</style>

      <PageShell fullWidth>
        {isError ? (
          <div className="min-h-screen bg-bg-navy flex items-center justify-center px-4">
            <ErrorState title="Failed to Load Theatres" retry={refetch} />
          </div>
        ) : isLoading || !current ? (
          <div className="min-h-screen bg-bg-navy animate-pulse" aria-busy="true" aria-label="Loading theatres" />
        ) : (
          <section
            className="tp-hero relative min-h-screen w-full overflow-hidden bg-bg-navy text-white"
            aria-roledescription="carousel"
            aria-label="Private theatres"
          >
            {/* ── Background images (cross-fade) ── */}
            {theatres!.map((t, i) => {
              const tid = getIdentity(t)
              return (
                <div
                  key={t.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === active ? 'opacity-100' : 'opacity-0'}`}
                  aria-hidden={i !== active}
                >
                  <img
                    key={i === active ? `on-${active}` : `off-${i}`}
                    src={t.images[0]}
                    alt={`${t.name} private theatre`}
                    className={`h-full w-full object-cover ${i === active ? 'tp-zoom' : ''}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                  {/* Per-theatre colour tint */}
                  <div className="absolute inset-0" style={{ background: tid.tint }} />
                </div>
              )
            })}

            {/* Legibility overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35" />

            {/* ── Top progress bar — theatre accent colour ── */}
            <div className="absolute left-0 right-0 top-0 z-20 h-[3px] bg-white/10">
              <div
                key={active}
                className="tp-progress h-full origin-left"
                style={{
                  background: id.accent,
                  animation: `tp-progress ${AUTOPLAY_MS}ms linear forwards`,
                  animationPlayState: isPaused ? 'paused' : 'running',
                }}
                onAnimationEnd={() => { if (!isPaused) go(1) }}
              />
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col justify-end px-6 pb-28 pt-32 md:px-12 lg:block lg:pb-0 lg:pt-0">

              {/* Left: slide text */}
              <div
                key={current.id}
                className="max-w-xl lg:absolute lg:left-12 lg:top-1/2 lg:-translate-y-[6%]"
              >
                {/* Identity badge */}
                <div className="tp-rise mb-4" style={{ animationDelay: '.02s' }}>
                  <span
                    className="inline-block rounded-full px-3 py-1 text-[9px] font-black tracking-[0.28em] uppercase text-white"
                    style={{ background: id.accent }}
                  >
                    {id.label}
                  </span>
                </div>

                {/* Accent bar — theatre colour */}
                <span
                  className="tp-rise mb-4 block h-[2.5px] w-6 rounded-full"
                  style={{ background: id.accent, animationDelay: '.06s' }}
                />

                <p className="tp-rise text-base text-white/90 md:text-lg" style={{ animationDelay: '.12s' }}>
                  {guestRangeText(current)} · {current.screenSize}
                </p>

                <h1
                  className="tp-rise mt-2 text-6xl uppercase leading-[0.95] tracking-wide md:text-7xl lg:text-8xl"
                  style={{ fontFamily: CONDENSED, animationDelay: '.20s' }}
                >
                  {current.name}
                </h1>

                {/* Product description from identity map */}
                <p
                  className="tp-rise mt-4 max-w-sm text-base font-medium leading-snug"
                  style={{ color: id.accent, animationDelay: '.28s' }}
                >
                  {id.desc}
                </p>

                <p
                  className="tp-rise mt-2 max-w-md text-sm leading-relaxed text-white/55 line-clamp-2"
                  style={{ animationDelay: '.32s' }}
                >
                  {current.description}
                </p>

                <div className="tp-rise mt-7 flex flex-wrap items-center gap-4" style={{ animationDelay: '.40s' }}>
                  <Link
                    to={`/book?theatre=${current.id}`}
                    aria-label={`Book ${current.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-black transition-transform hover:scale-110"
                    style={{ background: id.accent }}
                  >
                    <Ticket size={18} />
                  </Link>
                  <Link
                    to={`/theatres/${current.slug}`}
                    className="rounded-full border border-white/40 px-7 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors"
                    style={{ ['--hover-color' as string]: id.accent }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = id.accent; (e.currentTarget as HTMLElement).style.color = id.accent }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                  >
                    Discover Theatre
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setShowDetails(true); setAutoPaused(true) }}
                    className="flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = id.accent; (e.currentTarget as HTMLElement).style.color = id.accent }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.color = 'white' }}
                  >
                    <Images size={13} /> Gallery
                  </button>
                  <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/60">
                    From <PriceTag paise={current.startingPricePaise} />
                  </span>
                </div>
              </div>

              {/* ── Right: upcoming theatre cards ── */}
              <div className="mt-10 lg:absolute lg:bottom-[24%] lg:left-[44%] lg:right-0 lg:mt-0 lg:overflow-hidden lg:py-4">
                <div
                  key={active}
                  className="flex gap-4 overflow-x-auto pb-2 lg:overflow-visible lg:pb-0"
                  role="list"
                >
                  {upcoming.map(({ theatre, index }, i) => {
                    const uid = getIdentity(theatre)
                    return (
                      <button
                        key={theatre.id}
                        role="listitem"
                        type="button"
                        onClick={() => setActive(index)}
                        aria-label={`Show ${theatre.name}`}
                        className="tp-card group relative h-52 w-36 shrink-0 overflow-hidden rounded-2xl text-left shadow-[0_18px_30px_-10px_rgba(0,0,0,0.65)] outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 md:h-60 md:w-40 lg:h-[16.5rem] lg:w-[9.5rem] xl:w-44"
                        style={{
                          animationDelay: `${i * 0.07}s`,
                          ['--tw-ring-color' as string]: uid.accent,
                          boxShadow: `0 18px 30px -10px rgba(0,0,0,0.65), 0 0 0 0 ${uid.glow}`,
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 22px 36px -10px rgba(0,0,0,0.70), 0 0 20px 2px ${uid.glow}` }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 18px 30px -10px rgba(0,0,0,0.65), 0 0 0 0 ${uid.glow}` }}
                      >
                        <img
                          src={theatre.images[0]}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        {/* Base gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        {/* Theatre colour tint */}
                        <div className="absolute inset-0" style={{ background: uid.tint }} />

                        {/* Identity badge — top left */}
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className="inline-block rounded-full px-2 py-[2px] text-[7px] font-black tracking-[0.22em] uppercase text-white"
                            style={{ background: uid.accent }}
                          >
                            {uid.label}
                          </span>
                        </div>

                        {/* Bottom info */}
                        <div className="absolute inset-x-0 bottom-0 p-3">
                          {/* Accent line */}
                          <span
                            className="mb-2 block h-[2px] w-4 rounded-full"
                            style={{ background: uid.accent }}
                          />
                          <p className="text-[10px] text-white/75">
                            {guestRangeText(theatre)}
                          </p>
                          <p
                            className="mt-1 text-xl uppercase leading-[1.05] tracking-wide text-white"
                            style={{ fontFamily: CONDENSED }}
                          >
                            {theatre.name}
                          </p>
                        </div>

                        {/* Bottom accent stripe */}
                        <div
                          className="absolute bottom-0 left-0 right-0 h-[3px] opacity-70"
                          style={{ background: uid.accent }}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ── Controls: arrows + progress + counter + pause ── */}
              <div
                className={`absolute inset-x-6 flex items-center gap-4 md:inset-x-12 lg:inset-x-auto lg:left-[44%] lg:right-12 transition-all duration-500 ${
                  showDetails ? 'bottom-[calc(60vh+8px)]' : 'bottom-8 lg:bottom-[9%]'
                }`}
              >
                {[
                  { fn: () => go(-1), icon: <ChevronLeft size={18} />,  label: 'Previous theatre' },
                  { fn: () => go(1),  icon: <ChevronRight size={18} />, label: 'Next theatre' },
                  {
                    fn: () => setAutoPaused(p => !p),
                    icon: autoPaused ? <Play size={16} /> : <Pause size={16} />,
                    label: autoPaused ? 'Resume' : 'Pause',
                  },
                ].map((btn, bi) => (
                  <button
                    key={bi}
                    type="button"
                    onClick={btn.fn}
                    aria-label={btn.label}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/50 text-white transition-all"
                    onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = id.accent; el.style.color = id.accent }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(255,255,255,0.5)'; el.style.color = 'white' }}
                  >
                    {btn.icon}
                  </button>
                ))}

                <div className="relative mx-2 hidden h-px flex-1 bg-white/30 sm:block">
                  <div
                    className="absolute left-0 top-0 h-px transition-all duration-700"
                    style={{ width: `${((active + 1) / count) * 100}%`, background: id.accent }}
                  />
                </div>

                <span
                  className="ml-auto text-5xl leading-none tracking-wide sm:ml-0"
                  style={{ fontFamily: CONDENSED, color: id.accent }}
                  aria-live="polite"
                >
                  {pad(active + 1)}
                </span>
              </div>
            </div>

            {/* ── Details drawer ── */}
            <div
              className={`absolute inset-x-0 bottom-0 z-30 transition-transform duration-500 ease-in-out ${showDetails ? 'translate-y-0' : 'translate-y-full'}`}
              style={{ height: '60vh' }}
            >
              <div
                className="h-full overflow-y-auto backdrop-blur-md border-t px-6 pt-5 pb-8 md:px-12"
                style={{ background: 'rgba(10,5,20,0.90)', borderColor: `${id.accent}30` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block rounded-full px-2.5 py-1 text-[8px] font-black tracking-[0.24em] uppercase text-white"
                      style={{ background: id.accent }}
                    >
                      {id.label}
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/40 mb-0.5">Gallery & Details</p>
                      <p className="text-white font-semibold text-lg" style={{ fontFamily: CONDENSED }}>{current?.name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDetails(false)}
                    aria-label="Close details"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white/60 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Identity description */}
                <p className="text-sm font-semibold mb-4" style={{ color: id.accent }}>{id.desc}</p>

                {/* Image gallery */}
                <div className="flex gap-3 mb-6 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                  {current?.images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightbox(img)}
                      className="shrink-0 group relative overflow-hidden rounded-xl focus-visible:ring-2"
                      style={{ width: 200, height: 120, ['--tw-ring-color' as string]: id.accent }}
                    >
                      <img src={img} alt={`${current.name} view ${i + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
                      {/* Bottom accent on first image */}
                      {i === 0 && <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: id.accent }} />}
                    </button>
                  ))}
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 pb-5 border-b border-white/10">
                  {[
                    { label: 'Screen',     value: current?.screenSize },
                    { label: 'Resolution', value: current?.resolution },
                    { label: 'Sound',      value: current?.soundSystem },
                    { label: 'Seating',    value: current?.seatingType || CONFIRM_TEXT },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: `${id.accent}99` }}>{s.label}</p>
                      <p className="text-white text-sm font-medium leading-snug">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(current ? theatreFacts(current) : []).map(f => (
                    <span
                      key={f}
                      className="text-[11px] rounded-full px-3 py-1"
                      style={{ color: id.accent, border: `1px solid ${id.accent}40`, background: `${id.accent}0d` }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Lightbox ── */}
            {lightbox && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
                onClick={() => setLightbox(null)}
              >
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  aria-label="Close image"
                  className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:border-white transition-colors"
                >
                  <X size={18} />
                </button>
                <img
                  src={lightbox.replace('w=1920', 'w=2400').replace('w=1200', 'w=1920')}
                  alt="Theatre"
                  className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            )}
          </section>
        )}

        {/* Per-theatre reviews */}
        {current && (
          <TheatreReviewsSection
            theatreSlug={current.slug}
            accent={getIdentity(current).accent}
          />
        )}
      </PageShell>
    </>
  )
}

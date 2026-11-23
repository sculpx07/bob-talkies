import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, ChevronRight, Sparkles, Minus, Plus } from 'lucide-react'
import { CinemaFloatBackground } from './CinemaFloatBackground'

const THEATRES = [
  {
    slug: 'delight',
    name: 'Delight',
    label: 'INTIMATE',
    capacity: '1–4 guests',
    minGuests: 1,
    maxGuests: 4,
    desc: "BOB Talkies' most intimate space — perfect for couples and solo celebrations.",
    image: '/images/delight.jpg',
    accent: '#f43f5e',
  },
  {
    slug: 'heavens',
    name: 'Heavens',
    label: 'STYLISH',
    capacity: '4–10 guests',
    minGuests: 4,
    maxGuests: 10,
    desc: 'A stylish private theatre designed for small groups and special occasions.',
    image: '/images/heavens.jpg',
    accent: '#a78bfa',
  },
  {
    slug: 'filmdom',
    name: 'Filmdom',
    label: 'CINEMATIC',
    capacity: '6–13 guests',
    minGuests: 6,
    maxGuests: 13,
    desc: 'Cinema-grade screen and immersive sound for your most cinematic moments.',
    image: '/images/filmdom.jpg',
    accent: '#fbbf24',
  },
  {
    slug: 'cosmos',
    name: 'Cosmos',
    label: 'GRAND',
    capacity: '8–20 guests',
    minGuests: 8,
    maxGuests: 20,
    desc: 'A grand private theatre for larger gatherings and unforgettable celebrations.',
    image: '/images/cosmos.jpg',
    accent: '#818cf8',
  },
  {
    slug: 'vibe-hall',
    name: 'Vibe Hall',
    label: 'PARTY HALL',
    capacity: '20–40 guests',
    minGuests: 20,
    maxGuests: 40,
    desc: "Hyderabad's only private party hall with a cinema-grade screen.",
    image: '/images/vibe-hall.jpg',
    accent: '#34d399',
  },
]

const OCCASIONS = ['Birthday', 'Anniversary', 'Proposal', 'Baby Shower', 'Friends Night', 'Sports Night', 'Movie Night', 'Corporate', 'Other']

const QUICK_PICKS = [
  { label: 'Couple Celebration',          guests: 2,  occasion: 'Anniversary'  },
  { label: 'Small Birthday Party',        guests: 6,  occasion: 'Birthday'     },
  { label: 'Sports Night with Friends',   guests: 15, occasion: 'Sports Night' },
  { label: 'Large Gathering / Vibe Hall', guests: 25, occasion: 'Friends Night'},
  { label: 'Corporate Team Event',        guests: 20, occasion: 'Corporate'    },
]

function recommend(guests: number) {
  const exact = THEATRES.filter(t => guests >= t.minGuests && guests <= t.maxGuests)
  if (exact.length > 0) return exact[0]
  return THEATRES.reduce((best, t) => {
    const tMid = (t.minGuests + t.maxGuests) / 2
    const bMid = (best.minGuests + best.maxGuests) / 2
    return Math.abs(tMid - guests) < Math.abs(bMid - guests) ? t : best
  })
}

export function TheatreFinder() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px 18% 0px' })

  const [guests, setGuests] = useState(4)
  const [occasion, setOccasion] = useState('Birthday')
  const [showResult, setShowResult] = useState(false)

  const result = recommend(guests)
  const setG = (n: number) => { setGuests(Math.min(40, Math.max(1, n))); setShowResult(false) }

  return (
    <section ref={ref} className="relative overflow-x-clip pb-16 pt-6 md:pb-24 md:pt-8">
      <CinemaFloatBackground />

      <div className="relative mx-auto max-w-5xl px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mb-1 flex items-center justify-center gap-2">
            <Sparkles size={18} className="text-[#d4a94a]" />
            <p className="font-cursive text-2xl text-[#c9933a] md:text-3xl">Experience Finder</p>
          </div>
          <h2 className="mb-2 text-2xl font-black leading-tight md:text-3xl lg:text-4xl">
            <span className="text-[#3d0a24]">What Are You </span>
            <span className="text-[#a81a3a]">Planning Today?</span>
          </h2>
          <motion.div
            className="mx-auto mt-3 h-[3px] rounded-full bg-[#d4a94a]"
            initial={{ width: 0 }}
            animate={inView ? { width: 40 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <p className="mx-auto mt-3 max-w-sm text-sm text-[#5b2535]/80">
            Tell us your group size and occasion — we'll find the best theatre for you.
          </p>
        </motion.div>

        {/* Boarding-pass style ticket */}
        <motion.div
          initial={{ opacity: 0, y: 32, rotate: -1.5 }}
          animate={inView ? { opacity: 1, y: 0, rotate: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="relative mb-8 grid overflow-hidden rounded-[2rem] bg-white shadow-[0_28px_70px_rgba(107,35,152,0.2)] ring-1 ring-[#f8dce4] md:grid-cols-[280px_1fr]"
        >
          {/* Stub: guests */}
          <div className="relative bg-[linear-gradient(160deg,#5c1535_0%,#8b1a3a_100%)] p-7 text-white">
            <motion.span
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#f5bd61]/25 blur-2xl"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            />
            <label className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f5d7a1]">
              <Users size={14} /> Number of Guests
            </label>
            <div className="relative mt-5 flex items-center justify-between gap-3">
              <button type="button" onClick={() => setG(guests - 1)} aria-label="Decrease group size" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"><Minus size={18} /></button>
              <div className="text-center">
                <motion.span key={guests} initial={{ scale: 1.25, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="block font-display text-6xl font-bold leading-none tabular-nums">{guests}</motion.span>
                <span className="mt-1 block text-xs text-white/70">guests</span>
              </div>
              <button type="button" onClick={() => setG(guests + 1)} aria-label="Increase group size" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"><Plus size={18} /></button>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              value={guests}
              onChange={e => setG(Number(e.target.value))}
              aria-label="Number of guests"
              className="relative mt-6 w-full cursor-pointer"
              style={{ accentColor: '#f5d7a1' }}
            />
            <div className="relative mt-1 flex justify-between text-xs text-white/60"><span>1</span><span>40</span></div>
          </div>

          {/* Perforation + notches */}
          <span className="pointer-events-none absolute left-[280px] top-0 hidden h-full w-0 border-l-2 border-dashed border-[#f0d0dc] md:block" aria-hidden="true" />
          <span className="pointer-events-none absolute left-[280px] -top-3 hidden h-6 w-6 -translate-x-1/2 rounded-full bg-[#fff6f0] md:block" aria-hidden="true" />
          <span className="pointer-events-none absolute -bottom-3 left-[280px] hidden h-6 w-6 -translate-x-1/2 rounded-full bg-[#fff6f0] md:block" aria-hidden="true" />

          {/* Main: occasion + quick start + action */}
          <div className="p-7 md:p-8">
            <label className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#a81a3a]">Occasion</label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map(o => (
                <button
                  key={o}
                  onClick={() => { setOccasion(o); setShowResult(false) }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${occasion === o ? 'bg-[linear-gradient(135deg,#5c1535,#a81a3a)] text-white shadow-[0_8px_20px_rgba(50,16,95,0.28)]' : 'bg-[#fce8f0] text-[#5b2535] hover:bg-[#efe0f8]'}`}
                >
                  {o}
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-dashed border-[#f0d0dc] pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#c9933a]">Quick Start</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PICKS.map(qp => (
                  <button
                    key={qp.label}
                    onClick={() => { setGuests(qp.guests); setOccasion(qp.occasion); setShowResult(false) }}
                    className="rounded-full border border-[#f5d5e0] bg-[#fff7e8] px-3.5 py-1.5 text-xs font-semibold text-[#8f6420] transition-transform hover:scale-105"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <button
                onClick={() => setShowResult(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#5c1535,#8b1a3a)] px-8 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(50,16,95,0.3)] transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                Find My Theatre <Sparkles size={14} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
              className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_rgba(107,35,152,0.18)] ring-1 ring-[#f8dce4]"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-44 shrink-0 overflow-hidden sm:h-auto sm:w-60">
                  <img src={result.image} alt={result.name} className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white" style={{ background: result.accent }}>
                    {result.label}
                  </span>
                </div>
                <div className="flex-1 p-6 md:p-7">
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-[#a81a3a]">Our Recommendation</p>
                  <h3 className="mb-1 text-2xl font-black text-[#3d0a24]">{result.name}</h3>
                  <p className="mb-3 text-sm text-[#7d4555]">{result.capacity}</p>
                  <p className="mb-5 text-sm leading-relaxed text-[#5b2535]">{result.desc}</p>
                  <Link
                    to={`/theatres/${result.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#5c1535,#8b1a3a)] px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(50,16,95,0.28)] transition-transform hover:-translate-y-0.5"
                  >
                    Book {result.name} <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick theatre pills (shown when no result yet) */}
        <AnimatePresence>
          {!showResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap justify-center gap-2"
            >
              {THEATRES.map(t => (
                <Link
                  key={t.slug}
                  to={`/theatres/${t.slug}`}
                  className="rounded-full bg-white/80 px-4 py-2 text-sm text-[#3d0a24] ring-1 ring-[#f5d5e0] backdrop-blur transition-transform hover:scale-105"
                >
                  {t.name}
                  <span className="ml-1.5 text-xs text-[#9a6575]">{t.capacity}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  )
}

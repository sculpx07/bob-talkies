import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, ChevronRight, Sparkles } from 'lucide-react'

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
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const [guests, setGuests] = useState(4)
  const [occasion, setOccasion] = useState('Birthday')
  const [showResult, setShowResult] = useState(false)

  const result = recommend(guests)

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#2a0e4f 0%,#32105f 55%,#2a0e4f 100%)' }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/8 blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-[#8e39c7]/12 blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#d4a94a]" />
            <p className="font-cursive text-2xl md:text-3xl text-[#c9933a]">Experience Finder</p>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-2">
            <span className="text-white">What Are You </span>
            <span className="text-[#c9a84c]">Planning Today?</span>
          </h2>
          <motion.div
            className="mx-auto mt-3 h-[3px] rounded-full bg-[#d4a94a]"
            initial={{ width: 0 }}
            animate={inView ? { width: 40 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <p className="mt-3 text-white/55 text-sm max-w-sm mx-auto">
            Tell us your group size and occasion — we'll find the best theatre for you.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-3xl border border-white/10 p-6 md:p-8 mb-6"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

            {/* Guest count */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#c9a84c] mb-4">
                <Users size={14} /> Number of Guests
              </label>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl font-black text-white w-12 tabular-nums">{guests}</span>
                <span className="text-white/40 text-sm">guests</span>
              </div>
              <input
                type="range"
                min={1}
                max={40}
                value={guests}
                onChange={e => { setGuests(Number(e.target.value)); setShowResult(false) }}
                className="w-full accent-[#c9a84c] cursor-pointer"
                style={{ accentColor: '#c9a84c' }}
              />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>1</span><span>40</span>
              </div>
            </div>

            {/* Occasion */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-[#c9a84c] mb-4">
                Occasion
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map(o => (
                  <button
                    key={o}
                    onClick={() => { setOccasion(o); setShowResult(false) }}
                    className="rounded-full px-4 py-2 text-sm font-semibold transition-all"
                    style={
                      occasion === o
                        ? { background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)', color: '#2a0e4f' }
                        : { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick picks */}
          <div className="mt-5 pt-5 border-t border-white/10">
            <p className="text-xs font-bold tracking-widest uppercase text-[#c9a84c]/70 mb-3">Quick Start</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PICKS.map(qp => (
                <button
                  key={qp.label}
                  onClick={() => { setGuests(qp.guests); setOccasion(qp.occasion); setShowResult(false) }}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
                  style={{ background: 'rgba(201,168,76,0.12)', color: 'rgba(201,168,76,0.9)', border: '1px solid rgba(201,168,76,0.2)' }}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowResult(true)}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-black text-[#2a0e4f] transition-all hover:brightness-110 hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
            >
              Find My Theatre <Sparkles size={14} />
            </button>
          </div>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border overflow-hidden"
              style={{ borderColor: 'rgba(201,168,76,0.3)', background: 'rgba(255,255,255,0.05)' }}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative sm:w-56 h-44 sm:h-auto shrink-0 overflow-hidden">
                  <img
                    src={result.image}
                    alt={result.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                  <span
                    className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[9px] font-black tracking-[0.2em] uppercase text-white"
                    style={{ background: result.accent }}
                  >
                    {result.label}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 p-6">
                  <p className="text-xs text-[#c9a84c] font-bold tracking-widest uppercase mb-1">
                    Our Recommendation
                  </p>
                  <h3 className="text-2xl font-black text-white mb-1">{result.name}</h3>
                  <p className="text-white/40 text-sm mb-3">{result.capacity}</p>
                  <p className="text-white/60 text-sm leading-relaxed mb-5">{result.desc}</p>
                  <Link
                    to={`/theatres/${result.slug}`}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-black text-[#2a0e4f] transition-all hover:brightness-110 hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
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
              className="flex flex-wrap gap-2 justify-center"
            >
              {THEATRES.map(t => (
                <Link
                  key={t.slug}
                  to={`/theatres/${t.slug}`}
                  className="rounded-full px-4 py-2 text-sm transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {t.name}
                  <span className="ml-1.5 text-xs text-white/30">{t.capacity}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  )
}

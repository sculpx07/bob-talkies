import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react'

const HIGHLIGHTS = [
  {
    id: 'sports',
    accent: '#fbbf24',
    img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&q=80',
    eyebrow: 'Sports & Fan Nights',
    tagline: 'Big Matches. Bigger Screens.',
    desc: 'Cricket, football, IPL and World Cup watch parties on a 250" screen with your crew.',
    items: ['🏏 Cricket Screenings', '⚽ Football Nights', '🏆 IPL Parties', '🌍 World Cup Watch', '📣 Fan Gatherings'],
    cta: 'Plan Your Sports Night',
    link: '/book?occasion=sports-screening',
  },
  {
    id: 'movies',
    accent: '#a78bfa',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&q=80',
    eyebrow: 'Movie & Fan Experiences',
    tagline: "More Than a Movie. It's a Fan Moment.",
    desc: 'Private screenings, OTT nights, movie marathons and teaser reveals — your content, your cinema.',
    items: ['🎬 Private Screenings', '📺 OTT Movie Nights', '🍿 Movie Marathons', '👥 Fan Gatherings', '🎞️ Teaser Launches'],
    cta: 'Explore Screening Experiences',
    link: '/book?occasion=movie-night',
  },
  {
    id: 'vibe',
    accent: '#34d399',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
    eyebrow: 'Vibe Hall',
    tagline: 'Think Bigger. Celebrate Bigger.',
    desc: "Hyderabad's only private party hall with a cinema-grade 250\" screen and room for 20 to 40 guests.",
    items: ['🎂 Large Birthday Parties', '🏆 Sports Screenings', '💼 Corporate Events', '🎬 Group Movie Nights', '🎮 Gaming & Karaoke'],
    cta: 'Explore Vibe Hall',
    link: '/theatres/vibe-hall',
  },
]

export function ExperienceHighlights() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [active, setActive] = useState('sports')
  const ulRef = useRef<HTMLUListElement>(null)
  const liRefs = useRef<(HTMLLIElement | null)[]>([])
  const [ballY, setBallY] = useState<number | null>(null)

  // Calculate ball Y position relative to the ul whenever active changes
  useEffect(() => {
    const idx = HIGHLIGHTS.findIndex(h => h.id === active)
    const li = liRefs.current[idx]
    const ul = ulRef.current
    if (!li || !ul) return
    const liRect = li.getBoundingClientRect()
    const ulRect = ul.getBoundingClientRect()
    setBallY(liRect.top + liRect.height / 2 - ulRect.top)
  }, [active])

  // Auto-cycle: ball travels to next item every 3s
  useEffect(() => {
    if (!inView) return
    const ids = HIGHLIGHTS.map(h => h.id)
    let idx = 0
    const timer = setInterval(() => {
      idx = (idx + 1) % ids.length
      setActive(ids[idx])
    }, 3000)
    return () => clearInterval(timer)
  }, [inView])

  return (
    <section
      ref={ref}
      className="pb-16 pt-6 md:pb-24 md:pt-10"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.05, duration: 0.28 }}
              className="flex items-center gap-2 mb-0.5"
            >
              <Sparkles size={15} className="text-[#d4a94a]" />
              <p className="font-cursive text-xl text-[#c9933a]">Experiences at BOB</p>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.09, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="text-2xl md:text-3xl font-black text-[#3d0a24]"
            >Every Experience. One Venue.</motion.h2>
          </div>
        </motion.div>

        {/* ── Desktop: editorial list + photo with an overlapping text card ── */}
        <div className="hidden md:grid md:h-[480px] md:grid-cols-[300px_1fr] gap-10">
          {/* list: huge outlined numbers, stagger in one by one */}
          <ul ref={ulRef} className="relative flex h-full flex-col justify-between" role="tablist" aria-label="Experiences">
            <motion.span
              className="pointer-events-none absolute bottom-3 left-[7px] top-3 w-px bg-[#f0d0dc]"
              initial={{ scaleY: 0, originY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ delay: 0.18, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            />

            {/* Traveling ball */}
            {ballY !== null && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 z-10 h-[15px] w-[15px] -translate-x-0 -translate-y-1/2 rounded-full"
                style={{ boxShadow: '0 0 10px 3px rgba(201,168,76,0.7)', background: '#c9a84c' }}
                animate={{ top: ballY }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            )}

            {HIGHLIGHTS.map((h, i) => {
              const isActive = active === h.id
              return (
                <motion.li
                  key={h.id}
                  ref={el => { liRefs.current[i] = el }}
                  className="relative"
                  initial={{ opacity: 0, x: -36 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.12 + i * 0.09, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(h.id)}
                    className="group flex w-full items-center gap-6 pl-6 text-left"
                  >
                    {/* static dot hidden when ball is traveling to this item */}
                    <span
                      className={`absolute left-0 top-1/2 h-[15px] w-[15px] -translate-y-1/2 rounded-full border-2 transition-all duration-300 ${isActive ? 'opacity-0' : 'bg-[#fff8f9] border-[#edc5d0]'}`}
                      aria-hidden="true"
                    />
                    <span
                      className="font-display text-[5.5rem] font-bold leading-none transition-all duration-300"
                      style={isActive ? { color: h.accent } : { color: 'transparent', WebkitTextStroke: '1.5px #d4bfe6' }}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-lg font-bold leading-tight transition-colors ${isActive ? 'text-[#3d0a24]' : 'text-[#9a6575] group-hover:text-[#5b2535]'}`}>{h.eyebrow}</span>
                      <span className={`mt-1 block text-sm leading-snug transition-all ${isActive ? 'text-[#7d4555]' : 'text-transparent'}`}>{h.tagline}</span>
                    </span>
                  </button>
                </motion.li>
              )
            })}
          </ul>

          {/* photo with an overlapping white card — spring in from right */}
          <motion.div
            className="relative h-full"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              {HIGHLIGHTS.filter(h => h.id === active).map(h => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0"
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 w-[72%] overflow-hidden rounded-[2rem] shadow-[0_24px_60px_rgba(42,14,79,0.28)]"
                    initial={{ scale: 0.94, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: 0.2, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <img src={h.img} alt={h.eyebrow} className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#140930]/40 to-transparent" />
                    <span className="absolute left-5 top-5 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#3d0a24]" style={{ background: h.accent }}>{h.eyebrow}</span>
                  </motion.div>

                  <motion.div
                    className="absolute bottom-8 right-0 w-[48%] rounded-[1.75rem] bg-white p-7 shadow-[0_26px_60px_rgba(107,35,152,0.25)] ring-1 ring-[#f8dce4]"
                    initial={{ opacity: 0, y: 32 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.28, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <h3 className="font-display text-2xl font-bold leading-snug text-[#3d0a24]">{h.tagline}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#7d4555]">{h.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {h.items.map((item, idx) => (
                        <motion.span
                          key={item}
                          className="rounded-full bg-[#fce8f0] px-2.5 py-1 text-[11px] font-medium text-[#5b2535]"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={inView ? { opacity: 1, scale: 1 } : {}}
                          transition={{ delay: 0.32 + idx * 0.04, duration: 0.22 }}
                        >{item}</motion.span>
                      ))}
                    </div>
                    <Link
                      to={h.link}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#8b1a3a] transition-all hover:gap-3"
                    >
                      {h.cta} <ArrowRight size={15} />
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Mobile: vertical accordion ── */}
        <div className="md:hidden space-y-2">
          {HIGHLIGHTS.map((h, i) => {
            const isOpen = active === h.id
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: 0.08 + i * 0.08, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-2xl"
              >
                {/* Header button */}
                <button
                  onClick={() => setActive(isOpen ? '' : h.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                  style={{ background: 'linear-gradient(135deg,#3d0a24,#5c1535)' }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: h.accent }}
                    />
                    <span className="text-white font-black text-sm">{h.eyebrow}</span>
                  </div>
                  <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} className="text-white/50" />
                  </motion.div>
                </button>

                {/* Expandable body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div
                        className="relative"
                        style={{ background: 'linear-gradient(135deg,#3d0a24,#6b1535)' }}
                      >
                        <img
                          src={h.img}
                          alt={h.eyebrow}
                          className="w-full h-36 object-cover opacity-30"
                        />
                        <div className="p-4 pt-3">
                          <h3 className="text-white font-black text-base mb-1.5">{h.tagline}</h3>
                          <p className="text-white/55 text-xs leading-relaxed mb-3">{h.desc}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
                            {h.items.map(item => (
                              <span key={item} className="text-white/60 text-[11px]">{item}</span>
                            ))}
                          </div>
                          <Link
                            to={h.link}
                            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black"
                            style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)', color: '#3d0a24' }}
                          >
                            {h.cta} <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

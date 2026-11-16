import { useState, useRef } from 'react'
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
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [active, setActive] = useState('sports')

  return (
    <section
      ref={ref}
      className="py-14 md:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7"
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles size={15} className="text-[#d4a94a]" />
              <p className="font-cursive text-xl text-[#c9933a]">Experiences at BOB</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#2a0e4f]">Every Experience. One Venue.</h2>
          </div>
        </motion.div>

        {/* ── Desktop: horizontal expandable cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="hidden md:flex gap-2.5"
          style={{ height: 460 }}
        >
          {HIGHLIGHTS.map(h => {
            const isActive = active === h.id
            return (
              <motion.div
                key={h.id}
                animate={{ flexGrow: isActive ? 2.4 : 0.6 }}
                transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                className="relative overflow-hidden rounded-3xl cursor-pointer flex-shrink-0"
                style={{ flexBasis: 0, minWidth: 64 }}
                onClick={() => setActive(h.id)}
              >
                {/* Background */}
                <img
                  src={h.img}
                  alt={h.eyebrow}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(10,2,22,0.88) 0%, rgba(10,2,22,0.3) 50%, rgba(10,2,22,0.1) 100%)' }}
                />

                {/* Compressed: vertical label */}
                <AnimatePresence>
                  {!isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <span
                        className="text-white font-black text-sm tracking-wider uppercase select-none"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        {h.eyebrow}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded: full content */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="absolute inset-0 flex flex-col justify-end p-7 pointer-events-none"
                    >
                      <span
                        className="inline-flex self-start items-center rounded-full text-[9px] font-black uppercase tracking-widest px-2.5 py-1 mb-3"
                        style={{ background: `${h.accent}25`, border: `1px solid ${h.accent}50`, color: h.accent }}
                      >
                        {h.eyebrow}
                      </span>
                      <h3 className="text-white font-black text-xl md:text-2xl leading-snug mb-2">{h.tagline}</h3>
                      <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-xs">{h.desc}</p>

                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {h.items.map(item => (
                          <span key={item} className="text-white/70 text-[11px] font-medium">{item}</span>
                        ))}
                      </div>

                      <Link
                        to={h.link}
                        className="pointer-events-auto self-start inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black transition-all hover:brightness-110 hover:scale-105"
                        style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)', color: '#2a0e4f' }}
                      >
                        {h.cta} <ArrowRight size={12} />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active indicator dot */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    animate={{ scale: isActive ? 1 : 0 }}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: h.accent }}
                  />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── Mobile: vertical accordion ── */}
        <div className="md:hidden space-y-2">
          {HIGHLIGHTS.map((h, i) => {
            const isOpen = active === h.id
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.07 * i, duration: 0.4 }}
                className="overflow-hidden rounded-2xl"
              >
                {/* Header button */}
                <button
                  onClick={() => setActive(isOpen ? '' : h.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                  style={{ background: 'linear-gradient(135deg,#2a0e4f,#32105f)' }}
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
                        style={{ background: 'linear-gradient(135deg,#2a0e4f,#4a1a8a)' }}
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
                            style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)', color: '#2a0e4f' }}
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

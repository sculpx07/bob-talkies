import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

const HIGHLIGHTS = [
  { emoji: '🏏', label: 'Cricket Match Screenings' },
  { emoji: '⚽', label: 'Football Match Nights' },
  { emoji: '🏆', label: 'IPL Nights' },
  { emoji: '🌍', label: 'Tournament Watch Parties' },
  { emoji: '📣', label: 'Friends & Fan Gatherings' },
]

export function SportsNightHighlight() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px 18% 0px' })

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#3d0a24 0%,#5c1535 55%,#3d0a24 100%)' }}
    >
      {/* Ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-[#fbbf24]/10 blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-[#fbbf24]/8 blur-3xl translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[#fbbf24]" />
              <span className="text-xs font-bold tracking-widest uppercase text-[#fbbf24]">Sports Nights</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Big Matches.<br />
              <span className="text-[#fbbf24]">Bigger Screens.</span><br />
              Your Favourite People.
            </h2>
            <p className="text-white/55 text-sm leading-relaxed mb-8 max-w-md">
              Bring your team spirit to a private theatre and enjoy every match together — every cheer, every wicket, every goal felt on a 250" screen with Dolby Atmos sound.
            </p>
            <Link
              to="/book?occasion=sports-screening"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-black text-[#49283A] transition-all hover:brightness-110 hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#fde68a 50%,#fbbf24)' }}
            >
              Plan Your Sports Night <ArrowRight size={14} />
            </Link>
          </motion.div>

          {/* Highlights grid */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="grid grid-cols-1 gap-3"
          >
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 px-5 py-4"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-2xl">{h.emoji}</span>
                <span className="text-white font-semibold text-sm">{h.label}</span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  )
}

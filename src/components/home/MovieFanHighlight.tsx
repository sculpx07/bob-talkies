import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Film } from 'lucide-react'

const HIGHLIGHTS = [
  { emoji: '🎬', label: 'Private Movie Screenings',    desc: 'Your favourite film on a 250" screen, all to yourself.' },
  { emoji: '📺', label: 'OTT Movie Nights',            desc: 'Netflix, Prime, Hotstar — your platform, our theatre.' },
  { emoji: '🍿', label: 'Movie Marathons',             desc: 'Back-to-back films with your closest people.' },
  { emoji: '👥', label: 'Fan Gatherings',              desc: 'Celebrate your favourite stars and franchises together.' },
  { emoji: '🎞️', label: 'Teaser & Trailer Reveals',   desc: 'First reactions, shared with your fan community.' },
  { emoji: '🎥', label: 'Special Video Presentations', desc: 'Montages, tributes and memories on the big screen.' },
]

export function MovieFanHighlight() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="py-16 md:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Film size={18} className="text-[#6b2398]" strokeWidth={1.8} />
            <p className="font-cursive text-2xl md:text-3xl text-[#c9933a]">Movie & Fan Experiences</p>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#2a0e4f] leading-tight mb-2">
            More Than a Movie.<br />
            <span className="text-[#7c3aed]">It's a Fan Moment.</span>
          </h2>
          <motion.div
            className="mx-auto mt-3 h-[3px] rounded-full bg-[#d4a94a]"
            initial={{ width: 0 }}
            animate={inView ? { width: 40 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <p className="mt-3 text-[#5b4578] text-sm max-w-md mx-auto">
            Celebrate your favourite films, stars and cinematic moments on the big screen — the way they were meant to be experienced.
          </p>
        </motion.div>

        {/* Highlight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {HIGHLIGHTS.map((h, i) => (
            <motion.div
              key={h.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.07 * i, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group flex gap-4 rounded-2xl border border-[#f0e6cc] bg-white/70 p-5 backdrop-blur-sm"
              style={{ boxShadow: '0 2px 10px rgba(42,14,79,0.05)' }}
            >
              <span className="text-3xl shrink-0 leading-none">{h.emoji}</span>
              <div>
                <h3 className="font-bold text-[#2a0e4f] text-sm mb-1">{h.label}</h3>
                <p className="text-[#5b4578] text-xs leading-relaxed">{h.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex justify-center"
        >
          <Link
            to="/book?occasion=movie-night"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-black text-[#2a0e4f] transition-all hover:brightness-110 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
          >
            Explore Screening Experiences <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </section>
  )
}

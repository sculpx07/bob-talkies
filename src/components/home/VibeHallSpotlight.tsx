import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, MessageCircle, Zap } from 'lucide-react'
import { config } from '@/lib/config'

const USE_CASES = [
  { emoji: '🎂', label: 'Large Birthday Parties' },
  { emoji: '🏆', label: 'Sports Screening Parties' },
  { emoji: '👥', label: "Friends' Gatherings" },
  { emoji: '💼', label: 'Corporate Events' },
  { emoji: '👨‍👩‍👧‍👦', label: 'Family Celebrations' },
  { emoji: '🎬', label: 'Group Movie Screenings' },
  { emoji: '🎮', label: 'Gaming & Entertainment' },
  { emoji: '🎪', label: 'Special Event Enquiries' },
]

export function VibeHallSpotlight() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px 18% 0px' })

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#3d0a24 0%,#5c1535 55%,#3d0a24 100%)' }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#34d399]/8 blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#c9a84c]/8 blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">

        {/* Editorial label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap size={16} className="text-[#34d399]" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#34d399]">Featured Venue</span>
          </div>
          <p className="font-cursive text-2xl md:text-3xl text-[#c9933a]">Vibe Hall</p>
        </motion.div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-10">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl"
            style={{ minHeight: 380 }}
          >
            <img
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80"
              alt="Vibe Hall at BOB Talkies"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d0a24]/80 via-[#3d0a24]/20 to-transparent" />
            {/* Capacity pill */}
            <div className="absolute bottom-5 left-5 flex items-center gap-2">
              <span
                className="rounded-full px-3 py-1.5 text-xs font-black"
                style={{ background: 'rgba(52,211,153,0.2)', border: '1px solid rgba(52,211,153,0.4)', color: '#34d399' }}
              >
                PARTY HALL
              </span>
              <span
                className="rounded-full px-3 py-1.5 text-xs font-bold text-white/70"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                20–40 Guests
              </span>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
              Think Bigger.<br />
              <span className="text-[#34d399]">Celebrate at</span><br />
              Vibe Hall.
            </h2>
            <p className="text-white/55 text-sm leading-relaxed mb-6 max-w-md">
              From energetic group gatherings to unforgettable entertainment experiences, Vibe Hall gives you a cinema-grade 250" screen, immersive Dolby Atmos sound and room for 20 to 40 of your favourite people.
            </p>

            {/* Spec pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['250" Screen', 'Dolby Atmos', '20–40 Guests', 'Full Décor'].map(spec => (
                <span key={spec} className="rounded-full px-3 py-1 text-xs font-semibold text-[#34d399]/80"
                  style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  {spec}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/theatres/vibe-hall"
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-black text-[#3d0a24] transition-all hover:brightness-110 hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
              >
                Explore Vibe Hall <ArrowRight size={14} />
              </Link>
              <a
                href={`https://wa.me/${config.whatsappNumber}?text=Hi! I'm interested in booking Vibe Hall for a group event.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
              >
                <MessageCircle size={14} /> Enquire for Group Events
              </a>
            </div>
          </motion.div>
        </div>

        {/* Use cases strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {USE_CASES.map((u, i) => (
            <motion.div
              key={u.label}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <span className="text-lg">{u.emoji}</span>
              <span className="text-white/60 text-xs font-medium leading-snug">{u.label}</span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

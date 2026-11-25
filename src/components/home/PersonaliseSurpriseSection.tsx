import { useEffect, useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'

const SURPRISES = [
  {
    id: 'memory-reel',
    title: 'Our Memory Reel',
    desc: 'Childhood, friendship & family moments — their whole story on the big screen.',
    img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&q=80',
    color: '#a78bfa',
  },
  {
    id: 'big-proposal',
    title: 'The Big Proposal',
    desc: "Your love story, timeline and the question — in a cinematic moment they'll never forget.",
    img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=900&q=80',
    color: '#f43f5e',
  },
  {
    id: 'birthday-surprise',
    title: 'Birthday Screen Surprise',
    desc: 'A personalised birthday video, childhood memories and wishes from everyone they love.',
    img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=900&q=80',
    color: '#f59e0b',
  },
  {
    id: 'video-wishes',
    title: 'Video Wishes',
    desc: 'Collect messages from friends and family anywhere in the world into one surprise video.',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
    color: '#10b981',
  },
  {
    id: 'love-story',
    title: 'Love Story on Screen',
    desc: 'Your journey together — first meeting, special dates, favourite memories — on the theatre screen.',
    img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=80',
    color: '#ec4899',
  },
  {
    id: 'grand-reveal',
    title: 'The Grand Reveal',
    desc: 'Pregnancy announcement, surprise gift reveal or any milestone — make the moment extraordinary.',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
    color: '#c9a84c',
  },
  {
    id: 'from-friends-family',
    title: 'From Friends & Family',
    desc: 'A tribute compiled from the people who matter most — in one emotional surprise video.',
    img: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=900&q=80',
    color: '#6366f1',
  },
  {
    id: 'custom-screen',
    title: 'Your Own Custom Screen',
    desc: "Your photos, your video, your idea. Bring any personalised content and we'll screen it.",
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&q=80',
    color: '#f97316',
  },
]

const AUTO_MS = 4500
const N = SURPRISES.length

/** Shortest circular distance from the active card, so the deck wraps around. */
function offsetOf(i: number, active: number) {
  let d = i - active
  if (d > N / 2) d -= N
  if (d < -N / 2) d += N
  return d
}

export function PersonaliseSurpriseSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px 18% 0px' })
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!inView || paused) return
    const t = window.setTimeout(() => setActive((i) => (i + 1) % N), AUTO_MS)
    return () => window.clearTimeout(t)
  }, [active, inView, paused])

  const go = (d: number) => setActive((i) => (i + d + N) % N)
  const cur = SURPRISES[active]

  return (
    <section ref={ref} className="relative overflow-x-clip py-14 md:py-20">
      <motion.span
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#d9126a]/15 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />
      <motion.span
        className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-[#f5bd61]/20 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <div className="mb-0.5 flex items-center gap-2">
              <Sparkles size={15} className="text-[#d4a94a]" />
              <p className="font-cursive text-xl text-[#c9933a]">Personalise Your Surprise</p>
            </div>
            <h2 className="text-2xl font-black leading-snug text-white md:text-3xl">
              Your Story. Your Screen. Your Surprise.
            </h2>
            <p className="mt-2 max-w-sm text-sm text-white/80">
              Make your celebration truly yours — from personalised videos to big-screen surprises they'll never expect.
            </p>
          </div>
          <Link
            to="/personalise"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#5c1535,#8b1a3a)] px-6 py-3 text-xs font-bold text-white shadow-[0_12px_28px_rgba(50,16,95,0.3)] transition-transform hover:-translate-y-0.5"
          >
            Create Your Screen Surprise <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="grid items-center gap-10 lg:grid-cols-[minmax(0,420px)_1fr]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Info + controls */}
          <div className="order-2 lg:order-1">
            <p className="font-display text-7xl font-bold leading-none md:text-8xl" style={{ color: 'transparent', WebkitTextStroke: `2px ${cur.color}` }}>
              {String(active + 1).padStart(2, '0')}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={cur.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <span className="mt-5 block h-1 w-12 rounded-full" style={{ background: cur.color }} />
                <h3 className="mt-4 font-display text-3xl font-bold leading-snug text-white">{cur.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-white/80">{cur.desc}</p>
                <Link
                  to={`/personalise#${cur.id}`}
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#f5d7a1]"
                >
                  Explore <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
                </Link>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center gap-4">
              <button type="button" onClick={() => go(-1)} aria-label="Previous" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#3d0a24] shadow-[0_8px_20px_rgba(107,35,152,0.15)] ring-1 ring-[#f5d5e0] transition-transform hover:-translate-x-0.5">
                <ArrowRight size={16} className="rotate-180" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#3d0a24] text-white shadow-[0_8px_20px_rgba(42,14,79,0.3)] transition-transform hover:translate-x-0.5">
                <ArrowRight size={16} />
              </button>
              <div className="flex items-center gap-1.5">
                {SURPRISES.map((s, i) => (
                  <button key={s.id} type="button" onClick={() => setActive(i)} aria-label={`Show ${s.title}`} className="h-2 rounded-full transition-all duration-500" style={{ width: i === active ? 28 : 8, background: i === active ? cur.color : '#dccbe8' }} />
                ))}
              </div>
            </div>

            <Link
              to="/personalise"
              className="mt-6 flex max-w-sm items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm transition-colors hover:bg-white/90"
            >
              <span className="font-bold text-[#3d0a24]">Have your own surprise idea?</span>
              <span className="inline-flex shrink-0 items-center gap-1.5 font-bold text-[#8f6420]">Plan It Here <ArrowRight size={13} /></span>
            </Link>
          </div>

          {/* Fanned deck */}
          <div className="relative order-1 h-[420px] md:h-[470px] lg:order-2">
            {SURPRISES.map((s, i) => {
              const off = offsetOf(i, active)
              const abs = Math.abs(off)
              const isActive = off === 0
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={s.title}
                  initial={false}
                  animate={{
                    x: `calc(-50% + ${off * 130}px)`,
                    y: abs * 14,
                    rotate: off * 7,
                    scale: 1 - abs * 0.09,
                    opacity: abs > 2 ? 0 : 1 - abs * 0.18,
                    zIndex: 20 - abs,
                  }}
                  transition={{ type: 'spring', stiffness: 170, damping: 22 }}
                  whileHover={isActive ? { y: -8 } : { y: abs * 14 - 6 }}
                  className="absolute left-1/2 top-4 h-[390px] w-[260px] overflow-hidden rounded-[2rem] text-left shadow-[0_26px_60px_rgba(42,14,79,0.3)] md:h-[430px] md:w-[290px]"
                  style={{ pointerEvents: abs > 2 ? 'none' : 'auto' }}
                >
                  <img src={s.img} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#140930]/80 via-transparent to-transparent" />
                  <span className="absolute left-5 top-5 h-7 w-1.5 rounded-full" style={{ background: s.color }} />
                  <span className="absolute inset-x-5 bottom-5 font-display text-xl font-bold leading-snug !text-white">{s.title}</span>
                  {!isActive && <span className="absolute inset-0 bg-[#fce8f0]/25" />}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

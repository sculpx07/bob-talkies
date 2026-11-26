import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Users } from 'lucide-react'
import { formatINR } from '@/lib/utils/currency'
import { useTheatres } from '@/features/catalog/api'

// palette: Deep Burgundy #260018, Dark Wine #3B002A, Rich Magenta #87004F, Champagne Gold #F5C76A, Warm Gold #E8A83E

// sparkle dots scattered along each wave (deterministic so they never jump between renders)
const dots = (n: number, seed: number, x0: number, x1: number, y: (t: number) => number, spread: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i * 0.61803 + seed) % 1
    return { x: x0 + t * (x1 - x0), y: y(t) + (((i * 37 + seed * 100) % 100) / 100 - 0.4) * spread, r: 0.7 + (((i * 7) % 10) / 10) * 1.5, d: ((i * 13) % 30) / 10 }
  })
const TL_DOTS = dots(34, 0.11, 0, 360, (t) => 150 - t * 120, 40)
const BR_DOTS = dots(34, 0.37, 0, 380, (t) => 120 - t * 95, 44)

function GoldWave({ className, d, sparks, flip }: { className: string; d: string; sparks: typeof TL_DOTS; flip?: boolean }) {
  const gradId = flip ? 'ft-wave-br' : 'ft-wave-tl'
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 400 180" className={className} style={{ transform: flip ? 'scale(-1,-1)' : undefined }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E8A83E" stopOpacity="0" />
          <stop offset="0.35" stopColor="#E8A83E" />
          <stop offset="0.7" stopColor="#FFE3A0" />
          <stop offset="1" stopColor="#F5C76A" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <g className="ft-wave-glow" style={{ filter: 'drop-shadow(0 0 5px rgba(245,199,106,0.85)) drop-shadow(0 0 14px rgba(232,168,62,0.5))' }}>
        <path d={d} fill="none" stroke={`url(#${gradId})`} strokeWidth="2.4" strokeLinecap="round" />
        <path d={d} fill="none" stroke="#FFE9B8" strokeOpacity="0.55" strokeWidth="0.8" strokeLinecap="round" transform="translate(0 3)" />
      </g>
      <g fill="#FFE3A0" style={{ filter: 'drop-shadow(0 0 3px rgba(255,214,130,0.9))' }}>
        {sparks.map((c, i) => (
          <circle key={i} className="ft-spark" cx={c.x} cy={c.y} r={c.r} style={{ animationDelay: `${c.d}s` }} />
        ))}
      </g>
    </svg>
  )
}

export function FeaturedTheatres() {
  const reduce = useReducedMotion()
  const { data: theatres = [] } = useTheatres()
  const featured = theatres.filter((t) => t.images[0]).slice(0, 5)
  const stripRef = useRef<HTMLUListElement>(null)

  // slow auto-scroll to the left, looping seamlessly over a duplicated list; pauses on hover
  useEffect(() => {
    const node = stripRef.current
    if (!node || featured.length === 0) return
    let frameId = 0
    let paused = false
    let pos = node.scrollLeft
    let last = performance.now()
    const SPEED = 38 // px per second, independent of the frame rate
    const step = (now: number) => {
      const dt = Math.min(now - last, 100)
      last = now
      const loop = node.scrollWidth / 2
      if (!paused && loop > 0) {
        if (Math.abs(node.scrollLeft - pos) > 2) pos = node.scrollLeft // visitor scrolled by hand
        pos += (SPEED * dt) / 1000
        if (pos >= loop) pos = 0
        node.scrollLeft = pos
      }
      frameId = requestAnimationFrame(step)
    }
    const pause = () => { paused = true }
    const resume = () => { paused = false }
    node.addEventListener('mouseenter', pause)
    node.addEventListener('mouseleave', resume)
    frameId = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(frameId)
      node.removeEventListener('mouseenter', pause)
      node.removeEventListener('mouseleave', resume)
    }
  }, [featured.length])

  return (
    <section className="relative overflow-hidden py-14 md:py-20" aria-labelledby="featured-theatres-heading">
      <style>{`
        @keyframes ftGlow { 0%, 100% { opacity: 0.65; } 50% { opacity: 1; } }
        @keyframes ftSpark { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
        .ft-wave-glow { animation: ftGlow 4.5s ease-in-out infinite; }
        .ft-spark { animation: ftSpark 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .ft-wave-glow, .ft-spark { animation: none; } }
      `}</style>
      {/* decorative golden waves: top-left and bottom-right (SVG + CSS only), behind the content */}
      <GoldWave
        className="pointer-events-none absolute left-0 top-0 z-0 h-auto w-[200px] sm:w-[280px] lg:w-[400px]"
        d="M0 150 C 90 148 190 112 260 66 C 310 33 350 12 400 2"
        sparks={TL_DOTS}
      />
      <GoldWave
        className="pointer-events-none absolute bottom-0 right-0 z-0 h-auto w-[200px] sm:w-[280px] lg:w-[400px]"
        d="M0 150 C 90 148 190 112 260 66 C 310 33 350 12 400 2"
        sparks={BR_DOTS}
        flip
      />
      <motion.div
        className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 md:px-6 lg:grid-cols-[minmax(0,440px)_1fr] lg:gap-10"
        initial={reduce ? false : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Left copy ── */}
        <div className="relative">
          <h2
            id="featured-theatres-heading"
            className="font-display text-3xl font-black leading-[1.08] tracking-tight text-white md:text-5xl"
          >
            <span className="whitespace-nowrap">Explore Our Private</span>
            <span className="block bg-gradient-to-r from-[#F5C76A] via-[#E8A83E] to-[#F5C76A] bg-clip-text text-transparent">Theatres</span>
          </h2>
          <p className="mt-5 max-w-[22rem] text-lg leading-relaxed text-white/90">
            Find unique theatres. Perfect for every celebration.
          </p>
          <Link
            to="/theatres"
            className="group/cta mt-8 inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-base font-bold text-white shadow-[0_0_26px_rgba(245,199,106,0.35)] ring-1 ring-[#F5C76A]/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_34px_rgba(245,199,106,0.55)]"
            style={{ background: 'linear-gradient(120deg, #E8A83E 0%, #C1604A 48%, #87004F 100%)' }}
          >
            Explore All Theatres <ArrowRight size={16} className="transition-transform duration-300 group-hover/cta:translate-x-1" />
          </Link>
        </div>

        {/* ── Cards strip ── */}
        <div
          className="relative -my-10 overflow-hidden py-10"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 3%, black 95%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 3%, black 95%, transparent 100%)',
          }}
        >
          <ul
            ref={stripRef}
            className="-my-10 flex gap-6 overflow-x-auto px-3 py-10 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {[...featured, ...featured].map((t, n) => (
              <li key={`${t.id}-${n}`} aria-hidden={n >= featured.length || undefined} className="w-[270px] shrink-0 sm:w-[300px]">
                <Link
                  to={`/theatres/${t.slug}`}
                  className="group relative flex flex-col rounded-[2rem] p-3 transition-all duration-500 hover:-translate-y-1.5"
                  style={{
                    background: 'linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(135,0,79,0.30) 45%, rgba(59,0,42,0.40) 100%)',
                    backdropFilter: 'blur(14px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(14px) saturate(140%)',
                    border: '1.5px solid rgba(245,199,106,0.62)',
                    boxShadow: '0 12px 34px rgba(0,0,0,0.4), 0 0 26px rgba(245,199,106,0.22), 0 0 18px rgba(135,0,79,0.35), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 22px rgba(255,255,255,0.05)',
                  }}
                >
                  {/* brighter gold edge on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ boxShadow: '0 0 40px rgba(245,199,106,0.42), inset 0 0 0 1px rgba(245,199,106,0.85)' }}
                  />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem]">
                    <img
                      src={t.images[0]}
                      alt={`${t.name} private theatre`}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  <div className="px-2 pb-1 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-display text-2xl font-bold leading-tight text-white">{t.name}</p>
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/75">
                          <Users size={16} className="shrink-0 text-[#F5C76A]" />
                          {t.capacityMin} – {t.capacityMax} Guests
                        </p>
                      </div>
                      <div
                        className="shrink-0 rounded-2xl px-3 py-1.5 text-center"
                        style={{ background: 'rgba(38,0,24,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(245,199,106,0.4)', boxShadow: '0 0 14px rgba(245,199,106,0.16)' }}
                      >
                        <p className="text-[10px] font-medium leading-none text-white/85">From</p>
                        <p className="mt-1 text-lg font-black leading-none text-[#F5C76A]">{formatINR(t.startingPricePaise)}</p>
                      </div>
                    </div>
                    <span
                      className="mt-4 flex items-center justify-center gap-2 rounded-full py-3 text-base font-bold text-white ring-1 ring-transparent transition-all duration-300 group-hover:shadow-[0_0_22px_rgba(245,199,106,0.4)] group-hover:ring-[#F5C76A]/70"
                      style={{ background: 'linear-gradient(135deg, #87004F 0%, #3B002A 100%)', boxShadow: '0 4px 16px rgba(135,0,79,0.4)' }}
                    >
                      View &amp; Book <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  )
}

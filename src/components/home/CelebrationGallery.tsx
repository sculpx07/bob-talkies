import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react'

const ITEMS = [
  { id: '1', label: 'Surprise Birthday',  img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=500&q=80' },
  { id: '2', label: '5th Anniversary',    img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&q=80' },
  { id: '3', label: 'She Said Yes!',      img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&q=80' },
  { id: '4', label: 'Squad Night Out',    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&q=80' },
  { id: '5', label: 'Birthday Bash',      img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80' },
  { id: '6', label: 'IPL Final',          img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&q=80' },
  { id: '7', label: 'Date Night',         img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80' },
  { id: '8', label: 'Family Celebration', img: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=500&q=80' },
]

const CARD_W = 200   // px — card width
const GAP    = 12    // px — gap between cards

export function CelebrationGallery() {
  const sectionRef = useRef(null)
  const stripRef   = useRef<HTMLDivElement>(null)
  const inView     = useInView(sectionRef, { once: true, margin: '0px 0px 18% 0px' })
  const [current, setCurrent]   = useState(0)
  const pausedRef = useRef(false)

  const total = ITEMS.length

  function scrollTo(idx: number) {
    const el = stripRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(idx, total - 1))
    setCurrent(clamped)
    el.scrollTo({ left: clamped * (CARD_W + GAP), behavior: 'smooth' })
  }

  // Auto-advance every 2.5 s
  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setCurrent(c => {
          const next = (c + 1) % total
          stripRef.current?.scrollTo({ left: next * (CARD_W + GAP), behavior: 'smooth' })
          return next
        })
      }
    }, 2500)
    return () => clearInterval(id)
  }, [inView, total])

  return (
    <section ref={sectionRef} className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-2 mb-6"
        >
          <Camera size={14} className="text-[#6b2398]" />
          <p className="font-cursive text-xl text-[#c9933a]">Real Moments, Real Memories</p>
          <span className="h-px flex-1 max-w-[40px] bg-[#d4a94a]/40" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#2a0e4f]/40">Recent Celebrations</span>
        </motion.div>

        {/* Strip + arrow buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="relative"
          onMouseEnter={() => { pausedRef.current = true }}
          onMouseLeave={() => { pausedRef.current = false }}
        >
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => scrollTo(current - 1)}
            disabled={current === 0}
            aria-label="Previous"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(42,14,79,0.18)] ring-1 ring-[#f0e6cc] transition-all hover:scale-110 disabled:opacity-30"
          >
            <ChevronLeft size={16} className="text-[#2a0e4f]" />
          </button>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => scrollTo(current + 1)}
            disabled={current === total - 1}
            aria-label="Next"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(42,14,79,0.18)] ring-1 ring-[#f0e6cc] transition-all hover:scale-110 disabled:opacity-30"
          >
            <ChevronRight size={16} className="text-[#2a0e4f]" />
          </button>

          {/* Scrollable strip */}
          <div
            ref={stripRef}
            className="flex gap-3 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden pb-1"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
            }}
          >
            {ITEMS.map((item) => (
              <div
                key={item.id}
                className="group relative shrink-0 overflow-hidden rounded-2xl"
                style={{ width: CARD_W, height: 140 }}
              >
                <img
                  src={item.img}
                  alt={item.label}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-2.5 left-3 right-3 text-[11px] font-bold text-white truncate">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dot indicators */}
        <div className="flex justify-center items-center gap-1.5 mt-4">
          {ITEMS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to ${ITEMS[i].label}`}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? 20 : 7,
                height: 7,
                background: i === current
                  ? 'linear-gradient(90deg,#c9a84c,#eed98a)'
                  : 'rgba(201,168,76,0.3)',
                boxShadow: i === current ? '0 0 6px rgba(201,168,76,0.5)' : 'none',
              }}
            />
          ))}
        </div>

      </div>
    </section>
  )
}

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Camera, ArrowRight } from 'lucide-react'
import { config } from '@/lib/config'

const FILTERS = ['All', 'Birthday', 'Anniversary', 'Proposal', 'Friends', 'Sports Night'] as const
type Filter = typeof FILTERS[number]

const BADGE_COLORS: Record<Filter, string> = {
  All:          '#c9a84c',
  Birthday:     '#f43f5e',
  Anniversary:  '#a78bfa',
  Proposal:     '#f472b6',
  Friends:      '#34d399',
  'Sports Night': '#818cf8',
}

const ITEMS = [
  { id: '1', occasion: 'Birthday'     as Filter, img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&q=80', label: 'Surprise Birthday'   },
  { id: '2', occasion: 'Anniversary'  as Filter, img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80', label: '5th Anniversary'     },
  { id: '3', occasion: 'Proposal'     as Filter, img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80', label: 'She Said Yes!'       },
  { id: '4', occasion: 'Friends'      as Filter, img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', label: 'Squad Night Out'     },
  { id: '5', occasion: 'Birthday'     as Filter, img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', label: 'Birthday Bash'       },
  { id: '6', occasion: 'Sports Night' as Filter, img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80', label: 'IPL Final'           },
  { id: '7', occasion: 'Anniversary'  as Filter, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', label: 'Date Night'          },
  { id: '8', occasion: 'Proposal'     as Filter, img: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=600&q=80', label: 'Family Celebration'  },
  { id: '9', occasion: 'Friends'      as Filter, img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80', label: 'Private Screening'   },
]

export function CelebrationGallery() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [active, setActive] = useState<Filter>('All')

  const visible = active === 'All' ? ITEMS : ITEMS.filter(it => it.occasion === active)

  return (
    <section ref={ref} className="pt-16 md:pt-24">

      {/* Sub-header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <Camera size={18} className="text-[#6b2398]" />
          <p className="font-cursive text-xl md:text-2xl text-[#c9933a]">Real Moments, Real Memories</p>
        </div>
        <h3 className="text-xl md:text-2xl font-black text-[#2a0e4f]">Recent Celebrations</h3>
        <motion.div
          className="mt-2 h-[3px] rounded-full bg-[#d4a94a]"
          initial={{ width: 0 }}
          animate={inView ? { width: 32 } : {}}
          transition={{ delay: 0.3, duration: 0.4 }}
        />
      </motion.div>

      {/* Filters: pill chips with a photo count */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-10 flex flex-wrap justify-center gap-2.5"
      >
        {FILTERS.map(f => {
          const count = f === 'All' ? ITEMS.length : ITEMS.filter(it => it.occasion === f).length
          const on = active === f
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`group relative flex items-center gap-2 rounded-full py-2 pl-5 pr-2 text-sm font-semibold transition-all duration-300 ${on ? 'text-white shadow-[0_12px_28px_rgba(50,16,95,0.3)]' : 'bg-white/70 text-[#5b4578] ring-1 ring-[#ecd9ec] backdrop-blur hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_10px_24px_rgba(107,35,152,0.12)]'}`}
            >
              {on && (
                <motion.span layoutId="gallery-chip" className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#32105f,#8e39c7)]" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <span className="relative">{f}</span>
              <span className={`relative flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${on ? 'bg-white/25 text-white' : 'bg-[#f3e6ff] text-[#6b2398]'}`}>{count}</span>
            </button>
          )
        })}
      </motion.div>

      {/* Bento grid: full-bleed photos with a floating frosted caption panel */}
      <div className="grid auto-rows-[200px] grid-flow-dense grid-cols-2 gap-4 md:auto-rows-[240px] md:grid-cols-4 md:gap-5">
        <AnimatePresence mode="popLayout">
          {visible.map((item, i) => {
            // sizes chosen so the 4-column grid always fills with no holes:
            // all 9 photos = one big tile + 8 small (12 cells); 1-2 photos = one or two wide tiles
            const wide = visible.length === 1 ? 'col-span-2 md:col-span-4 row-span-2' : visible.length === 2 ? 'col-span-1 md:col-span-2 row-span-2' : ''
            const big = active === 'All' && visible.length > 2 ? i === 0 : visible.length <= 2
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                className={`group relative overflow-hidden rounded-[2rem] shadow-[0_16px_40px_rgba(42,14,79,0.2)] ${visible.length <= 2 ? wide : big ? 'col-span-2 row-span-2' : ''}`}
              >
                <img src={item.img} alt={item.label} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />

                {/* category: coloured dot + label */}
                <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: BADGE_COLORS[item.occasion] }} />
                  {item.occasion}
                </span>

                {/* floating frosted caption */}
                <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-[1.4rem] bg-white/75 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.15)] backdrop-blur-xl ring-1 ring-white/60 transition-transform duration-500 group-hover:-translate-y-1">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-[#8e39c7]">{String(i + 1).padStart(2, '0')}</p>
                    <p className={`truncate font-display font-semibold text-[#2a0e4f] ${big ? 'text-xl' : 'text-[15px]'}`}>{item.label}</p>
                  </div>
                  <Link
                    to="/book"
                    aria-label={`Book ${item.label}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2a0e4f] text-white transition-transform duration-300 group-hover:rotate-[-45deg]"
                  >
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Share CTA: plum banner with soft wave shapes and an illustration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative mt-16 overflow-hidden rounded-[2.5rem] md:mt-24 bg-[linear-gradient(120deg,#4a1a8a_0%,#6b2398_55%,#8e39c7_100%)] shadow-[0_24px_60px_rgba(74,26,138,0.35)]"
      >
        {/* decorative waves */}
        <span className="pointer-events-none absolute -left-10 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#f5bd61]/25 blur-2xl" aria-hidden="true" />
        <span className="pointer-events-none absolute -bottom-24 right-24 h-64 w-96 rounded-[50%] bg-white/10" aria-hidden="true" />
        <span className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#d946ef]/30 blur-2xl" aria-hidden="true" />

        <div className="relative flex flex-col items-start gap-6 px-6 py-8 sm:flex-row sm:items-center sm:gap-8 md:px-10 md:py-10">
          {/* illustration */}
          <div className="relative hidden shrink-0 select-none sm:block" aria-hidden="true">
            <span className="text-7xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] md:text-8xl">🎬</span>
            <span className="absolute -bottom-2 left-12 text-6xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] md:left-16 md:text-7xl">🍿</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-semibold leading-tight !text-white md:text-3xl">Share Your BOB Moment</p>
            <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
              Tagged us on Instagram or WhatsApp? We love seeing your celebrations!
            </p>
          </div>

          <a
            href={`https://wa.me/${config.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-[#2a0e4f] shadow-[0_12px_28px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
          >
            Share on WhatsApp <ArrowRight size={15} />
          </a>
        </div>
      </motion.div>
    </section>
  )
}

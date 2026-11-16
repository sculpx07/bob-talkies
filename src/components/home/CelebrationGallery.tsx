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
  { id: '8', occasion: 'Proposal'     as Filter, img: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=600&q=80', label: 'Family Celebration'  },
  { id: '9', occasion: 'Friends'      as Filter, img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80', label: 'Private Screening'   },
]

export function CelebrationGallery() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [active, setActive] = useState<Filter>('All')

  const visible = active === 'All' ? ITEMS : ITEMS.filter(it => it.occasion === active)

  return (
    <section ref={ref} className="pt-14 md:pt-20">

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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-wrap gap-2 justify-center mb-8"
      >
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActive(f)}
            className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
            style={
              active === f
                ? { background: BADGE_COLORS[f], color: '#fff' }
                : { background: 'rgba(42,14,79,0.07)', color: '#5b4578', border: '1px solid #f0e6cc' }
            }
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <AnimatePresence mode="popLayout">
          {visible.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="group relative overflow-hidden rounded-2xl aspect-square"
            >
              <img
                src={item.img}
                alt={item.label}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a0e4f]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Badge */}
              <span
                className="absolute top-2.5 left-2.5 rounded-full px-2.5 py-1 text-[9px] font-black tracking-[0.18em] uppercase text-white"
                style={{ background: BADGE_COLORS[item.occasion] }}
              >
                {item.occasion}
              </span>

              {/* Hover overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white font-semibold text-sm mb-2">{item.label}</p>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-[#2a0e4f]"
                >
                  Explore This Experience <ArrowRight size={9} />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Share CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 rounded-2xl px-6 py-6 md:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg,#2a0e4f 0%,#32105f 100%)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}
      >
        <div>
          <p className="font-bold text-white text-base mb-0.5">Share Your BOB Moment</p>
          <p className="text-white/50 text-sm">
            Tagged us on Instagram or WhatsApp? We love seeing your celebrations!
          </p>
        </div>
        <a
          href={`https://wa.me/${config.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-black text-[#2a0e4f] transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
        >
          Share on WhatsApp
        </a>
      </motion.div>
    </section>
  )
}

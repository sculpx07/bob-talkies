import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BadgeCheck, RefreshCw, Play, X, ChevronRight } from 'lucide-react'

const FILTERS = ['All', 'Birthday', 'Anniversary', 'Proposal', 'Friends', 'Vibe Hall'] as const
type Filter = typeof FILTERS[number]

const REVIEWS = [
  { id: '1', name: 'Priya & Rohit',  avatar: 'P', occasion: 'Anniversary'  as Filter, verified: true,  repeat: false, rating: 5, text: 'We booked The Delight for our 5th anniversary and it was absolutely magical. Rose petals, fairy lights, a custom banner — when my husband walked in, he was in tears. Best anniversary ever!' },
  { id: '2', name: 'Karthik S.',     avatar: 'K', occasion: 'Birthday'     as Filter, verified: true,  repeat: false, rating: 5, text: 'BOB Talkies made it effortless. Balloons, a photo wall, the cake — everything. When she walked in and saw 12 friends, she burst out crying. Never seen her so happy.' },
  { id: '3', name: 'Meera & Arjun', avatar: 'M', occasion: 'Proposal'     as Filter, verified: true,  repeat: false, rating: 5, text: 'I proposed here and she said YES! Roses, candles, our favourite song playing — the entire theatre was ours. The team made the moment absolutely perfect.' },
  { id: '4', name: 'Vikram & Team', avatar: 'V', occasion: 'Birthday'     as Filter, verified: false, repeat: true,  rating: 5, text: 'An unforgettable farewell! We played a surprise video compilation on the big screen — there was not a dry eye in the room. Staff made everything flawless.' },
  { id: '5', name: 'Rahul M.',      avatar: 'R', occasion: 'Vibe Hall'    as Filter, verified: true,  repeat: false, rating: 5, text: 'Watched the IPL final with 20 friends — absolute blast! The 250" screen and Atmos surround made every boundary feel like we were in the stadium.' },
  { id: '6', name: 'Divya & Suresh',avatar: 'D', occasion: 'Friends'      as Filter, verified: false, repeat: true,  rating: 5, text: 'Intimate, romantic, absolutely perfect. Champagne, comfort food, recliners, and a surprise message on screen before the movie. Pure bliss!' },
  { id: '7', name: 'Anjali T.',     avatar: 'A', occasion: 'Birthday'     as Filter, verified: true,  repeat: false, rating: 5, text: 'Third time booking with BOB Talkies — still getting better every time. The team remembered my husband\'s favourite setup. Truly feel like family here.' },
  { id: '8', name: 'Srinivas P.',   avatar: 'S', occasion: 'Anniversary'  as Filter, verified: true,  repeat: true,  rating: 5, text: 'Booked Cosmos for our group anniversary surprise. Everyone was amazed. The décor was beyond expectations and the team\'s attention to detail was incredible.' },
  { id: '9', name: 'Nisha R.',      avatar: 'N', occasion: 'Proposal'     as Filter, verified: false, repeat: false, rating: 5, text: 'He surprised me here and I literally could not stop crying. The setup was everything I could have dreamed of. We will be back for every anniversary!' },
]

const VIDEOS = [
  { id: 'v1', title: 'Birthday Surprise Reaction',    thumb: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400&q=70', ytId: 'dQw4w9WgXcQ' },
  { id: 'v2', title: 'Anniversary Night — Cosmos',    thumb: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=70', ytId: 'dQw4w9WgXcQ' },
  { id: 'v3', title: '"She Said Yes!" Proposal Story', thumb: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=70', ytId: 'dQw4w9WgXcQ' },
]

export function ReviewsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const [showAll, setShowAll] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const filtered = activeFilter === 'All' ? REVIEWS : REVIEWS.filter(r => r.occasion === activeFilter)
  const displayed = showAll ? filtered : filtered.slice(0, 6)

  return (
    <section
      ref={ref}
      className="py-16 md:py-24"
      style={{ background: 'linear-gradient(180deg,#fdf5e8 0%,#fffaf4 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="font-cursive text-2xl md:text-3xl text-[#c9933a] mb-0.5">Loved by the BOB Family</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#2a0e4f] leading-tight">What Our Guests Lived</h2>
            <motion.div
              className="mt-2 h-[3px] rounded-full bg-[#d4a94a]"
              initial={{ width: 0 }}
              animate={inView ? { width: 40 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </motion.div>

          {/* Google badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={inView ? { opacity: 1, scale: 1, x: 0 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex items-center gap-3 bg-white border border-[#f0e6cc] rounded-2xl px-4 py-3 shadow-sm shrink-0"
          >
            {/* Google "G" */}
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div>
              <span className="text-3xl font-black text-[#c9a84c] leading-none">4.9</span>
              <div className="flex gap-0.5 mt-0.5">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= 4 ? '#c9a84c' : 'none'} stroke="#c9a84c" strokeWidth="1.5">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                ))}
              </div>
              <p className="text-[10px] text-[#5b4578]/50 mt-0.5">847+ reviews</p>
            </div>
          </motion.div>
        </div>

        {/* Video testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex gap-4 overflow-x-auto pb-2 mb-8 [&::-webkit-scrollbar]:hidden"
        >
          {VIDEOS.map(v => (
            <button
              key={v.id}
              onClick={() => setPlayingId(v.id)}
              className="group relative shrink-0 w-[200px] h-[120px] rounded-2xl overflow-hidden focus:outline-none"
            >
              <img src={v.thumb} alt={v.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Play size={16} fill="#2a0e4f" className="text-[#2a0e4f] ml-0.5" />
                </span>
              </div>
              <p className="absolute bottom-2 left-2 right-2 text-[10px] text-white font-semibold line-clamp-1 text-left">{v.title}</p>
            </button>
          ))}
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex flex-wrap gap-2 mb-7"
        >
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); setShowAll(false) }}
              className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all"
              style={
                activeFilter === f
                  ? { background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)', color: '#2a0e4f' }
                  : { background: 'rgba(42,14,79,0.07)', color: '#5b4578', border: '1px solid #f0e6cc' }
              }
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Review cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <AnimatePresence mode="popLayout">
            {displayed.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="bg-white border border-[#f0e6cc] rounded-2xl p-5"
                style={{ boxShadow: '0 2px 12px rgba(42,14,79,0.05)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#f9f4ec] border-2 border-[#f0e6cc] flex items-center justify-center font-bold text-[#c9a84c] text-sm shrink-0">
                    {r.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-[#2a0e4f] text-sm truncate">{r.name}</p>
                      {r.verified && <BadgeCheck size={13} className="shrink-0 text-[#4285F4]" />}
                      {r.repeat && <RefreshCw size={11} className="shrink-0 text-[#c9a84c]" />}
                    </div>
                    <p className="text-[10px] text-[#5b4578]/50">{r.occasion}</p>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {Array.from({ length: r.rating }).map((_, s) => (
                      <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill="#c9a84c" stroke="none">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-[#5b4578] text-sm leading-relaxed line-clamp-4 italic">"{r.text}"</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Show more / all reviews link */}
        <div className="flex justify-center gap-4">
          {!showAll && filtered.length > 6 && (
            <button
              onClick={() => setShowAll(true)}
              className="rounded-full border border-[#c9a84c]/40 px-6 py-2.5 text-sm font-semibold text-[#c9a84c] hover:bg-[#c9a84c]/8 transition-colors"
            >
              Show More
            </button>
          )}
          <Link
            to="/reviews"
            className="inline-flex items-center gap-1 rounded-full border border-[#32105f]/30 px-6 py-2.5 text-sm font-semibold text-[#32105f] hover:bg-[#32105f]/5 transition-colors"
          >
            All Reviews <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Video popup */}
      <AnimatePresence>
        {playingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPlayingId(null)}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-black"
              style={{ aspectRatio: '16/9' }}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${VIDEOS.find(v => v.id === playingId)?.ytId}?autoplay=1`}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
              <button
                onClick={() => setPlayingId(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

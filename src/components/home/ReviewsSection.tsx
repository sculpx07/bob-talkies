import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CinemaFloatBackground } from './CinemaFloatBackground'
import { BadgeCheck, RefreshCw, Play, X, ChevronRight, Quote } from 'lucide-react'

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
  const inView = useInView(ref, { once: true, margin: '0px 0px 18% 0px' })
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const [showAll, setShowAll] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const filtered = activeFilter === 'All' ? REVIEWS : REVIEWS.filter(r => r.occasion === activeFilter)
  const displayed = showAll ? filtered : filtered.slice(0, 6)

  return (
    <section
      ref={ref}
      className="relative overflow-x-clip pb-4 pt-16 md:pb-6 md:pt-24"
    >
      <CinemaFloatBackground />
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="font-cursive text-2xl md:text-3xl text-[#c9933a] mb-0.5">Loved by the BOB Family</p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">What Our Guests Lived</h2>
          <motion.div
            className="mt-2 h-[3px] rounded-full bg-[#d4a94a]"
            initial={{ width: 0 }}
            animate={inView ? { width: 40 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
          {/* Left: rating + video stories on a plum panel */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#5c1535_0%,#6b1535_60%,#8b1a3a_100%)] p-6 text-white shadow-[0_26px_60px_rgba(50,16,95,0.35)] lg:sticky lg:top-28"
          >
            <motion.span
              className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#f5bd61]/25 blur-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            />
            <div className="relative flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg">
                <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Google rating</p>
            </div>

            <div className="relative mt-5 flex items-end gap-3">
              <span className="font-display text-7xl font-bold leading-none text-[#f5d7a1]">4.9</span>
              <div className="pb-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(st => (
                    <svg key={st} width="16" height="16" viewBox="0 0 24 24" fill={st <= 4 ? '#f5d7a1' : 'none'} stroke="#f5d7a1" strokeWidth="1.5">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  ))}
                </div>
                <p className="mt-1 text-xs text-white/70">847+ reviews</p>
              </div>
            </div>

            <div className="relative mt-6 space-y-2.5 border-t border-white/15 pt-5">
              {VIDEOS.map(v => (
                <button
                  key={v.id}
                  onClick={() => setPlayingId(v.id)}
                  className="group flex w-full items-center gap-3 rounded-2xl bg-white/10 p-2 text-left ring-1 ring-white/10 transition-colors hover:bg-white/20 focus:outline-none"
                >
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl">
                    <img src={v.thumb} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 transition-transform duration-300 group-hover:scale-110">
                        <Play size={12} fill="#3d0a24" className="ml-0.5 text-[#3d0a24]" />
                      </span>
                    </span>
                  </span>
                  <span className="line-clamp-2 text-xs font-semibold leading-snug text-white">{v.title}</span>
                </button>
              ))}
            </div>
          </motion.aside>

          {/* Right: filters + staggered quote cards */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mb-7 flex flex-wrap gap-2"
            >
              {FILTERS.map(f => {
                const on = activeFilter === f
                return (
                  <button
                    key={f}
                    onClick={() => { setActiveFilter(f); setShowAll(false) }}
                    className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${on ? 'text-white' : 'text-[#5b2535] hover:text-[#3d0a24]'}`}
                  >
                    {on && (
                      <motion.span layoutId="review-chip" className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#5c1535,#a81a3a)] shadow-[0_8px_20px_rgba(50,16,95,0.3)]" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                    )}
                    {!on && <span className="absolute inset-0 rounded-full bg-white" />}
                    <span className="relative">{f}</span>
                  </button>
                )
              })}
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {displayed.map((r, i) => (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    whileHover={{ y: -6 }}
                    className={`relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white/85 p-6 shadow-[0_14px_36px_rgba(107,35,152,0.1)] ring-1 ring-[#f8dce4] backdrop-blur ${i % 2 === 1 ? 'sm:mt-8' : ''}`}
                  >
                    <Quote size={44} strokeWidth={0} fill="#f1e3fa" className="pointer-events-none absolute right-5 top-5" aria-hidden="true" />
                    <div className="relative mb-4 flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, st) => (
                        <svg key={st} width="14" height="14" viewBox="0 0 24 24" fill="#e0a13a" stroke="none">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                        </svg>
                      ))}
                    </div>
                    <p className="relative flex-1 pr-8 text-[15px] leading-relaxed text-[#3b2a55] line-clamp-5">{r.text}</p>
                    <div className="relative mt-5 flex items-center gap-3 border-t border-[#f3e8f8] pt-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b1a3a,#d9126a)] text-sm font-bold text-white">{r.avatar}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-bold text-[#3d0a24]">{r.name}</p>
                          {r.verified && <BadgeCheck size={14} className="shrink-0 text-[#4285F4]" />}
                          {r.repeat && <RefreshCw size={12} className="shrink-0 text-[#c9a84c]" />}
                        </div>
                        <p className="text-xs text-[#7d4555]">{r.occasion}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Show more / all reviews link */}
        <div className="mt-14 flex justify-center gap-4 md:mt-16">
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
            className="inline-flex items-center gap-1 rounded-full border border-[#f5d7a1]/60 px-6 py-2.5 text-sm font-semibold text-[#f5d7a1] hover:bg-white/10 transition-colors"
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

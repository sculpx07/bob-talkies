import { useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'

const SURPRISES = [
  {
    id: 'memory-reel',
    title: 'Our Memory Reel',
    desc: 'Childhood, friendship & family moments — their whole story on the big screen.',
    img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=700&q=80',
    color: '#a78bfa',
  },
  {
    id: 'big-proposal',
    title: 'The Big Proposal',
    desc: 'Your love story, timeline and the question — in a cinematic moment they\'ll never forget.',
    img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=700&q=80',
    color: '#f43f5e',
  },
  {
    id: 'birthday-surprise',
    title: 'Birthday Screen Surprise',
    desc: 'A personalised birthday video, childhood memories and wishes from everyone they love.',
    img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=700&q=80',
    color: '#fbbf24',
  },
  {
    id: 'video-wishes',
    title: 'Video Wishes',
    desc: 'Collect messages from friends and family anywhere in the world into one surprise video.',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&q=80',
    color: '#34d399',
  },
  {
    id: 'love-story',
    title: 'Love Story on Screen',
    desc: 'Your journey together — first meeting, special dates, favourite memories — on the theatre screen.',
    img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=700&q=80',
    color: '#f472b6',
  },
  {
    id: 'grand-reveal',
    title: 'The Grand Reveal',
    desc: 'Pregnancy announcement, surprise gift reveal or any milestone — make the moment extraordinary.',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&q=80',
    color: '#c9a84c',
  },
  {
    id: 'from-friends-family',
    title: 'From Friends & Family',
    desc: 'A tribute compiled from the people who matter most — in one emotional surprise video.',
    img: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=700&q=80',
    color: '#818cf8',
  },
  {
    id: 'custom-screen',
    title: 'Your Own Custom Screen',
    desc: 'Your photos, your video, your idea. Bring any personalised content and we\'ll screen it.',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&q=80',
    color: '#fb923c',
  },
]

export function PersonaliseSurpriseSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section
      ref={ref}
      className="py-14 md:py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#2a0e4f 0%,#32105f 55%,#2a0e4f 100%)' }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full bg-[#f472b6]/5 blur-3xl translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#a78bfa]/8 blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles size={15} className="text-[#d4a94a]" />
              <p className="font-cursive text-xl text-[#c9933a]">Personalise Your Surprise</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-snug">
              Your Story. Your Screen. Your Surprise.
            </h2>
            <p className="mt-2 text-white/50 text-sm max-w-sm">
              Make your celebration truly yours — from personalised videos to big-screen surprises they'll never expect.
            </p>
          </div>
          <Link
            to="/personalise"
            className="shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black text-[#2a0e4f] transition-all hover:brightness-110 hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
          >
            Create Your Screen Surprise <ArrowRight size={12} />
          </Link>
        </motion.div>

        {/* Horizontal scroll row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {SURPRISES.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              className="relative shrink-0 overflow-hidden rounded-2xl cursor-pointer"
              style={{ width: 220, height: 300, scrollSnapAlign: 'start' }}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ scale: 1.03, y: -4 }}
            >
              <img
                src={s.img}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                style={{ transform: hovered === s.id ? 'scale(1.08)' : 'scale(1)' }}
                loading="lazy"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(10,2,22,0.92) 0%, rgba(10,2,22,0.3) 50%, rgba(10,2,22,0.1) 100%)' }}
              />
              {/* Color accent top-left */}
              <div
                className="absolute top-3 left-3 w-1.5 h-6 rounded-full"
                style={{ background: s.color }}
              />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <h3 className="text-white font-black text-sm leading-snug mb-1">{s.title}</h3>
                <AnimatePresence>
                  {hovered === s.id && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-white/60 text-[11px] leading-relaxed mb-2.5"
                    >
                      {s.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
                <Link
                  to={`/personalise#${s.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold transition-colors"
                  style={{ color: s.color }}
                  onClick={e => e.stopPropagation()}
                >
                  Explore <ArrowRight size={10} />
                </Link>
              </div>
            </motion.div>
          ))}

          {/* Terminal CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.42, duration: 0.4 }}
            className="relative shrink-0 overflow-hidden rounded-2xl flex flex-col items-center justify-center gap-4 border border-white/10"
            style={{
              width: 200, height: 300, scrollSnapAlign: 'start',
              background: 'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))',
              borderColor: 'rgba(201,168,76,0.25)',
            }}
          >
            <Sparkles size={28} className="text-[#c9a84c]" />
            <p className="text-white font-black text-sm text-center px-4 leading-snug">Have your own surprise idea?</p>
            <Link
              to="/personalise"
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black text-[#2a0e4f]"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
            >
              Plan It Here <ArrowRight size={10} />
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}

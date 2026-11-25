import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { X, ArrowRight, Zap } from 'lucide-react'
import { config } from '@/lib/config'

// resets on every full page load / refresh, but not when navigating inside the app
let shownThisLoad = false

export function VibeHallIntroPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (shownThisLoad) return
    const t = setTimeout(() => setOpen(true), 3000)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    setOpen(false)
    shownThisLoad = true
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(20,4,14,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative w-full sm:max-w-2xl overflow-hidden rounded-t-3xl sm:rounded-3xl"
            style={{ background: 'linear-gradient(145deg,#1a0510 0%,#2d0a1c 55%,#1a0510 100%)' }}
          >
            {/* Close */}
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Image strip */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80"
                alt="Vibe Hall"
                className="h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a0510]/40 to-[#1a0510]" />
              {/* Label over image */}
              <div className="absolute left-5 top-4 flex items-center gap-2">
                <Zap size={13} className="text-[#34d399]" />
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#34d399]">Now at BOB Talkies</span>
              </div>
              {/* Specs over image bottom */}
              <div className="absolute bottom-4 left-5 flex gap-2">
                {["250\" Screen", "Dolby Atmos", "20–40 Guests"].map(s => (
                  <span key={s} className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                    style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-7 pt-4">
              <p className="font-cursive text-xl text-[#c9933a] mb-1">Introducing</p>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
                Vibe Hall
              </h2>
              <p className="text-white/55 text-sm leading-relaxed mb-5 max-w-md">
                Hyderabad's only private party hall with a cinema-grade 250" screen. The perfect space for group celebrations, sports screenings, corporate events and more — with room for 20 to 40 guests.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/theatres/vibe-hall"
                  onClick={dismiss}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-black text-[#3d0a24] transition-all hover:brightness-110 active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
                >
                  Explore Vibe Hall <ArrowRight size={14} />
                </Link>
                <a
                  href={`https://wa.me/${config.whatsappNumber}?text=Hi! I'd like to know more about Vibe Hall.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismiss}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/70 hover:bg-white/8 transition-colors"
                >
                  Enquire on WhatsApp
                </a>
              </div>
            </div>

            {/* Bottom glow */}
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-64 -translate-x-1/2 rounded-full bg-[#c9a84c]/10 blur-2xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

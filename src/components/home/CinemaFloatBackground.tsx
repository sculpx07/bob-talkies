import { motion } from 'framer-motion'

/**
 * Decorative background of slowly drifting cinema icons (tickets, popcorn, clapperboards, reels, stars).
 * Purely visual: sits behind a section's content and ignores pointer events.
 */
const ITEMS: Array<{ icon: string; left: string; top: string; size: number; dur: number; delay: number; rot: number }> = [
  { icon: '🎟️', left: '4%',  top: '10%', size: 44, dur: 9,  delay: 0,   rot: -18 },
  { icon: '🍿', left: '90%', top: '8%',  size: 52, dur: 11, delay: 1,   rot: 14 },
  { icon: '🎬', left: '8%',  top: '70%', size: 46, dur: 10, delay: 0.5, rot: -10 },
  { icon: '🎞️', left: '93%', top: '62%', size: 42, dur: 12, delay: 2,   rot: 20 },
  { icon: '🍿', left: '46%', top: '2%',  size: 34, dur: 13, delay: 3,   rot: -8 },
  { icon: '🎟️', left: '80%', top: '86%', size: 40, dur: 10, delay: 1.5, rot: 16 },
  { icon: '⭐', left: '22%', top: '88%', size: 26, dur: 8,  delay: 0.8, rot: 0 },
  { icon: '✨', left: '70%', top: '30%', size: 24, dur: 7,  delay: 2.5, rot: 0 },
  { icon: '🎬', left: '55%', top: '92%', size: 34, dur: 12, delay: 4,   rot: 12 },
]

export function CinemaFloatBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {ITEMS.map((it, i) => (
        <motion.span
          key={i}
          className="absolute select-none opacity-[0.22] drop-shadow-[0_8px_14px_rgba(107,35,152,0.25)]"
          style={{ left: it.left, top: it.top, fontSize: it.size }}
          initial={{ rotate: it.rot }}
          animate={{ y: [0, -22, 0], x: [0, 10, 0], rotate: [it.rot, it.rot + 10, it.rot] }}
          transition={{ duration: it.dur, delay: it.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {it.icon}
        </motion.span>
      ))}
    </div>
  )
}

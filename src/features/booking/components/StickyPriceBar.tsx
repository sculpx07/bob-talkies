import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface StepNavProps {
  onNext: () => void
  onBack: () => void
  /** Continue is only shown once the step is valid */
  canProceed: boolean
  loading?: boolean
  nextLabel?: string
  /** Back is hidden on the first step */
  showBack?: boolean
}

/**
 * Step navigation: a floating pill with a background layer holding Back and Continue.
 * It is `sticky` inside the step column, so it floats at the bottom of the screen while the
 * card is on screen and comes to rest under the card at the end (it never covers the footer).
 */
export function StickyPriceBar({ onNext, onBack, canProceed, loading, nextLabel = 'Continue', showBack = true }: StepNavProps) {
  // hidden while the page is at the top; slides in once the visitor starts scrolling
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    // small buffer (show past 90px, hide under 30px) so it does not flicker near the top
    const update = () => setScrolled((was) => (was ? window.scrollY > 30 : window.scrollY > 90))
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  if (!showBack && !canProceed) return null

  return (
    // fixed height keeps the layout steady while the pill is hidden
    <div className="sticky bottom-4 z-20 mt-6 flex h-[60px] justify-center">
      <AnimatePresence>
      {scrolled && (
      <motion.div
        key="pill"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.85, ease: [0.25, 0.8, 0.25, 1] }}
        className="flex w-full max-w-md items-center justify-between gap-3 rounded-full border border-white/80 bg-white/85 p-2 shadow-[0_18px_50px_rgba(50,16,95,0.22)] backdrop-blur-xl"
      >
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#5c1535] ring-1 ring-[#f5d5e0] transition-all hover:-translate-y-0.5 hover:bg-[#fdf6ff] active:scale-[0.97]"
          >
            <ArrowLeft size={17} aria-hidden="true" /> Back
          </button>
        ) : (
          <span />
        )}

        <AnimatePresence>
          {canProceed && (
            <motion.button
              key="continue"
              type="button"
              onClick={onNext}
              disabled={loading}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              // highlighted: brighter gradient, gold ring and a soft pulsing glow so it is the obvious next action
              className="flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#8b1a3a,#d9126a)] px-8 text-[15px] font-bold text-white ring-1 ring-[#f5d7a1] [animation:planPulse_1.8s_ease-out_infinite] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait…' : nextLabel}
              <ChevronRight size={17} aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}

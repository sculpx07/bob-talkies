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
 * Step navigation shown directly below the step card: two separate buttons, Back on the left and Continue on the right.
 * (Kept under the old file name; it no longer shows selections, totals or a clear button.)
 */
export function StickyPriceBar({ onNext, onBack, canProceed, loading, nextLabel = 'Continue', showBack = true }: StepNavProps) {
  if (!showBack && !canProceed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 flex items-center justify-center gap-5"
    >
    <div className="contents">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#32105f] shadow-[0_10px_28px_rgba(50,16,95,0.22)] ring-1 ring-[#ecd9ec] transition-all hover:-translate-y-0.5 hover:bg-[#fdf6ff] active:scale-[0.97]"
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
            initial={{ opacity: 0, x: 40, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            // highlighted: brighter gradient, gold ring and a soft pulsing glow so it is the obvious next action
            className="flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6b2398,#d946ef)] px-8 text-[15px] font-bold text-white ring-1 ring-[#f5d7a1] [animation:planPulse_1.8s_ease-out_infinite] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait…' : nextLabel}
            <ChevronRight size={17} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
    </motion.div>
  )
}

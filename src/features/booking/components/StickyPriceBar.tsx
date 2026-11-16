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
 * Bottom navigation: just two separate buttons, Back on the left and Continue on the right.
 * (Kept under the old file name; it no longer shows selections, totals or a clear button.)
 */
export function StickyPriceBar({ onNext, onBack, canProceed, loading, nextLabel = 'Continue', showBack = true }: StepNavProps) {
  if (!showBack && !canProceed) return null

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 160, damping: 20, delay: 0.2 }}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-30 mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 safe-area-bottom"
    >
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#32105f] shadow-[0_10px_28px_rgba(50,16,95,0.22)] ring-1 ring-[#ecd9ec] transition-all hover:-translate-y-0.5 hover:bg-[#fdf6ff] active:scale-[0.97]"
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
            className="pointer-events-auto flex h-12 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#32105f,#6b2398)] px-7 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(50,16,95,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Please wait…' : nextLabel}
            <ChevronRight size={17} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

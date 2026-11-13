import { useBooking } from '../state/booking.context'
import { formatINR } from '@/lib/utils/currency'
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface StickyPriceBarProps {
  onNext: () => void
  onBack: () => void
  canProceed: boolean
  loading?: boolean
  nextLabel?: string
  showTotal?: boolean
  stepIndex: number
  totalSteps: number
}

export function StickyPriceBar({
  onNext, onBack, canProceed, loading, nextLabel = 'Continue',
  showTotal, stepIndex, totalSteps,
}: StickyPriceBarProps) {
  const { state } = useBooking()
  const [holdSeconds, setHoldSeconds] = useState<number | null>(null)

  useEffect(() => {
    if (!state.slotHoldExpiresAt) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(state.slotHoldExpiresAt!).getTime() - Date.now()) / 1000))
      setHoldSeconds(remaining)
      if (remaining === 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [state.slotHoldExpiresAt])

  const quote = state.serverQuote
  const displayTotal = quote?.totalPaise ?? null

  const mins = holdSeconds !== null ? Math.floor(holdSeconds / 60) : null
  const secs = holdSeconds !== null ? holdSeconds % 60 : null
  const holdWarning = holdSeconds !== null && holdSeconds < 120
  const progress = ((stepIndex + 1) / totalSteps) * 100

  // nothing to show yet (first step, nothing chosen): no empty pill
  const hasContent = stepIndex > 0 || canProceed || holdSeconds !== null || Boolean(showTotal && displayTotal)
  if (!hasContent) return null

  return (
    <motion.div
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.3 }}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex flex-col items-center gap-2 px-4 safe-area-bottom"
    >
      {holdSeconds !== null && (
        <div className={cn(
          'pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-1.5 text-xs shadow-lg backdrop-blur',
          holdWarning ? 'text-[#c2255c]' : 'text-[#5b4578]',
        )}>
          <Clock size={12} aria-hidden="true" />
          Slot held for <strong>{mins}:{String(secs).padStart(2, '0')}</strong>
          {holdWarning && ' — please hurry!'}
        </div>
      )}

      <div className="pointer-events-auto flex w-fit min-w-[300px] max-w-2xl items-center gap-4 rounded-full border border-white/70 bg-white/85 p-2 pl-3 shadow-[0_18px_50px_rgba(107,35,152,0.28)] backdrop-blur-xl">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f6e6ef] text-[#32105f] transition-colors hover:bg-[#efd3e6]"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="min-w-0 flex-1 px-2">
          {showTotal && displayTotal ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7d7094]">Total</p>
              <p className="text-lg font-bold leading-tight text-[#32105f]">{formatINR(displayTotal)}</p>
            </>
          ) : null}
        </div>

        {/* Continue appears (with a flourish) only once the step has a valid selection */}
        <AnimatePresence>
          {canProceed && (
            <motion.button
              key="continue"
              type="button"
              onClick={onNext}
              disabled={loading}
              initial={{ opacity: 0, x: 60, scale: 0.6, filter: 'blur(6px)' }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                filter: 'blur(0px)',
                boxShadow: [
                  '0 0 0 0 rgba(217,70,239,0.6)',
                  '0 0 0 18px rgba(217,70,239,0)',
                  '0 10px 24px rgba(107,35,152,0.35)',
                ],
              }}
              exit={{ opacity: 0, x: 40, scale: 0.7 }}
              transition={{
                type: 'spring', stiffness: 260, damping: 16,
                boxShadow: { duration: 1.1, times: [0, 0.7, 1], delay: 0.25 },
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="group flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#6b2398,#d946ef)] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait…' : nextLabel}
              <ChevronRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

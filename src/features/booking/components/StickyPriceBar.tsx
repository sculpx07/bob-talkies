import { useBooking } from '../state/booking.context'
import { formatINR } from '@/lib/utils/currency'
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export interface Selection {
  id: string
  title: string
  sub?: string
  image?: string
}

interface StickyPriceBarProps {
  onNext: () => void
  onBack: () => void
  canProceed: boolean
  loading?: boolean
  nextLabel?: string
  showTotal?: boolean
  stepIndex: number
  totalSteps: number
  /** everything the visitor has picked so far, shown as chips */
  selections?: Selection[]
  onClear?: () => void
}

export function StickyPriceBar({
  onNext, onBack, canProceed, loading, nextLabel = 'Continue',
  showTotal, stepIndex, selections = [], onClear,
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

  const displayTotal = state.serverQuote?.totalPaise ?? null
  const mins = holdSeconds !== null ? Math.floor(holdSeconds / 60) : null
  const secs = holdSeconds !== null ? holdSeconds % 60 : null
  const holdWarning = holdSeconds !== null && holdSeconds < 120
  const showTotalChip = Boolean(showTotal && displayTotal)

  // nothing to show yet (first step, nothing chosen): no empty pill
  const hasContent = stepIndex > 0 || canProceed || holdSeconds !== null || selections.length > 0 || showTotalChip
  if (!hasContent) return null

  return (
    <motion.div
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.3 }}
      className="pointer-events-none fixed inset-x-0 bottom-3 z-30 flex flex-col items-center gap-2 px-3 safe-area-bottom sm:bottom-4 sm:px-4"
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

      <div className="pointer-events-auto flex w-full max-w-3xl items-center gap-2 rounded-full border border-white/10 bg-[linear-gradient(135deg,#32105f,#4a1a8a)] p-1.5 pl-2 text-white shadow-[0_20px_50px_rgba(50,16,95,0.55)] backdrop-blur-xl sm:gap-3 sm:p-2 sm:pl-3">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:h-11 sm:w-11"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {(selections.length > 0 || showTotalChip) && (
          <p className="hidden shrink-0 pl-1 font-display text-lg font-semibold text-white/90 lg:block">Your Selections</p>
        )}

        {/* chips */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <AnimatePresence initial={false}>
            {selections.map((sel) => (
              <motion.div
                key={sel.id}
                layout
                initial={{ opacity: 0, scale: 0.6, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 ring-1 ring-white/15"
              >
                {sel.image ? (
                  <img src={sel.image} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d946ef]/40 text-xs font-bold">
                    {sel.title.charAt(0)}
                  </span>
                )}
                <span className="leading-tight">
                  <span className="block max-w-[130px] truncate text-sm font-semibold">{sel.title}</span>
                  {sel.sub && <span className="block max-w-[130px] truncate text-[11px] text-white/70">{sel.sub}</span>}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence initial={false}>
          {showTotalChip && (
              <motion.div
                key="total"
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#f5d7a1] px-3 py-1.5 text-[#32105f] sm:gap-2 sm:px-4"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
                <span className="text-base font-bold">{formatINR(displayTotal!)}</span>
              </motion.div>
            )}
        </AnimatePresence>

        {onClear && selections.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 px-1 text-sm font-semibold text-white/75 transition-colors hover:text-white sm:px-2"
          >
            Clear
          </button>
        )}

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
                  '0 10px 24px rgba(217,70,239,0.35)',
                ],
              }}
              exit={{ opacity: 0, x: 40, scale: 0.7 }}
              transition={{
                type: 'spring', stiffness: 260, damping: 16,
                boxShadow: { duration: 1.1, times: [0, 0.7, 1], delay: 0.25 },
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="group flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#a63fd8,#d946ef)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:px-6"
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

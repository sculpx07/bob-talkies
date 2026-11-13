import { useBooking } from '../state/booking.context'
import { formatINR } from '@/lib/utils/currency'
import { Button } from '@/components/ui/Button'
import { ChevronRight, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-bg-elevated/95 backdrop-blur-md border-t border-border-subtle px-4 py-3 safe-area-bottom">
      {holdSeconds !== null && (
        <div className={cn(
          'flex items-center justify-center gap-1.5 text-xs mb-2',
          holdWarning ? 'text-crimson-500' : 'text-text-muted',
        )}>
          <Clock size={12} aria-hidden="true" />
          Slot held for{' '}
          <strong>{mins}:{String(secs).padStart(2, '0')}</strong>
          {holdWarning && ' — please hurry!'}
        </div>
      )}
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        {stepIndex > 0 && (
          <Button variant="ghost" size="md" onClick={onBack} className="shrink-0">
            Back
          </Button>
        )}
        <div className="flex-1">
          {showTotal && displayTotal ? (
            <div className="text-xs text-text-muted">
              Total: <span className="text-gold-400 font-semibold">{formatINR(displayTotal)}</span>
            </div>
          ) : (
            <div className="text-xs text-text-muted">
              Step {stepIndex + 1} of {totalSteps}
            </div>
          )}
        </div>
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
          loading={loading}
          className="shrink-0 gap-1"
        >
          {nextLabel} <ChevronRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

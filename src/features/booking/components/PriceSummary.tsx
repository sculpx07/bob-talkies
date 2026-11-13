import { useEffect } from 'react'
import { useBooking } from '../state/booking.context'
import { usePriceQuote } from '../hooks/usePriceQuote'
import { formatINR } from '@/lib/utils/currency'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'

interface PriceSummaryProps {
  compact?: boolean
}

export function PriceSummary({ compact }: PriceSummaryProps) {
  const { state, dispatch } = useBooking()
  const { data: quote, isLoading } = usePriceQuote({
    theatreId: state.theatreId ?? undefined,
    packageId: state.packageId ?? undefined,
    date: state.date ?? undefined,
    slotId: state.slotId ?? undefined,
    guests: state.guests,
    addonIds: state.addonIds,
    couponCode: state.couponCode ?? undefined,
  })

  useEffect(() => {
    if (quote && JSON.stringify(state.serverQuote) !== JSON.stringify(quote)) {
      dispatch({ type: 'SET_SERVER_QUOTE', quote })
    }
  }, [quote])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
      </div>
    )
  }

  if (!quote) return null

  return (
    <div className={cn('space-y-2', !compact && 'p-5 bg-bg-surface border border-border-subtle rounded-card')}>
      {!compact && (
        <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Price Summary</h3>
      )}
      <dl className="space-y-2">
        {quote.lineItems.map((item, i) => (
          <div key={i} className={cn(
            'flex justify-between text-sm',
            item.paise < 0 ? 'text-success' : 'text-text-secondary',
          )}>
            <dt>{item.label}</dt>
            <dd className="font-medium">{item.paise < 0 ? '-' : ''}{formatINR(Math.abs(item.paise))}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-border-subtle pt-3 mt-3 space-y-2">
        <div className="flex justify-between font-bold">
          <span className="text-text-primary">Total</span>
          <span className="text-gold-400 text-lg">{formatINR(quote.totalPaise)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Pay advance now (30%)</span>
          <span className="text-text-primary font-semibold">{formatINR(quote.advancePaise)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Balance at venue</span>
          <span className="text-text-muted">{formatINR(quote.balancePaise)}</span>
        </div>
      </div>
    </div>
  )
}

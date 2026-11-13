import { useEffect } from 'react'
import { motion } from 'framer-motion'
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(!compact && 'overflow-hidden rounded-3xl bg-white shadow-[0_16px_44px_rgba(107,35,152,0.14)] ring-1 ring-[#ecd9ec]')}
    >
      {!compact && (
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#32105f,#6b2398_55%,#d946ef)] px-6 py-5">
          <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-xl" aria-hidden="true" />
          <span className="pointer-events-none absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-[#f5bd61]/30 blur-xl" aria-hidden="true" />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">Your booking</p>
          <p className="relative mt-0.5 font-display text-2xl font-bold text-white">Price Summary</p>
        </div>
      )}
      <div className={cn(!compact && 'p-6')}>
        <dl className="space-y-3">
          {quote.lineItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.5 }}
              className={cn('flex justify-between gap-4 text-sm', item.paise < 0 ? 'text-emerald-600' : 'text-[#5b4578]')}
            >
              <dt>{item.label}</dt>
              <dd className="font-semibold">{item.paise < 0 ? '-' : ''}{formatINR(Math.abs(item.paise))}</dd>
            </motion.div>
          ))}
        </dl>
        <div className="my-5 border-t border-dashed border-[#d9b8e0]" />
        <div className="flex items-end justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-[#7d7094]">Total</span>
          <span className="bg-[linear-gradient(135deg,#32105f,#c026d3)] bg-clip-text text-4xl font-bold tabular-nums text-transparent">{formatINR(quote.totalPaise)}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#f3e6ff] p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6b2398]">Pay now (30%)</p>
            <p className="mt-1 text-xl font-bold text-[#32105f]">{formatINR(quote.advancePaise)}</p>
          </div>
          <div className="rounded-2xl bg-[#fff1d6] p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8f6420]">Balance at venue</p>
            <p className="mt-1 text-xl font-bold text-[#4a2a00]">{formatINR(quote.balancePaise)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useCurrentQuote } from '../hooks/useCurrentQuote'
import { formatINR } from '@/lib/utils/currency'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'
import { displayQuoteLabel, hasExtraGuestLine, isExtraGuestLabel } from '@/content/bookingInclusions'
import { ProvisionalNote } from './ProvisionalNote'

/** Running total and breakdown, all taken from the server price quote. */
export function BookingSummaryCard({ className }: { className?: string }) {
  const { data: quote, isLoading } = useCurrentQuote()
  const [open, setOpen] = useState(true)
  const provisional = hasExtraGuestLine(quote?.lineItems)

  return (
    <div className={cn('overflow-hidden rounded-3xl bg-white ring-1 ring-[#ecd9ec]', className)}>
      <div className="flex items-center justify-between bg-[#f6e6ef] px-5 py-3.5">
        <span className="font-display text-lg font-bold text-[#2a0e4f]">Total{provisional && <span className="ml-1.5 align-middle text-[10px] font-bold uppercase tracking-wider text-[#8f6420]">provisional</span>}</span>
        <span className="text-xl font-bold tabular-nums text-[#32105f]">{quote ? formatINR(quote.totalPaise) : '—'}</span>
      </div>
      <div className="px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mb-3 flex w-full items-center justify-between text-left text-sm font-bold text-[#6b2398]"
        >
          Booking summary
          <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} />
        </button>

        {isLoading || !quote ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-5 w-full" />)}</div>
        ) : (
          <>
            {open && (
              <dl className="space-y-2 text-sm">
                {quote.lineItems.map((item, i) => (
                  <div key={i} className={cn('flex justify-between gap-3', item.paise < 0 ? 'text-emerald-600' : 'text-[#5b4578]')}>
                    <dt>{displayQuoteLabel(item.label)}</dt>
                    <dd className="font-semibold tabular-nums">{item.paise < 0 ? '-' : ''}{formatINR(Math.abs(item.paise))}{isExtraGuestLabel(item.label) && <span className="ml-1 text-[10px] font-bold uppercase text-[#8f6420]">prov.</span>}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="my-3 border-t border-[#ecd9ec]" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between font-bold text-[#2a0e4f]">
                <dt>Advance payable</dt>
                <dd className="tabular-nums">{formatINR(quote.advancePaise)}</dd>
              </div>
              <div className="flex justify-between text-[#5b4578]">
                <dt>Balance amount</dt>
                <dd className="tabular-nums">{formatINR(quote.balancePaise)}</dd>
              </div>
            </dl>
            <p className="mt-1 text-right text-[11px] text-[#7d7094]">Payable at the venue</p>
            {provisional && <ProvisionalNote className="mt-3" />}
          </>
        )}
      </div>
    </div>
  )
}

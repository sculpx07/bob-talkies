import { AlertCircle, AlertTriangle } from 'lucide-react'
import { Card, CardBody, CardHeader, ErrorState, Skeleton } from '@/admin/components/ui'
import { formatPaise } from '@/admin/lib/utils/money'
import { cn } from '@/admin/lib/utils/cn'
import { OVERRIDABLE_ISSUES, type Quote } from '../quote'

/** Live price: every line, GST, total, advance, and anything that blocks the booking. */
export function QuotePanel({ quote, loading, error, refreshing, title = 'Price', compareTotalPaise, emptyText = 'Pick a theatre, date and slot to see the price.' }: {
  quote?: Quote
  loading: boolean
  error?: unknown
  refreshing?: boolean
  title?: string
  /** an existing booking's total, to show the change */
  compareTotalPaise?: number
  emptyText?: string
}) {
  return (
    <Card>
      <CardHeader title={title} description={quote ? `${quote.isWeekend ? 'Weekend' : 'Weekday'} prices · GST ${quote.breakdown.gstPercent}%${quote.breakdown.pricesIncludeGst ? ' included' : ''}` : undefined} />
      <CardBody className={cn('space-y-3', refreshing && 'opacity-60 transition-opacity')}>
        {error ? (
          <ErrorState error={error} title="Could not price this" className="py-4" />
        ) : loading && !quote ? (
          <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-4" />)}</div>
        ) : !quote ? (
          <p className="text-sm text-slate-500">{emptyText}</p>
        ) : (
          <>
            {quote.issues.length > 0 && (
              <ul className="space-y-1.5">
                {quote.issues.map((i) => (
                  <li key={i.code + i.message} className={cn('flex gap-2 rounded-lg px-2.5 py-1.5 text-xs', i.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800')}>
                    {i.severity === 'error' ? <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                    <span>{i.message}{i.severity === 'error' && OVERRIDABLE_ISSUES.includes(i.code) && ' (staff can override)'}</span>
                  </li>
                ))}
              </ul>
            )}
            <ul className="divide-y divide-slate-100 text-sm">
              {quote.lineItems.map((l, idx) => (
                <li key={idx} className="flex justify-between gap-3 py-1.5">
                  <span className={cn('text-slate-600', l.paise < 0 && 'text-emerald-700')}>{l.label}</span>
                  <span className={cn('tabular-nums', l.paise < 0 && 'text-emerald-700', l.included && 'text-slate-400')}>
                    {l.paise < 0 ? `−${formatPaise(-l.paise)}` : formatPaise(l.paise)}{l.included ? ' (incl.)' : ''}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t border-slate-200 pt-2">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-lg font-semibold tabular-nums text-slate-900">{formatPaise(quote.totalPaise)}</span>
            </div>
            {compareTotalPaise !== undefined && compareTotalPaise !== quote.totalPaise && (
              <p className="text-right text-xs text-slate-500">
                was {formatPaise(compareTotalPaise)} · {quote.totalPaise > compareTotalPaise ? '+' : '−'}{formatPaise(Math.abs(quote.totalPaise - compareTotalPaise))}
              </p>
            )}
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Advance ({quote.advancePercent}%) <strong className="text-slate-900">{formatPaise(quote.advancePaise)}</strong> · balance at venue {formatPaise(quote.balancePaise)}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  )
}

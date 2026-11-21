import { useState } from 'react'
import { BadgePercent, CalendarCheck, Download, IndianRupee, Receipt, Ticket, Wallet } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { Delta, TrendBars } from '@/admin/components/charts'
import { Button, Card, CardBody, CardHeader, ErrorState, LoadingBlock, SegmentedControl, StatCard, useToast } from '@/admin/components/ui'
import { useUrlFilters } from '@/admin/hooks/useUrlFilters'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDate } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { useExportBookings, useReportSummary } from '../api'
import { BreakdownCards } from '../components/BreakdownCards'
import { ReportFilters } from '../components/ReportFilters'
import type { DailyPoint } from '../types'
import { presetRange, rangeLabel, shortDate } from '../utils'

type Metric = 'revenuePaise' | 'collectedPaise' | 'bookings'
const METRICS: { value: Metric; label: string; title: string; description: string }[] = [
  { value: 'revenuePaise', label: 'Revenue', title: 'Revenue by celebration date', description: 'Value of sold bookings (confirmed, completed, no-show) on each day.' },
  { value: 'collectedPaise', label: 'Collected', title: 'Money received by day', description: 'Payments recorded on each day, whatever the booking date.' },
  { value: 'bookings', label: 'Bookings', title: 'Bookings by celebration date', description: 'Sold bookings on each day.' },
]

/** Sales, occupancy, add-ons, offers and leads for any date range, with CSV export. */
export default function ReportsPage() {
  const toast = useToast()
  const initial = presetRange('last30')
  const [f, setFilters] = useUrlFilters({ preset: 'last30', from: initial.from, to: initial.to, theatre: '' })
  const [metric, setMetric] = useState<Metric>('revenuePaise')
  const range = { from: f.from, to: f.to, ...(f.theatre && { theatre: f.theatre }) }
  const invalid = f.to < f.from
  const query = useReportSummary(range, !invalid)
  const exporter = useExportBookings()
  const s = query.data

  const exportCsv = () =>
    exporter.mutate(range, {
      onSuccess: () => toast.success('Bookings exported'),
      onError: (err) => toast.error(errorMessage(err)),
    })

  const m = METRICS.find((x) => x.value === metric)!
  const fmt = (v: number) => (metric === 'bookings' ? `${v} booking${v === 1 ? '' : 's'}` : formatPaise(v))
  const details = (d: DailyPoint) => (metric === 'bookings' ? formatPaise(d.revenuePaise) : `${d.bookings} booking${d.bookings === 1 ? '' : 's'}`)

  return (
    <>
      <PageHeader
        title="Reports"
        description={s ? `${rangeLabel(s.range.from, s.range.to)} · compared with ${rangeLabel(s.previousRange.from, s.previousRange.to)}` : 'Sales, occupancy and leads.'}
        actions={
          <Button variant="secondary" leftIcon={<Download className="h-4 w-4" />} onClick={exportCsv} loading={exporter.isPending} disabled={invalid}>
            Export bookings (CSV)
          </Button>
        }
      />

      <Card className="mb-6">
        <CardBody>
          <ReportFilters value={f} onChange={setFilters} />
          {invalid && <p role="alert" className="mt-2 text-sm text-red-600">The end date must be on or after the start date.</p>}
        </CardBody>
      </Card>

      {query.error && !s ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : !s ? (
        <LoadingBlock />
      ) : (
        <div className={query.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Revenue booked" value={formatPaise(s.totals.revenuePaise)} icon={<IndianRupee />} tone="brand"
              hint={<Delta current={s.totals.revenuePaise} previous={s.previous.revenuePaise} />} />
            <StatCard label="Money collected" value={formatPaise(s.totals.collectedPaise)} icon={<Wallet />} tone="success"
              hint={<Delta current={s.totals.collectedPaise} previous={s.previous.collectedPaise} />} />
            <StatCard label="Bookings" value={s.totals.bookings} icon={<CalendarCheck />}
              hint={<Delta current={s.totals.bookings} previous={s.previous.bookings} />} />
            <StatCard label="Average booking value" value={formatPaise(s.totals.averageOrderPaise)} icon={<Receipt />}
              hint={<Delta current={s.totals.averageOrderPaise} previous={s.previous.averageOrderPaise} />} />
            <StatCard label="Occupancy" value={`${s.totals.occupancy}%`} icon={<Ticket />}
              hint={`${s.totals.bookings} of ${s.totals.sellableSlots} open slots sold`} />
            <StatCard label="Cancellations" value={`${s.totals.cancellationRate}%`} icon={<BadgePercent />} tone={s.totals.cancellationRate > 15 ? 'warning' : 'neutral'}
              hint={<><span className="mr-1">{s.totals.cancelled} cancelled · {s.totals.noShows} no-show ·</span><Delta current={s.totals.cancellationRate} previous={s.previous.cancellationRate} lowerIsBetter points /></>} />
          </div>

          <Card className="mb-6">
            <CardHeader
              title={m.title}
              description={m.description}
              actions={<SegmentedControl label="Chart shows" options={METRICS} value={metric} onChange={setMetric} />}
            />
            <CardBody>
              <TrendBars
                ariaLabel={`${m.title}, ${rangeLabel(s.range.from, s.range.to)}`}
                format={fmt}
                points={s.daily.map((d) => ({ label: shortDate(d.date), value: d[metric], details: <>{formatDate(d.date)}<br />{details(d)}</> }))}
              />
              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-4">
                {([
                  ['Still to collect', formatPaise(s.totals.outstandingPaise)],
                  ['Discounts given', formatPaise(s.totals.discountPaise)],
                  ['GST in revenue', formatPaise(s.totals.gstPaise)],
                  ['Guests hosted', s.totals.guests],
                ] as const).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="font-semibold tabular-nums text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <BreakdownCards s={s} />
          <p className="mt-6 text-xs text-slate-500">
            Revenue counts confirmed, completed and no-show bookings by their celebration date. Occupancy uses today's slot setup and skips blocked dates.
          </p>
        </div>
      )}
    </>
  )
}

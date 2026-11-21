import { Link, useNavigate } from 'react-router-dom'
import { AlarmClock, ArrowRight, CalendarDays, IndianRupee, UserRound, Wallet } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { TrendBars } from '@/admin/components/charts'
import { Card, CardBody, CardHeader, DataTable, EmptyState, Skeleton, StatCard, StatusBadge, type Column } from '@/admin/components/ui'
import { useCurrentUser } from '@/admin/auth/AuthProvider'
import { BOOKING_STATUS_BADGE, PAYMENT_STATUS_BADGE } from '@/admin/features/bookings/constants'
import type { BookingListItem } from '@/admin/features/bookings/types'
import { useReportOverview, useReportSummary } from '@/admin/features/reports/api'
import type { ReportOverview, UnpaidBooking } from '@/admin/features/reports/types'
import { presetRange, shortDate } from '@/admin/features/reports/utils'
import { formatDate, formatTime, todayISO } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { cn } from '@/admin/lib/utils/cn'
import { format, parseISO } from 'date-fns'
import { useBookingsOn, useLeadStats } from '../api'

const scheduleColumns: Column<BookingListItem>[] = [
  { key: 'time', header: 'Time', cell: (b) => <span className="font-medium text-slate-900">{formatTime(b.slotStart)}</span>, className: 'w-24' },
  { key: 'theatre', header: 'Theatre', cell: (b) => b.theatreName },
  {
    key: 'customer',
    header: 'Customer',
    cell: (b) => (
      <div>
        <p className="font-medium text-slate-900">{b.customer.name}</p>
        <p className="text-xs text-slate-500">{b.customer.mobile}</p>
      </div>
    ),
  },
  { key: 'guests', header: 'Guests', cell: (b) => b.guests, align: 'right', hideOnMobile: true },
  { key: 'status', header: 'Status', cell: (b) => <StatusBadge status={b.status} map={BOOKING_STATUS_BADGE} /> },
  {
    key: 'due',
    header: 'Balance due',
    align: 'right',
    hideOnMobile: true,
    cell: (b) => (
      <div className="flex flex-col items-end gap-1">
        <span className="tabular-nums">{formatPaise(b.balanceDuePaise)}</span>
        <StatusBadge status={b.paymentStatus} map={PAYMENT_STATUS_BADGE} />
      </div>
    ),
  },
]

const unpaidColumns: Column<UnpaidBooking>[] = [
  {
    key: 'when',
    header: 'When',
    cell: (b) => (
      <div className="whitespace-nowrap">
        <p className="font-medium text-slate-900">{format(parseISO(b.date), 'EEE, d MMM')}</p>
        <p className="text-xs text-slate-500">{formatTime(b.slotStart)} · {b.theatreName}</p>
      </div>
    ),
  },
  {
    key: 'customer',
    header: 'Customer',
    cell: (b) => (
      <div>
        <p className="font-medium text-slate-900">{b.customer.name}</p>
        <p className="text-xs text-slate-500">{b.customer.mobile}</p>
      </div>
    ),
  },
  { key: 'paid', header: 'Paid', align: 'right', hideOnMobile: true, cell: (b) => <span className="tabular-nums text-slate-600">{formatPaise(b.amountPaidPaise)} / {formatPaise(b.totalPaise)}</span> },
  { key: 'due', header: 'Due', align: 'right', cell: (b) => <span className="font-semibold tabular-nums text-slate-900">{formatPaise(b.balanceDuePaise)}</span> },
]

/** Next 7 days: sold slots out of open slots, per day. */
function WeekStrip({ days }: { days: ReportOverview['nextDays'] }) {
  return (
    <ul className="grid grid-cols-7 gap-2">
      {days.map((d, i) => {
        const pct = d.occupancy
        return (
          <li key={d.date}>
            <Link
              to={`/bookings?date=${d.date}`}
              className="focus-ring block rounded-lg border border-slate-200 p-2 text-center hover:border-violet-300"
              aria-label={`${formatDate(d.date)}: ${d.bookings} of ${d.sellableSlots} slots booked`}
            >
              <p className="text-[11px] font-medium uppercase text-slate-500">{i === 0 ? 'Today' : format(parseISO(d.date), 'EEE')}</p>
              <p className="text-xs text-slate-400">{format(parseISO(d.date), 'd MMM')}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{d.bookings}</p>
              <p className="text-[11px] text-slate-500">of {d.sellableSlots}</p>
              <div className="mt-1.5 h-1.5 rounded-full bg-slate-100">
                <div className={cn('h-1.5 rounded-full', pct >= 80 ? 'bg-violet-700' : 'bg-violet-500')} style={{ width: `${pct}%`, minWidth: d.bookings ? 4 : 0 }} />
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default function DashboardPage() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const today = todayISO()
  const bookings = useBookingsOn(today)
  const leads = useLeadStats()
  const overview = useReportOverview()
  const last30 = useReportSummary(presetRange('last30'))

  const o = overview.data
  const todays = bookings.data?.bookings ?? []
  const firstName = user.name.split(' ')[0]

  return (
    <>
      <PageHeader title={`Hello, ${firstName}`} description={formatDate(today)} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bookings today" value={o?.today.bookings ?? 0} icon={<CalendarDays />} tone="brand" loading={overview.isLoading} to="/bookings"
          hint={o && `${o.today.occupancy}% of ${o.today.sellableSlots} slots · ${o.today.guests} guests${o.activeHolds ? ` · ${o.activeHolds} on hold` : ''}`} />
        <StatCard label="Collected today" value={formatPaise(o?.today.collectedPaise ?? 0)} icon={<Wallet />} tone="success" loading={overview.isLoading}
          hint="Payments recorded today" />
        <StatCard label="Still to collect" value={formatPaise(o?.unpaidUpcoming.amountPaise ?? 0)} icon={<IndianRupee />} tone={o?.unpaidUpcoming.count ? 'warning' : 'neutral'} loading={overview.isLoading}
          hint={o && `${o.unpaidUpcoming.count} upcoming booking${o.unpaidUpcoming.count === 1 ? '' : 's'} with a balance`} />
        <StatCard label="Open leads" value={leads.data?.open ?? 0} icon={leads.data?.dueFollowUps ? <AlarmClock /> : <UserRound />} tone={leads.data?.dueFollowUps ? 'warning' : 'neutral'} loading={leads.isLoading} to="/leads"
          hint={leads.data && `${leads.data.dueFollowUps} follow-up${leads.data.dueFollowUps === 1 ? '' : 's'} due · ${leads.data.unassignedOpen} not assigned`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Next 7 days" description="Slots sold out of slots open, per day." />
          <CardBody>
            {o ? <WeekStrip days={o.nextDays} /> : <Skeleton className="h-28 w-full" />}
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Revenue, last 30 days"
            description={last30.data ? `${formatPaise(last30.data.totals.revenuePaise)} from ${last30.data.totals.bookings} bookings` : 'By celebration date'}
            actions={<Link to="/reports" className="focus-ring inline-flex items-center gap-1 rounded text-sm font-medium text-violet-700 hover:text-violet-900">Reports <ArrowRight className="h-4 w-4" /></Link>}
          />
          <CardBody>
            {last30.data ? (
              <TrendBars
                height={112}
                ariaLabel="Revenue per day for the last 30 days"
                format={formatPaise}
                points={last30.data.daily.map((d) => ({ label: shortDate(d.date), value: d.revenuePaise, details: `${d.bookings} booking${d.bookings === 1 ? '' : 's'}` }))}
              />
            ) : <Skeleton className="h-36 w-full" />}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Today's schedule" description="Every booking holding a slot today, earliest first." />
        <DataTable
          columns={scheduleColumns}
          rows={todays}
          rowKey={(b) => b.id}
          loading={bookings.isLoading}
          error={bookings.error}
          onRetry={() => bookings.refetch()}
          onRowClick={(b) => navigate(`/bookings/${b.id}`)}
          empty={<EmptyState icon={<CalendarDays className="h-5 w-5" />} title="No bookings today" description="New bookings will appear here automatically." />}
        />
      </Card>

      <Card className="mt-6 overflow-hidden">
        <CardHeader title="Upcoming with balance due" description="Confirmed bookings that still owe money, soonest first." />
        <DataTable
          columns={unpaidColumns}
          rows={o?.unpaidUpcoming.bookings}
          rowKey={(b) => b.id}
          loading={overview.isLoading}
          error={overview.error}
          onRetry={() => overview.refetch()}
          onRowClick={(b) => navigate(`/bookings/${b.id}`)}
          empty={<EmptyState icon={<Wallet className="h-5 w-5" />} title="Nothing to collect" description="Every upcoming booking is fully paid." />}
        />
      </Card>
    </>
  )
}

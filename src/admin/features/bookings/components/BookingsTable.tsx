import { useNavigate } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { Button, Card, DataTable, EmptyState, Input, Pagination, SearchInput, Select, StatusBadge, type Column } from '@/admin/components/ui'
import { TheatreSelect } from '@/admin/features/theatres/components/TheatreSelect'
import { occasionLabel } from '@/admin/constants/catalog'
import { useUrlFilters } from '@/admin/hooks/useUrlFilters'
import { formatDate, formatTime, timeAgo } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { useBookings } from '../api'
import { BOOKING_STATUS_BADGE, PAYMENT_STATUS_BADGE, SOURCE_LABELS, STATUS_FILTER_OPTIONS } from '../constants'
import type { BookingListItem, BookingSource, PaymentStatus } from '../types'

const columns: Column<BookingListItem>[] = [
  {
    key: 'createdAt',
    header: 'Booking',
    sortable: true,
    cell: (b) => (
      <div>
        <p className="font-mono text-sm font-semibold text-slate-900">{b.bookingNumber}</p>
        <p className="text-xs text-slate-500">{SOURCE_LABELS[b.source]} · {timeAgo(b.createdAt)}</p>
      </div>
    ),
  },
  {
    key: 'date',
    header: 'When',
    sortable: true,
    cell: (b) => (
      <div>
        <p className="font-medium text-slate-900">{formatDate(b.date)}</p>
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
        <p className="text-xs text-slate-500">{b.customer.mobile}{b.occasion ? ` · ${occasionLabel(b.occasion)}` : ''}</p>
      </div>
    ),
  },
  { key: 'guests', header: 'Guests', align: 'right', hideOnMobile: true, cell: (b) => b.guests },
  { key: 'status', header: 'Status', cell: (b) => <StatusBadge status={b.status} map={BOOKING_STATUS_BADGE} /> },
  {
    key: 'totalPaise',
    header: 'Total / due',
    sortable: true,
    align: 'right',
    cell: (b) => (
      <div className="flex flex-col items-end gap-1 tabular-nums">
        <span className="font-medium text-slate-900">{formatPaise(b.totalPaise)}</span>
        {b.balanceDuePaise > 0 ? <span className="text-xs text-slate-500">{formatPaise(b.balanceDuePaise)} due</span> : null}
        <StatusBadge status={b.paymentStatus} map={PAYMENT_STATUS_BADGE} />
      </div>
    ),
  },
]

const PAYMENT_OPTIONS = Object.entries(PAYMENT_STATUS_BADGE).map(([value, v]) => ({ value, label: v.label }))
const SOURCE_OPTIONS = Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label }))

/** Filterable booking list; every filter lives in the URL. */
export function BookingsTable() {
  const navigate = useNavigate()
  const [f, setFilters, reset] = useUrlFilters({
    page: 1, search: '', status: '', theatre: '', from: '', to: '', payment: '', source: '', sort: '-createdAt',
  })
  const statuses = STATUS_FILTER_OPTIONS.find((o) => o.value === f.status)?.statuses

  const query = useBookings({
    page: f.page,
    limit: 25,
    sort: f.sort,
    search: f.search || undefined,
    status: statuses,
    theatre: f.theatre || undefined,
    from: f.from || undefined,
    to: f.to || undefined,
    paymentStatus: (f.payment || undefined) as PaymentStatus | undefined,
    source: (f.source || undefined) as BookingSource | undefined,
  })

  const hasFilters = Boolean(f.search || f.status || f.theatre || f.from || f.to || f.payment || f.source)

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <SearchInput value={f.search} onChange={(search) => setFilters({ search })} placeholder="Booking no., name, mobile, email" />
        <div className="w-52"><Select aria-label="Status" value={f.status} onChange={(e) => setFilters({ status: e.target.value })} placeholder="Any status" options={STATUS_FILTER_OPTIONS} /></div>
        <div className="w-40"><TheatreSelect value={f.theatre} onChange={(theatre) => setFilters({ theatre })} allLabel="All theatres" /></div>
        <div className="flex items-center gap-1.5">
          <Input aria-label="From date" type="date" value={f.from} onChange={(e) => setFilters({ from: e.target.value })} className="w-36" />
          <span className="text-slate-400">–</span>
          <Input aria-label="To date" type="date" value={f.to} min={f.from || undefined} onChange={(e) => setFilters({ to: e.target.value })} className="w-36" />
        </div>
        <div className="w-36"><Select aria-label="Payment" value={f.payment} onChange={(e) => setFilters({ payment: e.target.value })} placeholder="Any payment" options={PAYMENT_OPTIONS} /></div>
        <div className="w-36"><Select aria-label="Source" value={f.source} onChange={(e) => setFilters({ source: e.target.value })} placeholder="Any source" options={SOURCE_OPTIONS} /></div>
        {hasFilters && <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button>}
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.bookings}
        rowKey={(b) => b.id}
        loading={query.isLoading || query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        sort={f.sort}
        onSortChange={(sort) => setFilters({ sort })}
        onRowClick={(b) => navigate(`/bookings/${b.id}`)}
        empty={hasFilters
          ? <EmptyState title="No bookings match" action={<Button variant="secondary" onClick={reset}>Clear filters</Button>} />
          : <EmptyState icon={<CalendarDays className="h-5 w-5" />} title="No bookings yet" />}
      />
      <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
    </Card>
  )
}

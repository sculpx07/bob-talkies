import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, HandCoins, IndianRupee, ReceiptIndianRupee, RefreshCw, RotateCcw, Undo2, Wallet } from 'lucide-react'
import { useAuth } from '@/admin/auth/AuthProvider'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, DataTable, EmptyState, ErrorState, LoadingBlock, Pagination, SearchInput, Select, StatCard, StatusBadge, Tabs, useToast,
  type Column,
} from '@/admin/components/ui'
import { useUrlFilters } from '@/admin/hooks/useUrlFilters'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDate, formatDateTime, formatTime, timeAgo } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { PERMISSIONS } from '@/admin/types/permissions'
import { BOOKING_STATUS_BADGE, PAYMENT_METHOD_LABELS } from '@/admin/features/bookings/constants'
import type { PaymentMethod } from '@/admin/features/bookings/types'
import { useTheatreOptions } from '@/admin/features/theatres/api'
import { presetRange } from '@/admin/features/reports/utils'
import { useCheckRefund, usePayments, useRefundQueue, useRefunds } from '../api'
import { REFUND_METHOD_SHORT, REFUND_STATUS_BADGE } from '../constants'
import { RefundModal } from '../components/RefundModal'
import type { ReceivedPayment, Refund, RefundMethod, RefundQueueItem, RefundStatus } from '../types'

const PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'all', label: 'All time' },
]
function periodRange(period: string): { from?: string; to?: string } {
  if (period === 'all') return {}
  if (period === 'today') { const t = presetRange('last7').to; return { from: t, to: t } }
  return presetRange(period as 'last7' | 'last30' | 'thisMonth' | 'lastMonth')
}

const BookingCell = ({ b }: { b: { id: string; bookingNumber: string; name: string; theatre?: string; date: string; slotStart: string } }) => (
  <div className="min-w-0">
    <Link to={`/bookings/${b.id}`} className="font-mono text-xs font-semibold text-violet-700 hover:underline">{b.bookingNumber}</Link>
    <p className="truncate text-xs text-slate-600">{b.name}</p>
    <p className="text-xs text-slate-400">{[b.theatre, formatDate(b.date), formatTime(b.slotStart)].filter(Boolean).join(' · ')}</p>
  </div>
)

// ---------------------------------------------------------------- received

function ReceivedTab() {
  const [f, setFilters, reset] = useUrlFilters({ page: 1, period: 'last30', method: '', theatre: '', search: '', sort: '-receivedAt' })
  const theatres = useTheatreOptions()
  const query = usePayments({ page: f.page, limit: 25, sort: f.sort, ...periodRange(f.period), method: (f.method || undefined) as PaymentMethod | undefined, theatre: f.theatre || undefined, search: f.search || undefined })
  const s = query.data?.summary

  const columns: Column<ReceivedPayment>[] = [
    { key: 'receivedAt', header: 'Received', sortable: true, cell: (p) => <span className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(p.receivedAt)}</span> },
    { key: 'booking', header: 'Booking', cell: (p) => <BookingCell b={{ id: p.booking.id, bookingNumber: p.booking.bookingNumber, name: p.booking.customerName, theatre: p.booking.theatreName, date: p.booking.date, slotStart: p.booking.slotStart }} /> },
    { key: 'method', header: 'Method', cell: (p) => <Badge>{PAYMENT_METHOD_LABELS[p.method]}</Badge> },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      cell: (p) => (
        <div className="text-right">
          <p className="font-semibold tabular-nums text-slate-900">{formatPaise(p.amountPaise)}</p>
          {p.refundedPaise > 0 && <p className="text-xs text-red-600">−{formatPaise(p.refundedPaise)} refunded</p>}
        </div>
      ),
    },
    { key: 'reference', header: 'Reference', hideOnMobile: true, cell: (p) => <span className="block max-w-[14rem] truncate font-mono text-xs text-slate-500">{p.reference || '—'}</span> },
    { key: 'by', header: 'Recorded by', hideOnMobile: true, cell: (p) => <span className="text-xs text-slate-600">{p.recordedBy?.name ?? (p.method === 'online' ? 'Website' : '—')}</span> },
    { key: 'status', header: 'Booking', hideOnMobile: true, cell: (p) => <StatusBadge status={p.booking.status} map={BOOKING_STATUS_BADGE} /> },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Received" value={formatPaise(s?.receivedPaise ?? 0)} icon={<Wallet />} tone="success" loading={query.isLoading} hint={s ? `${s.count} payment${s.count === 1 ? '' : 's'}` : undefined} />
        <StatCard label="Refunded" value={formatPaise(s?.refundedPaise ?? 0)} icon={<Undo2 />} tone={s?.refundedPaise ? 'danger' : 'neutral'} loading={query.isLoading} hint={s ? `${s.refundCount} refund${s.refundCount === 1 ? '' : 's'} completed in this period` : undefined} />
        <StatCard label="Net" value={formatPaise(s?.netPaise ?? 0)} icon={<IndianRupee />} tone="brand" loading={query.isLoading} hint={f.method ? 'For this method (refunds not taken off)' : 'Received minus refunded'} />
      </div>
      {s && s.byMethod.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {s.byMethod.map((m) => (
            <span key={m.method} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{PAYMENT_METHOD_LABELS[m.method]}: <strong className="tabular-nums">{formatPaise(m.amountPaise)}</strong> ({m.count})</span>
          ))}
        </div>
      )}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <SearchInput value={f.search} onChange={(search) => setFilters({ search })} placeholder="Booking no., name, mobile, reference" />
          <div className="w-40"><Select aria-label="Period" value={f.period} onChange={(e) => setFilters({ period: e.target.value })} options={PERIODS} /></div>
          <div className="w-40"><Select aria-label="Method" value={f.method} onChange={(e) => setFilters({ method: e.target.value })} placeholder="Any method" options={Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label }))} /></div>
          <div className="w-40"><Select aria-label="Theatre" value={f.theatre} onChange={(e) => setFilters({ theatre: e.target.value })} placeholder="Any theatre" options={(theatres.data ?? []).map((t) => ({ value: t.id, label: t.name }))} /></div>
          {(f.search || f.method || f.theatre || f.period !== 'last30') && <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button>}
        </div>
        <DataTable
          columns={columns}
          rows={query.data?.payments}
          rowKey={(p) => p.id}
          loading={query.isLoading || query.isPlaceholderData}
          error={query.error}
          onRetry={() => query.refetch()}
          sort={f.sort}
          onSortChange={(sort) => setFilters({ sort })}
          empty={<EmptyState icon={<ReceiptIndianRupee className="h-5 w-5" />} title="No payments in this period" />}
        />
        <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------- to refund

type RefundTarget = { bookingId: string; bookingNumber: string; preselect?: string; reason: string }

function QueueTab({ onRefund, canRefund }: { onRefund: (t: RefundTarget) => void; canRefund: boolean }) {
  const queue = useRefundQueue()
  if (queue.isLoading) return <LoadingBlock />
  if (queue.error) return <ErrorState error={queue.error} retry={() => queue.refetch()} />
  const items = queue.data ?? []
  if (!items.length) {
    return <Card><EmptyState icon={<CheckCircle2 className="h-5 w-5" />} title="Nothing to refund" description="Online payments that came too late and cancellations inside the refund window show up here." /></Card>
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        <strong>{items.length}</strong> waiting · <strong>{formatPaise(items.reduce((n, i) => n + i.owedPaise, 0))}</strong> to give back
      </p>
      <Card className="divide-y divide-slate-100">
        {items.map((i: RefundQueueItem) => (
          <div key={`${i.kind}-${i.paymentOrderId ?? i.booking.id}`} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className={`mt-0.5 rounded-lg p-2 ${i.kind === 'order' ? 'bg-amber-50 text-amber-700' : 'bg-violet-50 text-violet-700'}`}><HandCoins className="h-4 w-4" /></span>
              <div className="min-w-0">
                <BookingCell b={{ id: i.booking.id, bookingNumber: i.booking.bookingNumber, name: `${i.booking.customer.name} · ${i.booking.customer.mobile}`, theatre: i.booking.theatre?.name, date: i.booking.date, slotStart: i.booking.slotStart }} />
                <p className="mt-1 text-xs text-slate-700">{i.reason}{i.provider === 'razorpay' ? ' · paid via Razorpay' : ''} · {timeAgo(i.since)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold tabular-nums text-slate-900">{formatPaise(i.owedPaise)}</span>
              {canRefund && <Button size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => onRefund({ bookingId: i.booking.id, bookingNumber: i.booking.bookingNumber, preselect: i.paymentOrderId, reason: i.kind === 'order' ? 'Paid after the slot hold expired' : 'Cancelled within the refund window' })}>Refund</Button>}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------- refunds

function RefundsTab({ canRefund }: { canRefund: boolean }) {
  const toast = useToast()
  const check = useCheckRefund()
  const [f, setFilters, reset] = useUrlFilters({ page: 1, status: '', method: '', search: '', sort: '-createdAt' })
  const query = useRefunds({ page: f.page, limit: 25, sort: f.sort, status: (f.status || undefined) as RefundStatus | undefined, method: (f.method || undefined) as RefundMethod | undefined, search: f.search || undefined })

  const columns: Column<Refund>[] = [
    { key: 'createdAt', header: 'Date', sortable: true, cell: (r) => <span className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(r.createdAt)}</span> },
    { key: 'booking', header: 'Booking', cell: (r) => <BookingCell b={{ id: r.booking.id, bookingNumber: r.booking.bookingNumber, name: r.booking.customer.name, theatre: r.booking.theatre?.name, date: r.booking.date, slotStart: r.booking.slotStart }} /> },
    { key: 'amountPaise', header: 'Amount', sortable: true, align: 'right', cell: (r) => <span className="font-semibold tabular-nums text-slate-900">{formatPaise(r.amountPaise)}</span> },
    { key: 'method', header: 'By', cell: (r) => <Badge>{REFUND_METHOD_SHORT[r.method]}</Badge> },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => (
        <div>
          <StatusBadge status={r.status} map={REFUND_STATUS_BADGE} />
          {r.status === 'failed' && r.failureReason && <p className="mt-0.5 max-w-[14rem] text-xs text-red-600">{r.failureReason}</p>}
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Reason',
      hideOnMobile: true,
      cell: (r) => (
        <div className="max-w-xs text-xs">
          <p className="text-slate-700">{r.reason}</p>
          <p className="text-slate-400">{[r.reference && `ref ${r.reference}`, r.gateway?.refundId, r.createdBy && `by ${r.createdBy.name}`].filter(Boolean).join(' · ')}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (r) => canRefund && r.status === 'pending' && r.method === 'razorpay' ? (
        <Button size="sm" variant="secondary" leftIcon={<RefreshCw className="h-4 w-4" />} loading={check.isPending && check.variables === r.id}
          onClick={() => check.mutate(r.id, {
            onSuccess: (x) => toast.success(x.status === 'processed' ? 'Refund completed' : x.status === 'failed' ? 'Refund failed at Razorpay' : 'Still processing at Razorpay'),
            onError: (err) => toast.error('Could not check', errorMessage(err)),
          })}>
          Check status
        </Button>
      ) : null,
    },
  ]

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <SearchInput value={f.search} onChange={(search) => setFilters({ search })} placeholder="Booking no., name or mobile" />
        <div className="w-40"><Select aria-label="Status" value={f.status} onChange={(e) => setFilters({ status: e.target.value })} placeholder="Any status" options={Object.entries(REFUND_STATUS_BADGE).map(([value, b]) => ({ value, label: b.label }))} /></div>
        <div className="w-40"><Select aria-label="Refunded by" value={f.method} onChange={(e) => setFilters({ method: e.target.value })} placeholder="Any method" options={Object.entries(REFUND_METHOD_SHORT).map(([value, label]) => ({ value, label }))} /></div>
        {(f.search || f.status || f.method) && <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button>}
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.refunds}
        rowKey={(r) => r.id}
        loading={query.isLoading || query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        sort={f.sort}
        onSortChange={(sort) => setFilters({ sort })}
        empty={<EmptyState icon={<Undo2 className="h-5 w-5" />} title="No refunds yet" />}
      />
      <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
    </Card>
  )
}

// ---------------------------------------------------------------- page

/** Admin → Payments: money received, what is waiting to be refunded, and refunds. */
export default function PaymentsPage() {
  const { can } = useAuth()
  const canRefund = can(PERMISSIONS.PAYMENTS_REFUND)
  const [f, setFilters] = useUrlFilters({ tab: 'received' })
  const queue = useRefundQueue()
  const [target, setTarget] = useState<RefundTarget | null>(null)

  return (
    <>
      <PageHeader title="Payments" description="Money received from every booking, refunds, and what is waiting to be refunded." />
      <Tabs
        value={f.tab}
        onValueChange={(tab) => setFilters({ tab })}
        items={[
          { value: 'received', label: 'Received', content: <ReceivedTab /> },
          { value: 'queue', label: 'To refund', count: queue.data?.length, content: <QueueTab canRefund={canRefund} onRefund={setTarget} /> },
          { value: 'refunds', label: 'Refunds', content: <RefundsTab canRefund={canRefund} /> },
        ]}
      />
      {target && (
        <RefundModal
          open
          onOpenChange={(o) => !o && setTarget(null)}
          bookingId={target.bookingId}
          bookingNumber={target.bookingNumber}
          preselect={target.preselect}
          defaultReason={target.reason}
        />
      )}
    </>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Ban, Gift, History, Hourglass, Star, Users } from 'lucide-react'
import { useAuth } from '@/admin/auth/AuthProvider'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, CardBody, CardHeader, DataTable, EmptyState, ErrorState, FormField, Input, LoadingBlock, Modal, Pagination, SearchInput, Select, StatCard, StatusBadge, Tabs, useToast,
  type Column,
} from '@/admin/components/ui'
import { useUrlFilters } from '@/admin/hooks/useUrlFilters'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDateTime } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { cn } from '@/admin/lib/utils/cn'
import { PERMISSIONS } from '@/admin/types/permissions'
import { useAdjustPoints, useCustomerRewards, useReferrals, useRejectReferral, useRewardActivity, useRewardsCustomers } from '../api'
import { REFERRAL_STATUS_BADGE, REWARD_TYPE_LABELS } from '../constants'
import type { ActivityEntry, Referral, ReferralStatus, RewardEntry, RewardsCustomerRow, RewardsCustomersParams, RewardType } from '../types'

const MOBILE_RE = /^[6-9]\d{9}$/
const pts = (n: number) => `${n > 0 ? '+' : ''}${n.toLocaleString('en-IN')} pts`
const PointsCell = ({ n }: { n: number }) => <span className={cn('font-semibold tabular-nums', n > 0 ? 'text-emerald-700' : 'text-red-600')}>{pts(n)}</span>

// ---------------------------------------------------------------- customer

function AdjustModal({ mobile, open, onOpenChange }: { mobile: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const toast = useToast()
  const adjust = useAdjustPoints(mobile)
  const [mode, setMode] = useState<'add' | 'remove'>('add')
  const [points, setPoints] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const n = Number(points)

  const submit = async () => {
    setError('')
    if (!Number.isInteger(n) || n <= 0) return setError('Enter whole points, more than 0')
    if (note.trim().length < 3) return setError('Say why (at least 3 characters)')
    try {
      await adjust.mutateAsync({ points: mode === 'add' ? n : -n, note: note.trim() })
      toast.success(`${mode === 'add' ? 'Added' : 'Took away'} ${n.toLocaleString('en-IN')} pts`)
      setPoints(''); setNote(''); onOpenChange(false)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Adjust BOB Points" description={`For ${mobile}. Every change is kept in the customer's history with your name.`}
      footer={<>
        <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={adjust.isPending}>Cancel</Button>
        <Button variant={mode === 'remove' ? 'danger' : 'primary'} onClick={submit} loading={adjust.isPending}>{mode === 'add' ? 'Add points' : 'Take away points'}</Button>
      </>}>
      <div className="space-y-4">
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Change" required>
            {(f) => <Select {...f} value={mode} onChange={(e) => setMode(e.target.value as 'add' | 'remove')} options={[{ value: 'add', label: 'Add points' }, { value: 'remove', label: 'Take away points' }]} />}
          </FormField>
          <FormField label="Points" required>
            {(f) => <Input {...f} type="number" min={1} trailing="pts" value={points} onChange={(e) => setPoints(e.target.value)} />}
          </FormField>
        </div>
        <FormField label="Reason" required hint="e.g. Goodwill for a delayed show">
          {(f) => <Input {...f} value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />}
        </FormField>
      </div>
    </Modal>
  )
}

/** All customers with their points; a row opens that customer. */
function CustomersList({ onOpen }: { onOpen: (mobile: string) => void }) {
  const [f, setFilters, reset] = useUrlFilters({ page: 1, show: '', search: '', sort: '-lastBookingAt' })
  const query = useRewardsCustomers({ page: f.page, limit: 25, sort: f.sort, search: f.search || undefined, show: (f.show || 'all') as RewardsCustomersParams['show'] })
  const s = query.data?.summary

  const columns: Column<RewardsCustomerRow>[] = [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{c.name || '—'}</p>
          <p className="text-xs text-slate-500">{c.mobile}{!c.customerId && ' · no website login yet'}</p>
        </div>
      ),
    },
    {
      key: 'balance',
      header: 'Points',
      sortable: true,
      align: 'right',
      cell: (c) => (
        <div className="text-right">
          <p className={cn('font-semibold tabular-nums', c.balance > 0 ? 'text-slate-900' : 'text-slate-400')}>{c.balance.toLocaleString('en-IN')} pts</p>
          {c.balance > 0 && <p className="text-xs text-slate-500">worth {formatPaise(c.valuePaise)}</p>}
        </div>
      ),
    },
    {
      key: 'pending',
      header: 'Pending',
      sortable: true,
      align: 'right',
      cell: (c) => {
        const total = c.pending.bookingPoints + c.pending.referralPoints
        if (!total) return <span className="text-xs text-slate-400">—</span>
        return (
          <div className="text-right">
            <p className="font-semibold tabular-nums text-amber-700">+{total.toLocaleString('en-IN')} pts</p>
            <p className="text-xs text-slate-500">
              {[
                c.pending.awaitingBookings > 0 && `${c.pending.awaitingBookings} booking${c.pending.awaitingBookings === 1 ? '' : 's'} to complete`,
                c.pending.referralPoints > 0 && `${c.pending.referralPoints} referral`,
              ].filter(Boolean).join(' · ')}
            </p>
          </div>
        )
      },
    },
    {
      key: 'bookings',
      header: 'Bookings',
      sortable: true,
      hideOnMobile: true,
      cell: (c) => (
        <div className="text-sm">
          <span className="tabular-nums text-slate-700">{c.completed} completed</span>
          <span className="text-slate-400"> / {c.bookings}</span>
          {c.regular && <Badge tone="success" className="ml-2">Regular</Badge>}
        </div>
      ),
    },
    { key: 'lastBookingAt', header: 'Last booking', sortable: true, hideOnMobile: true, cell: (c) => <span className="text-xs text-slate-600">{c.lastBookingAt ? formatDateTime(c.lastBookingAt) : '—'}</span> },
  ]

  return (
    <div className="space-y-4">
      {s && !s.enabled && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">BOB Points are switched off in Settings: nothing is earned or spent, and nothing is pending.</p>}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Points held by customers" value={`${(s?.pointsHeld ?? 0).toLocaleString('en-IN')} pts`} icon={<Star />} tone="brand" loading={query.isLoading} hint={s ? `Worth ${formatPaise(s.pointsHeldValuePaise)} · ${s.withPoints} customer${s.withPoints === 1 ? '' : 's'}` : undefined} />
        <StatCard label="Pending points" value={`${(s?.pendingPoints ?? 0).toLocaleString('en-IN')} pts`} icon={<Hourglass />} tone={s?.pendingPoints ? 'warning' : 'neutral'} loading={query.isLoading} hint={s ? `Added when ${s.awaitingBookings} confirmed booking${s.awaitingBookings === 1 ? ' is' : 's are'} completed` : undefined} />
        <StatCard label="Customers" value={String(s?.customers ?? 0)} icon={<Users />} loading={query.isLoading} hint="Website logins and everyone who booked" />
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <SearchInput value={f.search} onChange={(search) => setFilters({ search })} placeholder="Name or mobile" />
          <div className="w-52">
            <Select aria-label="Show" value={f.show} onChange={(e) => setFilters({ show: e.target.value })} placeholder="All customers"
              options={[{ value: 'points', label: 'Has points' }, { value: 'pending', label: 'Points pending' }]} />
          </div>
          {(f.search || f.show) && <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button>}
        </div>
        <DataTable
          columns={columns}
          rows={query.data?.customers}
          rowKey={(c) => c.mobile}
          loading={query.isLoading || query.isPlaceholderData}
          error={query.error}
          onRetry={() => query.refetch()}
          sort={f.sort}
          onSortChange={(sort) => setFilters({ sort })}
          onRowClick={(c) => onOpen(c.mobile)}
          empty={<EmptyState icon={<Users className="h-5 w-5" />} title={f.search || f.show ? 'No customers match' : 'No customers yet'} description="Customers appear after their first booking or website sign-in." />}
        />
        <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
      </Card>
    </div>
  )
}

/** The list, or one customer's points and history (?mobile=…). */
function CustomerTab({ canAdjust }: { canAdjust: boolean }) {
  const [f, setFilters] = useUrlFilters({ mobile: '' })
  return MOBILE_RE.test(f.mobile)
    ? <CustomerDetail mobile={f.mobile} canAdjust={canAdjust} onBack={() => setFilters({ mobile: '' })} />
    : <CustomersList onOpen={(mobile) => setFilters({ mobile })} />
}

function CustomerDetail({ mobile, canAdjust, onBack }: { mobile: string; canAdjust: boolean; onBack: () => void }) {
  const [adjusting, setAdjusting] = useState(false)
  const query = useCustomerRewards(mobile)
  const r = query.data

  const historyColumns: Column<RewardEntry>[] = [
    { key: 'createdAt', header: 'When', cell: (e) => <span className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(e.createdAt)}</span> },
    { key: 'type', header: 'What', cell: (e) => <span className="text-sm text-slate-800">{REWARD_TYPE_LABELS[e.type as RewardType] ?? e.label}</span> },
    { key: 'points', header: 'Points', align: 'right', cell: (e) => <PointsCell n={e.points} /> },
    { key: 'note', header: 'Details', hideOnMobile: true, cell: (e) => <span className="text-xs text-slate-500">{[e.note, e.by && `by ${e.by.name}`].filter(Boolean).join(' · ') || '—'}</span> },
  ]

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={onBack}>All customers</Button>

      {query.isLoading ? <LoadingBlock /> : query.error ? <ErrorState error={query.error} retry={() => query.refetch()} /> : r && (
        <>
          {!r.enabled && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">BOB Points are switched off in Settings: nothing is earned or spent right now.</p>}
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Balance" value={`${r.balance.toLocaleString('en-IN')} pts`} icon={<Star />} tone="brand" hint={`Worth ${formatPaise(r.valuePaise)}${r.upcomingPoints ? ` · +${r.upcomingPoints} on the way` : ''}`} />
            <StatCard label="Referrals" value={`${r.referral.rewarded} rewarded`} icon={<Users />} hint={`${r.referral.invited} invited${r.referral.code ? ` · code ${r.referral.code}` : ''}`} />
            <StatCard label="Completed bookings" value={String(r.repeatGuest.completedBookings)} icon={<Gift />} tone={r.repeatGuest.active ? 'success' : 'neutral'} hint={r.repeatGuest.active ? 'Regular customer' : `Regular after ${r.repeatGuest.needed}`} />
          </div>
          <Card className="overflow-hidden">
            <CardHeader
              title={r.customer.name || r.customer.mobile}
              description={<>{r.customer.mobile}{r.customer.referredBy && <> · referred by {r.customer.referredBy.name || r.customer.referredBy.mobile}</>}{!r.customer.id && ' · no account yet (made when they first earn or sign in)'}</>}
              actions={canAdjust ? <Button size="sm" variant="secondary" onClick={() => setAdjusting(true)}>Adjust points</Button> : undefined}
            />
            <DataTable
              columns={historyColumns}
              rows={r.history}
              rowKey={(e) => e.id}
              empty={<EmptyState icon={<History className="h-5 w-5" />} title="No points yet" />}
            />
            {r.history.length >= 30 && <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">Latest 30 changes. See Activity for everything.</p>}
          </Card>
          <AdjustModal mobile={mobile} open={adjusting} onOpenChange={setAdjusting} />
        </>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- referrals

function ReferralsTab({ canAdjust }: { canAdjust: boolean }) {
  const toast = useToast()
  const reject = useRejectReferral()
  const [f, setFilters, reset] = useUrlFilters({ page: 1, status: '', search: '', sort: '-createdAt' })
  const query = useReferrals({ page: f.page, limit: 25, sort: f.sort, status: (f.status || undefined) as ReferralStatus | undefined, search: f.search || undefined })
  const [target, setTarget] = useState<Referral | null>(null)
  const [reason, setReason] = useState('')
  const counts = query.data?.counts

  const person = (p: { name: string; mobile: string }) => <div><p className="text-sm text-slate-900">{p.name || '—'}</p><p className="text-xs text-slate-500">{p.mobile}</p></div>
  const columns: Column<Referral>[] = [
    { key: 'createdAt', header: 'Joined', sortable: true, cell: (r) => <span className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(r.createdAt)}</span> },
    { key: 'referrer', header: 'Referred by', cell: (r) => person(r.referrer) },
    { key: 'friend', header: 'Friend', cell: (r) => person(r.friend) },
    {
      key: 'booking',
      header: 'Booking',
      hideOnMobile: true,
      cell: (r) => {
        const b = r.qualifyingBooking ?? r.firstBooking
        return b ? <Link to={`/bookings/${b.id}`} className="font-mono text-xs font-semibold text-violet-700 hover:underline">{b.bookingNumber}</Link> : <span className="text-xs text-slate-400">—</span>
      },
    },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => (
        <div>
          <StatusBadge status={r.status} map={REFERRAL_STATUS_BADGE} />
          {r.status === 'REWARDED' && <p className="mt-0.5 text-xs text-slate-500">{r.referrerPoints} + {r.friendPoints} pts · {formatDateTime(r.rewardedAt!)}</p>}
          {r.status === 'REJECTED' && <p className="mt-0.5 max-w-[16rem] text-xs text-red-600">{r.rejectReason}{r.rejectedBy ? ` (${r.rejectedBy.name})` : ''}</p>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (r) => canAdjust && r.status === 'PENDING'
        ? <Button size="sm" variant="ghost" leftIcon={<Ban className="h-4 w-4" />} onClick={() => { setTarget(r); setReason('') }}>Reject</Button>
        : null,
    },
  ]

  const doReject = () => {
    if (!target || reason.trim().length < 3) return
    reject.mutate({ id: target.id, reason: reason.trim() }, {
      onSuccess: () => { toast.success('Referral rejected'); setTarget(null) },
      onError: (err) => toast.error('Could not reject', errorMessage(err)),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        {(Object.keys(REFERRAL_STATUS_BADGE) as ReferralStatus[]).map((s) => (
          <Badge key={s} tone={REFERRAL_STATUS_BADGE[s].tone}>{REFERRAL_STATUS_BADGE[s].label}: {counts?.[s] ?? 0}</Badge>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <SearchInput value={f.search} onChange={(search) => setFilters({ search })} placeholder="Name, mobile or referral code" />
          <div className="w-56"><Select aria-label="Status" value={f.status} onChange={(e) => setFilters({ status: e.target.value })} placeholder="Any status" options={Object.entries(REFERRAL_STATUS_BADGE).map(([value, b]) => ({ value, label: b.label }))} /></div>
          {(f.search || f.status) && <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button>}
        </div>
        <DataTable
          columns={columns}
          rows={query.data?.referrals}
          rowKey={(r) => r.id}
          loading={query.isLoading || query.isPlaceholderData}
          error={query.error}
          onRetry={() => query.refetch()}
          sort={f.sort}
          onSortChange={(sort) => setFilters({ sort })}
          empty={<EmptyState icon={<Users className="h-5 w-5" />} title="No referrals yet" description="When a friend books with a customer's referral link, it shows up here." />}
        />
        <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
      </Card>
      <Modal open={Boolean(target)} onOpenChange={(o) => !o && setTarget(null)} title="Reject this referral?"
        description={target ? `${target.friend.name || target.friend.mobile}, referred by ${target.referrer.name || target.referrer.mobile}. Neither gets referral points.` : undefined}
        footer={<>
          <Button variant="secondary" onClick={() => setTarget(null)} disabled={reject.isPending}>Cancel</Button>
          <Button variant="danger" onClick={doReject} loading={reject.isPending} disabled={reason.trim().length < 3}>Reject referral</Button>
        </>}>
        <FormField label="Reason" required hint="e.g. Same person with two numbers">
          {(fp) => <Input {...fp} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} />}
        </FormField>
      </Modal>
    </div>
  )
}

// ---------------------------------------------------------------- activity

function ActivityTab() {
  const [f, setFilters, reset] = useUrlFilters({ page: 1, type: '', search: '', sort: '-createdAt' })
  const query = useRewardActivity({ page: f.page, limit: 25, sort: f.sort, type: (f.type || undefined) as RewardType | undefined, search: f.search || undefined })
  const columns: Column<ActivityEntry>[] = [
    { key: 'createdAt', header: 'When', sortable: true, cell: (e) => <span className="whitespace-nowrap text-xs text-slate-600">{formatDateTime(e.createdAt)}</span> },
    {
      key: 'customer',
      header: 'Customer',
      cell: (e) => e.customer
        ? <Link to={`/rewards?tab=customer&mobile=${e.customer.mobile}`} className="text-sm text-violet-700 hover:underline">{e.customer.name || e.customer.mobile}<span className="block text-xs text-slate-500">{e.customer.mobile}</span></Link>
        : '—',
    },
    { key: 'type', header: 'What', cell: (e) => <span className="text-sm text-slate-800">{REWARD_TYPE_LABELS[e.type] ?? e.label}</span> },
    { key: 'points', header: 'Points', sortable: true, align: 'right', cell: (e) => <PointsCell n={e.points} /> },
    { key: 'note', header: 'Details', hideOnMobile: true, cell: (e) => <span className="text-xs text-slate-500">{[e.note, e.by && `by ${e.by.name}`].filter(Boolean).join(' · ') || '—'}</span> },
  ]
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <SearchInput value={f.search} onChange={(search) => setFilters({ search })} placeholder="Customer name or mobile" />
        <div className="w-56"><Select aria-label="Type" value={f.type} onChange={(e) => setFilters({ type: e.target.value })} placeholder="Every change" options={Object.entries(REWARD_TYPE_LABELS).map(([value, label]) => ({ value, label }))} /></div>
        {(f.search || f.type) && <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button>}
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.entries}
        rowKey={(e) => e.id}
        loading={query.isLoading || query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        sort={f.sort}
        onSortChange={(sort) => setFilters({ sort })}
        empty={<EmptyState icon={<History className="h-5 w-5" />} title="No points activity yet" />}
      />
      <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
    </Card>
  )
}

// ---------------------------------------------------------------- page

/** Admin → BOB Points: a customer's points, referrals, and every change to points. */
export default function RewardsPage() {
  const { can } = useAuth()
  const canAdjust = can(PERMISSIONS.REWARDS_ADJUST)
  const [f, setFilters] = useUrlFilters({ tab: 'customer' })
  return (
    <>
      <PageHeader title="BOB Points" description="Customer points, referrals and every change. Rules (point value, points per booking, referral points) are in Settings → BOB Points." />
      <Tabs
        value={f.tab}
        onValueChange={(tab) => setFilters({ tab })}
        items={[
          { value: 'customer', label: 'Customer', content: <CustomerTab canAdjust={canAdjust} /> },
          { value: 'referrals', label: 'Referrals', content: <ReferralsTab canAdjust={canAdjust} /> },
          { value: 'activity', label: 'Activity', content: <ActivityTab /> },
        ]}
      />
    </>
  )
}

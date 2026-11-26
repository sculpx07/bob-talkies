import { useNavigate } from 'react-router-dom'
import { AlarmClock, Inbox, Percent, Plus, UserRoundX, UsersRound } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, DataTable, EmptyState, Pagination, SearchInput, Select, StatCard, StatusBadge, type Column,
} from '@/admin/components/ui'
import { occasionLabel } from '@/admin/constants/catalog'
import { useDisclosure } from '@/admin/hooks/useDisclosure'
import { useUrlFilters } from '@/admin/hooks/useUrlFilters'
import { formatDateTime, timeAgo } from '@/admin/lib/utils/date'
import { cn } from '@/admin/lib/utils/cn'
import { useLeadStats, useLeads } from '../api'
import { LEAD_SOURCE_LABELS, LEAD_STATUS_BADGE, LEAD_STATUS_ORDER, PRIORITY_BADGE } from '../constants'
import { LeadFormModal } from '../components/LeadModals'
import type { LeadListItem, LeadSource, LeadStatus } from '../types'
import { Can } from '@/admin/auth/guards'
import { PERMISSIONS } from '@/admin/types/permissions'

const isOverdue = (l: LeadListItem) => Boolean(l.followUpAt && new Date(l.followUpAt) <= new Date() && ['new', 'contacted', 'follow_up'].includes(l.status))

const columns: Column<LeadListItem>[] = [
  {
    key: 'name',
    header: 'Lead',
    sortable: true,
    cell: (l) => (
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 font-medium text-slate-900">
          {l.name}
          {l.priority === 'high' && <Badge tone={PRIORITY_BADGE.high.tone}>High</Badge>}
        </p>
        <p className="text-xs text-slate-500">{l.mobile}{l.occasion ? ` · ${occasionLabel(l.occasion)}` : ''}</p>
      </div>
    ),
  },
  { key: 'message', header: 'Message', hideOnMobile: true, cell: (l) => <p className="line-clamp-2 max-w-sm text-xs text-slate-600">{l.message || '—'}</p> },
  { key: 'source', header: 'Source', hideOnMobile: true, cell: (l) => <span className="text-xs">{LEAD_SOURCE_LABELS[l.source]}</span> },
  { key: 'status', header: 'Status', cell: (l) => <StatusBadge status={l.status} map={LEAD_STATUS_BADGE} /> },
  { key: 'assigned', header: 'Assigned', hideOnMobile: true, cell: (l) => l.assignedTo?.name ?? <span className="text-slate-400">—</span> },
  {
    key: 'followUpAt',
    header: 'Follow up',
    sortable: true,
    cell: (l) => (l.followUpAt
      ? <span className={cn('whitespace-nowrap text-xs', isOverdue(l) ? 'font-semibold text-red-600' : 'text-slate-600')}>{isOverdue(l) && 'Due · '}{formatDateTime(l.followUpAt)}</span>
      : <span className="text-slate-400">—</span>),
  },
  { key: 'createdAt', header: 'Received', sortable: true, cell: (l) => <span className="whitespace-nowrap text-xs text-slate-500">{timeAgo(l.createdAt)}</span> },
]

const SOURCE_OPTIONS = Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => ({ value, label }))

/** The enquiry inbox. Status tab, filters and search live in the URL. */
export default function LeadsPage() {
  const navigate = useNavigate()
  const add = useDisclosure()
  const stats = useLeadStats()
  const [f, setFilters, reset] = useUrlFilters({ page: 1, status: 'open', search: '', assignedTo: '', source: '', followUp: '', sort: '-createdAt' })

  const query = useLeads({
    page: f.page,
    limit: 25,
    sort: f.sort,
    search: f.search || undefined,
    status: f.status ? [f.status as LeadStatus | 'open'] : undefined,
    assignedTo: f.assignedTo || undefined,
    source: (f.source || undefined) as LeadSource | undefined,
    followUp: (f.followUp || undefined) as 'due' | undefined,
  })

  const s = stats.data
  const tabs = [
    { value: 'open', label: 'Open', count: s?.open },
    ...LEAD_STATUS_ORDER.map((st) => ({ value: st, label: LEAD_STATUS_BADGE[st].label, count: s?.byStatus[st] })),
    { value: '', label: 'All', count: s?.total },
  ]
  const hasFilters = Boolean(f.search || f.assignedTo || f.source || f.followUp)

  return (
    <>
      <PageHeader
        title="Leads"
        description="Enquiries from the website form, phone and WhatsApp."
        actions={<Can permission={PERMISSIONS.LEADS_CREATE}><Button leftIcon={<Plus className="h-4 w-4" />} onClick={add.open}>Log enquiry</Button></Can>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open leads" value={s?.open ?? 0} icon={<UsersRound />} tone="brand" loading={stats.isLoading} />
        <StatCard label="Follow-ups due" value={s?.dueFollowUps ?? 0} icon={<AlarmClock />} tone={s?.dueFollowUps ? 'warning' : 'neutral'} loading={stats.isLoading} />
        <StatCard label="Not assigned" value={s?.unassignedOpen ?? 0} icon={<UserRoundX />} loading={stats.isLoading} />
        <StatCard label="Conversion rate" value={`${s?.conversionRate ?? 0}%`} hint="Converted / all except spam" icon={<Percent />} tone="success" loading={stats.isLoading} />
      </div>

      <Card className="overflow-hidden">
        <div className="space-y-3 border-b border-slate-100 p-4">
          <div role="tablist" aria-label="Status" className="flex flex-wrap gap-1">
            {tabs.map((t) => (
              <button key={t.value || 'all'} type="button" role="tab" aria-selected={f.status === t.value} onClick={() => setFilters({ status: t.value })}
                className={cn('focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium', f.status === t.value ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100')}>
                {t.label}{t.count !== undefined && <span className="text-xs text-slate-400">{t.count}</span>}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput value={f.search} onChange={(search) => setFilters({ search })} placeholder="Name, mobile, email or message" />
            <div className="w-40"><Select aria-label="Assigned" value={f.assignedTo} onChange={(e) => setFilters({ assignedTo: e.target.value })} placeholder="Anyone" options={[{ value: 'me', label: 'Assigned to me' }, { value: 'unassigned', label: 'Not assigned' }]} /></div>
            <div className="w-40"><Select aria-label="Source" value={f.source} onChange={(e) => setFilters({ source: e.target.value })} placeholder="Any source" options={SOURCE_OPTIONS} /></div>
            <Button variant={f.followUp === 'due' ? 'primary' : 'secondary'} size="sm" leftIcon={<AlarmClock className="h-4 w-4" />} onClick={() => setFilters({ followUp: f.followUp === 'due' ? '' : 'due' })}>
              Follow-ups due
            </Button>
            {hasFilters && <Button variant="ghost" size="sm" onClick={() => setFilters({ search: '', assignedTo: '', source: '', followUp: '' })}>Clear filters</Button>}
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={query.data?.leads}
          rowKey={(l) => l.id}
          loading={query.isLoading || query.isPlaceholderData}
          error={query.error}
          onRetry={() => query.refetch()}
          sort={f.sort}
          onSortChange={(sort) => setFilters({ sort })}
          onRowClick={(l) => navigate(`/leads/${l.id}`)}
          empty={hasFilters || f.status
            ? <EmptyState icon={<Inbox className="h-5 w-5" />} title="No leads here" action={<Button variant="secondary" onClick={reset}>Show open leads</Button>} />
            : <EmptyState icon={<Inbox className="h-5 w-5" />} title="No enquiries yet" description="Website form submissions appear here automatically." />}
        />
        <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
      </Card>

      <LeadFormModal open={add.isOpen} onOpenChange={add.setOpen} onCreated={(l) => navigate(`/leads/${l.id}`)} />
    </>
  )
}

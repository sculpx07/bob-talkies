import { Link, useNavigate } from 'react-router-dom'
import { FlaskConical, MoreHorizontal, Pencil, Plus, TicketPercent } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, DataTable, EmptyState, IconButton, Menu, Pagination, SearchInput, StatusBadge, Switch, useToast, type Column,
} from '@/admin/components/ui'
import { useDisclosureWith } from '@/admin/hooks/useDisclosure'
import { useUrlFilters } from '@/admin/hooks/useUrlFilters'
import { errorMessage } from '@/admin/lib/api/errors'
import { cn } from '@/admin/lib/utils/cn'
import { formatDate } from '@/admin/lib/utils/date'
import { useOfferStats, useOffers, useSetOfferActive } from '../api'
import { OfferPreviewModal } from '../components/OfferPreviewModal'
import type { Offer, OfferStatus } from '../types'
import { OFFER_STATUS_BADGE, OFFER_STATUS_ORDER, formatDiscount, formatUsage, offerRules } from '../utils'
import { Can } from '@/admin/auth/guards'
import { PERMISSIONS } from '@/admin/types/permissions'

export default function OffersListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [filters, setFilters, resetFilters] = useUrlFilters({ page: 1, search: '', status: '', sort: 'sortOrder' })
  const stats = useOfferStats()
  const setActive = useSetOfferActive()
  const preview = useDisclosureWith<string>()

  const query = useOffers({
    page: filters.page,
    limit: 25,
    sort: filters.sort,
    search: filters.search || undefined,
    status: (filters.status || undefined) as OfferStatus | undefined,
  })

  const columns: Column<Offer>[] = [
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      cell: (o) => (
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold text-slate-900">{o.code}</p>
          <p className="max-w-xs truncate text-xs text-slate-500">{o.title}</p>
        </div>
      ),
    },
    {
      key: 'discount',
      header: 'Discount',
      cell: (o) => (
        <div>
          <p className="font-medium text-slate-900">{formatDiscount(o)}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {offerRules(o).map((r) => <Badge key={r} tone="neutral">{r}</Badge>)}
          </div>
        </div>
      ),
    },
    {
      key: 'validUntil',
      header: 'Valid',
      sortable: true,
      hideOnMobile: true,
      cell: (o) => <span className="whitespace-nowrap text-xs">{formatDate(o.validFrom)}<br />to {formatDate(o.validUntil)}</span>,
    },
    { key: 'usedCount', header: 'Usage', sortable: true, hideOnMobile: true, cell: (o) => <span className="text-xs">{formatUsage(o)}</span> },
    { key: 'status', header: 'Status', cell: (o) => <StatusBadge status={o.status} map={OFFER_STATUS_BADGE} /> },
    {
      key: 'active',
      header: 'On',
      cell: (o) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={o.isActive}
            disabled={setActive.isPending && setActive.variables?.id === o.id}
            onChange={(isActive) => setActive.mutate({ id: o.id, isActive }, {
              onSuccess: (s) => toast.success(`${s.code} switched ${s.isActive ? 'on' : 'off'}`),
              onError: (err) => toast.error('Could not change it', errorMessage(err)),
            })}
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-12',
      cell: (o) => (
        <Menu
          trigger={<IconButton label={`Actions for ${o.code}`} onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></IconButton>}
          items={[
            { label: 'Edit', icon: <Pencil />, onSelect: () => navigate(`/offers/${o.id}`) },
            { label: 'Try this code', icon: <FlaskConical />, onSelect: () => preview.open(o.code) },
          ]}
        />
      ),
    },
  ]

  const counts = stats.data?.byStatus
  const tabs: Array<{ value: string; label: string; count?: number }> = [
    { value: '', label: 'All', count: stats.data?.total },
    ...OFFER_STATUS_ORDER.map((s) => ({ value: s, label: OFFER_STATUS_BADGE[s].label, count: counts?.[s] })),
  ]

  return (
    <>
      <PageHeader
        title="Offers"
        description="Coupon codes customers use at checkout."
        actions={
          <>
            <Button variant="secondary" leftIcon={<FlaskConical className="h-4 w-4" />} onClick={() => preview.open('')}>Try a code</Button>
            <Can permission={PERMISSIONS.OFFERS_CREATE}><Link to="/offers/new"><Button leftIcon={<Plus className="h-4 w-4" />}>Add offer</Button></Link></Can>
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div role="tablist" aria-label="Status" className="flex flex-wrap gap-1">
            {tabs.map((t) => (
              <button
                key={t.value || 'all'}
                type="button"
                role="tab"
                aria-selected={filters.status === t.value}
                onClick={() => setFilters({ status: t.value })}
                className={cn(
                  'focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
                  filters.status === t.value ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100',
                )}
              >
                {t.label}
                {t.count !== undefined && <span className="text-xs text-slate-400">{t.count}</span>}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <SearchInput value={filters.search} onChange={(search) => setFilters({ search })} placeholder="Search code or title" />
        </div>

        <DataTable
          columns={columns}
          rows={query.data?.offers}
          rowKey={(o) => o.id}
          loading={query.isLoading || query.isPlaceholderData}
          error={query.error}
          onRetry={() => query.refetch()}
          sort={filters.sort}
          onSortChange={(sort) => setFilters({ sort })}
          onRowClick={(o) => navigate(`/offers/${o.id}`)}
          empty={
            filters.search || filters.status
              ? <EmptyState title="No offers match" action={<Button variant="secondary" onClick={resetFilters}>Show all</Button>} />
              : <EmptyState icon={<TicketPercent className="h-5 w-5" />} title="No offers yet" action={<Can permission={PERMISSIONS.OFFERS_CREATE}><Link to="/offers/new"><Button>Add offer</Button></Link></Can>} />
          }
        />
        <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
      </Card>

      <OfferPreviewModal open={preview.isOpen} onOpenChange={(o) => !o && preview.close()} initialCode={preview.item ?? ''} />
    </>
  )
}

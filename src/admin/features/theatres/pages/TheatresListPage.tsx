import { Link, useNavigate } from 'react-router-dom'
import { Clapperboard, ImageOff, MoreHorizontal, Pencil, Plus, Power } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, DataTable, EmptyState, IconButton, Menu, Pagination, SearchInput, Select, Switch, useToast, type Column,
} from '@/admin/components/ui'
import { useUrlFilters } from '@/admin/hooks/useUrlFilters'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatPaise } from '@/admin/lib/utils/money'
import { useSetTheatreActive, useTheatres } from '../api'
import type { Theatre } from '../types'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function TheatresListPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [filters, setFilters, resetFilters] = useUrlFilters({ page: 1, search: '', status: '', sort: 'sortOrder' })
  const setActive = useSetTheatreActive()

  const query = useTheatres({
    page: filters.page,
    limit: 20,
    sort: filters.sort,
    search: filters.search || undefined,
    isActive: filters.status ? filters.status === 'active' : undefined,
  })

  const toggleActive = (t: Theatre) => {
    setActive.mutate(
      { id: t.id, isActive: !t.isActive },
      {
        onSuccess: (saved) => toast.success(`${saved.name} is now ${saved.isActive ? 'active' : 'inactive'}`),
        onError: (err) => toast.error('Could not change status', errorMessage(err)),
      },
    )
  }

  const columns: Column<Theatre>[] = [
    {
      key: 'name',
      header: 'Theatre',
      sortable: true,
      cell: (t) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
            {t.images[0] ? (
              <img src={t.images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-slate-300"><ImageOff className="h-4 w-4" /></span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{t.name}</p>
            <p className="truncate text-xs text-slate-500">{t.tagline || `/${t.slug}`}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'capacityMax',
      header: 'Guests',
      sortable: true,
      hideOnMobile: true,
      cell: (t) => (
        <div>
          <p>{t.capacityMin}–{t.capacityMax}</p>
          <p className="text-xs text-slate-500">{t.includedGuests} included</p>
        </div>
      ),
    },
    {
      key: 'weekdayPricePaise',
      header: 'Weekday / weekend',
      sortable: true,
      align: 'right',
      cell: (t) => (
        <div className="tabular-nums">
          <p className="font-medium text-slate-900">{formatPaise(t.weekdayPricePaise)}</p>
          <p className="text-xs text-slate-500">{formatPaise(t.weekendPricePaise)}</p>
        </div>
      ),
    },
    {
      key: 'extra',
      header: 'Extra guest',
      align: 'right',
      hideOnMobile: true,
      cell: (t) => <span className="tabular-nums">{formatPaise(t.extraGuestPricePaise)}</span>,
    },
    {
      key: 'offer',
      header: 'Offer',
      hideOnMobile: true,
      cell: (t) => (t.currentOffer ? <Badge tone="brand">{t.currentOffer}</Badge> : <span className="text-slate-400">—</span>),
    },
    {
      key: 'active',
      header: 'Active',
      cell: (t) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={t.isActive}
            onChange={() => toggleActive(t)}
            disabled={setActive.isPending && setActive.variables?.id === t.id}
          />
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-12',
      cell: (t) => (
        <Menu
          trigger={<IconButton label={`Actions for ${t.name}`} onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></IconButton>}
          items={[
            { label: 'Edit', icon: <Pencil />, onSelect: () => navigate(`/theatres/${t.id}`) },
            { label: t.isActive ? 'Deactivate' : 'Activate', icon: <Power />, onSelect: () => toggleActive(t) },
          ]}
        />
      ),
    },
  ]

  const hasFilters = Boolean(filters.search || filters.status)

  return (
    <>
      <PageHeader
        title="Theatres"
        description="Theatres customers can book, with their capacity, prices and photos."
        actions={<Link to="/theatres/new"><Button leftIcon={<Plus className="h-4 w-4" />}>Add theatre</Button></Link>}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <SearchInput value={filters.search} onChange={(search) => setFilters({ search })} placeholder="Search by name or slug" />
          <div className="w-40">
            <Select aria-label="Status" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })} placeholder="All statuses" options={STATUS_OPTIONS} />
          </div>
          {hasFilters && <Button variant="ghost" size="sm" onClick={resetFilters}>Clear filters</Button>}
        </div>

        <DataTable
          columns={columns}
          rows={query.data?.theatres}
          rowKey={(t) => t.id}
          loading={query.isLoading || query.isPlaceholderData}
          error={query.error}
          onRetry={() => query.refetch()}
          sort={filters.sort}
          onSortChange={(sort) => setFilters({ sort })}
          onRowClick={(t) => navigate(`/theatres/${t.id}`)}
          empty={
            hasFilters ? (
              <EmptyState title="No theatres match" description="Try a different search or clear the filters." action={<Button variant="secondary" onClick={resetFilters}>Clear filters</Button>} />
            ) : (
              <EmptyState icon={<Clapperboard className="h-5 w-5" />} title="No theatres yet" description="Add your first theatre to start taking bookings." action={<Link to="/theatres/new"><Button>Add theatre</Button></Link>} />
            )
          }
        />
        <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
      </Card>
    </>
  )
}

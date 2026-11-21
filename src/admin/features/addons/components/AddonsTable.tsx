import { Link, useNavigate } from 'react-router-dom'
import { Gift, ImageOff, MoreHorizontal, Pencil, Plus } from 'lucide-react'
import {
  Button, Card, DataTable, EmptyState, IconButton, Menu, Pagination, SearchInput, Select, Switch, useToast, type Column,
} from '@/admin/components/ui'
import { useUrlFilters } from '@/admin/hooks/useUrlFilters'
import { errorMessage } from '@/admin/lib/api/errors'
import { cn } from '@/admin/lib/utils/cn'
import { formatPaise } from '@/admin/lib/utils/money'
import { useAddonCategories, useAddons, useSetAddonStatus, useSetVariantStock } from '../api'
import type { Addon, AddonListParams } from '../types'

const STATUS_OPTIONS = [
  { value: 'listed', label: 'Listed' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'out', label: 'Out of stock' },
]

const statusParams = (status: string): Pick<AddonListParams, 'isAvailable' | 'isOutOfStock'> =>
  status === 'listed' ? { isAvailable: true } : status === 'hidden' ? { isAvailable: false } : status === 'out' ? { isOutOfStock: true } : {}

/** Filterable list of add-ons with quick listed / stock switches. */
export function AddonsTable() {
  const navigate = useNavigate()
  const toast = useToast()
  const [filters, setFilters, resetFilters] = useUrlFilters({ page: 1, search: '', category: '', status: '', sort: 'sortOrder' })
  const categories = useAddonCategories()
  const setStatus = useSetAddonStatus()
  const setVariantStock = useSetVariantStock()

  const query = useAddons({
    page: filters.page,
    limit: 25,
    sort: filters.sort,
    search: filters.search || undefined,
    category: filters.category || undefined,
    ...statusParams(filters.status),
  })

  const quick = (a: Addon, change: { isAvailable?: boolean; isOutOfStock?: boolean }, done: string) =>
    setStatus.mutate({ id: a.id, ...change }, {
      onSuccess: () => toast.success(done),
      onError: (err) => toast.error('Could not update', errorMessage(err)),
    })

  const busy = (a: Addon) => setStatus.isPending && setStatus.variables?.id === a.id

  const columns: Column<Addon>[] = [
    {
      key: 'name',
      header: 'Add-on',
      sortable: true,
      cell: (a) => (
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-slate-100">
            {a.image ? <img src={a.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-slate-300"><ImageOff className="h-4 w-4" /></span>}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{a.name}</p>
            <p className="text-xs text-slate-500">{a.category.name}{a.leadTimeHours ? ` · ${a.leadTimeHours}h notice` : ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'startingPricePaise',
      header: <span title="For cakes, tap a size to switch its stock">Price / sizes</span>,
      sortable: true,
      cell: (a) =>
        a.hasVariants ? (
          <div>
            <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
              {a.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  title={v.isOutOfStock ? 'Out of stock: tap to restock' : 'In stock: tap to mark out of stock'}
                  disabled={setVariantStock.isPending}
                  onClick={() => setVariantStock.mutate(
                    { addonId: a.id, variantId: v.id, isOutOfStock: !v.isOutOfStock },
                    {
                      onSuccess: () => toast.success(`${a.name} ${v.label} ${v.isOutOfStock ? 'back in stock' : 'out of stock'}`),
                      onError: (err) => toast.error('Could not update', errorMessage(err)),
                    },
                  )}
                  className={cn(
                    'focus-ring rounded-md border px-1.5 py-0.5 text-xs tabular-nums',
                    v.isOutOfStock ? 'border-red-200 bg-red-50 text-red-600 line-through' : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300',
                  )}
                >
                  {v.label} {formatPaise(v.pricePaise)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="tabular-nums">
            <span className="font-medium text-slate-900">{formatPaise(a.pricePaise)}</span>
            {a.originalPricePaise !== null && <span className="ml-1.5 text-xs text-slate-400 line-through">{formatPaise(a.originalPricePaise)}</span>}
          </div>
        ),
    },
    {
      key: 'theatres',
      header: 'Theatres',
      hideOnMobile: true,
      cell: (a) => (a.theatres.length ? <span className="text-xs">{a.theatres.map((t) => t.name).join(', ')}</span> : <span className="text-slate-500">All</span>),
    },
    {
      key: 'listed',
      header: 'Listed',
      cell: (a) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch checked={a.isAvailable} disabled={busy(a)} onChange={(on) => quick(a, { isAvailable: on }, `${a.name} ${on ? 'listed' : 'hidden'}`)} />
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'In stock',
      cell: (a) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch checked={!a.isOutOfStock} disabled={busy(a)} onChange={(on) => quick(a, { isOutOfStock: !on }, `${a.name} ${on ? 'back in stock' : 'out of stock'}`)} />
        </div>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-12',
      cell: (a) => (
        <Menu
          trigger={<IconButton label={`Actions for ${a.name}`} onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></IconButton>}
          items={[{ label: 'Edit', icon: <Pencil />, onSelect: () => navigate(`/addons/${a.id}`) }]}
        />
      ),
    },
  ]

  const hasFilters = Boolean(filters.search || filters.category || filters.status)

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <SearchInput value={filters.search} onChange={(search) => setFilters({ search })} placeholder="Search add-ons" />
        <div className="w-44">
          <Select aria-label="Category" value={filters.category} onChange={(e) => setFilters({ category: e.target.value })} placeholder="All categories" options={(categories.data ?? []).map((c) => ({ value: c.id, label: `${c.name} (${c.addonCount})` }))} />
        </div>
        <div className="w-40">
          <Select aria-label="Status" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })} placeholder="Any status" options={STATUS_OPTIONS} />
        </div>
        {hasFilters && <Button variant="ghost" size="sm" onClick={resetFilters}>Clear filters</Button>}
        <div className="flex-1" />
        <Link to="/addons/new"><Button leftIcon={<Plus className="h-4 w-4" />}>Add add-on</Button></Link>
      </div>
      <DataTable
        columns={columns}
        rows={query.data?.addons}
        rowKey={(a) => a.id}
        loading={query.isLoading || query.isPlaceholderData}
        error={query.error}
        onRetry={() => query.refetch()}
        sort={filters.sort}
        onSortChange={(sort) => setFilters({ sort })}
        onRowClick={(a) => navigate(`/addons/${a.id}`)}
        empty={
          hasFilters
            ? <EmptyState title="No add-ons match" action={<Button variant="secondary" onClick={resetFilters}>Clear filters</Button>} />
            : <EmptyState icon={<Gift className="h-5 w-5" />} title="No add-ons yet" action={<Link to="/addons/new"><Button>Add add-on</Button></Link>} />
        }
      />
      <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
    </Card>
  )
}

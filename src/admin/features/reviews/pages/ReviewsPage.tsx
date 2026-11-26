import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, MessageSquareQuote, MoreHorizontal, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useAuth } from '@/admin/auth/AuthProvider'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, ConfirmDialog, DataTable, EmptyState, IconButton, Menu, Pagination, SearchInput, Select, StatCard, Stars, useToast,
  type Column, type MenuItem,
} from '@/admin/components/ui'
import { useSettings } from '@/admin/features/settings/api'
import { useUrlFilters } from '@/admin/hooks/useUrlFilters'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDate } from '@/admin/lib/utils/date'
import { ROLES } from '@/admin/types/auth'
import { useDeleteReview, useReviewStats, useReviews, useSetReviewPublished } from '../api'
import { RATING_OPTIONS, SOURCE_LABELS, SOURCE_OPTIONS } from '../constants'
import { ReviewFormModal } from '../components/ReviewFormModal'
import type { Review, ReviewSource } from '../types'

const STATUS_OPTIONS = [{ value: 'true', label: 'Published' }, { value: 'false', label: 'Hidden' }]

/** Testimonials for the website's Reviews page. */
export default function ReviewsPage() {
  const toast = useToast()
  const { hasRole } = useAuth()
  const stats = useReviewStats()
  const settings = useSettings()
  const setPublished = useSetReviewPublished()
  const remove = useDeleteReview()
  const [editing, setEditing] = useState<Review | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Review | null>(null)

  const [f, setFilters, reset] = useUrlFilters({ page: 1, search: '', rating: '', status: '', source: '', sort: 'sortOrder' })
  const query = useReviews({
    page: f.page,
    limit: 20,
    sort: f.sort,
    search: f.search || undefined,
    rating: f.rating ? Number(f.rating) : undefined,
    isPublished: f.status ? f.status === 'true' : undefined,
    source: (f.source || undefined) as ReviewSource | undefined,
  })
  const hasFilters = Boolean(f.search || f.rating || f.status || f.source)
  const summary = settings.data?.reviews

  const togglePublished = (r: Review) =>
    setPublished.mutate({ id: r.id, isPublished: !r.isPublished }, {
      onSuccess: () => toast.success(r.isPublished ? 'Review hidden from the website' : 'Review published'),
      onError: (err) => toast.error(errorMessage(err)),
    })

  const actions = (r: Review): MenuItem[] => [
    { label: 'Edit', icon: <Pencil />, onSelect: () => setEditing(r) },
    { label: r.isPublished ? 'Hide from website' : 'Publish', icon: r.isPublished ? <EyeOff /> : <Eye />, onSelect: () => togglePublished(r) },
    ...(hasRole(ROLES.SUPER_ADMIN) ? [{ label: 'Delete', icon: <Trash2 />, danger: true, onSelect: () => setDeleting(r) }] : []),
  ]

  const columns: Column<Review>[] = [
    {
      key: 'name',
      header: 'Customer',
      sortable: true,
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{r.name}</p>
          <Stars value={r.rating} className="mt-0.5" />
        </div>
      ),
    },
    { key: 'text', header: 'Review', cell: (r) => <p className="line-clamp-2 max-w-md text-xs text-slate-600">{r.text}</p> },
    {
      key: 'details',
      header: 'Occasion · theatre',
      hideOnMobile: true,
      cell: (r) => <span className="text-xs text-slate-600">{[r.occasion, r.theatre?.name].filter(Boolean).join(' · ') || '—'}</span>,
    },
    { key: 'date', header: 'Date', sortable: true, hideOnMobile: true, cell: (r) => <span className="whitespace-nowrap text-xs text-slate-500">{formatDate(r.date)}<br />{SOURCE_LABELS[r.source]}</span> },
    { key: 'status', header: 'Status', cell: (r) => (r.isPublished ? <Badge tone="success" dot>Published</Badge> : <Badge dot>Hidden</Badge>) },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-12',
      cell: (r) => <Menu items={actions(r)} trigger={<IconButton label={`Actions for ${r.name}`}><MoreHorizontal className="h-4 w-4" /></IconButton>} />,
    },
  ]

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Customer testimonials on the website's Reviews page."
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>Add review</Button>}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Published" value={stats.data?.published ?? 0} icon={<Eye />} tone="success" loading={stats.isLoading} hint={`${stats.data?.hidden ?? 0} hidden`} />
        <StatCard label="Average of published" value={stats.data?.averageRating ? stats.data.averageRating.toFixed(1) : '—'} icon={<Star />} tone="warning" loading={stats.isLoading} />
        <StatCard
          label="Rating shown on the website"
          value={summary ? `${summary.googleRating.toFixed(1)} · ${summary.googleReviewCount.toLocaleString('en-IN')}` : '—'}
          icon={<MessageSquareQuote />}
          tone="brand"
          loading={settings.isLoading}
          hint={<>Your Google rating and review count. <Link to="/settings" className="font-medium text-violet-700 hover:underline">Change in Settings</Link></>}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <SearchInput value={f.search} onChange={(search) => setFilters({ search })} placeholder="Name, text or occasion" />
          <div className="w-36"><Select aria-label="Rating" value={f.rating} onChange={(e) => setFilters({ rating: e.target.value })} placeholder="Any rating" options={RATING_OPTIONS} /></div>
          <div className="w-36"><Select aria-label="Status" value={f.status} onChange={(e) => setFilters({ status: e.target.value })} placeholder="Any status" options={STATUS_OPTIONS} /></div>
          <div className="w-36"><Select aria-label="Source" value={f.source} onChange={(e) => setFilters({ source: e.target.value })} placeholder="Any source" options={SOURCE_OPTIONS} /></div>
          {hasFilters && <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button>}
        </div>
        <DataTable
          columns={columns}
          rows={query.data?.reviews}
          rowKey={(r) => r.id}
          loading={query.isLoading || query.isPlaceholderData}
          error={query.error}
          onRetry={() => query.refetch()}
          sort={f.sort}
          onSortChange={(sort) => setFilters({ sort })}
          onRowClick={(r) => setEditing(r)}
          empty={<EmptyState icon={<MessageSquareQuote className="h-5 w-5" />} title={hasFilters ? 'No reviews match' : 'No reviews yet'} action={hasFilters ? <Button variant="secondary" onClick={reset}>Clear filters</Button> : undefined} />}
        />
        <Pagination pagination={query.data?.pagination} onPageChange={(page) => setFilters({ page })} />
      </Card>

      <ReviewFormModal open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} review={editing && editing !== 'new' ? editing : undefined} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete this review?"
        description={deleting ? `${deleting.name} · ${deleting.rating} stars` : undefined}
        confirmLabel="Delete"
        tone="danger"
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id, {
          onSuccess: () => { toast.success('Review deleted'); setDeleting(null) },
          onError: (err) => toast.error(errorMessage(err)),
        })}
      >
        <p className="text-sm text-slate-600">To take it off the website but keep it, hide it instead.</p>
      </ConfirmDialog>
    </>
  )
}

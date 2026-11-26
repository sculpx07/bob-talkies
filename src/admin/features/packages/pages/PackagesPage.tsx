import { useState } from 'react'
import { Check, MoreHorizontal, Package as PackageIcon, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { useAuth } from '@/admin/auth/AuthProvider'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, ConfirmDialog, EmptyState, ErrorState, IconButton, LoadingBlock, Menu, SearchInput, Select, Switch, useToast,
} from '@/admin/components/ui'
import { useUrlFilters } from '@/admin/hooks/useUrlFilters'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatPaise } from '@/admin/lib/utils/money'
import { ROLES } from '@/admin/types/auth'
import { useDeletePackage, usePackages, useSetPackageAvailable } from '../api'
import { TIER_OPTIONS, tierOption } from '../constants'
import { PackageFormModal } from '../components/PackageFormModal'
import type { CelebrationPackage, PackageTier } from '../types'

const STATUS_OPTIONS = [{ value: 'true', label: 'On website' }, { value: 'false', label: 'Hidden' }]

function PackageCard({ pkg, canDelete, onEdit, onDelete }: { pkg: CelebrationPackage; canDelete: boolean; onEdit: () => void; onDelete: () => void }) {
  const toast = useToast()
  const setAvailable = useSetPackageAvailable()
  const tier = tierOption(pkg.tier)
  const toggle = (isAvailable: boolean) =>
    setAvailable.mutate({ id: pkg.id, isAvailable }, {
      onSuccess: () => toast.success(isAvailable ? `${pkg.name} is on the website` : `${pkg.name} is hidden`),
      onError: (err) => toast.error(errorMessage(err)),
    })

  return (
    <Card className="flex flex-col p-5" aria-label={pkg.name}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={tier.tone}>{tier.label}</Badge>
            {pkg.badge && <Badge tone="brand">{pkg.badge}</Badge>}
          </div>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">{pkg.name}</h2>
        </div>
        <Menu
          items={[
            { label: 'Edit', icon: <Pencil />, onSelect: onEdit },
            ...(canDelete ? [{ label: 'Delete', icon: <Trash2 />, danger: true, onSelect: onDelete }] : []),
          ]}
          trigger={<IconButton label={`Actions for ${pkg.name}`}><MoreHorizontal className="h-4 w-4" /></IconButton>}
        />
      </div>
      {pkg.description && <p className="mt-1 text-sm text-slate-600">{pkg.description}</p>}
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-slate-50 px-3 py-2"><dt className="text-xs text-slate-500">Weekday</dt><dd className="font-semibold tabular-nums">{formatPaise(pkg.pricePaise)}</dd></div>
        <div className="rounded-lg bg-slate-50 px-3 py-2"><dt className="text-xs text-slate-500">Weekend</dt><dd className="font-semibold tabular-nums">{formatPaise(pkg.weekendPricePaise)}</dd></div>
      </dl>
      <ul className="mt-4 flex-1 space-y-1 text-sm text-slate-700">
        {pkg.inclusions.slice(0, 5).map((inc) => (
          <li key={inc} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />{inc}</li>
        ))}
        {pkg.inclusions.length > 5 && <li className="pl-6 text-xs text-slate-500">+{pkg.inclusions.length - 5} more</li>}
      </ul>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
        <Users className="h-3.5 w-3.5" aria-hidden="true" /> {pkg.includedGuests} guests ·{' '}
        {pkg.theatres.length ? pkg.theatres.map((t) => t.name).join(', ') : 'Every theatre'}
      </p>
      <div className="mt-4 border-t border-slate-100 pt-3">
        <Switch checked={pkg.isAvailable} disabled={setAvailable.isPending} onChange={toggle} label="Show on the website" />
      </div>
    </Card>
  )
}

/** Website packages (Silver, Gold, ...), shown on the customer Packages page. */
export default function PackagesPage() {
  const toast = useToast()
  const { hasRole } = useAuth()
  const [f, setFilters, reset] = useUrlFilters({ search: '', tier: '', status: '' })
  const query = usePackages({
    limit: 100,
    sort: 'sortOrder',
    search: f.search || undefined,
    tier: (f.tier || undefined) as PackageTier | undefined,
    isAvailable: f.status ? f.status === 'true' : undefined,
  })
  const [editing, setEditing] = useState<CelebrationPackage | 'new' | null>(null)
  const [deleting, setDeleting] = useState<CelebrationPackage | null>(null)
  const remove = useDeletePackage()
  const packages = query.data?.packages ?? []
  const hasFilters = Boolean(f.search || f.tier || f.status)

  const confirmDelete = () => {
    if (!deleting) return
    remove.mutate(deleting.id, {
      onSuccess: () => { toast.success(`${deleting.name} deleted`); setDeleting(null) },
      onError: (err) => toast.error(errorMessage(err)),
    })
  }

  return (
    <>
      <PageHeader
        title="Packages"
        description="Celebration packages on the website's Packages page."
        actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>Add package</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={f.search} onChange={(search) => setFilters({ search })} placeholder="Name or inclusion" />
        <div className="w-40"><Select aria-label="Tier" value={f.tier} onChange={(e) => setFilters({ tier: e.target.value })} placeholder="Any tier" options={TIER_OPTIONS.map(({ value, label }) => ({ value, label }))} /></div>
        <div className="w-40"><Select aria-label="Status" value={f.status} onChange={(e) => setFilters({ status: e.target.value })} placeholder="Any status" options={STATUS_OPTIONS} /></div>
        {hasFilters && <Button variant="ghost" size="sm" onClick={reset}>Clear filters</Button>}
      </div>

      {query.error ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : query.isLoading ? (
        <LoadingBlock />
      ) : packages.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PackageIcon className="h-5 w-5" />}
            title={hasFilters ? 'No packages match' : 'No packages yet'}
            action={hasFilters ? <Button variant="secondary" onClick={reset}>Clear filters</Button> : <Button onClick={() => setEditing('new')}>Add package</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {packages.map((p) => (
            <PackageCard key={p.id} pkg={p} canDelete={hasRole(ROLES.SUPER_ADMIN)} onEdit={() => setEditing(p)} onDelete={() => setDeleting(p)} />
          ))}
        </div>
      )}

      <PackageFormModal open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} pkg={editing && editing !== 'new' ? editing : undefined} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Delete ${deleting?.name ?? 'package'}?`}
        description="It disappears from the website. This cannot be undone from the admin panel."
        confirmLabel="Delete"
        tone="danger"
        loading={remove.isPending}
        onConfirm={confirmDelete}
      />
    </>
  )
}

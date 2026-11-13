import { useQuery } from '@tanstack/react-query'
import { packageKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Package } from '@/schemas/package'
import { useBooking } from '../../state/booking.context'
import { formatINR } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Check, Users } from 'lucide-react'

export function PackageStep() {
  const { state, dispatch } = useBooking()

  const { data: packages = [], isLoading } = useQuery({
    queryKey: packageKeys.list(state.theatreId ?? undefined),
    queryFn: () => api.get<Package[]>(`/packages${state.theatreId ? `?theatreId=${state.theatreId}` : ''}`),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        {[1, 2].map((i) => <Skeleton key={i} className="h-56 w-full" />)}
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-2">
        Choose your package
      </h2>
      <p className="text-text-secondary mb-6">
        Each package includes everything you need. You can add more in the next step.
      </p>
      <div className="space-y-4">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            selected={state.packageId === pkg.id}
            onSelect={() => dispatch({ type: 'SET_PACKAGE', packageId: pkg.id })}
          />
        ))}
      </div>
    </div>
  )
}

function PackageCard({ pkg, selected, onSelect }: { pkg: Package; selected: boolean; onSelect: () => void }) {
  const tierColors: Record<string, string> = {
    silver: 'text-text-secondary',
    gold: 'text-gold-400',
    diamond: 'text-blue-300',
    platinum: 'text-champagne-200',
  }
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'w-full text-left p-5 rounded-card border-2 transition-all duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500',
        selected
          ? 'border-gold-500 bg-gold-500/10 shadow-gold-glow'
          : 'border-border-subtle bg-bg-surface hover:border-gold-500/40 hover:bg-bg-elevated',
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn('font-display text-xl font-semibold', tierColors[pkg.tier] ?? 'text-text-primary')}>
              {pkg.name}
            </h3>
            {pkg.badge && <Badge variant="gold">{pkg.badge}</Badge>}
          </div>
          <p className="text-sm text-text-secondary">{pkg.description}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-gold-400 font-bold text-lg">{formatINR(pkg.pricePaise)}</p>
          <p className="text-xs text-text-muted">incl. {pkg.includedGuests} guests</p>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {pkg.inclusions.map((inc) => (
          <li key={inc} className="flex items-start gap-2 text-xs text-text-secondary">
            <Check size={12} className="text-success mt-0.5 shrink-0" aria-hidden="true" />
            {inc}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border-subtle text-xs text-text-muted">
        <Users size={12} aria-hidden="true" />
        Includes {pkg.includedGuests} guests · Extra guests charged separately
      </div>
    </button>
  )
}

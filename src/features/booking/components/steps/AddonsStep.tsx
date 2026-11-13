import { useQuery } from '@tanstack/react-query'
import { addonKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Addon, AddonCategory } from '@/schemas/addon'
import { useBooking } from '../../state/booking.context'
import { formatINR } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Plus, Minus, Clock } from 'lucide-react'

const CATEGORY_LABELS: Record<AddonCategory, string> = {
  decoration: 'Decoration',
  cake: 'Cake',
  flowers: 'Flowers',
  photography: 'Photography',
  food: 'Food & Beverages',
  surprise: 'Surprise',
  effects: 'Special Effects',
  signage: 'Signage',
}

export function AddonsStep() {
  const { state, dispatch } = useBooking()

  const { data: addons = [], isLoading } = useQuery({
    queryKey: addonKeys.list(state.theatreId ?? undefined),
    queryFn: () => api.get<Addon[]>(`/addons${state.theatreId ? `?theatreId=${state.theatreId}` : ''}`),
  })

  const categories = [...new Set(addons.map((a) => a.category))] as AddonCategory[]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-2">
        Add the finishing touches
      </h2>
      <p className="text-text-secondary mb-6">
        Make it extra special with decorations, cake, photography and more.
      </p>
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="space-y-2">
              {addons.filter((a) => a.category === category).map((addon) => (
                <AddonCard
                  key={addon.id}
                  addon={addon}
                  selected={state.addonIds.includes(addon.id)}
                  onToggle={() => dispatch({ type: 'TOGGLE_ADDON', addonId: addon.id })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddonCard({ addon, selected, onToggle }: { addon: Addon; selected: boolean; onToggle: () => void }) {
  const disabled = !addon.isAvailable || addon.isOutOfStock
  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-card border transition-all duration-150',
      selected ? 'border-gold-500 bg-gold-500/10' : 'border-border-subtle bg-bg-surface',
      disabled && 'opacity-50',
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-text-primary">{addon.name}</span>
          {addon.isOutOfStock && <Badge variant="crimson">Out of Stock</Badge>}
          {addon.leadTimeHours > 2 && !addon.isOutOfStock && (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock size={10} /> {addon.leadTimeHours}h notice
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary mt-0.5">{addon.description}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-gold-400 font-semibold text-sm">{formatINR(addon.pricePaise)}</span>
        <button
          type="button"
          onClick={() => !disabled && onToggle()}
          disabled={disabled}
          aria-pressed={selected}
          aria-label={selected ? `Remove ${addon.name}` : `Add ${addon.name}`}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-150',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500',
            selected
              ? 'bg-gold-500 border-gold-500 text-bg-base'
              : 'border-border-subtle text-text-secondary hover:border-gold-500 hover:text-gold-400',
            disabled && 'cursor-not-allowed',
          )}
        >
          {selected ? <Minus size={14} /> : <Plus size={14} />}
        </button>
      </div>
    </div>
  )
}

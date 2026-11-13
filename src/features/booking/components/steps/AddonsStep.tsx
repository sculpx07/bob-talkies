import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { addonKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Addon, AddonCategory } from '@/schemas/addon'
import { useBooking } from '../../state/booking.context'
import { formatINR } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/Skeleton'
import { Check, Clock, Plus } from 'lucide-react'

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
        <div className="grid gap-3 sm:grid-cols-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full" rounded="lg" />)}</div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-1 font-display text-3xl font-bold text-[#2a0e4f] md:text-4xl">Add the finishing touches</h2>
      <p className="mb-7 text-sm text-[#5b4578]">Make it extra special with decorations, cake, photography and more.</p>
      <div className="space-y-8">
        {categories.map((category) => (
          <section key={category}>
            <h3 className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#6b2398]">
              {CATEGORY_LABELS[category]}
              <span className="h-px flex-1 bg-gradient-to-r from-[#e3cbe6] to-transparent" />
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {addons.filter((a) => a.category === category).map((addon, i) => (
                <AddonCard
                  key={addon.id}
                  index={i}
                  addon={addon}
                  selected={state.addonIds.includes(addon.id)}
                  onToggle={() => dispatch({ type: 'TOGGLE_ADDON', addonId: addon.id })}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function AddonCard({ addon, selected, onToggle, index }: { addon: Addon; selected: boolean; onToggle: () => void; index: number }) {
  const disabled = !addon.isAvailable || addon.isOutOfStock
  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onToggle()}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={selected ? `Remove ${addon.name}` : `Add ${addon.name}`}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.6, delay: (index % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={disabled ? undefined : { y: -4 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={cn(
        'relative flex flex-col rounded-3xl p-4 text-left transition-shadow duration-300',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c026d3]/40',
        selected
          ? 'bg-[linear-gradient(135deg,#faf0ff,#fff)] shadow-[0_16px_38px_rgba(192,38,211,0.28)] ring-2 ring-[#c026d3]'
          : 'bg-white/85 shadow-[0_8px_24px_rgba(107,35,152,0.1)] ring-1 ring-[#ecd9ec] hover:shadow-[0_14px_34px_rgba(107,35,152,0.18)]',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="pr-2 text-[15px] font-semibold leading-snug text-[#2a0e4f]">{addon.name}</p>
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300',
            selected ? 'bg-[#c026d3] text-white' : 'bg-[#f6e6ef] text-[#6b2398]',
          )}
          aria-hidden="true"
        >
          {selected ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
        </span>
      </div>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-[#5b4578]">{addon.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full bg-[#fff1d6] px-3 py-1 text-sm font-bold text-[#8f6420]">{formatINR(addon.pricePaise)}</span>
        {addon.isOutOfStock ? (
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#c2255c]">Out of stock</span>
        ) : addon.leadTimeHours > 2 ? (
          <span className="flex items-center gap-1 text-[11px] text-[#7d7094]"><Clock size={11} /> {addon.leadTimeHours}h notice</span>
        ) : null}
      </div>
    </motion.button>
  )
}

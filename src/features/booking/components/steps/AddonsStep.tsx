import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Check, Plus } from 'lucide-react'
import { addonKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Addon, AddonCategory } from '@/schemas/addon'
import { useBooking } from '../../state/booking.context'
import { formatINR } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/Skeleton'

// section headings, as on https://bobtalkies.com/add-on/
const CATEGORY_LABELS: Record<AddonCategory, string> = {
  cake: 'Cakes',
  effects: 'Effects',
  decor: 'Decor Items',
  decoration: 'Decoration',
  flowers: 'Flowers',
  gifts: 'Gifts',
  photography: 'Photography (soft copies only)',
  videography: 'Videography',
  food: 'Food & Beverages',
  surprise: 'Surprise',
  signage: 'Signage',
}

const TILES = ['from-[#fbe3ec] to-[#f6c9dc]', 'from-[#fce8f0] to-[#dcc4f5]', 'from-[#fff1d6] to-[#f8dca0]', 'from-[#e4f1ff] to-[#c6dcf5]']

/** Optional extras. Cakes have their own step before this one, and decoration is chosen with the booking details. */
export function AddonsStep() {
  const { state, dispatch } = useBooking()

  const { data: addons = [], isLoading } = useQuery({
    queryKey: addonKeys.list(state.theatreId ?? undefined),
    queryFn: () => api.get<Addon[]>(`/addons${state.theatreId ? `?theatreId=${state.theatreId}` : ''}`),
  })

  const shown = addons.filter((a) => a.category !== 'cake' && a.category !== 'decoration')
  const categories = [...new Set(shown.map((a) => a.category))] as AddonCategory[] // keeps the page order

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-44 w-full" rounded="lg" />)}</div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-1 font-display text-3xl font-bold text-[#3d0a24] md:text-4xl">Add the finishing touches</h2>
      <p className="mb-6 text-sm text-[#5b2535]">Optional: effects, decor, flowers, gifts, photography and videography. You can skip this step.</p>

      <div className="mb-7 rounded-2xl bg-[#fdf6ff] p-4 ring-1 ring-[#f5d5e0]">
        <label htmlFor="addon-request" className="mb-1.5 block text-sm font-semibold text-[#3d0a24]">Customize as per your requirement</label>
        <textarea
          id="addon-request" rows={3} value={state.addonRequest}
          onChange={(e) => dispatch({ type: 'SET_ADDON_REQUEST', text: e.target.value.slice(0, 400) })}
          placeholder="Photography style, flowers, food, effects, anything special"
          className="w-full resize-none rounded-xl border border-[#f5d5e0] bg-white px-4 py-3 text-sm text-[#3d0a24] outline-none placeholder:text-[#b0a0c8] focus:border-[#c0125a] focus:ring-2 focus:ring-[#c0125a]/25"
        />
        <p className="mt-1 text-right text-[11px] text-[#7d4555]">{state.addonRequest.length}/400. Our team will confirm custom requests with you.</p>
      </div>

      {shown.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[#ddd0f5] px-4 py-10 text-center text-sm text-[#7d4555]">Nothing to add here. Continue to the next step.</p>
      )}

      <div className="space-y-9">
        {categories.map((category) => (
          <section key={category}>
            <h3 className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8b1a3a]">
              {CATEGORY_LABELS[category]}
              <span className="h-px flex-1 bg-gradient-to-r from-[#e3cbe6] to-transparent" />
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {shown.filter((a) => a.category === category).map((addon, i) => (
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
  const [imgFailed, setImgFailed] = useState(false)
  const disabled = !addon.isAvailable || addon.isOutOfStock
  const onOffer = addon.originalPricePaise && addon.originalPricePaise > addon.pricePaise

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
        'relative flex items-center gap-4 rounded-3xl p-4 text-left transition-shadow duration-300',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c0125a]/40',
        selected
          ? 'bg-[linear-gradient(135deg,#faf0ff,#fff)] shadow-[0_16px_38px_rgba(192,38,211,0.28)] ring-2 ring-[#c0125a]'
          : 'bg-white/85 shadow-[0_8px_24px_rgba(107,35,152,0.1)] ring-1 ring-[#f5d5e0] hover:shadow-[0_14px_34px_rgba(107,35,152,0.18)]',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="block h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-[#f5d5e0]">
        {addon.image && !imgFailed ? (
          <img src={addon.image} alt="" loading="lazy" onError={() => setImgFailed(true)} className="h-full w-full object-cover" />
        ) : (
          <span className={cn('flex h-full w-full items-center justify-center bg-gradient-to-br text-2xl', TILES[index % TILES.length])} aria-hidden="true">✨</span>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="text-[15px] font-semibold leading-snug text-[#3d0a24]">{addon.name}</span>
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-[#fff1d6] px-3 py-1 text-sm font-bold text-[#8f6420]">{formatINR(addon.pricePaise)}</span>
          {onOffer && <s className="text-xs tabular-nums text-[#9a6575]">{formatINR(addon.originalPricePaise!)}</s>}
        </span>
      </span>

      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-full transition-all duration-300',
          selected ? 'bg-[#c0125a] text-white' : 'bg-[#f6e6ef] text-[#8b1a3a]',
        )}
        aria-hidden="true"
      >
        {selected ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
      </span>
    </motion.button>
  )
}

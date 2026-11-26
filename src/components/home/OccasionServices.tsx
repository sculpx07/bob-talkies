import type { Addon } from '@/schemas/addon'
import { formatINR } from '@/lib/utils/currency'
import { CATEGORY_LABEL, OCCASION_SERVICE_CATEGORIES } from '@/content/experienceServices'
import { useAddons } from '@/features/catalog/api'

export interface OccasionServiceGroup {
  key: string
  label: string
  names: string[]
  total: number
  fromPaise: number
}

/** Real add-on categories (from the add-on catalogue) relevant to an occasion. Empty while loading or if none exist. */
export function useOccasionServices(slug: string): { groups: OccasionServiceGroup[]; isLoading: boolean } {
  const { data, isLoading } = useAddons()

  const available = (data ?? []).filter((a) => a.isAvailable && !a.isOutOfStock)
  const byCategory = new Map<string, Addon[]>()
  for (const a of available) byCategory.set(a.category, [...(byCategory.get(a.category) ?? []), a])

  const order = OCCASION_SERVICE_CATEGORIES[slug]
  const keys = order ? order.filter((c) => byCategory.has(c)) : [...byCategory.keys()]

  const groups = keys.map((key) => {
    const items = byCategory.get(key)!
    // cakes are listed once per size: show each cake name once
    const names = [...new Set(items.map((i) => i.cakeName ?? i.name))]
    return {
      key,
      label: CATEGORY_LABEL[key] ?? key,
      names,
      total: names.length,
      fromPaise: Math.min(...items.map((i) => i.pricePaise)),
    }
  })
  return { groups, isLoading }
}

export function OccasionServiceList({ groups, tone = 'light' }: { groups: OccasionServiceGroup[]; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {groups.map((g) => (
        <li key={g.key} className={dark ? 'rounded-2xl bg-white/10 p-4 ring-1 ring-white/15' : 'rounded-2xl bg-white p-4 shadow-[0_10px_26px_rgba(107,35,152,0.1)] ring-1 ring-[#f8dce4]'}>
          <div className="flex items-baseline justify-between gap-2">
            <p className={dark ? 'font-display text-base font-bold text-white' : 'font-display text-base font-bold text-[#3d0a24]'}>{g.label}</p>
            <span className={dark ? 'text-xs text-[#f5d7a1]' : 'text-xs font-semibold text-[#8b1a3a]'}>from {formatINR(g.fromPaise)}</span>
          </div>
          <p className={dark ? 'mt-1 line-clamp-2 text-[13px] text-white/75' : 'mt-1 line-clamp-2 text-[13px] text-[#5b2535]'}>
            {g.names.slice(0, 3).join(', ')}{g.total > 3 ? ` +${g.total - 3} more` : ''}
          </p>
        </li>
      ))}
    </ul>
  )
}

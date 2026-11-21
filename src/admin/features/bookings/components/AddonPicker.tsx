import { useMemo, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { Input, QuantityStepper, Skeleton } from '@/admin/components/ui'
import { useAddonCategories, useAddons } from '@/admin/features/addons/api'
import type { Addon } from '@/admin/features/addons/types'
import { formatPaise } from '@/admin/lib/utils/money'
import type { AddonLine } from '../quote'

const keyOf = (addon: string, variant?: string) => `${addon}:${variant ?? ''}`

/** Choose cakes (by size) and extras with quantities, from what this theatre offers. */
export function AddonPicker({ theatreId, value, onChange }: {
  theatreId: string
  value: AddonLine[]
  onChange: (lines: AddonLine[]) => void
}) {
  const [search, setSearch] = useState('')
  const addons = useAddons({ theatre: theatreId || undefined, isAvailable: true, limit: 200, sort: 'sortOrder' })
  const categories = useAddonCategories()

  const quantities = useMemo(() => new Map(value.map((l) => [keyOf(l.addon, l.variant), l.quantity])), [value])
  const setQty = (addon: string, variant: string | undefined, quantity: number) => {
    const rest = value.filter((l) => keyOf(l.addon, l.variant) !== keyOf(addon, variant))
    onChange(quantity > 0 ? [...rest, { addon, ...(variant && { variant }), quantity }] : rest)
  }

  // grouped by category, in the categories' display order
  const groups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = (addons.data?.addons ?? []).filter((a) => !q || a.name.toLowerCase().includes(q))
    const order = new Map((categories.data ?? []).map((c, i) => [c.id, i]))
    const byCat = new Map<string, { name: string; items: Addon[] }>()
    list.forEach((a) => {
      const g = byCat.get(a.category.id) ?? { name: a.category.name, items: [] }
      g.items.push(a)
      byCat.set(a.category.id, g)
    })
    return [...byCat.entries()].sort(([a], [b]) => (order.get(a) ?? 99) - (order.get(b) ?? 99)).map(([, g]) => g)
  }, [addons.data, categories.data, search])

  const selectedCount = value.reduce((n, l) => n + l.quantity, 0)

  if (addons.isLoading) return <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>

  // a plain function (not a component), so rows keep focus across re-renders
  const row = ({ a, label, price, original, outOfStock, variant }: { a: Addon; label: string; price: number; original: number | null; outOfStock: boolean; variant?: string }) => (
    <div key={keyOf(a.id, variant)} className="flex items-center justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">
          {formatPaise(price)}{original !== null && <span className="ml-1 line-through">{formatPaise(original)}</span>}
          {a.leadTimeHours > 0 && ` · ${a.leadTimeHours}h notice`}
          {outOfStock && <span className="ml-1 font-medium text-red-600">Out of stock</span>}
        </p>
      </div>
      <QuantityStepper label={label} value={quantities.get(keyOf(a.id, variant)) ?? 0} onChange={(n) => setQty(a.id, variant, n)} disabled={outOfStock && !quantities.get(keyOf(a.id, variant))} />
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Input type="search" aria-label="Search add-ons" placeholder="Search add-ons" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <span className="text-sm text-slate-500">{selectedCount ? `${selectedCount} item(s) added` : 'Nothing added'}</span>
      </div>
      <div className="max-h-[28rem] space-y-4 overflow-y-auto pr-1">
        {groups.map((g) => (
          <section key={g.name}>
            <h3 className="sticky top-0 z-10 bg-white py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{g.name}</h3>
            <ul className="divide-y divide-slate-100">
              {g.items.map((a) => (
                <li key={a.id} className="flex gap-3 py-1">
                  <div className="mt-1.5 h-9 w-9 shrink-0 overflow-hidden rounded-md bg-slate-100">
                    {a.image ? <img src={a.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-slate-300"><ImageOff className="h-3.5 w-3.5" /></span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    {a.hasVariants ? (
                      <>
                        <p className="pt-1.5 text-sm font-medium text-slate-900">{a.name}</p>
                        {a.variants.map((v) => row({ a, variant: v.id, label: `${a.name} (${v.label})`, price: v.pricePaise, original: v.originalPricePaise, outOfStock: a.isOutOfStock || v.isOutOfStock }))}
                      </>
                    ) : (
                      row({ a, label: a.name, price: a.pricePaise ?? 0, original: a.originalPricePaise, outOfStock: a.isOutOfStock })
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {!groups.length && <p className="py-6 text-center text-sm text-slate-500">No add-ons match.</p>}
      </div>
    </div>
  )
}

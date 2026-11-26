import { z } from 'zod'
import { paiseToRupees, rupeesToPaise } from '@/admin/lib/utils/money'
import type { CelebrationPackage, PackageInput } from './types'

const rupees = (label: string) => z.number({ error: `Enter the ${label}` }).min(0, 'Cannot be negative').max(10_000_000)

/** Package form (prices in rupees). Limits mirror the backend. */
export const packageFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  tier: z.enum(['silver', 'gold', 'diamond', 'platinum', 'custom']),
  description: z.string().trim().max(500),
  inclusions: z.array(z.string()).min(1, 'Add at least one inclusion').max(30, 'At most 30 inclusions'),
  includedGuests: z.number({ error: 'Enter the guests' }).int('Whole number').min(1).max(500),
  price: rupees('weekday price'),
  weekendPrice: rupees('weekend price'),
  allTheatres: z.boolean(),
  theatres: z.array(z.string()),
  badge: z.string().trim().max(30),
  isAvailable: z.boolean(),
  sortOrder: z.number({ error: 'Enter a number' }).int().min(0).max(10000),
}).refine((v) => v.allTheatres || v.theatres.length > 0, { path: ['theatres'], message: 'Pick at least one theatre' })

export type PackageFormValues = z.infer<typeof packageFormSchema>

export const PACKAGE_FORM_FIELDS = ['name', 'tier', 'description', 'inclusions', 'includedGuests', 'price', 'weekendPrice', 'theatres', 'badge', 'isAvailable', 'sortOrder']

/** API field -> form field */
export const packageFieldMap = { pricePaise: 'price', weekendPricePaise: 'weekendPrice' }

export function packageToForm(p?: CelebrationPackage): PackageFormValues {
  return {
    name: p?.name ?? '',
    tier: p?.tier ?? 'silver',
    description: p?.description ?? '',
    inclusions: p?.inclusions ?? [],
    includedGuests: p?.includedGuests ?? 2,
    price: p ? Number(paiseToRupees(p.pricePaise)) : NaN,
    weekendPrice: p ? Number(paiseToRupees(p.weekendPricePaise)) : NaN,
    allTheatres: !p || p.theatres.length === 0,
    theatres: p?.theatres.map((t) => t.id) ?? [],
    badge: p?.badge ?? '',
    isAvailable: p?.isAvailable ?? true,
    sortOrder: p?.sortOrder ?? 0,
  }
}

export function formToPackage(v: PackageFormValues): PackageInput {
  return {
    name: v.name,
    tier: v.tier,
    description: v.description,
    inclusions: v.inclusions,
    includedGuests: v.includedGuests,
    pricePaise: rupeesToPaise(v.price) ?? 0,
    weekendPricePaise: rupeesToPaise(v.weekendPrice) ?? 0,
    theatres: v.allTheatres ? [] : v.theatres,
    badge: v.badge,
    isAvailable: v.isAvailable,
    sortOrder: v.sortOrder,
  }
}

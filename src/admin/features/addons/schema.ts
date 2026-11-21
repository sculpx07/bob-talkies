import { z } from 'zod'
import { paiseToRupees, rupeesToPaise } from '@/admin/lib/utils/money'
import type { Addon, AddonInput } from './types'

/** Empty money inputs read as NaN; this keeps "empty" separate from 0. */
const money = z.number().min(0, 'Cannot be negative').max(10_000_000, 'Too large').or(z.nan())
const has = (n: number) => !Number.isNaN(n)

const variantSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, 'Name the size').max(50),
  price: money,
  originalPrice: money,
  isOutOfStock: z.boolean(),
})

/**
 * Add-on form. Prices are in rupees. An add-on has either one price ("single")
 * or a list of sizes, each with its own price (rules mirror the backend model).
 */
export const addonFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    category: z.string().min(1, 'Pick a category'),
    description: z.string().trim().max(1000),
    mode: z.enum(['single', 'sizes']),
    price: money,
    originalPrice: money,
    variants: z.array(variantSchema).max(10, 'At most 10 sizes'),
    allTheatres: z.boolean(),
    theatres: z.array(z.string()),
    leadTimeHours: z.number({ error: 'Enter hours' }).int('Whole hours').min(0).max(336, 'At most 14 days'),
    isAvailable: z.boolean(),
    isOutOfStock: z.boolean(),
    sortOrder: z.number({ error: 'Enter a number' }).int().min(0).max(10000),
  })
  .superRefine((v, ctx) => {
    const strikeCheck = (price: number, original: number, path: (string | number)[]) => {
      if (has(original) && has(price) && original <= price) ctx.addIssue({ code: 'custom', path, message: 'Must be higher than the price' })
    }
    if (v.mode === 'single') {
      if (!has(v.price)) ctx.addIssue({ code: 'custom', path: ['price'], message: 'Enter a price' })
      strikeCheck(v.price, v.originalPrice, ['originalPrice'])
    } else {
      if (!v.variants.length) ctx.addIssue({ code: 'custom', path: ['variants'], message: 'Add at least one size' })
      const seen = new Set<string>()
      v.variants.forEach((s, i) => {
        if (!has(s.price)) ctx.addIssue({ code: 'custom', path: ['variants', i, 'price'], message: 'Enter a price' })
        strikeCheck(s.price, s.originalPrice, ['variants', i, 'originalPrice'])
        const key = s.label.trim().toLowerCase()
        if (key && seen.has(key)) ctx.addIssue({ code: 'custom', path: ['variants', i, 'label'], message: 'Size names must be different' })
        seen.add(key)
      })
    }
    if (!v.allTheatres && !v.theatres.length) ctx.addIssue({ code: 'custom', path: ['theatres'], message: 'Pick at least one theatre, or offer it everywhere' })
  })

export type AddonFormValues = z.infer<typeof addonFormSchema>

export const ADDON_FORM_FIELDS = Object.keys(addonFormSchema.shape) as Array<keyof AddonFormValues>

/** API -> form field: "pricePaise" -> "price", "variants.0.originalPricePaise" -> "variants.0.originalPrice". */
export const addonFieldMap = (apiField: string) =>
  apiField.replace(/originalPricePaise$/, 'originalPrice').replace(/pricePaise$/, 'price')

const toRupees = (paise: number | null) => (paise === null ? NaN : Number(paiseToRupees(paise)))
const toPaise = (rupees: number) => (has(rupees) ? rupeesToPaise(rupees) : null)

export const emptyVariant = () => ({ label: '', price: NaN, originalPrice: NaN, isOutOfStock: false })

export function emptyAddonForm(categoryId = ''): AddonFormValues {
  return {
    name: '', category: categoryId, description: '',
    mode: 'single', price: NaN, originalPrice: NaN, variants: [],
    allTheatres: true, theatres: [], leadTimeHours: 0,
    isAvailable: true, isOutOfStock: false, sortOrder: 0,
  }
}

export function addonToForm(a: Addon): AddonFormValues {
  return {
    name: a.name,
    category: a.category.id,
    description: a.description,
    mode: a.variants.length ? 'sizes' : 'single',
    price: toRupees(a.pricePaise),
    originalPrice: toRupees(a.originalPricePaise),
    variants: a.variants.map((v) => ({
      id: v.id, label: v.label, price: toRupees(v.pricePaise), originalPrice: toRupees(v.originalPricePaise), isOutOfStock: v.isOutOfStock,
    })),
    allTheatres: a.theatres.length === 0,
    theatres: a.theatres.map((t) => t.id),
    leadTimeHours: a.leadTimeHours,
    isAvailable: a.isAvailable,
    isOutOfStock: a.isOutOfStock,
    sortOrder: a.sortOrder,
  }
}

export function formToAddonInput(v: AddonFormValues): AddonInput {
  const single = v.mode === 'single'
  return {
    name: v.name,
    category: v.category,
    description: v.description,
    pricePaise: single ? toPaise(v.price) : null,
    originalPricePaise: single ? toPaise(v.originalPrice) : null,
    variants: single
      ? []
      : v.variants.map((s) => ({
          ...(s.id && { id: s.id }),
          label: s.label.trim(),
          pricePaise: toPaise(s.price) ?? 0,
          originalPricePaise: toPaise(s.originalPrice),
          isOutOfStock: s.isOutOfStock,
        })),
    leadTimeHours: v.leadTimeHours,
    theatres: v.allTheatres ? [] : v.theatres,
    isAvailable: v.isAvailable,
    isOutOfStock: v.isOutOfStock,
    sortOrder: v.sortOrder,
  }
}

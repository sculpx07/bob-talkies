import type { UserRef } from '@/admin/types/api'

/** Shapes from bob-admin (src/models/addon.model.js, addonCategory.model.js). Money is paise. */

export interface CategoryRef {
  id: string
  name: string
  slug: string
}

export interface AddonCategory extends CategoryRef {
  description: string
  sortOrder: number
  isActive: boolean
  /** add-ons in this category (list / detail endpoints) */
  addonCount: number
  createdAt: string
}

export interface AddonVariant {
  id: string
  label: string
  pricePaise: number
  /** struck-through price, higher than pricePaise */
  originalPricePaise: number | null
  isOutOfStock: boolean
}

export interface Addon {
  id: string
  name: string
  description: string
  category: CategoryRef
  image: string
  /** single-price add-ons; null when the add-on has sizes */
  pricePaise: number | null
  originalPricePaise: number | null
  variants: AddonVariant[]
  hasVariants: boolean
  /** lowest price across the item / its sizes */
  startingPricePaise: number
  leadTimeHours: number
  /** empty = every theatre */
  theatres: Array<{ id: string; name: string; slug: string }>
  isAvailable: boolean
  isOutOfStock: boolean
  sortOrder: number
  createdBy: UserRef | string | null
  updatedBy: UserRef | string | null
  createdAt: string
  updatedAt: string
}

export interface AddonInput {
  name: string
  description: string
  category: string
  pricePaise: number | null
  originalPricePaise: number | null
  /** keep `id` to update an existing size; omit it for a new one */
  variants: Array<{ id?: string; label: string; pricePaise: number; originalPricePaise: number | null; isOutOfStock: boolean }>
  leadTimeHours: number
  theatres: string[]
  isAvailable: boolean
  isOutOfStock: boolean
  sortOrder: number
}

export interface AddonListParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
  category?: string
  /** offered at this theatre (its own + all-theatre add-ons) */
  theatre?: string
  isAvailable?: boolean
  isOutOfStock?: boolean
}

export interface CategoryInput {
  name: string
  slug?: string
  description: string
  sortOrder: number
  isActive: boolean
}

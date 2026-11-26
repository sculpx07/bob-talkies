import type { UserRef } from '@/admin/types/api'

export type PackageTier = 'silver' | 'gold' | 'diamond' | 'platinum' | 'custom'

/** A website package (bob-admin src/models/package.model.js). Money is paise. */
export interface CelebrationPackage {
  id: string
  name: string
  tier: PackageTier
  description: string
  inclusions: string[]
  includedGuests: number
  pricePaise: number
  weekendPricePaise: number
  /** empty = every theatre */
  theatres: { id: string; name: string; slug: string }[]
  badge: string
  isAvailable: boolean
  sortOrder: number
  createdBy?: UserRef | null
  updatedBy?: UserRef | null
  createdAt: string
  updatedAt: string
}

export type PackageInput = Omit<CelebrationPackage, 'id' | 'theatres' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'> & {
  theatres: string[]
}

export interface PackageListParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
  tier?: PackageTier
  isAvailable?: boolean
}

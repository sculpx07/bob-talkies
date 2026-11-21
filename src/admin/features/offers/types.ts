import type { UserRef } from '@/admin/types/api'

/** Offer from bob-admin (src/models/offer.model.js). Money is paise. */

export type DiscountType = 'flat' | 'percent'
export type OfferStatus = 'active' | 'scheduled' | 'expired' | 'inactive' | 'exhausted'

export interface Offer {
  id: string
  code: string
  title: string
  description: string
  badge: string
  image: string
  discountType: DiscountType
  /** flat: paise; percent: 1-100 */
  discountValue: number
  /** percent only */
  maxDiscountPaise: number | null
  minOrderPaise: number | null
  /** empty = every theatre */
  theatres: Array<{ id: string; name: string; slug: string }>
  /** 0 = Sunday ... 6 = Saturday */
  applicableDays: number[]
  firstBookingOnly: boolean
  validFrom: string
  validUntil: string
  /** null = unlimited */
  usageLimit: number | null
  perCustomerLimit: number | null
  usedCount: number
  isActive: boolean
  isPublic: boolean
  sortOrder: number
  status: OfferStatus
  createdBy: UserRef | string | null
  updatedBy: UserRef | string | null
  createdAt: string
  updatedAt: string
}

export type OfferInput = Omit<Offer, 'id' | 'image' | 'theatres' | 'usedCount' | 'status' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt'> & {
  theatres: string[]
}

export interface OfferListParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
  status?: OfferStatus
  discountType?: DiscountType
}

export interface OfferStats {
  total: number
  byStatus: Record<OfferStatus, number>
}

/** POST /offers/preview */
export interface OfferPreview {
  offer: { id: string; code: string; title: string; status: OfferStatus }
  input: { theatre: string | null; date: string; subtotalPaise: number }
  applicable: boolean
  reason: string | null
  discountPaise: number
  totalAfterDiscountPaise: number
  /** rules that need the customer's history, enforced at checkout */
  checkedAtCheckout: string[]
}

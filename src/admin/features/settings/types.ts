import type { UserRef } from '@/admin/types/api'

/** Business settings from bob-admin (src/models/setting.model.js). Money is paise. */
export interface Settings {
  pricing: {
    gstPercent: number
    pricesIncludeGst: boolean
    advancePercent: number
    allowFullPayment: boolean
    decorationPricePaise: number
  }
  booking: {
    slotHoldMinutes: number
    minLeadHours: number
    maxAdvanceDays: number
    refundCutoffHours: number
    /** customers may change guests / decoration / add-ons on the website ... */
    allowCustomerEdits: boolean
    /** ... until this many minutes before the slot */
    customerEditCutoffMinutes: number
  }
  contact: {
    whatsappNumber: string
    phone: string
    email: string
    address: string
  }
  /** overall rating shown on the website's Reviews page */
  reviews: {
    googleRating: number
    googleReviewCount: number
  }
  /** automatic discount for regular customers (counted by completed bookings on the same mobile) */
  loyalty: {
    enabled: boolean
    minCompletedBookings: number
    /** discount on the bill, bonus BOB Points on completion, or both */
    rewardType: LoyaltyRewardType
    bonusPoints: number
    discountType: 'percent' | 'flat'
    /** percent: 1-50; flat: paise */
    discountValue: number
    maxDiscountPaise: number | null
    label: string
    stackWithCoupons: boolean
  }
  /** BOB Points: earned on completed bookings and referrals, spent at checkout */
  rewards: {
    enabled: boolean
    /** what 1 point is worth */
    pointValuePaise: number
    pointsPerBooking: number
    referrerPoints: number
    friendPoints: number
    /** points can pay at most this share of a booking (before GST) */
    maxRedeemPercent: number
    minRedeemPoints: number
    monthlyReferralCap: number
  }
  updatedBy: UserRef | null
  updatedAt: string
}

export type LoyaltyRewardType = 'discount' | 'points' | 'both'

export type SettingsSection = 'pricing' | 'booking' | 'contact' | 'reviews' | 'loyalty' | 'rewards'

/** Any subset of sections and fields, e.g. { pricing: { gstPercent: 12 } } */
export type SettingsPatch = { [S in SettingsSection]?: Partial<Settings[S]> }

export interface SettingChange {
  /** e.g. "pricing.gstPercent" */
  path: string
  from: unknown
  to: unknown
}

export interface SettingHistoryEntry {
  id: string
  changes: SettingChange[]
  changedBy: UserRef | null
  createdAt: string
}

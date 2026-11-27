import type { ListParams } from '@/admin/types/api'

/** BOB Points (bob-admin services/rewards). */

export type RewardType = 'booking_completed' | 'regular_bonus' | 'referral_referrer' | 'referral_friend' | 'redeemed' | 'redeem_returned' | 'adjustment'
export type ReferralStatus = 'PENDING' | 'REWARDED' | 'REJECTED'

export interface RewardEntry {
  id: string
  type: RewardType
  label: string
  /** + earned / returned, - spent */
  points: number
  note: string
  bookingNumber: string | null
  by: { id: string; name: string } | null
  createdAt: string
}

/** GET /rewards/customers/:mobile */
export interface CustomerRewards {
  customer: { id: string | null; name: string; mobile: string; referredBy: { id: string; name: string; mobile: string; referralCode?: string } | null }
  enabled: boolean
  balance: number
  valuePaise: number
  pointValuePaise: number
  pointsPerBooking: number
  upcomingPoints: number
  referral: { code: string | null; referrerPoints: number; friendPoints: number; invited: number; rewarded: number }
  repeatGuest: { completedBookings: number; needed: number; active: boolean; discount: boolean; bonusPoints: number }
  history: RewardEntry[]
}

export interface AdjustPointsInput {
  /** + adds, - takes away */
  points: number
  note: string
}

type PersonRef = { id: string; name: string; mobile: string }
type BookingRef = { id: string; bookingNumber: string; status: string; date: string } | null

export interface Referral {
  id: string
  referrer: PersonRef & { referralCode?: string }
  friend: PersonRef
  code: string
  status: ReferralStatus
  firstBooking: BookingRef
  qualifyingBooking: BookingRef
  referrerPoints: number
  friendPoints: number
  rewardedAt: string | null
  rejectedAt: string | null
  rejectReason: string
  rejectedBy: { id: string; name: string } | null
  createdAt: string
}

export interface ReferralsParams extends ListParams {
  status?: ReferralStatus
}

export interface ActivityEntry extends RewardEntry {
  customer: PersonRef | null
}

export interface ActivityParams extends ListParams {
  type?: RewardType
}

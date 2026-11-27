import type { BadgeTone } from '@/admin/components/ui'
import type { ReferralStatus, RewardType } from './types'

export const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  booking_completed: 'Booking completed',
  regular_bonus: 'Regular customer bonus',
  referral_referrer: 'Friend referred',
  referral_friend: 'Joined with a referral',
  redeemed: 'Used on a booking',
  redeem_returned: 'Points returned',
  adjustment: 'Adjusted by staff',
}

export const REFERRAL_STATUS_BADGE: Record<ReferralStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'Waiting for first celebration', tone: 'warning' },
  REWARDED: { label: 'Rewarded', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
}

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { useCustomerSession } from '@/features/auth/session'
import { useSiteConfig } from '@/features/site/api'
import { getFirstTouchUTM, getLastTouchUTM } from '@/features/tracking/utm'

/*
 * BOB Points (bob-admin services/rewards). One balance per customer (their mobile number):
 * earned when a booking is completed and through referrals, spent at checkout.
 * Replaces the old browser-only points (lib/utils/bobRewards.ts).
 */

/** The programme rules (GET /public/config -> rewards; Admin → Settings → BOB Points). */
export interface RewardsProgram {
  enabled: boolean
  /** what 1 point is worth */
  pointValuePaise: number
  pointsPerBooking: number
  referrerPoints: number
  friendPoints: number
  maxRedeemPercent: number
}

/** Regular customers (GET /public/config -> loyalty; Admin → Settings → Regular customers). */
export interface LoyaltyProgram {
  enabled: boolean
  /** completed bookings before a customer counts as regular */
  minCompletedBookings: number
  rewardType: 'discount' | 'points' | 'both'
  bonusPoints: number
  discountType: 'percent' | 'flat'
  /** percent, or paise for a flat discount */
  discountValue: number
  maxDiscountPaise: number | null
}

export interface RewardHistoryItem {
  id: string
  type: string
  label: string
  points: number
  note: string
  bookingNumber: string | null
  createdAt: string
}

/** GET /public/me/rewards */
export interface MyRewards {
  enabled: boolean
  balance: number
  valuePaise: number
  pointValuePaise: number
  pointsPerBooking: number
  maxRedeemPercent: number
  /** points the customer's upcoming confirmed bookings earn once completed */
  upcomingPoints: number
  referral: { code: string | null; referrerPoints: number; friendPoints: number; invited: number; rewarded: number }
  repeatGuest: { completedBookings: number; needed: number; active: boolean; discount: boolean; bonusPoints: number }
  history: RewardHistoryItem[]
}

export const rewardsKeys = { me: (token: string | null) => ['rewards', 'me', token] as const }

/** The programme rules, for everyone (signed in or not). */
export function useRewardsProgram(): RewardsProgram | null {
  const { data } = useSiteConfig()
  return data?.rewards ?? null
}

/** The signed-in customer's points; null while signed out. */
export function useMyRewards() {
  const session = useCustomerSession()
  const token = session?.token ?? null
  return useQuery({
    queryKey: rewardsKeys.me(token),
    queryFn: () => api.get<MyRewards>('/me/rewards', token!),
    enabled: Boolean(token),
    staleTime: 30_000,
  })
}

/** Link a customer shares: /book?ref=<their code>. */
export const referralUrl = (code: string, baseUrl = window.location.origin) => `${baseUrl}/book?ref=${encodeURIComponent(code)}`

/** The referral code this visitor arrived with (first link wins, so a later visit cannot replace the friend who referred them). */
export function arrivedWithReferralCode(): string | undefined {
  const code = getFirstTouchUTM()?.ref ?? getLastTouchUTM()?.ref
  const clean = code?.trim().toUpperCase()
  return clean && /^[A-Z0-9]{4,16}$/.test(clean) ? clean : undefined
}

/**
 * Opens the share sheet (or copies the link). Returns 'shared' | 'copied' | 'dismissed'.
 * Without a referral code (signed out) the plain booking link is shared.
 */
export async function shareLink({ url, text, title = 'BOB Talkies' }: { url: string; text: string; title?: string }): Promise<'shared' | 'copied' | 'dismissed'> {
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url })
      return 'shared'
    }
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'dismissed'
  }
}

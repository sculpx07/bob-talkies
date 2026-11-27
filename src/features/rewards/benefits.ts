import type { LucideIcon } from 'lucide-react'
import { Gift, Heart, RotateCcw, ShieldCheck, Ticket, Users } from 'lucide-react'
import { useSiteConfig } from '@/features/site/api'
import { formatINR } from '@/lib/utils/currency'
import type { LoyaltyProgram, RewardsProgram } from './api'

/*
 * The BOB Club benefits shown on the home page and the Rewards page, written from the
 * live rules in Admin → Settings (BOB Points and Regular customers), so the website
 * never promises something the system does not do.
 */

export interface ClubBenefit {
  key: string
  icon: LucideIcon
  title: string
  /** one short line (home page) */
  short: string
  /** a sentence (Rewards page) */
  long: string
  badge: string
}

const pts = (n: number) => `${n.toLocaleString('en-IN')} pts`

/** "10% off" / "₹250 off" (with a cap: "10% off (up to ₹500)") */
function discountText(l: LoyaltyProgram): string {
  const amount = l.discountType === 'percent' ? `${l.discountValue}% off` : `${formatINR(l.discountValue)} off`
  return l.discountType === 'percent' && l.maxDiscountPaise ? `${amount} (up to ${formatINR(l.maxDiscountPaise)})` : amount
}

/** What a regular customer gets, in words; null when the regular-customer rewards are off. */
export function regularCustomerText(l: LoyaltyProgram | undefined, r: RewardsProgram | undefined): { short: string; long: string } | null {
  if (!l?.enabled) return null
  const after = `After ${l.minCompletedBookings} celebration${l.minCompletedBookings === 1 ? '' : 's'}`
  const discount = l.rewardType !== 'points' ? discountText(l) : null
  const bonus = l.rewardType !== 'discount' && r?.enabled && l.bonusPoints > 0 ? `${l.bonusPoints.toLocaleString('en-IN')} bonus points` : null
  const parts = [discount && `${discount} every booking`, bonus && `${bonus} every celebration`].filter(Boolean)
  if (!parts.length) return null
  return {
    short: `${after}: ${parts.join(' + ')}.`,
    long: `${after} with us you are a regular: ${parts.join(', plus ')}, automatically — no code needed.`,
  }
}

export function buildClubBenefits(r: RewardsProgram | undefined, l: LoyaltyProgram | undefined): ClubBenefit[] {
  if (!r?.enabled) return []
  const pointWorth = formatINR(r.pointValuePaise)
  const perBookingWorth = formatINR(r.pointsPerBooking * r.pointValuePaise)
  const regular = regularCustomerText(l, r)
  return [
    {
      key: 'earn', icon: Gift, badge: 'Points', title: 'Earn BOB Points',
      short: `+${pts(r.pointsPerBooking)} every celebration.`,
      long: `Every completed celebration earns ${pts(r.pointsPerBooking)} (worth ${perBookingWorth}). 1 point = ${pointWorth}.`,
    },
    {
      key: 'refer', icon: Users, badge: 'Referral', title: 'Refer & Earn',
      short: `${pts(r.referrerPoints)} for you, ${pts(r.friendPoints)} for a friend.`,
      long: `Share your link. When a friend completes their first celebration, you get ${pts(r.referrerPoints)} and they get ${pts(r.friendPoints)}.`,
    },
    {
      key: 'pay', icon: Ticket, badge: 'Save', title: 'Pay with Points',
      short: `Use points for up to ${r.maxRedeemPercent}% of a booking.`,
      long: `Turn on “Use my BOB Points” when you pay: points cover up to ${r.maxRedeemPercent}% of your booking.`,
    },
    ...(regular
      ? [{ key: 'regular', icon: Heart, badge: 'Loyalty', title: 'Repeat Guest Perks', short: regular.short, long: regular.long }]
      : []),
    {
      key: 'safe', icon: ShieldCheck, badge: 'Safe', title: 'Points Never Lost',
      short: 'Cancelled? Your points come back.',
      long: 'If a booking is cancelled or not paid, every point you used goes straight back to your account.',
    },
    {
      key: 'track', icon: RotateCcw, badge: 'Easy', title: 'Track Anytime',
      short: 'See your points in My Booking.',
      long: 'Sign in with your mobile number on My Booking to see your points, what is on the way and your referral link.',
    },
  ]
}

/**
 * The live benefits. `loading` while the settings load; an empty list when BOB Points are off.
 */
export function useClubBenefits() {
  const { data, isLoading } = useSiteConfig()
  return {
    loading: isLoading,
    enabled: Boolean(data?.rewards?.enabled),
    program: data?.rewards ?? null,
    loyalty: data?.loyalty ?? null,
    benefits: buildClubBenefits(data?.rewards, data?.loyalty),
  }
}

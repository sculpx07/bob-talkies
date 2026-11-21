import type { BadgeTone } from '@/admin/components/ui'
import { formatPaise } from '@/admin/lib/utils/money'
import { formatDays } from '@/admin/features/slots/utils'
import type { Offer, OfferStatus } from './types'

export const OFFER_STATUS_BADGE: Record<OfferStatus, { label: string; tone: BadgeTone }> = {
  active: { label: 'Active', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  expired: { label: 'Expired', tone: 'neutral' },
  inactive: { label: 'Switched off', tone: 'neutral' },
  exhausted: { label: 'Used up', tone: 'warning' },
}

export const OFFER_STATUS_ORDER: OfferStatus[] = ['active', 'scheduled', 'exhausted', 'expired', 'inactive']

/** "₹500 off" / "10% off, up to ₹1,000" */
export function formatDiscount(o: Pick<Offer, 'discountType' | 'discountValue' | 'maxDiscountPaise'>): string {
  if (o.discountType === 'flat') return `${formatPaise(o.discountValue)} off`
  return `${o.discountValue}% off${o.maxDiscountPaise !== null ? `, up to ${formatPaise(o.maxDiscountPaise)}` : ''}`
}

/** Short list of the rules that limit an offer. */
export function offerRules(o: Offer): string[] {
  return [
    o.minOrderPaise !== null && `Min order ${formatPaise(o.minOrderPaise)}`,
    o.theatres.length > 0 && o.theatres.map((t) => t.name).join(', '),
    o.applicableDays.length < 7 && formatDays(o.applicableDays),
    o.firstBookingOnly && 'First booking only',
    o.perCustomerLimit !== null && `${o.perCustomerLimit}× per customer`,
    !o.isPublic && 'Hidden code',
  ].filter((r): r is string => Boolean(r))
}

/** "3 used" / "3 of 100 used" */
export const formatUsage = (o: Pick<Offer, 'usedCount' | 'usageLimit'>) =>
  o.usageLimit === null ? `${o.usedCount} used` : `${o.usedCount} of ${o.usageLimit} used`

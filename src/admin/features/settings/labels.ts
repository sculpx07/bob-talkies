import { formatPaise } from '@/admin/lib/utils/money'

/** Human names for setting paths, and how to show their values (used in the history and the save summary). */
const LABELS: Record<string, { label: string; format?: (v: unknown) => string }> = {
  'pricing.gstPercent': { label: 'GST', format: (v) => `${v}%` },
  'pricing.pricesIncludeGst': { label: 'Prices include GST', format: (v) => (v ? 'Yes' : 'No') },
  'pricing.advancePercent': { label: 'Advance', format: (v) => `${v}%` },
  'pricing.allowFullPayment': { label: 'Allow full payment', format: (v) => (v ? 'Yes' : 'No') },
  'pricing.decorationPricePaise': { label: 'Decoration price', format: (v) => formatPaise(Number(v)) },
  'booking.slotHoldMinutes': { label: 'Slot hold', format: (v) => `${v} min` },
  'booking.minLeadHours': { label: 'Minimum notice', format: (v) => `${v} h` },
  'booking.maxAdvanceDays': { label: 'Booking window', format: (v) => `${v} days` },
  'booking.refundCutoffHours': { label: 'Refund cut-off', format: (v) => `${v} h` },
  'booking.allowCustomerEdits': { label: 'Customers can change their booking', format: (v) => (v ? 'Yes' : 'No') },
  'booking.customerEditCutoffMinutes': { label: 'Changes close before the slot', format: (v) => `${v} min` },
  'contact.whatsappNumber': { label: 'WhatsApp' },
  'contact.phone': { label: 'Phone' },
  'contact.email': { label: 'Email' },
  'contact.address': { label: 'Address' },
  'reviews.googleRating': { label: 'Rating shown on website', format: (v) => `${Number(v).toFixed(1)} ★` },
  'payments.provider': { label: 'Payment provider', format: (v) => (v === 'razorpay' ? 'Razorpay' : v === 'dev' ? 'Test payment screen' : String(v)) },
  'payments.razorpay.keyId': { label: 'Razorpay Key ID' },
  'payments.razorpay.keySecret': { label: 'Razorpay Key Secret' },
  'payments.razorpay.webhookSecret': { label: 'Razorpay Webhook Secret' },
  'loyalty.enabled': { label: 'Regular-customer discount', format: (v) => (v ? 'On' : 'Off') },
  'loyalty.minCompletedBookings': { label: 'Regular after', format: (v) => `${v} completed booking(s)` },
  'loyalty.discountType': { label: 'Regular discount type', format: (v) => (v === 'flat' ? 'Flat amount' : 'Percent') },
  'loyalty.discountValue': { label: 'Regular discount' },
  'loyalty.maxDiscountPaise': { label: 'Regular discount cap', format: (v) => formatPaise(Number(v)) },
  'loyalty.label': { label: 'Regular discount name on bill' },
  'loyalty.stackWithCoupons': { label: 'Combine with coupons', format: (v) => (v ? 'Yes' : 'No') },
  'loyalty.rewardType': { label: 'Regular customers get', format: (v) => ({ discount: 'Discount', points: 'Bonus points', both: 'Discount + bonus points' } as Record<string, string>)[String(v)] ?? String(v) },
  'loyalty.bonusPoints': { label: 'Regular bonus points', format: (v) => Number(v).toLocaleString('en-IN') + ' pts' },
  'rewards.enabled': { label: 'BOB Points', format: (v) => (v ? 'On' : 'Off') },
  'rewards.pointValuePaise': { label: 'Value of 1 point', format: (v) => formatPaise(Number(v)) },
  'rewards.pointsPerBooking': { label: 'Points per completed booking', format: (v) => Number(v).toLocaleString('en-IN') + ' pts' },
  'rewards.referrerPoints': { label: 'Referrer gets', format: (v) => Number(v).toLocaleString('en-IN') + ' pts' },
  'rewards.friendPoints': { label: 'Referred friend gets', format: (v) => Number(v).toLocaleString('en-IN') + ' pts' },
  'rewards.maxRedeemPercent': { label: 'Points can pay up to', format: (v) => v + '% of a booking' },
  'rewards.minRedeemPoints': { label: 'Fewest points per use', format: (v) => Number(v).toLocaleString('en-IN') + ' pts' },
  'rewards.monthlyReferralCap': { label: 'Referral rewards per person per month', format: (v) => String(v) },
  'reviews.googleReviewCount': { label: 'Review count shown on website', format: (v) => Number(v).toLocaleString('en-IN') },
}

export const settingLabel = (path: string) => LABELS[path]?.label ?? path

export function formatSettingValue(path: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  const format = LABELS[path]?.format
  return format ? format(value) : String(value)
}

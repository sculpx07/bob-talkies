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
  'contact.whatsappNumber': { label: 'WhatsApp' },
  'contact.phone': { label: 'Phone' },
  'contact.email': { label: 'Email' },
  'contact.address': { label: 'Address' },
}

export const settingLabel = (path: string) => LABELS[path]?.label ?? path

export function formatSettingValue(path: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  const format = LABELS[path]?.format
  return format ? format(value) : String(value)
}

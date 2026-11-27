import { z } from 'zod'
import { paiseToRupees, rupeesToPaise } from '@/admin/lib/utils/money'
import type { SettingChange, Settings, SettingsPatch, SettingsSection } from './types'

export const SETTINGS_SECTIONS: SettingsSection[] = ['pricing', 'booking', 'contact', 'reviews', 'loyalty']

const whole = (min: number, max: number, label: string) =>
  z.number({ error: `Enter ${label}` }).int('Whole number').min(min, `At least ${min}`).max(max, `At most ${max}`)

/** Settings form (decoration price in rupees). Limits mirror the backend. */
export const settingsFormSchema = z.object({
  pricing: z.object({
    gstPercent: z.number({ error: 'Enter GST %' }).min(0, 'At least 0').max(100, 'At most 100')
      .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-9, 'At most 2 decimal places'),
    pricesIncludeGst: z.boolean(),
    advancePercent: whole(1, 100, 'the advance %'),
    allowFullPayment: z.boolean(),
    decorationPrice: z.number({ error: 'Enter a price' }).min(0, 'Cannot be negative').max(1_000_000),
  }),
  booking: z.object({
    slotHoldMinutes: whole(1, 60, 'minutes'),
    minLeadHours: whole(0, 168, 'hours'),
    maxAdvanceDays: whole(1, 365, 'days'),
    refundCutoffHours: whole(0, 720, 'hours'),
  }),
  contact: z.object({
    whatsappNumber: z.string().trim().regex(/^\d{10,15}$/, 'Digits only with country code, e.g. 919876543210'),
    phone: z.string().trim().min(5, 'Too short').max(30),
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    address: z.string().trim().min(5, 'Too short').max(300),
  }),
  reviews: z.object({
    googleRating: z.number({ error: 'Enter the rating' }).min(0, 'At least 0').max(5, 'At most 5')
      .refine((n) => Math.abs(n * 10 - Math.round(n * 10)) < 1e-9, 'One decimal place, e.g. 4.9'),
    googleReviewCount: whole(0, 10_000_000, 'the count'),
  }),
  loyalty: z.object({
    enabled: z.boolean(),
    minCompletedBookings: whole(1, 100, 'the number of bookings'),
    discountType: z.enum(['percent', 'flat']),
    /** percent, or rupees for a flat discount */
    discountValue: z.number({ error: 'Enter the discount' }).positive('More than 0').max(100_000),
    /** rupees; empty = no cap */
    maxDiscount: z.number().positive('More than 0').max(100_000).optional(),
    label: z.string().trim().min(2, 'At least 2 characters').max(40),
    stackWithCoupons: z.boolean(),
  }).superRefine((l, ctx) => {
    if (l.discountType === 'percent' && (!Number.isInteger(l.discountValue) || l.discountValue > 50)) {
      ctx.addIssue({ code: 'custom', path: ['discountValue'], message: 'A whole percent, at most 50' })
    }
  }),
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>

export function settingsToForm(s: Settings): SettingsFormValues {
  const { decorationPricePaise, ...pricing } = s.pricing
  return {
    pricing: { ...pricing, decorationPrice: Number(paiseToRupees(decorationPricePaise)) },
    booking: { ...s.booking },
    contact: { ...s.contact },
    reviews: { ...s.reviews },
    loyalty: {
      ...s.loyalty,
      discountValue: s.loyalty.discountType === 'flat' ? Number(paiseToRupees(s.loyalty.discountValue)) : s.loyalty.discountValue,
      maxDiscount: s.loyalty.maxDiscountPaise ? Number(paiseToRupees(s.loyalty.maxDiscountPaise)) : undefined,
    },
  }
}

function formToSettings(v: SettingsFormValues): Pick<Settings, SettingsSection> {
  const { decorationPrice, ...pricing } = v.pricing
  return {
    pricing: { ...pricing, decorationPricePaise: rupeesToPaise(decorationPrice) ?? 0 },
    booking: v.booking,
    contact: { ...v.contact, email: v.contact.email.trim().toLowerCase() },
    reviews: v.reviews,
    loyalty: (() => {
      const { maxDiscount, ...l } = v.loyalty
      return {
        ...l,
        label: l.label.trim(),
        discountValue: l.discountType === 'flat' ? rupeesToPaise(l.discountValue) ?? 0 : l.discountValue,
        // a cap only limits a percent discount
        maxDiscountPaise: l.discountType === 'percent' && maxDiscount ? rupeesToPaise(maxDiscount) ?? null : null,
      }
    })(),
  }
}

/** Only what changed, as a PATCH body plus a readable list of changes. */
export function diffSettings(current: Settings, values: SettingsFormValues): { patch: SettingsPatch; changes: SettingChange[] } {
  const next = formToSettings(values)
  const patch: Record<string, Record<string, unknown>> = {}
  const changes: SettingChange[] = []
  for (const section of SETTINGS_SECTIONS) {
    for (const [field, to] of Object.entries(next[section])) {
      const from = (current[section] as Record<string, unknown>)[field]
      if (from === to) continue
      patch[section] = { ...patch[section], [field]: to }
      changes.push({ path: `${section}.${field}`, from, to })
    }
  }
  return { patch: patch as SettingsPatch, changes }
}

import { z } from 'zod'
import { addMonths, format } from 'date-fns'
import { paiseToRupees, rupeesToPaise } from '@/admin/lib/utils/money'
import { todayISO } from '@/admin/lib/utils/date'
import type { Offer, OfferInput } from './types'

const money = z.number().min(0, 'Cannot be negative').max(10_000_000, 'Too large').or(z.nan())
const limit = z.number().int('Whole number').min(1, 'At least 1').max(1_000_000).or(z.nan())
const has = (n: number) => !Number.isNaN(n)

/**
 * Offer form. Flat discounts are entered in rupees, percent discounts as a whole
 * percentage. Empty limits mean "no limit". Rules mirror the backend.
 */
export const offerFormSchema = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,20}$/, '3-20 letters or numbers, no spaces'),
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
    description: z.string().trim().max(1000),
    badge: z.string().trim().max(30),
    discountType: z.enum(['flat', 'percent']),
    discountValue: z.number({ error: 'Enter the discount' }).positive('Must be more than 0'),
    maxDiscount: money,
    minOrder: money,
    allTheatres: z.boolean(),
    theatres: z.array(z.string()),
    applicableDays: z.array(z.number()).min(1, 'Pick at least one day'),
    firstBookingOnly: z.boolean(),
    validFrom: z.string().min(1, 'Pick a start date'),
    validUntil: z.string().min(1, 'Pick an end date'),
    usageLimit: limit,
    perCustomerLimit: limit,
    isActive: z.boolean(),
    isPublic: z.boolean(),
    sortOrder: z.number({ error: 'Enter a number' }).int().min(0).max(10000),
  })
  .superRefine((v, ctx) => {
    if (v.discountType === 'percent') {
      if (!Number.isInteger(v.discountValue)) ctx.addIssue({ code: 'custom', path: ['discountValue'], message: 'Whole percent only' })
      if (v.discountValue > 100) ctx.addIssue({ code: 'custom', path: ['discountValue'], message: 'At most 100%' })
    }
    if (v.validFrom && v.validUntil && v.validUntil < v.validFrom) ctx.addIssue({ code: 'custom', path: ['validUntil'], message: 'Cannot be before the start date' })
    if (!v.allTheatres && !v.theatres.length) ctx.addIssue({ code: 'custom', path: ['theatres'], message: 'Pick at least one theatre, or allow every theatre' })
  })

export type OfferFormValues = z.infer<typeof offerFormSchema>

export const OFFER_FORM_FIELDS = Object.keys(offerFormSchema.shape)

/** API -> form field names. */
export const offerFieldMap = (f: string) =>
  ({ maxDiscountPaise: 'maxDiscount', minOrderPaise: 'minOrder' } as Record<string, string>)[f] ?? f

const rupees = (paise: number | null) => (paise === null ? NaN : Number(paiseToRupees(paise)))
const paise = (r: number) => (has(r) ? rupeesToPaise(r) : null)

export function emptyOfferForm(): OfferFormValues {
  const today = todayISO()
  return {
    code: '', title: '', description: '', badge: '',
    discountType: 'flat', discountValue: NaN, maxDiscount: NaN, minOrder: NaN,
    allTheatres: true, theatres: [], applicableDays: [0, 1, 2, 3, 4, 5, 6], firstBookingOnly: false,
    validFrom: today, validUntil: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    usageLimit: NaN, perCustomerLimit: NaN,
    isActive: true, isPublic: true, sortOrder: 0,
  }
}

export function offerToForm(o: Offer): OfferFormValues {
  return {
    code: o.code, title: o.title, description: o.description, badge: o.badge,
    discountType: o.discountType,
    discountValue: o.discountType === 'flat' ? Number(paiseToRupees(o.discountValue)) : o.discountValue,
    maxDiscount: rupees(o.maxDiscountPaise),
    minOrder: rupees(o.minOrderPaise),
    allTheatres: o.theatres.length === 0,
    theatres: o.theatres.map((t) => t.id),
    applicableDays: o.applicableDays,
    firstBookingOnly: o.firstBookingOnly,
    validFrom: o.validFrom, validUntil: o.validUntil,
    usageLimit: o.usageLimit ?? NaN,
    perCustomerLimit: o.perCustomerLimit ?? NaN,
    isActive: o.isActive, isPublic: o.isPublic, sortOrder: o.sortOrder,
  }
}

export function formToOfferInput(v: OfferFormValues): OfferInput {
  const flat = v.discountType === 'flat'
  return {
    code: v.code.trim().toUpperCase(),
    title: v.title, description: v.description, badge: v.badge,
    discountType: v.discountType,
    discountValue: flat ? rupeesToPaise(v.discountValue) ?? 0 : v.discountValue,
    maxDiscountPaise: flat ? null : paise(v.maxDiscount),
    minOrderPaise: paise(v.minOrder),
    theatres: v.allTheatres ? [] : v.theatres,
    applicableDays: v.applicableDays,
    firstBookingOnly: v.firstBookingOnly,
    validFrom: v.validFrom, validUntil: v.validUntil,
    usageLimit: has(v.usageLimit) ? v.usageLimit : null,
    perCustomerLimit: has(v.perCustomerLimit) ? v.perCustomerLimit : null,
    isActive: v.isActive, isPublic: v.isPublic, sortOrder: v.sortOrder,
  }
}

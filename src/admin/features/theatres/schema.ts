import { z } from 'zod'
import { LOCATIONS } from '@/admin/constants/catalog'
import { paiseToRupees, rupeesToPaise } from '@/admin/lib/utils/money'
import type { Theatre, TheatreInput } from './types'

const num = (label: string) => z.number({ error: `Enter ${label}` }).finite({ error: `Enter ${label}` })
const guests = (label: string) => num(label).int('Whole number').min(1, 'At least 1').max(500, 'At most 500')
const rupees = (label: string) => num(label).min(0, 'Cannot be negative').max(10_000_000, 'Too large')
const text = (max: number) => z.string().trim().max(max, `At most ${max} characters`)

/** The theatre form. Prices are entered in rupees and sent as paise. Rules mirror the backend. */
export const theatreFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    slug: z.string().trim().toLowerCase().max(100).refine((v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), 'Use a-z, 0-9 and single dashes'),
    tagline: text(150),
    description: text(2000),
    capacityMin: guests('the minimum guests'),
    capacityMax: guests('the maximum guests'),
    includedGuests: guests('the included guests'),
    screenSize: text(50),
    resolution: text(50),
    soundSystem: text(100),
    seatingType: text(100),
    facilities: z.array(z.string()).max(50),
    suitableFor: z.array(z.string()).max(30),
    weekdayPrice: rupees('a weekday price'),
    weekendPrice: rupees('a weekend price'),
    extraGuestPrice: rupees('an extra guest price'),
    durationNote: text(100),
    videoUrl: z.string().trim().refine((v) => !v || /^https?:\/\/\S+$/.test(v), 'Enter a full URL starting with http'),
    currentOffer: z.string(),
    locationId: z.string(),
    sortOrder: z.number({ error: 'Enter a number' }).int().min(0).max(10000),
    isActive: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.capacityMin > v.capacityMax) ctx.addIssue({ code: 'custom', path: ['capacityMin'], message: 'Cannot be more than the maximum' })
    if (v.includedGuests > v.capacityMax) ctx.addIssue({ code: 'custom', path: ['includedGuests'], message: 'Cannot be more than the maximum' })
  })

export type TheatreFormValues = z.infer<typeof theatreFormSchema>

/** Form field names, for mapping backend errors onto them. */
export const THEATRE_FORM_FIELDS = Object.keys(theatreFormSchema.shape) as Array<keyof TheatreFormValues>

/** Backend field -> form field, where they differ. */
export const THEATRE_FIELD_MAP = {
  weekdayPricePaise: 'weekdayPrice',
  weekendPricePaise: 'weekendPrice',
  extraGuestPricePaise: 'extraGuestPrice',
} as const

export const emptyTheatreForm: TheatreFormValues = {
  name: '', slug: '', tagline: '', description: '',
  capacityMin: 2, capacityMax: 4, includedGuests: 2,
  screenSize: '', resolution: '4K', soundSystem: '', seatingType: '',
  facilities: [], suitableFor: [],
  weekdayPrice: NaN, weekendPrice: NaN, extraGuestPrice: 0,
  durationNote: '', videoUrl: '', currentOffer: '', locationId: LOCATIONS[0].id,
  sortOrder: 0, isActive: true,
}

export function theatreToForm(t: Theatre): TheatreFormValues {
  return {
    name: t.name, slug: t.slug, tagline: t.tagline, description: t.description,
    capacityMin: t.capacityMin, capacityMax: t.capacityMax, includedGuests: t.includedGuests,
    screenSize: t.screenSize, resolution: t.resolution, soundSystem: t.soundSystem, seatingType: t.seatingType,
    facilities: t.facilities, suitableFor: t.suitableFor,
    weekdayPrice: Number(paiseToRupees(t.weekdayPricePaise)),
    weekendPrice: Number(paiseToRupees(t.weekendPricePaise)),
    extraGuestPrice: Number(paiseToRupees(t.extraGuestPricePaise)),
    durationNote: t.durationNote, videoUrl: t.videoUrl, currentOffer: t.currentOffer, locationId: t.locationId,
    sortOrder: t.sortOrder, isActive: t.isActive,
  }
}

export function formToTheatreInput(v: TheatreFormValues): Partial<TheatreInput> {
  const { weekdayPrice, weekendPrice, extraGuestPrice, slug, ...rest } = v
  return {
    ...rest,
    ...(slug && { slug }), // empty = let the backend make one from the name
    weekdayPricePaise: rupeesToPaise(weekdayPrice) ?? 0,
    weekendPricePaise: rupeesToPaise(weekendPrice) ?? 0,
    extraGuestPricePaise: rupeesToPaise(extraGuestPrice) ?? 0,
  }
}

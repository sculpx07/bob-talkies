import { z } from 'zod'

export const TheatreSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
  capacityMin: z.number().int(),
  capacityMax: z.number().int(),
  screenSize: z.string(),
  resolution: z.string(),
  soundSystem: z.string(),
  seatingType: z.string(),
  facilities: z.array(z.string()),
  suitableFor: z.array(z.string()),
  startingPricePaise: z.number().int(),
  weekdayPricePaise: z.number().int(),
  weekendPricePaise: z.number().int(),
  extraGuestPricePaise: z.number().int(),
  images: z.array(z.string()),
  videoUrl: z.string().optional(),
  currentOffer: z.string().optional(),
  locationId: z.string(),
  isActive: z.boolean(),
})

export type Theatre = z.infer<typeof TheatreSchema>

export const TheatreListSchema = z.array(TheatreSchema)

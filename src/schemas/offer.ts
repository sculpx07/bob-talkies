import { z } from 'zod'

export const OfferSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string(),
  discountType: z.enum(['percent', 'flat']),
  discountValue: z.number(),
  maxDiscountPaise: z.number().int().optional(),
  minOrderPaise: z.number().int().optional(),
  applicableTheatreIds: z.array(z.string()).optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  isActive: z.boolean(),
  badge: z.string().optional(),
  image: z.string().optional(),
})

export type Offer = z.infer<typeof OfferSchema>

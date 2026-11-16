import { z } from 'zod'

export const AddonCategorySchema = z.enum([
  'decoration', 'cake', 'flowers', 'photography', 'food', 'surprise', 'effects', 'signage', 'decor', 'gifts', 'videography',
])

export const AddonSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: AddonCategorySchema,
  pricePaise: z.number().int(),
  /** shown struck through when the item is on offer (pricePaise is what is charged) */
  originalPricePaise: z.number().int().optional(),
  image: z.string().optional(),
  leadTimeHours: z.number().int(),
  isAvailable: z.boolean(),
  isOutOfStock: z.boolean(),
  theatreIds: z.array(z.string()).optional(),
  /** cakes only: the cake this size belongs to, and the size label (e.g. "500 gm") */
  cakeName: z.string().optional(),
  sizeLabel: z.string().optional(),
})

export type Addon = z.infer<typeof AddonSchema>
export type AddonCategory = z.infer<typeof AddonCategorySchema>

import { z } from 'zod'

export const AddonCategorySchema = z.enum([
  'decoration', 'cake', 'flowers', 'photography', 'food', 'surprise', 'effects', 'signage',
])

export const AddonSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: AddonCategorySchema,
  pricePaise: z.number().int(),
  image: z.string().optional(),
  leadTimeHours: z.number().int(),
  isAvailable: z.boolean(),
  isOutOfStock: z.boolean(),
  theatreIds: z.array(z.string()).optional(),
})

export type Addon = z.infer<typeof AddonSchema>
export type AddonCategory = z.infer<typeof AddonCategorySchema>

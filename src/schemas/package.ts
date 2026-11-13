import { z } from 'zod'

export const PackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: z.enum(['silver', 'gold', 'diamond', 'platinum', 'custom']),
  description: z.string(),
  inclusions: z.array(z.string()),
  includedGuests: z.number().int(),
  pricePaise: z.number().int(),
  weekendPricePaise: z.number().int(),
  theatreIds: z.array(z.string()),
  isAvailable: z.boolean(),
  badge: z.string().optional(),
})

export type Package = z.infer<typeof PackageSchema>

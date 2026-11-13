import { z } from 'zod'

export const LeadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  occasion: z.string().optional(),
  message: z.string().min(10, 'Please describe how we can help').max(1000),
  consentWhatsapp: z.boolean(),
  source: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
})

export type Lead = z.infer<typeof LeadSchema>

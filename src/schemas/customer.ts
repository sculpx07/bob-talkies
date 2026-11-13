import { z } from 'zod'

export const CustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  specialInstructions: z.string().max(500).optional(),
  birthday: z.string().optional(),
  anniversary: z.string().optional(),
  consentTnC: z.boolean().refine((v) => v === true, {
    message: 'You must accept the Terms & Conditions',
  }),
  consentWhatsapp: z.boolean(),
})

export type Customer = z.infer<typeof CustomerSchema>

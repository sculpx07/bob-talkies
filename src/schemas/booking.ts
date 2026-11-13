import { z } from 'zod'

export const BookingStatusSchema = z.enum([
  'PENDING', 'SLOT_HELD', 'PAYMENT_PENDING', 'CONFIRMED',
  'COMPLETED', 'CANCELLED', 'FAILED',
])
export type BookingStatus = z.infer<typeof BookingStatusSchema>

export const BookingRequestSchema = z.object({
  theatreId: z.string(),
  packageId: z.string(),
  date: z.string(), // YYYY-MM-DD
  slotId: z.string(),
  occasion: z.string(),
  guests: z.number().int().min(1),
  addonIds: z.array(z.string()),
  couponCode: z.string().optional(),
  customerName: z.string().min(2),
  customerMobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  customerEmail: z.string().email().optional(),
  specialInstructions: z.string().optional(),
  consentTnC: z.boolean().refine((v) => v, 'You must accept T&C'),
  consentWhatsapp: z.boolean(),
})
export type BookingRequest = z.infer<typeof BookingRequestSchema>

export const BookingSchema = z.object({
  id: z.string(),
  status: BookingStatusSchema,
  theatreId: z.string(),
  theatreName: z.string(),
  packageId: z.string(),
  packageName: z.string(),
  date: z.string(),
  slotId: z.string(),
  slotStart: z.string(),
  slotEnd: z.string(),
  occasion: z.string(),
  guests: z.number().int(),
  addonIds: z.array(z.string()),
  couponCode: z.string().optional(),
  customerName: z.string(),
  customerMobile: z.string(),
  customerEmail: z.string().optional(),
  specialInstructions: z.string().optional(),
  totalPaise: z.number().int(),
  advancePaidPaise: z.number().int(),
  balancePaise: z.number().int(),
  passToken: z.string().optional(),
  createdAt: z.string(),
  slotHoldExpiresAt: z.string().optional(),
})
export type Booking = z.infer<typeof BookingSchema>

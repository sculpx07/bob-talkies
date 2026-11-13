export const THEATRE_SLUGS = ['delight', 'heavens', 'filmdom', 'cosmos', 'vibe-hall'] as const
export type TheatreSlug = (typeof THEATRE_SLUGS)[number]

export const OCCASION_SLUGS = [
  'birthday', 'anniversary', 'date-night', 'proposal',
  'family', 'friends', 'sports-screening', 'corporate',
] as const
export type OccasionSlug = (typeof OCCASION_SLUGS)[number]

export const BOOKING_STEPS = [
  'occasion', 'guests', 'location', 'date', 'theatre-slot',
  'package', 'addons', 'coupon', 'summary', 'details', 'payment',
] as const
export type BookingStep = (typeof BOOKING_STEPS)[number]

export const GUEST_OPTIONS = [2, 4, 6, 8, 10, 15, 20, 30] as const

export const WHATSAPP_DEFAULT_MSG = 'Hi! I\'d like to book a private theatre at BOB Talkies.'

export const ADVANCE_PAYMENT_PERCENT = 30

export const SLOT_HOLD_DURATION_MS = 10 * 60 * 1000 // 10 minutes

export const OTP_RESEND_COOLDOWN_S = 30

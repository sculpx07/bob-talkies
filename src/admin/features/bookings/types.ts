import type { UserRef } from '@/admin/types/api'
import type { DaySchedule } from '@/admin/features/slots/types'

/** Booking shapes from the bob-admin backend (src/models/booking.model.js). Money is paise. */

export type BookingStatus = 'SLOT_HELD' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED' | 'FAILED'
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid'
export type BookingSource = 'website' | 'phone' | 'whatsapp' | 'walk_in' | 'admin'
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'online'

/** A row in the bookings list (no payments / history). */
export interface BookingListItem {
  id: string
  bookingNumber: string
  status: BookingStatus
  source: BookingSource
  theatre: string
  theatreName: string
  slot: string
  slotStart: string
  slotEnd: string
  date: string
  occasion: string
  guests: number
  kids: number
  customer: { name: string; mobile: string; email: string }
  totalPaise: number
  amountPaidPaise: number
  balanceDuePaise: number
  paymentStatus: PaymentStatus
  /** money given back (processed refunds, Admin → Payments) */
  refundedPaise?: number
  /** BOB Points spent on it (given back if cancelled / unpaid) and earned when completed */
  rewards?: {
    pointsRedeemed: number
    pointValuePaise: number
    returnedAt: string | null
    pointsEarned: number
    regularBonusPoints?: number
    earnedAt: string | null
  }
  holdExpiresAt: string | null
  createdAt: string
}

export interface BookingPayment {
  id: string
  amountPaise: number
  method: PaymentMethod
  reference: string
  note: string
  receivedAt: string
  recordedBy: UserRef | null
}

export interface BookingLineItem {
  type: 'theatre' | 'extra_guests' | 'decoration' | 'addon' | 'slot_offer' | 'loyalty' | 'discount' | 'points' | 'tax'
  label: string
  paise: number
  /** GST already inside the prices: shown, not added */
  included: boolean
}

/** GET /bookings/:id */
export interface BookingDetail extends Omit<BookingListItem, 'theatre' | 'slot'> {
  theatre: { id: string; name: string; slug: string }
  slot: { id: string; startTime: string; endTime: string; label: string }
  decoration: boolean
  addons: Array<{ addon: string; variant: string | null; name: string; unitPricePaise: number; quantity: number; linePaise: number }>
  coupon: { code: string; offer: { id: string; code: string; title: string } | null; discountPaise: number } | null
  consentWhatsapp: boolean
  specialInstructions: string
  cakeRequest: string
  addonRequest: string
  internalNotes: string
  pricing: {
    lineItems: BookingLineItem[]
    subtotalPaise: number
    discountPaise: number
    gstPercent: number
    pricesIncludeGst: boolean
    gstPaise: number
    advancePercent: number
    advancePaise: number
  }
  payments: BookingPayment[]
  confirmedAt: string | null
  completedAt: string | null
  cancellation: { reason: string; at: string; by: UserRef | null; hoursBeforeSlot: number; refundEligible: boolean } | null
  passToken: string | null
  statusHistory: Array<{ from: BookingStatus | null; to: BookingStatus; at: string; by: UserRef | null; note: string }>
  reschedules: Array<{ fromDate: string; fromTime: string; toDate: string; toTime: string; reason: string; at: string; by: UserRef | null }>
  createdBy: UserRef | null
  updatedBy: UserRef | null
  updatedAt: string
}

export interface BookingListParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
  status?: BookingStatus[]
  theatre?: string
  date?: string
  from?: string
  to?: string
  source?: BookingSource
  paymentStatus?: PaymentStatus
}

/** GET /bookings/board?date= */
export interface DayBoard {
  date: string
  theatres: DaySchedule[]
}

export interface PaymentInput {
  amountPaise: number
  method: Exclude<PaymentMethod, 'online'>
  reference?: string
  note?: string
}

export interface BookingDetailsInput {
  customer?: Partial<BookingDetail['customer']>
  occasion?: string
  kids?: number
  specialInstructions?: string
  cakeRequest?: string
  addonRequest?: string
  internalNotes?: string
  consentWhatsapp?: boolean
}

/** A reason a booking or change is refused (409 details from the backend). */
export interface BookingIssue {
  code: string
  severity: 'error' | 'warning'
  message: string
}

/** An online payment attempt (Razorpay order or test-screen payment) for a website booking. */
export interface PaymentAttempt {
  id: string
  provider: 'dev' | 'razorpay'
  /** Razorpay: 'test' or 'live' keys */
  mode: string
  orderId: string
  amountPaise: number
  payFull: boolean
  status: 'created' | 'paid' | 'failed'
  gatewayPaymentId: string
  confirmedVia: '' | 'test_screen' | 'checkout' | 'webhook'
  failureReason: string
  lastFailure: { code: string; description: string; at: string } | null
  /** money was taken but the booking could not be confirmed: refund the customer */
  refundNeeded: boolean
  paidAt: string | null
  failedAt: string | null
  createdAt: string
}

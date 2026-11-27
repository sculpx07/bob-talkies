import { api } from '@/lib/api/client'
import type { Booking } from '@/schemas/booking'
import type { Offer } from '@/schemas/offer'
import type { ServerQuote } from './state/booking.reducer'
import { customerSession } from '@/features/auth/session'

export interface QuoteRequest {
  theatreId: string
  date: string
  slotId: string
  guests: number
  decoration?: boolean
  addonIds: string[]
  couponCode?: string
  /** spend BOB Points (signed-in customer) */
  usePoints?: boolean
}

export interface BookingCreateRequest {
  theatreId: string
  date: string
  slotId: string
  occasion: string
  guests: number
  decoration?: boolean
  addonIds: string[]
  couponCode?: string
  customerName: string
  customerMobile: string
  customerEmail?: string
  specialInstructions?: string
  consentTnC: boolean
  consentWhatsapp: boolean
  usePoints?: boolean
  /** the ?ref= code of the referral link the customer arrived with */
  referralCode?: string
}

export interface PayOrderRequest {
  payFull?: boolean
}

export interface PayOrderResponse {
  bookingId: string
  gatewayOrderId: string
  amount: number
  currency: string
  key: string
  /** 'dev' = the test payment screen; 'razorpay' = the real gateway */
  provider: string
  /** Razorpay: 'test' or 'live' keys */
  mode?: string
  /** shown in Razorpay Checkout */
  name?: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
}

/** Razorpay Checkout's answer, sent to the backend to verify */
export interface RazorpayVerifyRequest {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

/** Entry pass (GET /passes/:token) */
export interface PassData {
  id: string; theatreName: string; date: string; slotStart: string; slotEnd: string;
  guests: number; customerName: string; packageName?: string; totalPaise: number;
  balancePaise: number; status: string; qrCode: string;
}

/** A change to a confirmed booking: the full new selection. */
export interface BookingEditRequest {
  /** everyone attending */
  guests: number
  decoration: boolean
  /** website add-on ids; a repeated id adds one more */
  addonIds: string[]
}

/** The new bill for a change, before saving. */
export interface BookingEditPreview {
  lineItems: Array<{ label: string; paise: number }>
  totalPaise: number
  previousTotalPaise: number
  differencePaise: number
  paidPaise: number
  balancePaise: number
  /** why the change cannot be saved (empty when it can) */
  problems: string[]
  belowPaid: boolean
}

export type TestPaymentResult = 'success' | 'failed'

export const bookingApi = {
  getQuote: (body: QuoteRequest) =>
    api.post<ServerQuote>('/pricing/quote', body, customerSession.token() ?? undefined),

  /** holds the slot; needs the customer's OTP login (sent automatically) */
  createBooking: (body: BookingCreateRequest) =>
    api.post<Booking>('/bookings', body, customerSession.token() ?? undefined),

  getBooking: (id: string) =>
    api.get<Booking>(`/bookings/${encodeURIComponent(id)}`),

  payBooking: (id: string, body: PayOrderRequest) =>
    api.post<PayOrderResponse>(`/bookings/${encodeURIComponent(id)}/pay`, body),

  /** the test payment screen's answer (only while the backend uses the 'dev' payment provider) */
  completeTestPayment: (orderId: string, result: TestPaymentResult) =>
    api.post<Booking>('/payments/dev/complete', { orderId, result }),

  /** verifies a Razorpay Checkout payment (signature + payment lookup) and confirms the booking */
  verifyRazorpayPayment: (body: RazorpayVerifyRequest) =>
    api.post<Booking>('/payments/razorpay/verify', body),

  getPass: (token: string) =>
    api.get<PassData>(`/passes/${encodeURIComponent(token)}`),

  /** the new bill for a change to the customer's booking (nothing saved) */
  previewEdit: (ref: string, body: BookingEditRequest, token: string) =>
    api.post<BookingEditPreview>(`/me/bookings/${encodeURIComponent(ref)}/edit-preview`, body, token),

  /** saves the change: re-priced, nothing to pay now (the balance at the venue changes) */
  editBooking: (ref: string, body: BookingEditRequest, token: string) =>
    api.patch<Booking>(`/me/bookings/${encodeURIComponent(ref)}`, body, token),

  /** the signed-in customer's bookings */
  myBookings: (token: string) =>
    api.get<{ data: Booking[]; total: number }>('/me/bookings', token),

  /** checks the code against the current selection with the same rules the quote uses */
  validateCoupon: (code: string, selection: Partial<QuoteRequest>) =>
    api.post<{ valid: boolean; offer: Offer }>('/coupons/validate', { code, ...selection }),
}

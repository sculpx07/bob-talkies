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
}

/** Entry pass (GET /passes/:token) */
export interface PassData {
  id: string; theatreName: string; date: string; slotStart: string; slotEnd: string;
  guests: number; customerName: string; packageName?: string; totalPaise: number;
  balancePaise: number; status: string; qrCode: string;
}

export type TestPaymentResult = 'success' | 'failed'

export const bookingApi = {
  getQuote: (body: QuoteRequest) =>
    api.post<ServerQuote>('/pricing/quote', body),

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

  getPass: (token: string) =>
    api.get<PassData>(`/passes/${encodeURIComponent(token)}`),

  /** the signed-in customer's bookings */
  myBookings: (token: string) =>
    api.get<{ data: Booking[]; total: number }>('/me/bookings', token),

  /** checks the code against the current selection with the same rules the quote uses */
  validateCoupon: (code: string, selection: Partial<QuoteRequest>) =>
    api.post<{ valid: boolean; offer: Offer }>('/coupons/validate', { code, ...selection }),
}

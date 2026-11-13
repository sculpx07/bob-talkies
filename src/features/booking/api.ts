import { api } from '@/lib/api/client'
import type { Booking } from '@/schemas/booking'
import type { ServerQuote } from './state/booking.reducer'

export interface QuoteRequest {
  theatreId: string
  packageId: string
  date: string
  slotId: string
  guests: number
  addonIds: string[]
  couponCode?: string
}

export interface BookingCreateRequest {
  theatreId: string
  packageId: string
  date: string
  slotId: string
  occasion: string
  guests: number
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
}

export const bookingApi = {
  getQuote: (body: QuoteRequest) =>
    api.post<ServerQuote>('/pricing/quote', body),

  createBooking: (body: BookingCreateRequest) =>
    api.post<Booking>('/bookings', body),

  getBooking: (id: string, token?: string) =>
    api.get<Booking>(`/bookings/${id}`, token),

  payBooking: (id: string, body: PayOrderRequest) =>
    api.post<PayOrderResponse>(`/bookings/${id}/pay`, body),

  addAddons: (id: string, addonIds: string[]) =>
    api.post<Booking>(`/bookings/${id}/addons`, { addonIds }),

  validateCoupon: (code: string, theatreId?: string) =>
    api.post<{ valid: boolean; offer: { discountType: string; discountValue: number; code: string } }>('/coupons/validate', { code, theatreId }),
}

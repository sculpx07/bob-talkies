import type { UserRef } from '@/admin/types/api'
import type { BookingStatus, PaymentMethod } from '@/admin/features/bookings/types'

/** Shapes from bob-admin /payments (money received and refunds). Money is paise. */

export type RefundStatus = 'pending' | 'processed' | 'failed'
export type RefundMethod = 'razorpay' | 'test' | 'cash' | 'upi' | 'bank_transfer' | 'card'

export interface ReceivedPayment {
  id: string
  amountPaise: number
  method: PaymentMethod
  reference: string
  note: string
  receivedAt: string
  recordedBy: UserRef | null
  refundedPaise: number
  booking: { id: string; bookingNumber: string; customerName: string; customerMobile: string; date: string; slotStart: string; status: BookingStatus; theatreName: string }
}

export interface PaymentsSummary {
  receivedPaise: number
  count: number
  byMethod: Array<{ method: PaymentMethod; amountPaise: number; count: number }>
  refundedPaise: number
  refundCount: number
  netPaise: number
}

export interface PaymentsPage {
  payments: ReceivedPayment[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
  summary: PaymentsSummary
}

export interface PaymentsParams {
  page?: number
  limit?: number
  sort?: string
  from?: string
  to?: string
  method?: PaymentMethod
  theatre?: string
  search?: string
}

export interface BookingRef {
  id: string
  bookingNumber: string
  customer: { name: string; mobile: string; email?: string }
  date: string
  slotStart: string
  status: BookingStatus
  theatre: { id: string; name: string } | null
}

export interface Refund {
  id: string
  booking: BookingRef
  source: { kind: 'payment' | 'order'; paymentId: string | null; paymentOrder: string | null }
  amountPaise: number
  method: RefundMethod
  status: RefundStatus
  reason: string
  reference: string
  note: string
  gateway: { refundId: string; paymentId: string; status: string; speed: string } | null
  failureReason: string
  processedAt: string | null
  createdBy: UserRef | null
  createdAt: string
}

export interface RefundsParams {
  page?: number
  limit?: number
  sort?: string
  status?: RefundStatus
  method?: RefundMethod
  from?: string
  to?: string
  search?: string
}

/** One entry of "To refund". */
export interface RefundQueueItem {
  kind: 'payment' | 'order'
  reason: string
  booking: BookingRef
  /** set for online payments that never became a booking payment */
  paymentOrderId?: string
  owedPaise: number
  since: string
  provider?: string
}

/** GET /bookings/:id/refunds: each payment with what can still be refunded, and the refunds. */
export interface RefundablePayment {
  kind: 'payment' | 'order'
  paymentId?: string
  paymentOrderId?: string
  method: PaymentMethod
  amountPaise: number
  reference: string
  receivedAt: string
  provider: string | null
  refundablePaise: number
  methods: RefundMethod[]
  note?: string
}

export interface BookingRefundInfo {
  payments: RefundablePayment[]
  refunds: Refund[]
}

export interface RefundInput {
  booking: string
  paymentId?: string
  paymentOrder?: string
  amountPaise: number
  method: RefundMethod
  reason: string
  reference?: string
  note?: string
}

import type { BadgeTone } from '@/admin/components/ui'
import type { RefundMethod, RefundStatus } from './types'

export const REFUND_METHOD_LABELS: Record<RefundMethod, string> = {
  razorpay: 'Razorpay (to the customer’s card / UPI)',
  test: 'Test payment (no money moves)',
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank transfer',
  card: 'Card (at the venue machine)',
}

/** Short labels for tables. */
export const REFUND_METHOD_SHORT: Record<RefundMethod, string> = {
  razorpay: 'Razorpay',
  test: 'Test',
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank transfer',
  card: 'Card',
}

export const REFUND_STATUS_BADGE: Record<RefundStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Processing', tone: 'warning' },
  processed: { label: 'Refunded', tone: 'success' },
  failed: { label: 'Failed', tone: 'danger' },
}

/** Refunds staff make themselves and record here: a reference is required. */
export const MANUAL_REFUND_METHODS: RefundMethod[] = ['cash', 'upi', 'bank_transfer', 'card']

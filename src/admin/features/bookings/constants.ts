import type { BadgeTone } from '@/admin/components/ui'
import type { BookingSource, BookingStatus, PaymentMethod, PaymentStatus } from './types'

/** How each booking status is shown (labels match what staff say, tones match urgency). */
export const BOOKING_STATUS_BADGE: Record<BookingStatus, { label: string; tone: BadgeTone }> = {
  SLOT_HELD: { label: 'Held', tone: 'warning' },
  PAYMENT_PENDING: { label: 'Payment pending', tone: 'warning' },
  CONFIRMED: { label: 'Confirmed', tone: 'success' },
  COMPLETED: { label: 'Completed', tone: 'brand' },
  NO_SHOW: { label: 'No-show', tone: 'danger' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
  FAILED: { label: 'Failed', tone: 'neutral' },
}

export const PAYMENT_STATUS_BADGE: Record<PaymentStatus, { label: string; tone: BadgeTone }> = {
  unpaid: { label: 'Unpaid', tone: 'danger' },
  partially_paid: { label: 'Part paid', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
}

/** Statuses that keep a slot taken (same as the backend's OCCUPYING_STATUSES). */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ['SLOT_HELD', 'PAYMENT_PENDING', 'CONFIRMED', 'COMPLETED', 'NO_SHOW']

/** Statuses whose details, extras and time can still be changed (backend EDITABLE_STATUSES). */
export const EDITABLE_STATUSES: BookingStatus[] = ['SLOT_HELD', 'PAYMENT_PENDING', 'CONFIRMED']

/** Allowed status changes (backend STATUS_TRANSITIONS). */
export const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  SLOT_HELD: ['PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'],
  PAYMENT_PENDING: ['CONFIRMED', 'CANCELLED', 'FAILED'],
  CONFIRMED: ['COMPLETED', 'NO_SHOW', 'CANCELLED'],
  COMPLETED: [],
  NO_SHOW: [],
  CANCELLED: [],
  FAILED: [],
}

export const canMoveTo = (from: BookingStatus, to: BookingStatus) => STATUS_TRANSITIONS[from].includes(to)

/** Payments can be recorded on these (backend PAYABLE). */
export const PAYABLE_STATUSES: BookingStatus[] = ['SLOT_HELD', 'PAYMENT_PENDING', 'CONFIRMED', 'COMPLETED', 'NO_SHOW']

export const SOURCE_LABELS: Record<BookingSource, string> = {
  website: 'Website',
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  walk_in: 'Walk-in',
  admin: 'Admin',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  bank_transfer: 'Bank transfer',
  online: 'Online (gateway)',
}

/** Methods staff can record by hand (online comes from the payment gateway). */
export const MANUAL_PAYMENT_METHODS = ['cash', 'upi', 'card', 'bank_transfer'] as const

export const STATUS_FILTER_OPTIONS: Array<{ value: string; label: string; statuses: BookingStatus[] }> = [
  { value: 'upcoming', label: 'Active (held + confirmed)', statuses: ['SLOT_HELD', 'PAYMENT_PENDING', 'CONFIRMED'] },
  { value: 'held', label: 'Held / payment pending', statuses: ['SLOT_HELD', 'PAYMENT_PENDING'] },
  { value: 'confirmed', label: 'Confirmed', statuses: ['CONFIRMED'] },
  { value: 'completed', label: 'Completed', statuses: ['COMPLETED'] },
  { value: 'no_show', label: 'No-show', statuses: ['NO_SHOW'] },
  { value: 'cancelled', label: 'Cancelled', statuses: ['CANCELLED'] },
  { value: 'failed', label: 'Failed', statuses: ['FAILED'] },
]

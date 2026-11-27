import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import { bookingKeys } from '@/admin/features/bookings/api'
import type { Paginated } from '@/admin/types/api'
import type { BookingRefundInfo, PaymentsPage, PaymentsParams, Refund, RefundInput, RefundQueueItem, RefundsParams } from './types'

export const paymentKeys = {
  all: ['payments'] as const,
  received: (params: PaymentsParams) => [...paymentKeys.all, 'received', params] as const,
  refunds: (params: RefundsParams) => [...paymentKeys.all, 'refunds', params] as const,
  queue: () => [...paymentKeys.all, 'queue'] as const,
  booking: (id: string) => [...paymentKeys.all, 'booking', id] as const,
}

export function usePayments(params: PaymentsParams) {
  return useQuery({
    queryKey: paymentKeys.received(params),
    queryFn: ({ signal }) => api.get<PaymentsPage>('/payments', { ...params }, signal),
    placeholderData: keepPreviousData,
  })
}

export function useRefunds(params: RefundsParams) {
  return useQuery({
    queryKey: paymentKeys.refunds(params),
    queryFn: ({ signal }) => api.get<Paginated<'refunds', Refund>>('/payments/refunds', { ...params }, signal),
    placeholderData: keepPreviousData,
  })
}

/** Money waiting to go back. */
export function useRefundQueue() {
  return useQuery({
    queryKey: paymentKeys.queue(),
    queryFn: () => api.get<{ items: RefundQueueItem[] }>('/payments/refunds/queue').then((r) => r.items),
  })
}

/** A booking's payments with what can still be refunded, and its refunds. */
export function useBookingRefunds(bookingId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: paymentKeys.booking(bookingId ?? ''),
    queryFn: () => api.get<BookingRefundInfo>(`/bookings/${bookingId}/refunds`),
    enabled: Boolean(bookingId) && enabled,
  })
}

function useRefundMutation<TVars>(fn: (vars: TVars) => Promise<Refund>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (refund) => {
      qc.invalidateQueries({ queryKey: paymentKeys.all })
      qc.invalidateQueries({ queryKey: bookingKeys.detail(refund.booking.id) })
    },
  })
}

/** Gives money back (through Razorpay for online payments: real money). */
export const useCreateRefund = () =>
  useRefundMutation((input: RefundInput) => api.post<{ refund: Refund }>('/payments/refunds', input).then((r) => r.refund))

/** Asks Razorpay for the latest status of a refund. */
export const useCheckRefund = () =>
  useRefundMutation((id: string) => api.post<{ refund: Refund }>(`/payments/refunds/${id}/check`).then((r) => r.refund))

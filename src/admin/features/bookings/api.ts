import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import type { Paginated } from '@/admin/types/api'
import { scheduleKeys } from '@/admin/features/slots/api'
import { dashboardKeys } from '@/admin/features/dashboard/api'
import type { BookingDetail, BookingDetailsInput, BookingListItem, BookingListParams, BookingSource, DayBoard, PaymentInput } from './types'
import type { AddonLine } from './quote'

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (params: BookingListParams) => [...bookingKeys.lists(), params] as const,
  board: (date: string) => [...bookingKeys.all, 'board', date] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
}

type BookingReply = { booking: BookingDetail }

// ---------------------------------------------------------------- queries

export function useBookings(params: BookingListParams) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: ({ signal }) => api.get<Paginated<'bookings', BookingListItem>>('/bookings', { ...params }, signal),
    placeholderData: keepPreviousData,
  })
}

export function useDayBoard(date: string) {
  return useQuery({
    queryKey: bookingKeys.board(date),
    queryFn: () => api.get<DayBoard>('/bookings/board', { date }),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000, // holds expire and new bookings arrive
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: ({ signal }) => api.get<BookingReply>(`/bookings/${id}`, undefined, signal).then((r) => r.booking),
  })
}

// ---------------------------------------------------------------- mutations

/**
 * Any booking change can move money and free / take slots, so it refreshes the
 * booking lists, the board, the slot calendar and the dashboard.
 */
export function useOnBookingChanged() {
  const qc = useQueryClient()
  return (booking?: BookingDetail) => {
    if (booking) qc.setQueryData(bookingKeys.detail(booking.id), booking)
    qc.invalidateQueries({ queryKey: bookingKeys.lists() })
    qc.invalidateQueries({ queryKey: [...bookingKeys.all, 'board'] })
    qc.invalidateQueries({ queryKey: scheduleKeys.all })
    qc.invalidateQueries({ queryKey: dashboardKeys.all })
  }
}

/** POST /bookings/:id/<action>, replying with the booking. */
function useBookingAction<TInput>(path: (id: string) => string, method: 'post' | 'patch' = 'post') {
  const onChanged = useOnBookingChanged()
  return useMutation({
    mutationFn: ({ id, ...input }: TInput & { id: string }) =>
      api[method]<BookingReply>(path(id), input).then((r) => r.booking),
    onSuccess: onChanged,
  })
}

export const useUpdateBookingDetails = () => useBookingAction<BookingDetailsInput>((id) => `/bookings/${id}`, 'patch')
export const useConfirmBooking = () => useBookingAction<{ payment?: PaymentInput; note?: string }>((id) => `/bookings/${id}/confirm`)
export const useCancelBooking = () => useBookingAction<{ reason: string }>((id) => `/bookings/${id}/cancel`)
export const useCompleteBooking = () => useBookingAction<{ note?: string }>((id) => `/bookings/${id}/complete`)
export const useMarkNoShow = () => useBookingAction<{ note?: string }>((id) => `/bookings/${id}/no-show`)
export const useAddPayment = () => useBookingAction<PaymentInput>((id) => `/bookings/${id}/payments`)

export function useRemovePayment() {
  const onChanged = useOnBookingChanged()
  return useMutation({
    mutationFn: ({ id, paymentId }: { id: string; paymentId: string }) =>
      api.delete<BookingReply>(`/bookings/${id}/payments/${paymentId}`).then((r) => r.booking),
    onSuccess: onChanged,
  })
}

export interface CreateBookingInput {
  theatre: string
  date: string
  slot: string
  guests: number
  kids: number
  decoration: boolean
  addons: AddonLine[]
  couponCode?: string
  customer: { name: string; mobile: string; email: string }
  occasion: string
  specialInstructions: string
  cakeRequest: string
  addonRequest: string
  internalNotes: string
  consentWhatsapp: boolean
  source: Exclude<BookingSource, 'website'>
  /** confirm now, or hold the slot while payment is awaited */
  mode: 'confirm' | 'hold'
  payment?: PaymentInput
  allowOverride: boolean
}

export function useCreateBooking() {
  const onChanged = useOnBookingChanged()
  return useMutation({
    mutationFn: (input: CreateBookingInput) => api.post<BookingReply>('/bookings', input).then((r) => r.booking),
    onSuccess: onChanged,
  })
}

/** Change guests / decoration / add-ons; the booking is re-priced. */
export function useUpdateExtras() {
  const onChanged = useOnBookingChanged()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; guests: number; kids: number; decoration: boolean; addons: AddonLine[]; allowOverride: boolean }) =>
      api.patch<{ booking: BookingDetail; previousTotalPaise: number; differencePaise: number }>(`/bookings/${id}/extras`, input),
    onSuccess: (r) => onChanged(r.booking),
  })
}

export function useRescheduleBooking() {
  const onChanged = useOnBookingChanged()
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; date: string; slot: string; reason: string; allowOverride?: boolean }) =>
      api.post<{ booking: BookingDetail; newSlotPriceTodayPaise: number; priceDifferencePaise: number }>(`/bookings/${id}/reschedule`, input),
    onSuccess: (r) => onChanged(r.booking),
  })
}

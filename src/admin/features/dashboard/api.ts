import { useQuery } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import type { Paginated } from '@/admin/types/api'
import type { BookingListItem } from '@/admin/features/bookings/types'
import { ACTIVE_BOOKING_STATUSES } from '@/admin/features/bookings/constants'
import type { LeadStats } from '@/admin/features/leads/types'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  bookingsOn: (date: string) => [...dashboardKeys.all, 'bookings', date] as const,
  leadStats: () => [...dashboardKeys.all, 'lead-stats'] as const,
}

/** Bookings that hold a slot on `date`, earliest slot first. */
export function useBookingsOn(date: string) {
  return useQuery({
    queryKey: dashboardKeys.bookingsOn(date),
    queryFn: () =>
      api.get<Paginated<'bookings', BookingListItem>>('/bookings', {
        date,
        status: ACTIVE_BOOKING_STATUSES,
        sort: 'date',
        limit: 100,
      }),
    refetchInterval: 60_000, // new bookings show up without a reload
  })
}

export function useLeadStats() {
  return useQuery({
    queryKey: dashboardKeys.leadStats(),
    queryFn: () => api.get<LeadStats>('/leads/stats'),
    refetchInterval: 60_000,
  })
}

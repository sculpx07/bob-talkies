import { useQuery } from '@tanstack/react-query'
import { bookingKeys } from '@/lib/api/queryKeys'
import { bookingApi } from '../api'

export function useBookingStatus(id: string | null) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: () => bookingApi.getBooking(id!),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 3000
      const terminal = ['CONFIRMED', 'CANCELLED', 'FAILED']
      return terminal.includes(data.status) ? false : 3000
    },
    staleTime: 0,
  })
}

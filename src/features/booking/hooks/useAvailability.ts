import { useQuery } from '@tanstack/react-query'
import { availabilityKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import { withQuery } from '@/lib/api/query'
import { format } from 'date-fns'

/** Slots and calendar from the backend (bob-admin GET /public/availability), built from Admin → Slots & calendar. */
export interface Slot {
  id: string
  start: string
  end: string
  status: 'available' | 'high_demand' | 'booked' | 'held'
  pricePaise: number
}

export interface CalendarDay {
  date: string
  status: 'available' | 'high_demand' | 'offer_date' | 'fully_booked' | 'unavailable'
}

export function useSlots(theatreId: string | null, date: string | null) {
  return useQuery({
    queryKey: availabilityKeys.slots(theatreId ?? '', date ?? ''),
    queryFn: () =>
      api.get<Slot[]>(withQuery('/availability', { theatre: theatreId, date })),
    enabled: Boolean(theatreId && date),
    staleTime: 30_000,
  })
}

export function useCalendar(theatreId: string | null, month?: string) {
  const m = month ?? format(new Date(), 'yyyy-MM')
  return useQuery({
    queryKey: availabilityKeys.calendar(theatreId ?? '', m),
    queryFn: () =>
      api.get<CalendarDay[]>(withQuery('/availability/calendar', { theatre: theatreId, month: m })),
    enabled: Boolean(theatreId),
    staleTime: 60_000,
  })
}

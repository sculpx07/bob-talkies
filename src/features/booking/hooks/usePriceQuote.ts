import { useQuery } from '@tanstack/react-query'
import { bookingApi, type QuoteRequest } from '../api'

export function usePriceQuote(request: Partial<QuoteRequest>) {
  const isReady = Boolean(
    request.theatreId && request.packageId && request.date && request.slotId,
  )
  return useQuery({
    queryKey: ['booking', 'quote', request],
    queryFn: () => bookingApi.getQuote(request as QuoteRequest),
    enabled: isReady,
    staleTime: 30_000,
  })
}

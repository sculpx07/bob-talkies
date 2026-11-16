import { useEffect } from 'react'
import { useBooking } from '../state/booking.context'
import { usePriceQuote } from './usePriceQuote'

/** Price quote for whatever is currently selected; mirrors it into booking state for the sticky bar and payment. */
export function useCurrentQuote() {
  const { state, dispatch } = useBooking()
  const query = usePriceQuote({
    theatreId: state.theatreId ?? undefined,
    date: state.date ?? undefined,
    slotId: state.slotId ?? undefined,
    guests: state.guests + state.kids,
    decoration: state.decoration,
    addonIds: state.addonIds,
    couponCode: state.couponCode ?? undefined,
  })
  const quote = query.data
  useEffect(() => {
    if (quote && JSON.stringify(state.serverQuote) !== JSON.stringify(quote)) {
      dispatch({ type: 'SET_SERVER_QUOTE', quote })
    }
  }, [quote, state.serverQuote, dispatch])
  return query
}

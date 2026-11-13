import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { bookingReducer, initialBookingState, type BookingState, type BookingAction } from './booking.reducer'
import { saveBookingState, loadBookingState } from './booking.storage'

interface BookingContextValue {
  state: BookingState
  dispatch: React.Dispatch<BookingAction>
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const saved = loadBookingState()
  const [state, dispatch] = useReducer(bookingReducer, {
    ...initialBookingState,
    ...(saved ?? {}),
  })

  useEffect(() => {
    saveBookingState(state)
  }, [state])

  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be inside BookingProvider')
  return ctx
}

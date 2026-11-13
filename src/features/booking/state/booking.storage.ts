import type { BookingState } from './booking.reducer'

const KEY = 'bob_booking_state'

export function saveBookingState(state: BookingState): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

export function loadBookingState(): Partial<BookingState> | null {
  try {
    const v = sessionStorage.getItem(KEY)
    return v ? (JSON.parse(v) as Partial<BookingState>) : null
  } catch {
    return null
  }
}

export function clearBookingState(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

const POINTS_KEY = 'bob_points'
const BOOKINGS_KEY = 'bob_booking_count'
const REF_CODE_KEY = 'bob_ref_code'
const POINTS_PER_BOOKING = 50

function makeRefCode(): string {
  return 'BOB' + Math.random().toString(36).slice(2, 7).toUpperCase()
}

export function getRefCode(): string {
  try {
    let code = localStorage.getItem(REF_CODE_KEY)
    if (!code) { code = makeRefCode(); localStorage.setItem(REF_CODE_KEY, code) }
    return code
  } catch { return makeRefCode() }
}

export function getPoints(): number {
  try { return parseInt(localStorage.getItem(POINTS_KEY) ?? '0') || 0 } catch { return 0 }
}

export function getBookingCount(): number {
  try { return parseInt(localStorage.getItem(BOOKINGS_KEY) ?? '0') || 0 } catch { return 0 }
}

export function awardBookingPoints(): { points: number; total: number; bookings: number } {
  try {
    const prev = getPoints()
    const bookings = getBookingCount() + 1
    const total = prev + POINTS_PER_BOOKING
    localStorage.setItem(POINTS_KEY, String(total))
    localStorage.setItem(BOOKINGS_KEY, String(bookings))
    return { points: POINTS_PER_BOOKING, total, bookings }
  } catch { return { points: POINTS_PER_BOOKING, total: POINTS_PER_BOOKING, bookings: 1 } }
}

export function buildReferralUrl(baseUrl = window.location.origin): string {
  return `${baseUrl}/book?ref=${getRefCode()}`
}

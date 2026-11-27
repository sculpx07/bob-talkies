import type { BOOKING_STEPS } from '@/lib/constants'

export type BookingStep = (typeof BOOKING_STEPS)[number]

export interface BookingState {
  step: number
  occasion: string | null
  guests: number
  locationId: string | null
  date: string | null
  theatreId: string | null
  theatreSlug: string | null
  slotId: string | null
  packageId: string | null
  addonIds: string[]
  customRequest: string
  addonRequest: string
  personalMessage: string
  couponCode: string | null
  customerName: string
  customerMobile: string
  customerEmail: string
  specialInstructions: string
  consentTnC: boolean
  consentWhatsapp: boolean
  bookingId: string | null
  slotHoldExpiresAt: string | null
  serverQuote: ServerQuote | null
  payFull: boolean
  kids: number
  decoration: boolean
  verifiedMobile: string | null
  /** pay part of the booking with BOB Points (signed-in customers) */
  usePoints: boolean
}

export interface ServerQuote {
  lineItems: Array<{ label: string; paise: number }>
  totalPaise: number
  advancePaise: number
  balancePaise: number
  couponApplied?: string
  /** BOB Points (only for a signed-in customer) */
  points?: {
    balance: number
    /** most points this booking can take */
    usable: number
    used: number
    discountPaise: number
    pointValuePaise: number
    /** what completing this booking earns (incl. a regular-customer bonus) */
    earnPoints: number
    regularBonusPoints?: number
  }
}

export type BookingAction =
  | { type: 'SET_OCCASION'; occasion: string }
  | { type: 'SET_GUESTS'; guests: number }
  | { type: 'SET_LOCATION'; locationId: string }
  | { type: 'SET_DATE'; date: string }
  | { type: 'SET_THEATRE_SLOT'; theatreId: string; theatreSlug: string; slotId: string }
  | { type: 'SET_PACKAGE'; packageId: string }
  | { type: 'TOGGLE_ADDON'; addonId: string }
  | { type: 'SET_ADDONS'; addonIds: string[] }
  | { type: 'SET_CUSTOM_REQUEST'; text: string }
  | { type: 'SET_ADDON_REQUEST'; text: string }
  | { type: 'SET_PERSONAL_MESSAGE'; text: string }
  | { type: 'SET_COUPON'; couponCode: string | null }
  | { type: 'SET_CUSTOMER'; name: string; mobile: string; email: string; instructions: string; consentTnC: boolean; consentWhatsapp: boolean }
  | { type: 'SET_BOOKING_ID'; bookingId: string; expiresAt: string }
  | { type: 'SET_SERVER_QUOTE'; quote: ServerQuote }
  | { type: 'SET_PAY_FULL'; payFull: boolean }
  | { type: 'SET_PEOPLE'; guests: number }
  | { type: 'SET_KIDS'; kids: number }
  | { type: 'SET_DECORATION'; decoration: boolean }
  | { type: 'SET_VERIFIED_MOBILE'; mobile: string | null }
  | { type: 'SET_USE_POINTS'; usePoints: boolean }
  | { type: 'GO_STEP'; step: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'CLEAR_BOOKING' }
  | { type: 'RESET' }

export const initialBookingState: BookingState = {
  step: 0,
  occasion: null,
  guests: 2,
  locationId: null,
  date: null,
  theatreId: null,
  theatreSlug: null,
  slotId: null,
  packageId: null,
  addonIds: [],
  customRequest: '',
  addonRequest: '',
  personalMessage: '',
  couponCode: null,
  customerName: '',
  customerMobile: '',
  customerEmail: '',
  specialInstructions: '',
  consentTnC: false,
  consentWhatsapp: true,
  bookingId: null,
  slotHoldExpiresAt: null,
  serverQuote: null,
  payFull: false,
  kids: 0,
  decoration: true,
  verifiedMobile: null,
  usePoints: false,
}

/** The held booking (if any) no longer matches the selection: the next "Pay" creates a new one. */
const newBooking = { bookingId: null, slotHoldExpiresAt: null }

const downstreamReset = {
  theatreId: null, theatreSlug: null, slotId: null, packageId: null,
  addonIds: [] as string[], serverQuote: null, bookingId: null, slotHoldExpiresAt: null,
}

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_OCCASION': return { ...state, occasion: action.occasion }
    // changing guests / date invalidates everything chosen downstream of them
    case 'SET_GUESTS': return action.guests === state.guests ? state : { ...state, guests: action.guests, ...downstreamReset }
    case 'SET_LOCATION': return { ...state, locationId: action.locationId }
    case 'SET_DATE': return action.date === state.date ? state : { ...state, date: action.date, ...downstreamReset }
    case 'SET_THEATRE_SLOT': return { ...state, theatreId: action.theatreId, theatreSlug: action.theatreSlug, slotId: action.slotId, ...newBooking }
    case 'SET_PACKAGE': return { ...state, packageId: action.packageId }
    case 'TOGGLE_ADDON': {
      const has = state.addonIds.includes(action.addonId)
      return { ...state, addonIds: has ? state.addonIds.filter((id) => id !== action.addonId) : [...state.addonIds, action.addonId], ...newBooking }
    }
    case 'SET_ADDONS': return { ...state, addonIds: action.addonIds, ...newBooking }
    case 'SET_ADDON_REQUEST': return { ...state, addonRequest: action.text }
    case 'SET_PERSONAL_MESSAGE': return { ...state, personalMessage: action.text }
    case 'SET_CUSTOM_REQUEST': return { ...state, customRequest: action.text }
    case 'SET_COUPON': return { ...state, couponCode: action.couponCode, ...newBooking }
    case 'SET_CUSTOMER': return {
      ...state,
      customerName: action.name, customerMobile: action.mobile,
      customerEmail: action.email, specialInstructions: action.instructions,
      consentTnC: action.consentTnC, consentWhatsapp: action.consentWhatsapp,
    }
    case 'SET_BOOKING_ID': return { ...state, bookingId: action.bookingId, slotHoldExpiresAt: action.expiresAt }
    case 'SET_SERVER_QUOTE': return { ...state, serverQuote: action.quote }
    // editing the head-count after a theatre is chosen keeps the theatre (the form clamps it to capacity)
    case 'SET_PEOPLE': return { ...state, guests: action.guests, serverQuote: null, ...newBooking }
    case 'SET_KIDS': return { ...state, kids: action.kids, serverQuote: null, ...newBooking }
    case 'SET_DECORATION': return { ...state, decoration: action.decoration, serverQuote: null, ...newBooking }
    case 'SET_VERIFIED_MOBILE': return { ...state, verifiedMobile: action.mobile }
    case 'SET_USE_POINTS': return action.usePoints === state.usePoints ? state : { ...state, usePoints: action.usePoints, ...newBooking }
    case 'SET_PAY_FULL': return { ...state, payFull: action.payFull }
    case 'GO_STEP': return { ...state, step: action.step }
    case 'NEXT_STEP': return { ...state, step: state.step + 1 }
    case 'PREV_STEP': return { ...state, step: Math.max(0, state.step - 1) }
    case 'CLEAR_BOOKING': return { ...state, ...newBooking }
    case 'RESET': return { ...initialBookingState }
    default: return state
  }
}

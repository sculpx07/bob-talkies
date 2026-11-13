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
}

export interface ServerQuote {
  lineItems: Array<{ label: string; paise: number }>
  totalPaise: number
  advancePaise: number
  balancePaise: number
  couponApplied?: string
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
  | { type: 'SET_COUPON'; couponCode: string | null }
  | { type: 'SET_CUSTOMER'; name: string; mobile: string; email: string; instructions: string; consentTnC: boolean; consentWhatsapp: boolean }
  | { type: 'SET_BOOKING_ID'; bookingId: string; expiresAt: string }
  | { type: 'SET_SERVER_QUOTE'; quote: ServerQuote }
  | { type: 'SET_PAY_FULL'; payFull: boolean }
  | { type: 'GO_STEP'; step: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
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
}

export function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_OCCASION': return { ...state, occasion: action.occasion }
    case 'SET_GUESTS': return { ...state, guests: action.guests }
    case 'SET_LOCATION': return { ...state, locationId: action.locationId }
    case 'SET_DATE': return { ...state, date: action.date }
    case 'SET_THEATRE_SLOT': return { ...state, theatreId: action.theatreId, theatreSlug: action.theatreSlug, slotId: action.slotId }
    case 'SET_PACKAGE': return { ...state, packageId: action.packageId }
    case 'TOGGLE_ADDON': {
      const has = state.addonIds.includes(action.addonId)
      return { ...state, addonIds: has ? state.addonIds.filter((id) => id !== action.addonId) : [...state.addonIds, action.addonId] }
    }
    case 'SET_ADDONS': return { ...state, addonIds: action.addonIds }
    case 'SET_CUSTOM_REQUEST': return { ...state, customRequest: action.text }
    case 'SET_COUPON': return { ...state, couponCode: action.couponCode }
    case 'SET_CUSTOMER': return {
      ...state,
      customerName: action.name, customerMobile: action.mobile,
      customerEmail: action.email, specialInstructions: action.instructions,
      consentTnC: action.consentTnC, consentWhatsapp: action.consentWhatsapp,
    }
    case 'SET_BOOKING_ID': return { ...state, bookingId: action.bookingId, slotHoldExpiresAt: action.expiresAt }
    case 'SET_SERVER_QUOTE': return { ...state, serverQuote: action.quote }
    case 'SET_PAY_FULL': return { ...state, payFull: action.payFull }
    case 'GO_STEP': return { ...state, step: action.step }
    case 'NEXT_STEP': return { ...state, step: state.step + 1 }
    case 'PREV_STEP': return { ...state, step: Math.max(0, state.step - 1) }
    case 'RESET': return { ...initialBookingState }
    default: return state
  }
}

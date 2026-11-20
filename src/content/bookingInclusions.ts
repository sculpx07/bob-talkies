import { THEATRE_LISTING, DECOR_PRICE_INR } from './theatreListing'

/** Shown wherever a fact has not been confirmed by the business yet. */
export const CONFIRM_TEXT = 'Confirm with our team'

export interface InclusionLine {
  text: string
  /** true when the line is a placeholder for information still to be confirmed */
  pending?: boolean
}

/**
 * Guest ranges stated in two places that agree (the FAQ and the theatre records).
 * Cosmos is left out on purpose: the FAQ says 8-20 guests but the theatre record says 18,
 * so it shows "Confirm with our team" until the business confirms the number.
 */
const VERIFIED_CAPACITY: Record<string, [number, number]> = {
  delight: [2, 4],
  heavens: [4, 10],
  filmdom: [6, 13],
  'vibe-hall': [20, 40],
}

/** Verified [min, max] guests for a theatre, or null when not confirmed (e.g. Cosmos). Display use only. */
export function getVerifiedCapacity(slug: string): [number, number] | null {
  return VERIFIED_CAPACITY[slug] ?? null
}

/** "2–4 Guests" when verified, otherwise a clear "Confirm with our team" marker. Display use only. */
export function guestRangeText(slug: string, unit = 'Guests'): string {
  const r = VERIFIED_CAPACITY[slug]
  return r ? `${r[0]}–${r[1]} ${unit}` : `Capacity: ${CONFIRM_TEXT}`
}

/**
 * Facility chips safe to show to customers: only facts from the listing page / FAQ.
 * Seed facility lists and descriptions are unverified (and conflict in places), so they are not used.
 */
export function getVerifiedFacilities(slug: string): string[] {
  const info = THEATRE_LISTING[slug]
  if (!info) return []
  return [
    info.spec,
    `Base price includes ${info.includedGuests} guests`,
    ...(info.durationNote ? [info.durationNote] : []),
    'Outside food and beverages are welcome',
  ]
}

export const isExtraGuestLabel = (label: string) => /^Extra Guests?/i.test(label)

/** True when the quote includes an extra-guest charge, whose per-guest rate is not confirmed yet. */
export const hasExtraGuestLine = (lineItems: Array<{ label: string }> | undefined) =>
  Boolean(lineItems?.some((i) => isExtraGuestLabel(i.label)))

export const PROVISIONAL_NOTE =
  'Provisional: the total, advance and balance include extra guests, whose rate is still to be confirmed. The final amount may change.'

/** Customer-facing label for a price-quote line: hides the unverified per-guest rate on extra-guest lines. */
export function displayQuoteLabel(label: string): string {
  const m = label.match(/^(Extra Guests?)\s*\((\d+)\s*[×x][^)]*\)/i)
  return m ? `${m[1]} (${m[2]}) · rate to be confirmed` : label
}

export function getDurationLines(slug: string): InclusionLine[] {
  const note = THEATRE_LISTING[slug]?.durationNote
  return note ? [{ text: note }] : [{ text: CONFIRM_TEXT, pending: true }]
}

export function getCapacityLines(slug: string): InclusionLine[] {
  const info = THEATRE_LISTING[slug]
  const range = VERIFIED_CAPACITY[slug]
  return [
    info ? { text: `Base price includes ${info.includedGuests} guests` } : { text: CONFIRM_TEXT, pending: true },
    range ? { text: `Accommodates ${range[0]}–${range[1]} guests` } : { text: `Maximum capacity: ${CONFIRM_TEXT}`, pending: true },
  ]
}

export function getScreenSoundLines(slug: string): InclusionLine[] {
  const info = THEATRE_LISTING[slug]
  return info ? [{ text: info.spec }] : [{ text: CONFIRM_TEXT, pending: true }]
}

export function getFoodLines(): InclusionLine[] {
  return [
    { text: 'Outside food and beverages are welcome' },
    { text: `Food included in the booking: ${CONFIRM_TEXT}`, pending: true },
  ]
}

export function getDecorationLines(): InclusionLine[] {
  return [
    { text: `Decoration is available for ₹${DECOR_PRICE_INR}` },
    { text: `What the decoration includes: ${CONFIRM_TEXT}`, pending: true },
  ]
}

export function getExtraGuestLines(): InclusionLine[] {
  return [{ text: `Extra guest charges: ${CONFIRM_TEXT}`, pending: true }]
}

/**
 * Cancellation and rescheduling details are intentionally NOT shown yet:
 * the refund policy (72 hours) and the terms page (48 / 24 hours) disagree.
 * Set this once the business confirms which policy applies and the section will appear.
 */
export const CANCELLATION_LINES: InclusionLine[] | null = null

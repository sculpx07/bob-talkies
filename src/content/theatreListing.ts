/**
 * Per-theatre listing facts taken from https://bobtalkies.com/private-theatre-in-hyderabad/
 * (prices include taxes, as stated on that page). Slot times and photos are NOT on that page.
 */
export interface TheatreListingInfo {
  /** heading used on the listing page */
  displayName: string
  /** guests included in the base price */
  includedGuests: number
  /** screen and sound line, as written on the listing page */
  spec: string
  /** base-price label, e.g. Vibe Hall is sold as a 3-hour package */
  durationNote?: string
}

export const THEATRE_LISTING: Record<string, TheatreListingInfo> = {
  delight: { displayName: 'Delight Private Theatre', includedGuests: 2, spec: '120 inch 4K Screen, 850W dolby atmos' },
  heavens: { displayName: 'Heavens Private Theatre', includedGuests: 4, spec: '133 inch 4K screen, 1000W dolby atmos' },
  filmdom: { displayName: 'Filmdom Private Theatre', includedGuests: 6, spec: '133 inch 4K screen, 1000W dolby atmos' },
  cosmos: { displayName: 'Cosmos Private Theatre', includedGuests: 8, spec: '133 inch 4K screen, 1500W dolby atmos' },
  'vibe-hall': {
    displayName: 'Vibe Hall', includedGuests: 20, durationNote: '3 hr package',
    spec: '180 inch, cinematic luxury with 3000W high-fidelity sound, 4K Visuals',
  },
}

/** Decoration charge shown for every theatre on that page (INR) */
export const DECOR_PRICE_INR = 749

export const LISTING_NOTES = {
  cancellation: 'Refund eligible if cancelled 72 hours before the slot time',
  addOns: 'Add Cakes and Photography in the next step',
}

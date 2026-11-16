/**
 * Per-theatre listing facts taken from https://bobtalkies.com/private-theatre-in-hyderabad/
 * (prices include taxes, as stated on that page). Slot times and photos are NOT on that page.
 */
export interface TheatreListingInfo {
  /** guests included in the base price */
  includedGuests: number
  /** base-price label, e.g. Vibe Hall is sold as a 3-hour package */
  durationNote?: string
}

export const THEATRE_LISTING: Record<string, TheatreListingInfo> = {
  delight: { includedGuests: 2 },
  heavens: { includedGuests: 4 },
  filmdom: { includedGuests: 6 },
  cosmos: { includedGuests: 8 },
  'vibe-hall': { includedGuests: 20, durationNote: '3 hr package' },
}

/** Decoration charge shown for every theatre on that page (INR) */
export const DECOR_PRICE_INR = 749

export const LISTING_NOTES = {
  cancellation: 'Refund eligible if cancelled 72 hours before the slot time',
  addOns: 'Add cake, photography and more in the next steps',
}

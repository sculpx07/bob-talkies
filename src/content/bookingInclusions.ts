import type { Theatre } from '@/schemas/theatre'
import { formatINR } from '@/lib/utils/currency'
import { theatreSpec } from '@/features/catalog/theatre'

/** Shown wherever a fact has not been confirmed by the business yet. */
export const CONFIRM_TEXT = 'Confirm with our team'

export interface InclusionLine {
  text: string
  /** true when the line is a placeholder for information still to be confirmed */
  pending?: boolean
}

/** Shown under each theatre in the booking flow. */
export const ADD_ONS_NOTE = 'Add Cakes and Photography in the next step'

export function getDurationLines(t: Theatre): InclusionLine[] {
  return t.durationNote ? [{ text: t.durationNote }] : [{ text: CONFIRM_TEXT, pending: true }]
}

export function getCapacityLines(t: Theatre): InclusionLine[] {
  return [
    { text: `Base price includes ${t.includedGuests} guests` },
    { text: `Accommodates ${t.capacityMin}–${t.capacityMax} guests` },
  ]
}

export function getScreenSoundLines(t: Theatre): InclusionLine[] {
  const spec = theatreSpec(t)
  return spec ? [{ text: spec }] : [{ text: CONFIRM_TEXT, pending: true }]
}

export function getFoodLines(): InclusionLine[] {
  return [
    { text: 'Outside food and beverages are welcome' },
    { text: `Food included in the booking: ${CONFIRM_TEXT}`, pending: true },
  ]
}

export function getDecorationLines(decorationPricePaise: number | undefined): InclusionLine[] {
  return [
    decorationPricePaise !== undefined
      ? { text: `Decoration is available for ${formatINR(decorationPricePaise)}` }
      : { text: `Decoration price: ${CONFIRM_TEXT}`, pending: true },
    { text: `What the decoration includes: ${CONFIRM_TEXT}`, pending: true },
  ]
}

export function getExtraGuestLines(t: Theatre): InclusionLine[] {
  return [{ text: `${formatINR(t.extraGuestPricePaise)} per guest beyond the ${t.includedGuests} included` }]
}

/**
 * Cancellation and rescheduling details are intentionally NOT shown yet:
 * the refund policy (72 hours) and the terms page (48 / 24 hours) disagree.
 * Set this once the business confirms which policy applies and the section will appear.
 */
export const CANCELLATION_LINES: InclusionLine[] | null = null

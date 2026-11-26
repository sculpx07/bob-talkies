import type { Theatre } from '@/schemas/theatre'

/*
 * How theatre facts read on the website, built from the theatre data managed in
 * Admin → Theatres (so every page says the same thing).
 */

/** "Delight Private Theatre"; a hall keeps its own name ("Vibe Hall"). */
export const theatreTitle = (t: Pick<Theatre, 'name'>) => (/\bhall$/i.test(t.name) ? t.name : `${t.name} Private Theatre`)

/** "120 inches 4K screen, 850W Dolby Atmos" */
export function theatreSpec(t: Pick<Theatre, 'screenSize' | 'resolution' | 'soundSystem'>): string {
  const screen = [t.screenSize, t.resolution].filter(Boolean).join(' ')
  return [screen && `${screen} screen`, t.soundSystem].filter(Boolean).join(', ')
}

/** "2–4 Guests" */
export const guestRangeText = (t: Pick<Theatre, 'capacityMin' | 'capacityMax'>, unit = 'Guests') =>
  `${t.capacityMin}–${t.capacityMax}${unit ? ` ${unit}` : ''}`

/** Short facts for chips and lists: screen and sound, guests in the base price, package length, then the facilities list. */
export function theatreFacts(t: Theatre): string[] {
  return [
    theatreSpec(t),
    `Base price includes ${t.includedGuests} guests`,
    ...(t.durationNote ? [t.durationNote] : []),
    ...t.facilities,
  ].filter(Boolean)
}

import { THEATRE_LISTING } from './theatreListing'

/** Shown wherever a detail has not been confirmed by the business yet. */
export const CONFIRM_TEXT = 'Confirm with our team'

export const VIBE_HALL_EXPERIENCES = [
  { id: 'presentations', emoji: '📊', title: 'Corporate Presentations', text: 'Connect your laptop through HDMI and present on our big screen.', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80' },
  { id: 'team', emoji: '🎉', title: 'Team Celebrations', text: 'Celebrate wins, milestones and get-togethers with your whole team in one private space.', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80' },
  { id: 'seminars', emoji: '🎤', title: 'Seminars', text: 'A large hall with a big screen and sound system for talks and training sessions.', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&q=80' },
  { id: 'screenings', emoji: '🎬', title: 'Private Screenings', text: 'Screen a film, teaser or launch for your invited guests, exclusively.', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&q=80' },
  { id: 'sports', emoji: '🏆', title: 'Sports Events', text: 'Watch the big match together on a huge screen with cinema sound.', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&q=80' },
] as const

export const EVENT_TYPES = [
  'Corporate Presentation', 'Team Celebration', 'Seminar', 'Private Screening', 'Sports Event', 'Other',
] as const

/**
 * Group packages: intentionally empty. No verified group package or pricing exists yet.
 * Add entries here once the business confirms them and the page will list them automatically.
 */
export interface GroupPackage {
  id: string
  name: string
  description: string
  inclusions: string[]
  /** leave undefined until a price is confirmed */
  priceLabel?: string
}
export const GROUP_PACKAGES: GroupPackage[] = []

/**
 * Catering options: intentionally empty until the business confirms what is offered.
 */
export interface CateringOption { id: string; name: string; description: string }
export const CATERING_OPTIONS: CateringOption[] = []

/** Verified Vibe Hall facts (bobtalkies.com listing page + FAQ). */
const info = THEATRE_LISTING['vibe-hall']
export const VIBE_HALL_FACTS = {
  guestRange: '20–40 guests', // FAQ and theatre record agree
  includedGuests: info.includedGuests,
  duration: info.durationNote ?? CONFIRM_TEXT,
  spec: info.spec,
}

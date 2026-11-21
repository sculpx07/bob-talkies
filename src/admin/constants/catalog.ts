/** Shared catalogue values. Mirror the backend where noted. */

/** Venue branches (bob-admin src/constants/location.js). */
export const LOCATIONS = [{ id: 'loc-kukatpally', name: 'Kukatpally, Hyderabad' }] as const

/** Occasion slugs used across the customer site; suggestions for "suitable for". */
export const OCCASIONS: Array<{ slug: string; label: string }> = [
  { slug: 'birthday', label: 'Birthday' },
  { slug: 'anniversary', label: 'Anniversary' },
  { slug: 'date-night', label: 'Date night' },
  { slug: 'proposal', label: 'Proposal' },
  { slug: 'bride-to-be', label: 'Bride to be' },
  { slug: 'baby-shower', label: 'Baby shower' },
  { slug: 'family', label: 'Family' },
  { slug: 'friends', label: 'Friends' },
  { slug: 'sports-screening', label: 'Sports screening' },
  { slug: 'corporate', label: 'Corporate' },
]

export const occasionLabel = (slug: string) => OCCASIONS.find((o) => o.slug === slug)?.label ?? slug

/** Common theatre facilities, offered as suggestions (anything can be typed). */
export const FACILITY_SUGGESTIONS = [
  '4K Projector', '4K Laser Projector', 'Dolby Atmos 5.1', 'Dolby Atmos 7.1', 'Premium Recliners', 'Sofa Seating',
  'Air Conditioning', 'Decoration Setup', 'Cake Counter', 'Food & Beverage Counter', 'Photography Available',
  'OTT Access', 'OTT/HDMI Access', 'Cold Fire Effects', 'Fog Entry', 'LED Name Board', 'Stage Lighting', 'DJ Ready Setup',
]

/** Image upload limits (bob-admin src/constants/upload.js, UPLOAD_MAX_FILE_MB). */
export const IMAGE_UPLOAD = {
  accept: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
  maxFileMb: 5,
  maxPerRequest: 10,
  maxPerTheatre: 20,
} as const

export interface CityLocation {
  slug: string
  name: string
}

export interface City {
  slug: string
  name: string
  locations: CityLocation[]
}

/**
 * Cities shown in the "Select City" picker.
 * NOTE: Kukatpally (Hyderabad) is the real BOB Talkies branch. Every other
 * location is DUMMY placeholder data until real branches are added.
 */
export const CITIES: City[] = [
  { slug: 'bengaluru', name: 'Bengaluru', locations: [{ slug: 'indiranagar', name: 'Indiranagar' }, { slug: 'koramangala', name: 'Koramangala' }, { slug: 'whitefield', name: 'Whitefield' }] },
  { slug: 'hyderabad', name: 'Hyderabad', locations: [{ slug: 'kukatpally', name: 'Kukatpally' }, { slug: 'madhapur', name: 'Madhapur' }, { slug: 'gachibowli', name: 'Gachibowli' }] },
  { slug: 'delhi-ncr', name: 'Delhi NCR', locations: [{ slug: 'rajouri-garden', name: 'Rajouri Garden' }, { slug: 'noida-sector-18', name: 'Noida Sector 18' }, { slug: 'gurugram-sector-29', name: 'Gurugram Sector 29' }] },
  { slug: 'mumbai', name: 'Mumbai (MMR)', locations: [{ slug: 'andheri-west', name: 'Andheri West' }, { slug: 'powai', name: 'Powai' }, { slug: 'thane-west', name: 'Thane West' }] },
  { slug: 'chennai', name: 'Chennai', locations: [{ slug: 'omr-perungudi', name: 'OMR Perungudi' }, { slug: 'anna-nagar', name: 'Anna Nagar' }, { slug: 'velachery', name: 'Velachery' }] },
  { slug: 'visakhapatnam', name: 'Visakhapatnam', locations: [{ slug: 'mvp-colony', name: 'MVP Colony' }, { slug: 'dwaraka-nagar', name: 'Dwaraka Nagar' }, { slug: 'madhurawada', name: 'Madhurawada' }] },
  { slug: 'pune', name: 'Pune', locations: [{ slug: 'kothrud', name: 'Kothrud' }, { slug: 'hinjewadi', name: 'Hinjewadi' }, { slug: 'viman-nagar', name: 'Viman Nagar' }] },
  { slug: 'ahmedabad', name: 'Ahmedabad', locations: [{ slug: 'satellite', name: 'Satellite' }, { slug: 'prahlad-nagar', name: 'Prahlad Nagar' }, { slug: 'bopal', name: 'Bopal' }] },
  { slug: 'lucknow', name: 'Lucknow', locations: [{ slug: 'gomti-nagar', name: 'Gomti Nagar' }, { slug: 'hazratganj', name: 'Hazratganj' }, { slug: 'aliganj', name: 'Aliganj' }] },
]

/** Value format used in state and URLs: "<city-slug>/<location-slug>" */
export function parseLocationValue(value: string | null | undefined): { city: City; location: CityLocation } | null {
  if (!value) return null
  const [c, l] = value.split('/')
  const city = CITIES.find((x) => x.slug === c)
  const location = city?.locations.find((x) => x.slug === l)
  return city && location ? { city, location } : null
}

export function formatLocation(value: string | null | undefined): string | null {
  const p = parseLocationValue(value)
  return p ? `${p.location.name}, ${p.city.name}` : null
}

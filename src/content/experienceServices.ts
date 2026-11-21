import type { AddonCategory } from '@/schemas/addon'

export const CATEGORY_LABEL: Record<string, string> = {
  effects: 'Effects', decor: 'Decor items', decoration: 'Decoration', flowers: 'Flowers', gifts: 'Gifts',
  photography: 'Photography', videography: 'Videography', cake: 'Cakes', food: 'Food', surprise: 'Surprises', signage: 'Signage',
}

/**
 * Which add-on categories are shown first for an occasion. This only chooses and orders
 * categories that already exist in the add-on catalogue: nothing here is a new service,
 * and a category with no available add-ons is never shown. Occasions not listed show every category.
 */
export const OCCASION_SERVICE_CATEGORIES: Record<string, AddonCategory[]> = {
  birthday: ['cake', 'decor', 'effects', 'gifts', 'photography', 'videography'],
  proposal: ['decor', 'flowers', 'photography', 'videography', 'effects', 'gifts'],
  'date-night': ['flowers', 'decor', 'gifts', 'cake', 'photography'],
  'private-screenings': ['decor', 'effects', 'photography', 'videography'],
}

import type { ReviewSource } from './types'

export const SOURCE_LABELS: Record<ReviewSource, string> = {
  google: 'Google',
  website: 'Website',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  other: 'Other',
}

export const SOURCE_OPTIONS = Object.entries(SOURCE_LABELS).map(([value, label]) => ({ value, label }))

export const RATING_OPTIONS = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n === 1 ? '' : 's'}` }))

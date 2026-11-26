import type { BadgeTone } from '@/admin/components/ui'
import type { PackageTier } from './types'

export const TIER_OPTIONS: { value: PackageTier; label: string; tone: BadgeTone }[] = [
  { value: 'silver', label: 'Silver', tone: 'neutral' },
  { value: 'gold', label: 'Gold', tone: 'warning' },
  { value: 'diamond', label: 'Diamond', tone: 'info' },
  { value: 'platinum', label: 'Platinum', tone: 'brand' },
  { value: 'custom', label: 'Custom', tone: 'success' },
]

export const tierOption = (tier: PackageTier) => TIER_OPTIONS.find((t) => t.value === tier) ?? TIER_OPTIONS[4]

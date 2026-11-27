import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { config as env } from '@/lib/config'
import type { LoyaltyProgram, RewardsProgram } from '@/features/rewards/api'

/** Business settings the website shows or calculates with (bob-admin GET /public/config, edited in Admin → Settings). */
export interface SiteConfig {
  pricing: {
    gstPercent: number
    pricesIncludeGst: boolean
    advancePercent: number
    allowFullPayment: boolean
    decorationPricePaise: number
  }
  booking: {
    slotHoldMinutes: number
    minLeadHours: number
    maxAdvanceDays: number
    refundCutoffHours: number
  }
  contact: {
    /** digits with country code, e.g. 919876543210 */
    whatsappNumber: string
    phone: string
    email: string
    address: string
  }
  /** BOB Points rules (Admin → Settings → BOB Points) */
  rewards?: RewardsProgram
  /** regular customers (Admin → Settings → Regular customers) */
  loyalty?: LoyaltyProgram
}

export const siteKeys = { config: ['site', 'config'] as const }

export function useSiteConfig() {
  return useQuery({
    queryKey: siteKeys.config,
    queryFn: () => api.get<SiteConfig>('/config'),
    staleTime: 10 * 60_000,
  })
}

/** WhatsApp number from Settings; the build-time number covers the moment before settings load. */
export function useWhatsappNumber(): string {
  const { data } = useSiteConfig()
  return data?.contact.whatsappNumber || env.whatsappNumber
}

/** Contact details from Admin → Settings → Contact. */
export function useContact() {
  const { data } = useSiteConfig()
  const c = data?.contact
  return {
    whatsappNumber: c?.whatsappNumber || env.whatsappNumber,
    phone: c?.phone ?? '',
    email: c?.email ?? '',
    address: c?.address ?? '',
  }
}

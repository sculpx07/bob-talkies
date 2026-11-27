import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import { useDebouncedValue } from '@/admin/hooks/useDebouncedValue'
import type { BookingIssue, BookingLineItem } from './types'

/** One add-on line in a booking or quote request. */
export interface AddonLine {
  addon: string
  /** required for add-ons with sizes */
  variant?: string
  quantity: number
}

export interface QuoteInput {
  theatre: string
  date: string
  slot: string
  /** everyone attending, kids included */
  guests: number
  decoration: boolean
  addons: AddonLine[]
  couponCode?: string
  /** gives the regular-customer discount */
  customerMobile?: string
  /** price a change to this existing booking */
  booking?: string
}

/** POST /pricing/quote (bob-admin src/services/pricing.service.js). Money is paise. */
export interface Quote {
  bookable: boolean
  issues: BookingIssue[]
  theatre: { id: string; name: string; includedGuests: number }
  slot: { id: string; startTime: string; endTime: string }
  date: string
  isWeekend: boolean
  lineItems: BookingLineItem[]
  addons: Array<{ addonId: string; variant: { id: string; label: string } | null; name: string; unitPricePaise: number; quantity: number; linePaise: number }>
  coupon: { code: string; applied: boolean; reason: string | null; discountPaise: number; checkedAtCheckout?: string[] } | null
  /** regular-customer discount: why it is (not) given */
  loyalty?: { enabled: boolean; eligible: boolean; applied: boolean; completedBookings: number; needed: number; discountPaise: number; label: string; reason: string }
  breakdown: { subtotalPaise: number; discountPaise: number; loyaltyPaise?: number; gstPercent: number; pricesIncludeGst: boolean; gstPaise: number }
  totalPaise: number
  advancePercent: number
  advancePaise: number
  balancePaise: number
  allowFullPayment: boolean
}

/** Quote errors staff may knowingly override (backend ADMIN_OVERRIDABLE_ISSUES). */
export const OVERRIDABLE_ISSUES = ['TOO_SOON', 'DATE_TOO_FAR', 'ADDON_LEAD_TIME']

export const blockingIssues = (q: Quote) => q.issues.filter((i) => i.severity === 'error')

/** True when every blocking issue can be overridden. */
export const onlyOverridable = (q: Quote) => blockingIssues(q).every((i) => OVERRIDABLE_ISSUES.includes(i.code))

/**
 * Live price for the current selection. Re-quotes shortly after the selection
 * stops changing; null input (selection incomplete) skips the request.
 */
export function useQuote(input: QuoteInput | null) {
  const debounced = useDebouncedValue(input, 300)
  return useQuery({
    queryKey: ['quote', debounced],
    queryFn: () => api.post<Quote>('/pricing/quote', debounced),
    enabled: Boolean(debounced),
    placeholderData: keepPreviousData,
    staleTime: 0,
    retry: false,
  })
}

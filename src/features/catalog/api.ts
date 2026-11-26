import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { withQuery } from '@/lib/api/query'
import { addonKeys, offerKeys, packageKeys, reviewKeys, theatreKeys } from '@/lib/api/queryKeys'
import type { Theatre } from '@/schemas/theatre'
import type { Addon } from '@/schemas/addon'
import type { Offer } from '@/schemas/offer'
import type { Package } from '@/schemas/package'
import type { ReviewData } from '@/schemas/review'

/*
 * Catalogue data from the backend (bob-admin /api/v1/public). Everything here is
 * managed in the admin panel, so pages always read it through these hooks.
 */

export const catalogApi = {
  theatres: () => api.get<Theatre[]>('/theatres'),
  theatre: (slug: string) => api.get<Theatre>(`/theatres/${encodeURIComponent(slug)}`),
  addons: (theatreId?: string | null) => api.get<Addon[]>(withQuery('/addons', { theatreId })),
  packages: (theatreId?: string | null) => api.get<Package[]>(withQuery('/packages', { theatreId })),
  offers: () => api.get<Offer[]>('/offers'),
  reviews: () => api.get<ReviewData>('/reviews'),
}

interface Options {
  /** false to wait (e.g. until a drawer opens) */
  enabled?: boolean
}

/** Catalogue data changes only when staff edit it, so a few minutes of caching is safe. */
const STALE = 5 * 60_000

export function useTheatres({ enabled = true }: Options = {}) {
  return useQuery({ queryKey: theatreKeys.list(), queryFn: catalogApi.theatres, staleTime: STALE, enabled })
}

export function useTheatre(slug: string | undefined) {
  return useQuery({
    queryKey: theatreKeys.detail(slug ?? ''),
    queryFn: () => catalogApi.theatre(slug!),
    staleTime: STALE,
    enabled: Boolean(slug),
  })
}

/** Add-ons and cakes; with a theatre, only those offered there. */
export function useAddons(theatreId?: string | null, { enabled = true }: Options = {}) {
  return useQuery({
    queryKey: addonKeys.list(theatreId ?? undefined),
    queryFn: () => catalogApi.addons(theatreId),
    staleTime: STALE,
    enabled,
  })
}

export function usePackages(theatreId?: string | null, { enabled = true }: Options = {}) {
  return useQuery({
    queryKey: packageKeys.list(theatreId ?? undefined),
    queryFn: () => catalogApi.packages(theatreId),
    staleTime: STALE,
    enabled,
  })
}

export function useOffers() {
  return useQuery({ queryKey: offerKeys.list(), queryFn: catalogApi.offers, staleTime: STALE })
}

export function useReviews() {
  return useQuery({ queryKey: reviewKeys.list(), queryFn: catalogApi.reviews, staleTime: STALE })
}

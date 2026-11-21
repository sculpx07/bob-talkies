import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import type { Paginated } from '@/admin/types/api'
import type { Offer, OfferInput, OfferListParams, OfferPreview, OfferStats } from './types'

export const offerKeys = {
  all: ['offers'] as const,
  lists: () => [...offerKeys.all, 'list'] as const,
  list: (params: OfferListParams) => [...offerKeys.lists(), params] as const,
  stats: () => [...offerKeys.all, 'stats'] as const,
  options: () => [...offerKeys.all, 'options'] as const,
  detail: (id: string) => [...offerKeys.all, 'detail', id] as const,
}

type OfferReply = { offer: Offer }

// ---------------------------------------------------------------- queries

export function useOffers(params: OfferListParams) {
  return useQuery({
    queryKey: offerKeys.list(params),
    queryFn: ({ signal }) => api.get<Paginated<'offers', Offer>>('/offers', { ...params }, signal),
    placeholderData: keepPreviousData,
  })
}

export function useOfferStats() {
  return useQuery({ queryKey: offerKeys.stats(), queryFn: () => api.get<OfferStats>('/offers/stats') })
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: offerKeys.detail(id),
    queryFn: ({ signal }) => api.get<OfferReply>(`/offers/${id}`, undefined, signal).then((r) => r.offer),
  })
}

/** Minimal offer shape for pickers (e.g. a theatre's highlighted offer). */
export type OfferOption = Pick<Offer, 'id' | 'code' | 'title' | 'status'>

/** Every offer code, for dropdowns. */
export function useOfferOptions() {
  return useQuery({
    queryKey: offerKeys.options(),
    queryFn: () => api.get<Paginated<'offers', Offer>>('/offers', { limit: 100, sort: 'code' }),
    select: (r): OfferOption[] => r.offers,
    staleTime: 5 * 60_000,
  })
}

// ---------------------------------------------------------------- mutations

/** After a change: refresh lists, counts and pickers; store the fresh offer. */
function useOnOfferSaved() {
  const qc = useQueryClient()
  return (offer: Offer) => {
    qc.setQueryData(offerKeys.detail(offer.id), offer)
    qc.invalidateQueries({ queryKey: offerKeys.lists() })
    qc.invalidateQueries({ queryKey: offerKeys.stats() })
    qc.invalidateQueries({ queryKey: offerKeys.options() })
  }
}

export function useCreateOffer() {
  const onSaved = useOnOfferSaved()
  return useMutation({
    mutationFn: (input: OfferInput) => api.post<OfferReply>('/offers', input).then((r) => r.offer),
    onSuccess: onSaved,
  })
}

export function useUpdateOffer(id: string) {
  const onSaved = useOnOfferSaved()
  return useMutation({
    mutationFn: (input: Partial<OfferInput>) => api.patch<OfferReply>(`/offers/${id}`, input).then((r) => r.offer),
    onSuccess: onSaved,
  })
}

export function useSetOfferActive() {
  const onSaved = useOnOfferSaved()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.patch<OfferReply>(`/offers/${id}/status`, { isActive }).then((r) => r.offer),
    onSuccess: onSaved,
  })
}

export function useDeleteOffer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/offers/${id}`),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: offerKeys.detail(id) })
      qc.invalidateQueries({ queryKey: offerKeys.all })
    },
  })
}

export function useUploadOfferImage(id: string) {
  const onSaved = useOnOfferSaved()
  return useMutation({
    mutationFn: (file: File) => api.upload<OfferReply>(`/offers/${id}/image`, 'image', [file]).then((r) => r.offer),
    onSuccess: onSaved,
  })
}

export function useRemoveOfferImage(id: string) {
  const onSaved = useOnOfferSaved()
  return useMutation({
    mutationFn: () => api.delete<OfferReply>(`/offers/${id}/image`).then((r) => r.offer),
    onSuccess: onSaved,
  })
}

/** Try a code against an imaginary booking. */
export function usePreviewOffer() {
  return useMutation({
    mutationFn: (input: { code: string; theatre?: string; date?: string; subtotalPaise: number }) => api.post<OfferPreview>('/offers/preview', input),
  })
}

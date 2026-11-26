import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import type { Paginated } from '@/admin/types/api'
import type { Review, ReviewInput, ReviewListParams, ReviewStats } from './types'

export const reviewKeys = {
  all: ['reviews'] as const,
  list: (params: ReviewListParams) => [...reviewKeys.all, 'list', params] as const,
  stats: () => [...reviewKeys.all, 'stats'] as const,
}

type Reply = { review: Review }

export function useReviews(params: ReviewListParams) {
  return useQuery({
    queryKey: reviewKeys.list(params),
    queryFn: ({ signal }) => api.get<Paginated<'reviews', Review>>('/reviews', { ...params }, signal),
    placeholderData: keepPreviousData,
  })
}

export function useReviewStats() {
  return useQuery({ queryKey: reviewKeys.stats(), queryFn: () => api.get<ReviewStats>('/reviews/stats') })
}

function useReviewMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: reviewKeys.all }) })
}

export const useCreateReview = () =>
  useReviewMutation((input: ReviewInput) => api.post<Reply>('/reviews', input).then((r) => r.review))

export const useUpdateReview = () =>
  useReviewMutation(({ id, ...input }: Partial<ReviewInput> & { id: string }) => api.patch<Reply>(`/reviews/${id}`, input).then((r) => r.review))

export const useSetReviewPublished = () =>
  useReviewMutation(({ id, isPublished }: { id: string; isPublished: boolean }) => api.patch<Reply>(`/reviews/${id}/status`, { isPublished }))

export const useDeleteReview = () => useReviewMutation((id: string) => api.delete(`/reviews/${id}`))

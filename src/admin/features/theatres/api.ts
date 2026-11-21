import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import type { Paginated } from '@/admin/types/api'
import type { Theatre, TheatreInput, TheatreListParams } from './types'

export const theatreKeys = {
  all: ['theatres'] as const,
  lists: () => [...theatreKeys.all, 'list'] as const,
  list: (params: TheatreListParams) => [...theatreKeys.lists(), params] as const,
  detail: (id: string) => [...theatreKeys.all, 'detail', id] as const,
}

type TheatreReply = { theatre: Theatre }

// ---------------------------------------------------------------- queries

export function useTheatres(params: TheatreListParams) {
  return useQuery({
    queryKey: theatreKeys.list(params),
    queryFn: ({ signal }) => api.get<Paginated<'theatres', Theatre>>('/theatres', { ...params }, signal),
    placeholderData: keepPreviousData, // keep the table while the next page / filter loads
  })
}

export function useTheatre(id: string) {
  return useQuery({
    queryKey: theatreKeys.detail(id),
    queryFn: ({ signal }) => api.get<TheatreReply>(`/theatres/${id}`, undefined, signal).then((r) => r.theatre),
  })
}

/** Every theatre, for dropdowns in other modules (slots, offers, add-ons). */
export function useTheatreOptions() {
  return useQuery({
    queryKey: theatreKeys.list({ limit: 100, sort: 'sortOrder' }),
    queryFn: () => api.get<Paginated<'theatres', Theatre>>('/theatres', { limit: 100, sort: 'sortOrder' }),
    select: (r) => r.theatres,
    staleTime: 5 * 60_000,
  })
}

// ---------------------------------------------------------------- mutations

/** After any change: refresh lists, and store the fresh theatre so its page updates instantly. */
function useOnTheatreSaved() {
  const qc = useQueryClient()
  return (theatre: Theatre) => {
    qc.setQueryData(theatreKeys.detail(theatre.id), theatre)
    qc.invalidateQueries({ queryKey: theatreKeys.lists() })
  }
}

export function useCreateTheatre() {
  const onSaved = useOnTheatreSaved()
  return useMutation({
    mutationFn: (input: Partial<TheatreInput>) => api.post<TheatreReply>('/theatres', input).then((r) => r.theatre),
    onSuccess: onSaved,
  })
}

export function useUpdateTheatre(id: string) {
  const onSaved = useOnTheatreSaved()
  return useMutation({
    mutationFn: (input: Partial<TheatreInput> & { images?: string[] }) =>
      api.patch<TheatreReply>(`/theatres/${id}`, input).then((r) => r.theatre),
    onSuccess: onSaved,
  })
}

export function useSetTheatreActive() {
  const onSaved = useOnTheatreSaved()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch<TheatreReply>(`/theatres/${id}/status`, { isActive }).then((r) => r.theatre),
    onSuccess: onSaved,
  })
}

export function useDeleteTheatre() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/theatres/${id}`),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: theatreKeys.detail(id) })
      qc.invalidateQueries({ queryKey: theatreKeys.lists() })
    },
  })
}

export function useUploadTheatreImages(id: string) {
  const onSaved = useOnTheatreSaved()
  return useMutation({
    mutationFn: (files: File[]) => api.upload<TheatreReply>(`/theatres/${id}/images`, 'images', files).then((r) => r.theatre),
    onSuccess: onSaved,
  })
}

export function useRemoveTheatreImage(id: string) {
  const onSaved = useOnTheatreSaved()
  return useMutation({
    mutationFn: (url: string) => api.delete<TheatreReply>(`/theatres/${id}/images`, { url }).then((r) => r.theatre),
    onSuccess: onSaved,
  })
}

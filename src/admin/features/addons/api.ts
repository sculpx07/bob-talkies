import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import type { Paginated } from '@/admin/types/api'
import type { Addon, AddonCategory, AddonInput, AddonListParams, CategoryInput } from './types'

export const addonKeys = {
  all: ['addons'] as const,
  lists: () => [...addonKeys.all, 'list'] as const,
  list: (params: AddonListParams) => [...addonKeys.lists(), params] as const,
  detail: (id: string) => [...addonKeys.all, 'detail', id] as const,
  categories: () => [...addonKeys.all, 'categories'] as const,
}

type AddonReply = { addon: Addon }

// ---------------------------------------------------------------- add-ons

export function useAddons(params: AddonListParams) {
  return useQuery({
    queryKey: addonKeys.list(params),
    queryFn: ({ signal }) => api.get<Paginated<'addons', Addon>>('/addons', { ...params }, signal),
    placeholderData: keepPreviousData,
  })
}

export function useAddon(id: string) {
  return useQuery({
    queryKey: addonKeys.detail(id),
    queryFn: ({ signal }) => api.get<AddonReply>(`/addons/${id}`, undefined, signal).then((r) => r.addon),
  })
}

/** After a change: refresh lists and category counts, store the fresh add-on. */
function useOnAddonSaved() {
  const qc = useQueryClient()
  return (addon: Addon) => {
    qc.setQueryData(addonKeys.detail(addon.id), addon)
    qc.invalidateQueries({ queryKey: addonKeys.lists() })
    qc.invalidateQueries({ queryKey: addonKeys.categories() })
  }
}

export function useCreateAddon() {
  const onSaved = useOnAddonSaved()
  return useMutation({
    mutationFn: (input: AddonInput) => api.post<AddonReply>('/addons', input).then((r) => r.addon),
    onSuccess: onSaved,
  })
}

export function useUpdateAddon(id: string) {
  const onSaved = useOnAddonSaved()
  return useMutation({
    mutationFn: (input: Partial<AddonInput>) => api.patch<AddonReply>(`/addons/${id}`, input).then((r) => r.addon),
    onSuccess: onSaved,
  })
}

/** Quick switches from the list: listed on the site / out of stock. */
export function useSetAddonStatus() {
  const onSaved = useOnAddonSaved()
  return useMutation({
    mutationFn: ({ id, ...status }: { id: string; isAvailable?: boolean; isOutOfStock?: boolean }) =>
      api.patch<AddonReply>(`/addons/${id}/status`, status).then((r) => r.addon),
    onSuccess: onSaved,
  })
}

/** One size's stock, e.g. mark "1 kg" out of stock. */
export function useSetVariantStock() {
  const onSaved = useOnAddonSaved()
  return useMutation({
    mutationFn: ({ addonId, variantId, isOutOfStock }: { addonId: string; variantId: string; isOutOfStock: boolean }) =>
      api.patch<AddonReply>(`/addons/${addonId}/variants/${variantId}`, { isOutOfStock }).then((r) => r.addon),
    onSuccess: onSaved,
  })
}

export function useDeleteAddon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/addons/${id}`),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: addonKeys.detail(id) })
      qc.invalidateQueries({ queryKey: addonKeys.lists() })
      qc.invalidateQueries({ queryKey: addonKeys.categories() })
    },
  })
}

export function useUploadAddonImage(id: string) {
  const onSaved = useOnAddonSaved()
  return useMutation({
    mutationFn: (file: File) => api.upload<AddonReply>(`/addons/${id}/image`, 'image', [file]).then((r) => r.addon),
    onSuccess: onSaved,
  })
}

export function useRemoveAddonImage(id: string) {
  const onSaved = useOnAddonSaved()
  return useMutation({
    mutationFn: () => api.delete<AddonReply>(`/addons/${id}/image`).then((r) => r.addon),
    onSuccess: onSaved,
  })
}

// ---------------------------------------------------------------- categories

export function useAddonCategories() {
  return useQuery({
    queryKey: addonKeys.categories(),
    queryFn: () => api.get<Paginated<'categories', AddonCategory>>('/addon-categories', { limit: 100, sort: 'sortOrder' }).then((r) => r.categories),
    staleTime: 60_000,
  })
}

export function useSaveCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<CategoryInput> & { id?: string }) =>
      (id ? api.patch<{ category: AddonCategory }>(`/addon-categories/${id}`, input) : api.post<{ category: AddonCategory }>('/addon-categories', input))
        .then((r) => r.category),
    onSuccess: () => qc.invalidateQueries({ queryKey: addonKeys.all }), // names show inside add-on rows too
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/addon-categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: addonKeys.categories() }),
  })
}

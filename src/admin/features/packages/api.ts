import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import type { Paginated } from '@/admin/types/api'
import type { CelebrationPackage, PackageInput, PackageListParams } from './types'

export const packageKeys = {
  all: ['packages'] as const,
  list: (params: PackageListParams) => [...packageKeys.all, 'list', params] as const,
}

type Reply = { package: CelebrationPackage }

export function usePackages(params: PackageListParams) {
  return useQuery({
    queryKey: packageKeys.list(params),
    queryFn: ({ signal }) => api.get<Paginated<'packages', CelebrationPackage>>('/packages', { ...params }, signal),
    placeholderData: keepPreviousData,
  })
}

function usePackageMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: packageKeys.all }) })
}

export const useCreatePackage = () =>
  usePackageMutation((input: PackageInput) => api.post<Reply>('/packages', input).then((r) => r.package))

export const useUpdatePackage = () =>
  usePackageMutation(({ id, ...input }: Partial<PackageInput> & { id: string }) => api.patch<Reply>(`/packages/${id}`, input).then((r) => r.package))

export const useSetPackageAvailable = () =>
  usePackageMutation(({ id, isAvailable }: { id: string; isAvailable: boolean }) => api.patch<Reply>(`/packages/${id}/status`, { isAvailable }))

export const useDeletePackage = () => usePackageMutation((id: string) => api.delete(`/packages/${id}`))

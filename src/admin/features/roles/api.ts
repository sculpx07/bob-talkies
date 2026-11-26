import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import { userKeys } from '@/admin/features/users/api'
import type { PermissionGroup, RoleInput, RoleRecord } from './types'

export const roleKeys = {
  all: ['roles'] as const,
  list: () => [...roleKeys.all, 'list'] as const,
  detail: (id: string) => [...roleKeys.all, 'detail', id] as const,
  permissions: () => [...roleKeys.all, 'permissions'] as const,
}

type Reply = { role: RoleRecord }

/** Every role, system role first (Roles & permissions, and the Staff role picker). */
export function useRoles(enabled = true) {
  return useQuery({
    queryKey: roleKeys.list(),
    queryFn: () => api.get<{ roles: RoleRecord[] }>('/roles').then((r) => r.roles),
    enabled,
    staleTime: 60_000,
  })
}

export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: roleKeys.detail(id ?? ''),
    queryFn: () => api.get<Reply>(`/roles/${id}`).then((r) => r.role),
    enabled: Boolean(id),
  })
}

/** The permission catalogue for the role editor; it only changes with a backend release. */
export function usePermissionGroups() {
  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: () => api.get<{ groups: PermissionGroup[] }>('/roles/permissions').then((r) => r.groups),
    staleTime: Infinity,
  })
}

function useRoleMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roleKeys.all })
      qc.invalidateQueries({ queryKey: userKeys.all }) // staff lists show role names
    },
  })
}

export const useCreateRole = () => useRoleMutation((input: RoleInput) => api.post<Reply>('/roles', input).then((r) => r.role))

export const useUpdateRole = () =>
  useRoleMutation(({ id, ...input }: Partial<RoleInput> & { id: string }) => api.patch<Reply>(`/roles/${id}`, input).then((r) => r.role))

export const useDeleteRole = () => useRoleMutation((id: string) => api.delete(`/roles/${id}`))

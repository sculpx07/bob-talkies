import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import { tokens } from '@/admin/lib/api/tokens'
import type { Paginated } from '@/admin/types/api'
import type { ChangePasswordInput, StaffInput, StaffListParams, StaffMember, StaffWithPassword } from './types'

/** Minimal staff shape for pickers (assign a lead, filter by staff member). */
export interface StaffOption {
  id: string
  name: string
  email: string
  role: { id: string; name: string; displayName: string } | null
}

export const userKeys = {
  all: ['users'] as const,
  options: () => [...userKeys.all, 'options'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: StaffListParams) => [...userKeys.lists(), params] as const,
}

type StaffReply = { user: StaffMember }

// ---------------------------------------------------------------- queries

/** Active staff (any admin). */
export function useStaffOptions() {
  return useQuery({
    queryKey: userKeys.options(),
    queryFn: () => api.get<{ users: StaffOption[] }>('/users/options').then((r) => r.users),
    staleTime: 5 * 60_000,
  })
}

/** Every staff account (needs "View staff"). */
export function useStaff(params: StaffListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: ({ signal }) => api.get<Paginated<'users', StaffMember>>('/users', { ...params }, signal),
    placeholderData: keepPreviousData,
  })
}

// ---------------------------------------------------------------- mutations (need "Manage staff")

function useStaffMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }) })
}

export const useCreateStaff = () =>
  useStaffMutation((input: StaffInput) => api.post<StaffWithPassword>('/users', input))

export const useUpdateStaff = () =>
  useStaffMutation(({ id, ...input }: Partial<StaffInput> & { id: string }) => api.patch<StaffReply>(`/users/${id}`, input).then((r) => r.user))

export const useSetStaffActive = () =>
  useStaffMutation(({ id, isActive }: { id: string; isActive: boolean }) => api.patch<StaffReply>(`/users/${id}/status`, { isActive }).then((r) => r.user))

export const useResetStaffPassword = () =>
  useStaffMutation((id: string) => api.post<StaffWithPassword>(`/users/${id}/reset-password`))

// ---------------------------------------------------------------- own account

/**
 * Changes the signed-in person's password. The backend signs out every other
 * device and returns fresh tokens for this one, which are stored here.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      const result = await api.post<{ accessToken: string; refreshToken: string }>('/auth/change-password', input)
      tokens.set(result.accessToken, result.refreshToken)
    },
  })
}

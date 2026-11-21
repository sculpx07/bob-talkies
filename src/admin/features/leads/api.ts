import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import type { Paginated } from '@/admin/types/api'
import { dashboardKeys } from '@/admin/features/dashboard/api'
import type { Lead, LeadDetail, LeadInput, LeadListItem, LeadListParams, LeadStats, LeadStatus } from './types'

export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (params: LeadListParams) => [...leadKeys.lists(), params] as const,
  stats: () => [...leadKeys.all, 'stats'] as const,
  detail: (id: string) => [...leadKeys.all, 'detail', id] as const,
}

type LeadReply = { lead: Lead }

// ---------------------------------------------------------------- queries

export function useLeads(params: LeadListParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: ({ signal }) => api.get<Paginated<'leads', LeadListItem>>('/leads', { ...params }, signal),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000, // website enquiries arrive on their own
  })
}

export function useLeadStats() {
  return useQuery({ queryKey: leadKeys.stats(), queryFn: () => api.get<LeadStats>('/leads/stats'), refetchInterval: 60_000 })
}

/** A lead with its related enquiries and bookings; skipped when `id` is empty. */
export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: ({ signal }) => api.get<LeadDetail>(`/leads/${id}`, undefined, signal),
    enabled: Boolean(id),
  })
}

// ---------------------------------------------------------------- mutations

/** After a change: refresh the inbox, counts, dashboard and this lead's page. */
function useOnLeadChanged() {
  const qc = useQueryClient()
  return (lead: Lead) => {
    qc.setQueryData<LeadDetail>(leadKeys.detail(lead.id), (old) => (old ? { ...old, lead } : old))
    qc.invalidateQueries({ queryKey: leadKeys.detail(lead.id) })
    qc.invalidateQueries({ queryKey: leadKeys.lists() })
    qc.invalidateQueries({ queryKey: leadKeys.stats() })
    qc.invalidateQueries({ queryKey: dashboardKeys.all })
  }
}

function useLeadMutation<TInput>(request: (input: TInput) => Promise<LeadReply>) {
  const onChanged = useOnLeadChanged()
  return useMutation({ mutationFn: (input: TInput) => request(input).then((r) => r.lead), onSuccess: onChanged })
}

export const useCreateLead = () => useLeadMutation((input: LeadInput) => api.post<LeadReply>('/leads', input))

export const useUpdateLead = () =>
  useLeadMutation(({ id, ...input }: Partial<LeadInput> & { id: string }) => api.patch<LeadReply>(`/leads/${id}`, input))

export const useChangeLeadStatus = () =>
  useLeadMutation(({ id, ...input }: { id: string; status: Exclude<LeadStatus, 'converted'>; note?: string; lostReason?: string; followUpAt?: string }) =>
    api.patch<LeadReply>(`/leads/${id}/status`, input))

export const useAssignLead = () =>
  useLeadMutation(({ id, assignedTo }: { id: string; assignedTo: string | null }) => api.patch<LeadReply>(`/leads/${id}/assign`, { assignedTo }))

export const useAddLeadActivity = () =>
  useLeadMutation(({ id, ...input }: { id: string; type: 'note' | 'call' | 'whatsapp' | 'email'; text: string }) =>
    api.post<LeadReply>(`/leads/${id}/activity`, input))

export const useConvertLead = () =>
  useLeadMutation(({ id, ...input }: { id: string; booking: string; note?: string }) => api.post<LeadReply>(`/leads/${id}/convert`, input))

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: leadKeys.detail(id) })
      qc.invalidateQueries({ queryKey: leadKeys.all })
    },
  })
}

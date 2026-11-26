import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import { settingKeys } from '../api'
import type { CrmSettings, CrmSettingsPatch, CrmSyncStatus } from './types'

export const crmKeys = {
  settings: () => [...settingKeys.all, 'crm'] as const,
  sync: () => [...settingKeys.all, 'crm', 'sync'] as const,
}

export function useCrmSettings() {
  return useQuery({
    queryKey: crmKeys.settings(),
    queryFn: () => api.get<{ crm: CrmSettings }>('/settings/crm').then((r) => r.crm),
  })
}

/** Queue counts and latest problems; refreshed every 15 s while the tab is open. */
export function useCrmSyncStatus(enabled = true) {
  return useQuery({
    queryKey: crmKeys.sync(),
    queryFn: () => api.get<{ sync: CrmSyncStatus }>('/settings/crm/sync').then((r) => r.sync),
    refetchInterval: 15_000,
    enabled,
  })
}

export function useUpdateCrmSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: CrmSettingsPatch) => api.patch<{ crm: CrmSettings }>('/settings/crm', patch).then((r) => r.crm),
    onSuccess: (crm) => {
      qc.setQueryData(crmKeys.settings(), crm)
      qc.invalidateQueries({ queryKey: crmKeys.sync() })
    },
  })
}

/** Sends a signed test event with the saved URL and secret. */
export function useTestCrmConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<{ ok: boolean; message: string }>('/settings/crm/test'),
    onSuccess: () => qc.invalidateQueries({ queryKey: crmKeys.settings() }),
  })
}

export function useRetryFailedCrmEvents() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<{ requeued: number; sync: CrmSyncStatus }>('/settings/crm/sync/retry'),
    onSuccess: (r) => qc.setQueryData(crmKeys.sync(), r.sync),
  })
}

/** Sends the leads and bookings of the last N days again (records already in the CRM are updated, not duplicated). */
export function useBackfillCrmLeads() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (days: number) => api.post<{ leads: number; bookings: number; sync: CrmSyncStatus }>('/settings/crm/sync/backfill', { days }),
    onSuccess: (r) => qc.setQueryData(crmKeys.sync(), r.sync),
  })
}

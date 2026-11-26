import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import type { Paginated } from '@/admin/types/api'
import type { SettingChange, SettingHistoryEntry, Settings, SettingsPatch } from './types'

export const settingKeys = {
  all: ['settings'] as const,
  current: () => [...settingKeys.all, 'current'] as const,
  history: (page: number) => [...settingKeys.all, 'history', page] as const,
}

export function useSettings() {
  return useQuery({
    queryKey: settingKeys.current(),
    queryFn: () => api.get<{ settings: Settings }>('/settings').then((r) => r.settings),
  })
}

export function useSettingHistory(page: number) {
  return useQuery({
    queryKey: settingKeys.history(page),
    queryFn: () => api.get<Paginated<'history', SettingHistoryEntry>>('/settings/history', { page, limit: 20 }),
    placeholderData: keepPreviousData,
  })
}

/** Needs "Edit settings". Sends only the changed fields. */
export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: SettingsPatch) => api.patch<{ settings: Settings; changes: SettingChange[] }>('/settings', patch),
    onSuccess: ({ settings }) => {
      qc.setQueryData(settingKeys.current(), settings)
      qc.invalidateQueries({ queryKey: [...settingKeys.all, 'history'] })
    },
  })
}

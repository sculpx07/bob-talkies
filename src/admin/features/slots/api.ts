import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import type { Paginated } from '@/admin/types/api'
import type { DaySchedule, Slot, SlotBlock, SlotBlockInput, SlotInput, SpecialDate, SpecialDateType } from './types'

/*
 * Slots, blocks and special dates all feed the day schedule, so they share one
 * cache namespace: any change refreshes everything under "schedule".
 */
export const scheduleKeys = {
  all: ['schedule'] as const,
  slots: (theatreId: string) => [...scheduleKeys.all, 'slots', theatreId] as const,
  day: (theatreId: string, date: string) => [...scheduleKeys.all, 'day', theatreId, date] as const,
  blocks: (params: BlockListParams) => [...scheduleKeys.all, 'blocks', params] as const,
  specialDates: (params: SpecialDateListParams) => [...scheduleKeys.all, 'special', params] as const,
}

function useRefreshSchedule() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: scheduleKeys.all })
}

// ---------------------------------------------------------------- slots

export function useSlots(theatreId: string) {
  return useQuery({
    queryKey: scheduleKeys.slots(theatreId),
    queryFn: () => api.get<Paginated<'slots', Slot>>('/slots', { theatre: theatreId, limit: 200, sort: 'startMinutes' }).then((r) => r.slots),
    enabled: Boolean(theatreId),
  })
}

export function useCreateSlot() {
  const refresh = useRefreshSchedule()
  return useMutation({
    mutationFn: (input: SlotInput) => api.post<{ slot: Slot }>('/slots', input).then((r) => r.slot),
    onSuccess: refresh,
  })
}

export function useUpdateSlot() {
  const refresh = useRefreshSchedule()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<SlotInput> & { id: string }) => api.patch<{ slot: Slot }>(`/slots/${id}`, input).then((r) => r.slot),
    onSuccess: refresh,
  })
}

export function useSetSlotActive() {
  const refresh = useRefreshSchedule()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.patch<{ slot: Slot }>(`/slots/${id}/status`, { isActive }).then((r) => r.slot),
    onSuccess: refresh,
  })
}

export function useDeleteSlot() {
  const refresh = useRefreshSchedule()
  return useMutation({ mutationFn: (id: string) => api.delete(`/slots/${id}`), onSuccess: refresh })
}

// ---------------------------------------------------------------- day preview

export function useDaySchedule(theatreId: string, date: string) {
  return useQuery({
    queryKey: scheduleKeys.day(theatreId, date),
    queryFn: () => api.get<DaySchedule>('/slots/schedule', { theatre: theatreId, date }),
    enabled: Boolean(theatreId && date),
    placeholderData: keepPreviousData,
  })
}

// ---------------------------------------------------------------- blocks

export interface BlockListParams {
  theatre?: string
  startDate?: string
  page?: number
}

export function useSlotBlocks(params: BlockListParams) {
  return useQuery({
    queryKey: scheduleKeys.blocks(params),
    queryFn: () => api.get<Paginated<'blocks', SlotBlock>>('/slot-blocks', { ...params, limit: 50, includeGlobal: true }),
    placeholderData: keepPreviousData,
  })
}

export function useCreateBlock() {
  const refresh = useRefreshSchedule()
  return useMutation({
    mutationFn: (input: SlotBlockInput) => api.post<{ block: SlotBlock }>('/slot-blocks', input).then((r) => r.block),
    onSuccess: refresh,
  })
}

export function useDeleteBlock() {
  const refresh = useRefreshSchedule()
  return useMutation({ mutationFn: (id: string) => api.delete(`/slot-blocks/${id}`), onSuccess: refresh })
}

// ---------------------------------------------------------------- special dates

export interface SpecialDateListParams {
  theatre?: string
  from?: string
  page?: number
}

export function useSpecialDates(params: SpecialDateListParams) {
  return useQuery({
    queryKey: scheduleKeys.specialDates(params),
    queryFn: () => api.get<Paginated<'specialDates', SpecialDate>>('/special-dates', { ...params, limit: 100, includeGlobal: true }),
    placeholderData: keepPreviousData,
  })
}

export function useSaveSpecialDate() {
  const refresh = useRefreshSchedule()
  return useMutation({
    mutationFn: ({ id, ...input }: { id?: string; theatre?: string | null; date?: string; type: SpecialDateType; note: string }) =>
      (id
        ? api.patch<{ specialDate: SpecialDate }>(`/special-dates/${id}`, { type: input.type, note: input.note })
        : api.post<{ specialDate: SpecialDate }>('/special-dates', input)
      ).then((r) => r.specialDate),
    onSuccess: refresh,
  })
}

export function useDeleteSpecialDate() {
  const refresh = useRefreshSchedule()
  return useMutation({ mutationFn: (id: string) => api.delete(`/special-dates/${id}`), onSuccess: refresh })
}

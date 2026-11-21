import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import { saveBlob } from '@/admin/lib/utils/download'
import type { BookingStatus } from '@/admin/features/bookings/types'
import type { ReportOverview, ReportRange, ReportSummary } from './types'

export const reportKeys = {
  all: ['reports'] as const,
  overview: () => [...reportKeys.all, 'overview'] as const,
  summary: (range: ReportRange) => [...reportKeys.all, 'summary', range] as const,
}

/** Dashboard numbers: today, the next 7 days, unpaid upcoming bookings. */
export function useReportOverview() {
  return useQuery({
    queryKey: reportKeys.overview(),
    queryFn: () => api.get<ReportOverview>('/reports/overview'),
    refetchInterval: 60_000,
  })
}

export function useReportSummary(range: ReportRange, enabled = true) {
  return useQuery({
    queryKey: reportKeys.summary(range),
    queryFn: ({ signal }) => api.get<ReportSummary>('/reports/summary', { ...range }, signal),
    placeholderData: keepPreviousData,
    enabled,
  })
}

/** Downloads the bookings in a range as a CSV file. */
export function useExportBookings() {
  return useMutation({
    mutationFn: async ({ status, ...range }: ReportRange & { status?: BookingStatus[] }) => {
      const blob = await api.download('/reports/bookings.csv', { ...range, status })
      saveBlob(blob, `bob-bookings-${range.from}-to-${range.to}.csv`)
    },
  })
}

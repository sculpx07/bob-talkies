import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import { settingKeys } from '../api'
import type { ConnectionCheck, PaymentSettings, PaymentSettingsPatch } from './types'

export const paymentSettingKeys = {
  current: () => [...settingKeys.all, 'payments'] as const,
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: paymentSettingKeys.current(),
    queryFn: () => api.get<{ settings: PaymentSettings }>('/settings/payments').then((r) => r.settings),
  })
}

/** Needs "Payment gateway" permission. */
export function useUpdatePaymentSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: PaymentSettingsPatch) => api.patch<{ settings: PaymentSettings }>('/settings/payments', patch).then((r) => r.settings),
    onSuccess: (settings) => {
      qc.setQueryData(paymentSettingKeys.current(), settings)
      qc.invalidateQueries({ queryKey: [...settingKeys.all, 'history'] })
    },
  })
}

/** Checks the saved Razorpay keys against Razorpay. */
export function useTestPaymentConnection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<ConnectionCheck>('/settings/payments/test'),
    onSuccess: () => qc.invalidateQueries({ queryKey: paymentSettingKeys.current() }),
  })
}

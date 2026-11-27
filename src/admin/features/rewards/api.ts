import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/admin/lib/api/client'
import type { Paginated } from '@/admin/types/api'
import type {
  ActivityEntry, ActivityParams, AdjustPointsInput, CustomerRewards, Referral, ReferralStatus, ReferralsParams, RewardsCustomerRow, RewardsCustomersParams, RewardsCustomersSummary,
} from './types'

export const rewardsKeys = {
  all: ['rewards'] as const,
  customer: (mobile: string) => [...rewardsKeys.all, 'customer', mobile] as const,
  referrals: (params: ReferralsParams) => [...rewardsKeys.all, 'referrals', params] as const,
  activity: (params: ActivityParams) => [...rewardsKeys.all, 'activity', params] as const,
}

const MOBILE_RE = /^[6-9]\d{9}$/

/** Every customer with their points and what is still to come. */
export function useRewardsCustomers(params: RewardsCustomersParams) {
  return useQuery({
    queryKey: [...rewardsKeys.all, 'customers', params] as const,
    queryFn: ({ signal }) => api.get<Paginated<'customers', RewardsCustomerRow> & { summary: RewardsCustomersSummary }>('/rewards/customers', { ...params }, signal),
    placeholderData: keepPreviousData,
  })
}

/** A customer's points and history, by mobile number (only for a full 10-digit number). */
export function useCustomerRewards(mobile: string) {
  return useQuery({
    queryKey: rewardsKeys.customer(mobile),
    queryFn: ({ signal }) => api.get<CustomerRewards>(`/rewards/customers/${mobile}`, undefined, signal),
    enabled: MOBILE_RE.test(mobile),
  })
}

export function useAdjustPoints(mobile: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AdjustPointsInput) => api.post<CustomerRewards>(`/rewards/customers/${mobile}/adjust`, input),
    onSuccess: (data) => {
      qc.setQueryData(rewardsKeys.customer(mobile), data)
      qc.invalidateQueries({ queryKey: [...rewardsKeys.all, 'activity'] })
    },
  })
}

export function useReferrals(params: ReferralsParams) {
  return useQuery({
    queryKey: rewardsKeys.referrals(params),
    queryFn: ({ signal }) => api.get<Paginated<'referrals', Referral> & { counts: Record<ReferralStatus, number> }>('/rewards/referrals', { ...params }, signal),
    placeholderData: keepPreviousData,
  })
}

export function useRejectReferral() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => api.post<{ referral: Referral }>(`/rewards/referrals/${id}/reject`, { reason }).then((r) => r.referral),
    onSuccess: () => qc.invalidateQueries({ queryKey: rewardsKeys.all }),
  })
}

export function useRewardActivity(params: ActivityParams) {
  return useQuery({
    queryKey: rewardsKeys.activity(params),
    queryFn: ({ signal }) => api.get<Paginated<'entries', ActivityEntry>>('/rewards/entries', { ...params }, signal),
    placeholderData: keepPreviousData,
  })
}

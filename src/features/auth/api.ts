import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { customerSession, type CustomerProfile } from './session'

/*
 * Customer login with a mobile number and a 6-digit OTP (bob-admin /public/auth).
 * Until an SMS provider is set up, the backend accepts 123456 for every number.
 */

export interface OtpRequestReply {
  success: boolean
  /** seconds the code is valid */
  expiresIn: number
  /** seconds before another code can be requested */
  resendAfter: number
}

export interface OtpVerifyReply {
  success: boolean
  token: string
  verified: boolean
  customer: CustomerProfile
}

export const authApi = {
  requestOtp: (mobile: string) => api.post<OtpRequestReply>('/auth/otp/request', { mobile }),
  verifyOtp: (mobile: string, otp: string) => api.post<OtpVerifyReply>('/auth/otp/verify', { mobile, otp }),
}

export function useRequestOtp() {
  return useMutation({ mutationFn: (mobile: string) => authApi.requestOtp(mobile) })
}

/** Verifies the code and signs the customer in on this device. */
export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ mobile, otp }: { mobile: string; otp: string }) => authApi.verifyOtp(mobile, otp),
    onSuccess: ({ token, customer }) => customerSession.set({ token, customer }),
  })
}

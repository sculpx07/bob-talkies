import type { UserRef } from '@/admin/types/api'

export type PaymentProvider = 'dev' | 'razorpay'
export type RazorpayMode = 'test' | 'live'

/** Admin → Settings → Payments (bob-admin GET /settings/payments). Secret values are never sent. */
export interface PaymentSettings {
  provider: PaymentProvider
  /** false on the live server: the test payment screen cannot be chosen */
  testPaymentsAllowed: boolean
  /** false when the server has no SETTINGS_ENCRYPTION_KEY: secrets cannot be saved */
  canStoreSecrets: boolean
  razorpay: {
    keyId: string
    mode: RazorpayMode | null
    keySecretSet: boolean
    /** e.g. "••••ab12" */
    keySecretHint: string
    webhookSecretSet: boolean
    webhookSecretHint: string
    /** key id and key secret are both saved */
    ready: boolean
    webhookUrl: string
    lastCheck: { at: string; ok: boolean; message: string } | null
  }
  updatedBy: UserRef | null
  updatedAt: string | null
}

/** A secret: a string sets it, null removes it, leaving it out keeps the saved one. */
export interface PaymentSettingsPatch {
  provider?: PaymentProvider
  razorpay?: {
    keyId?: string
    keySecret?: string | null
    webhookSecret?: string | null
  }
}

export interface ConnectionCheck {
  ok: boolean
  message: string
  mode: RazorpayMode
  checkedAt: string
}

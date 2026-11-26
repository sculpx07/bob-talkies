/** Settings → CRM (bob-admin /settings/crm). The secret is write-only: only its last 4 characters come back. */
export interface CrmSettings {
  enabled: boolean
  eventsUrl: string
  secretHint: string
  hasSecret: boolean
  /** false when the server has no SETTINGS_ENCRYPTION_KEY (secrets cannot be saved) */
  canStoreSecrets: boolean
  lastCheck: { at: string; ok: boolean; message: string } | null
  /** paste into CRM → Connected apps → Callback URL so CRM changes come back here */
  callbackUrl: string
  updatedAt: string | null
}

export interface CrmSettingsPatch {
  enabled?: boolean
  eventsUrl?: string
  /** empty = keep the saved one */
  secret?: string
}

export interface CrmSyncStatus {
  pending: number
  failed: number
  sentRecently: number
  lastSentAt: string | null
  problems: Array<{
    id: string
    type: string
    /** e.g. "lead:<id>" or "draft:<id>" */
    record: string
    status: 'pending' | 'failed'
    attempts: number
    error: string
    nextAttemptAt: string | null
    at: string
  }>
}

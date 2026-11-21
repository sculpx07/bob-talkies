import { z } from 'zod'
import { paiseToRupees, rupeesToPaise } from '@/admin/lib/utils/money'
import type { SettingChange, Settings, SettingsPatch } from './types'

const whole = (min: number, max: number, label: string) =>
  z.number({ error: `Enter ${label}` }).int('Whole number').min(min, `At least ${min}`).max(max, `At most ${max}`)

/** Settings form (decoration price in rupees). Limits mirror the backend. */
export const settingsFormSchema = z.object({
  pricing: z.object({
    gstPercent: z.number({ error: 'Enter GST %' }).min(0, 'At least 0').max(100, 'At most 100')
      .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-9, 'At most 2 decimal places'),
    pricesIncludeGst: z.boolean(),
    advancePercent: whole(1, 100, 'the advance %'),
    allowFullPayment: z.boolean(),
    decorationPrice: z.number({ error: 'Enter a price' }).min(0, 'Cannot be negative').max(1_000_000),
  }),
  booking: z.object({
    slotHoldMinutes: whole(1, 60, 'minutes'),
    minLeadHours: whole(0, 168, 'hours'),
    maxAdvanceDays: whole(1, 365, 'days'),
    refundCutoffHours: whole(0, 720, 'hours'),
  }),
  contact: z.object({
    whatsappNumber: z.string().trim().regex(/^\d{10,15}$/, 'Digits only with country code, e.g. 919876543210'),
    phone: z.string().trim().min(5, 'Too short').max(30),
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    address: z.string().trim().min(5, 'Too short').max(300),
  }),
})

export type SettingsFormValues = z.infer<typeof settingsFormSchema>

export function settingsToForm(s: Settings): SettingsFormValues {
  const { decorationPricePaise, ...pricing } = s.pricing
  return {
    pricing: { ...pricing, decorationPrice: Number(paiseToRupees(decorationPricePaise)) },
    booking: { ...s.booking },
    contact: { ...s.contact },
  }
}

function formToSettings(v: SettingsFormValues): Pick<Settings, 'pricing' | 'booking' | 'contact'> {
  const { decorationPrice, ...pricing } = v.pricing
  return {
    pricing: { ...pricing, decorationPricePaise: rupeesToPaise(decorationPrice) ?? 0 },
    booking: v.booking,
    contact: { ...v.contact, email: v.contact.email.trim().toLowerCase() },
  }
}

/** Only what changed, as a PATCH body plus a readable list of changes. */
export function diffSettings(current: Settings, values: SettingsFormValues): { patch: SettingsPatch; changes: SettingChange[] } {
  const next = formToSettings(values)
  const patch: Record<string, Record<string, unknown>> = {}
  const changes: SettingChange[] = []
  for (const section of ['pricing', 'booking', 'contact'] as const) {
    for (const [field, to] of Object.entries(next[section])) {
      const from = (current[section] as Record<string, unknown>)[field]
      if (from === to) continue
      patch[section] = { ...patch[section], [field]: to }
      changes.push({ path: `${section}.${field}`, from, to })
    }
  }
  return { patch: patch as SettingsPatch, changes }
}

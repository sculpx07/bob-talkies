import type { BadgeTone } from '@/admin/components/ui'
import type { ScheduleSlotStatus, SpecialDateType } from './types'

const SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Monday-first order for pickers and labels (values stay 0 = Sunday ... 6 = Saturday). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]
export const DAY_OPTIONS = WEEK_ORDER.map((d) => ({ value: d, label: SHORT[d] }))

/** [0..6] -> "Every day", [1..5] -> "Mon–Fri", [0,6] -> "Sat, Sun" */
export function formatDays(days: number[]): string {
  const set = new Set(days)
  if (set.size === 7) return 'Every day'
  if (set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d))) return 'Mon–Fri'
  return WEEK_ORDER.filter((d) => set.has(d)).map((d) => SHORT[d]).join(', ')
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/** Minutes between two "HH:mm" times; an end at or before the start runs past midnight. */
export function durationBetween(start: string, end: string): number {
  const diff = toMinutes(end) - toMinutes(start)
  return diff > 0 ? diff : diff + 24 * 60
}

export const endsNextDay = (start: string, end: string) => toMinutes(end) <= toMinutes(start)

/** 150 -> "2h 30m" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(' ') || '0m'
}

export const SPECIAL_DATE_BADGE: Record<SpecialDateType, { label: string; tone: BadgeTone }> = {
  high_demand: { label: 'High demand', tone: 'warning' },
  offer_date: { label: 'Offer date', tone: 'brand' },
}

export const SCHEDULE_STATUS_BADGE: Record<ScheduleSlotStatus, { label: string; tone: BadgeTone }> = {
  open: { label: 'Open', tone: 'success' },
  held: { label: 'Held', tone: 'warning' },
  booked: { label: 'Booked', tone: 'brand' },
  blocked: { label: 'Blocked', tone: 'neutral' },
}

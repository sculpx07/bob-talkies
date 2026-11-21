import { addDays, endOfMonth, format, formatDistanceStrict, parseISO, startOfMonth, subMonths } from 'date-fns'

const iso = (d: Date) => format(d, 'yyyy-MM-dd')

export type RangePreset = 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'next30' | 'custom'

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: 'last7', label: 'Last 7 days' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'lastMonth', label: 'Last month' },
  { value: 'next30', label: 'Next 30 days' },
  { value: 'custom', label: 'Custom dates' },
]

/** Dates for a preset, relative to `today`. */
export function presetRange(preset: Exclude<RangePreset, 'custom'>, today = new Date()): { from: string; to: string } {
  switch (preset) {
    case 'last7': return { from: iso(addDays(today, -6)), to: iso(today) }
    case 'last30': return { from: iso(addDays(today, -29)), to: iso(today) }
    case 'thisMonth': return { from: iso(startOfMonth(today)), to: iso(endOfMonth(today)) }
    case 'lastMonth': {
      const m = subMonths(today, 1)
      return { from: iso(startOfMonth(m)), to: iso(endOfMonth(m)) }
    }
    case 'next30': return { from: iso(today), to: iso(addDays(today, 29)) }
  }
}

/** "2026-12-02" -> "2 Dec" (chart axis) */
export const shortDate = (date: string) => format(parseISO(date), 'd MMM')

/** "2026-12-01".."2026-12-07" -> "1 Dec – 7 Dec 2026" */
export function rangeLabel(from: string, to: string) {
  const a = parseISO(from)
  const b = parseISO(to)
  return a.getFullYear() === b.getFullYear() ? `${format(a, 'd MMM')} – ${format(b, 'd MMM yyyy')}` : `${format(a, 'd MMM yyyy')} – ${format(b, 'd MMM yyyy')}`
}

/** 95 -> "1 hour 35 min"-ish, for response times. */
export function minutesLabel(minutes: number | null) {
  if (minutes === null) return '—'
  if (minutes < 60) return `${minutes} min`
  return formatDistanceStrict(0, minutes * 60_000)
}

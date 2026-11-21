import type { ReactNode } from 'react'
import { cn } from '@/admin/lib/utils/cn'

const tones = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
  brand: 'bg-violet-50 text-violet-700 ring-violet-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
} as const

export type BadgeTone = keyof typeof tones

export function Badge({ tone = 'neutral', dot, className, children }: { tone?: BadgeTone; dot?: boolean; className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  )
}

/** Maps a status value to a badge using a { value: { label, tone } } table defined per feature. */
export function StatusBadge<T extends string>({ status, map }: { status: T; map: Record<T, { label: string; tone: BadgeTone }> }) {
  const entry = map[status] ?? { label: status, tone: 'neutral' as const }
  return <Badge tone={entry.tone} dot>{entry.label}</Badge>
}

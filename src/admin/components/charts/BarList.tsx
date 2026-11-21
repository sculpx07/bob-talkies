import type { ReactNode } from 'react'
import { EmptyState } from '@/admin/components/ui'

export interface BarListRow {
  key: string
  label: ReactNode
  value: number
  /** formatted value shown at the right */
  display: ReactNode
  hint?: ReactNode
}

/** Ranked horizontal bars (top add-ons, theatres, sources). Bar length is relative to the largest row, or to `max`. */
export function BarList({ rows, max, empty = 'Nothing in this period' }: { rows: BarListRow[]; max?: number; empty?: string }) {
  if (!rows.length) return <EmptyState title={empty} className="py-8" />
  const top = max ?? Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-slate-700">{r.label}</span>
            <span className="shrink-0 tabular-nums font-medium text-slate-900">{r.display}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100" title={typeof r.display === 'string' ? r.display : undefined}>
            <div className="h-2 rounded-full bg-violet-500" style={{ width: `${Math.min(100, (r.value / top) * 100)}%`, minWidth: r.value > 0 ? 4 : 0 }} />
          </div>
          {r.hint && <p className="mt-1 text-xs text-slate-500">{r.hint}</p>}
        </li>
      ))}
    </ul>
  )
}

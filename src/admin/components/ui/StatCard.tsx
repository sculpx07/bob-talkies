import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/admin/lib/utils/cn'
import { Skeleton } from './States'

/** A number with a label, for dashboards and list headers. Becomes a link when `to` is given. */
export function StatCard({ label, value, hint, icon, to, loading, tone = 'neutral' }: {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  to?: string
  loading?: boolean
  tone?: 'neutral' | 'brand' | 'warning' | 'danger' | 'success'
}) {
  const iconTone = {
    neutral: 'bg-slate-100 text-slate-600',
    brand: 'bg-violet-100 text-violet-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-600',
    success: 'bg-emerald-100 text-emerald-700',
  }[tone]

  const body = (
    <div className={cn('flex h-full items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm', to && 'transition-colors hover:border-violet-300')}>
      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        {loading ? <Skeleton className="mt-2 h-7 w-16" /> : <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>}
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
      {icon && <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&>svg]:h-5 [&>svg]:w-5', iconTone)}>{icon}</span>}
    </div>
  )

  return to ? <Link to={to} className="focus-ring block h-full rounded-xl">{body}</Link> : body
}

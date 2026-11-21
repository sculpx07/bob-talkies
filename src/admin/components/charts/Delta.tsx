import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/admin/lib/utils/cn'

/**
 * Change against the previous period, e.g. "+12% vs prev." With an icon and a
 * sign, so the direction never depends on colour alone.
 * `lowerIsBetter` flips the tone (e.g. cancellation rate).
 */
export function Delta({ current, previous, lowerIsBetter, points }: { current: number; previous: number; lowerIsBetter?: boolean; points?: boolean }) {
  if (!previous && !current) return <span className="text-xs text-slate-400">No change</span>
  const diff = points ? Math.round((current - previous) * 10) / 10 : previous ? Math.round(((current - previous) / previous) * 1000) / 10 : null
  if (diff === null) return <span className="text-xs text-slate-500">New this period</span>
  const up = diff > 0
  const good = diff === 0 ? null : up !== Boolean(lowerIsBetter)
  const Icon = diff === 0 ? ArrowRight : up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', good === null ? 'text-slate-500' : good ? 'text-emerald-700' : 'text-red-600')}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {up ? '+' : ''}{diff}{points ? ' pts' : '%'} <span className="font-normal text-slate-500">vs prev.</span>
    </span>
  )
}

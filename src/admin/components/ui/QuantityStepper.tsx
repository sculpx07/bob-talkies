import { Minus, Plus } from 'lucide-react'
import { cn } from '@/admin/lib/utils/cn'

/** − n + control. 0 reads as "not added". */
export function QuantityStepper({ value, onChange, min = 0, max = 20, disabled, label }: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  /** what is being counted, for screen readers */
  label: string
}) {
  return (
    <div className={cn('inline-flex items-center rounded-lg border border-slate-300 bg-white', disabled && 'opacity-50')}>
      <button type="button" aria-label={`Fewer ${label}`} disabled={disabled || value <= min} onClick={() => onChange(value - 1)}
        className="focus-ring flex h-8 w-8 items-center justify-center rounded-l-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className={cn('w-8 text-center text-sm tabular-nums', value > 0 ? 'font-semibold text-slate-900' : 'text-slate-400')} aria-live="polite" aria-label={`${label}: ${value}`}>{value}</span>
      <button type="button" aria-label={`More ${label}`} disabled={disabled || value >= max} onClick={() => onChange(value + 1)}
        className="focus-ring flex h-8 w-8 items-center justify-center rounded-r-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

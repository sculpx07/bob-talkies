import { cn } from '@/admin/lib/utils/cn'

interface ChipGroupProps<T extends string | number> {
  options: Array<{ value: T; label: string }>
  value: T[]
  onChange: (value: T[]) => void
  /** label for screen readers */
  label: string
  invalid?: boolean
}

/** Row of toggle chips for picking several values (e.g. days of the week). */
export function ChipGroup<T extends string | number>({ options, value, onChange, label, invalid }: ChipGroupProps<T>) {
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <div role="group" aria-label={label} className={cn('flex flex-wrap gap-1.5', invalid && 'rounded-lg ring-2 ring-red-200 ring-offset-2')}>
      {options.map((o) => {
        const on = value.includes(o.value)
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(o.value)}
            className={cn(
              'focus-ring h-8 min-w-[2.75rem] rounded-lg border px-2.5 text-xs font-medium transition-colors',
              on ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-violet-400',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

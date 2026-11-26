import { Star } from 'lucide-react'
import { cn } from '@/admin/lib/utils/cn'

const STARS = [1, 2, 3, 4, 5]

/** Read-only star rating, e.g. <Stars value={4} />. */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span role="img" aria-label={`${value} out of 5 stars`} className={cn('inline-flex gap-0.5', className)}>
      {STARS.map((n) => (
        <Star key={n} aria-hidden="true" className={cn('h-4 w-4', n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
      ))}
    </span>
  )
}

/** Pick 1-5 stars; a radio group, so it works with the keyboard. */
export function StarPicker({ value, onChange, label = 'Rating', invalid }: { value: number; onChange: (n: number) => void; label?: string; invalid?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex gap-1', invalid && 'rounded-lg ring-2 ring-red-200 ring-offset-2')}>
      {STARS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          onClick={() => onChange(n)}
          className="focus-ring rounded p-0.5"
        >
          <Star className={cn('h-6 w-6 transition-colors', n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 hover:text-amber-300')} />
        </button>
      ))}
    </div>
  )
}

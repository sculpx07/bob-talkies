import { useBooking } from '../../state/booking.context'
import { GUEST_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'
import { Users } from 'lucide-react'

export function GuestsStep() {
  const { state, dispatch } = useBooking()
  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-2">
        How many guests?
      </h2>
      <p className="text-text-secondary mb-8">
        We'll show you the theatres that fit your group perfectly.
      </p>
      <div
        role="radiogroup"
        aria-label="Select number of guests"
        className="grid grid-cols-4 sm:grid-cols-4 gap-3 max-w-md"
      >
        {GUEST_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={state.guests === n}
            onClick={() => dispatch({ type: 'SET_GUESTS', guests: n })}
            className={cn(
              'flex flex-col items-center gap-1.5 p-4 rounded-card border-2 transition-all duration-150',
              'hover:border-gold-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500',
              state.guests === n
                ? 'border-gold-500 bg-gold-500/10 shadow-gold-glow'
                : 'border-border-subtle bg-bg-surface hover:bg-bg-elevated',
            )}
          >
            <Users
              size={18}
              className={state.guests === n ? 'text-gold-400' : 'text-text-muted'}
              aria-hidden="true"
            />
            <span className={cn(
              'text-sm font-semibold',
              state.guests === n ? 'text-gold-400' : 'text-text-primary',
            )}>
              {n === 30 ? '30+' : n}
            </span>
            <span className="text-[10px] text-text-muted">
              {'guests'}
            </span>
          </button>
        ))}
      </div>
      <p className="text-xs text-text-muted mt-4">
        Theatres with insufficient capacity will be filtered out automatically.
      </p>
    </div>
  )
}

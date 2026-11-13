import { useBooking } from '../../state/booking.context'
import { OCCASION_SLUGS } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'

const OCCASIONS: Array<{ slug: string; label: string; emoji: string }> = [
  { slug: 'birthday', label: 'Birthday', emoji: '🎂' },
  { slug: 'anniversary', label: 'Anniversary', emoji: '💑' },
  { slug: 'date-night', label: 'Date Night', emoji: '🌹' },
  { slug: 'proposal', label: 'Proposal', emoji: '💍' },
  { slug: 'bride-to-be', label: 'Bride To Be', emoji: '👰' },
  { slug: 'baby-shower', label: 'Baby Shower', emoji: '🍼' },
  { slug: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { slug: 'friends', label: 'Friends', emoji: '🥳' },
  { slug: 'sports-screening', label: 'Sports Screening', emoji: '⚽' },
  { slug: 'corporate', label: 'Corporate', emoji: '💼' },
]

export function OccasionStep() {
  const { state, dispatch } = useBooking()
  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-2">
        What are you celebrating?
      </h2>
      <p className="text-text-secondary mb-8">Choose your occasion to get personalised recommendations.</p>
      <div
        role="radiogroup"
        aria-label="Select occasion"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
      >
        {OCCASIONS.map((o) => (
          <button
            key={o.slug}
            type="button"
            role="radio"
            aria-checked={state.occasion === o.slug}
            onClick={() => dispatch({ type: 'SET_OCCASION', occasion: o.slug })}
            className={cn(
              'flex flex-col items-center gap-3 p-5 rounded-card border-2 transition-all duration-150 cursor-pointer',
              'hover:border-gold-500/40 hover:bg-bg-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500',
              state.occasion === o.slug
                ? 'border-gold-500 bg-gold-500/10 shadow-gold-glow'
                : 'border-border-subtle bg-bg-surface',
            )}
          >
            <span className="text-3xl" role="img" aria-hidden="true">{o.emoji}</span>
            <span className={cn(
              'text-xs font-medium text-center leading-tight',
              state.occasion === o.slug ? 'text-gold-400' : 'text-text-secondary',
            )}>
              {o.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

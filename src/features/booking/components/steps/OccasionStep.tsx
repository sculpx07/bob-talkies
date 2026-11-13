import { useBooking } from '../../state/booking.context'
import { cn } from '@/lib/utils/cn'

const OCCASIONS = [
  { slug: 'birthday',         label: 'Birthday',         img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=400&q=75', overlay: '#a855f7' },
  { slug: 'anniversary',      label: 'Anniversary',      img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=75', overlay: '#ec4899' },
  { slug: 'date-night',       label: 'Date Night',       img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=75', overlay: '#7c3aed' },
  { slug: 'proposal',         label: 'Proposal',         img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&q=75', overlay: '#db2777' },
  { slug: 'family',           label: 'Family',           img: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=400&q=75', overlay: '#f97316' },
  { slug: 'friends',          label: 'Friends',          img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=75', overlay: '#6366f1' },
  { slug: 'sports-screening', label: 'Sports Screening', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&q=75', overlay: '#0ea5e9' },
  { slug: 'corporate',        label: 'Corporate',        img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=75', overlay: '#334155' },
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
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {OCCASIONS.map((o) => {
          const active = state.occasion === o.slug
          return (
            <button
              key={o.slug}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => dispatch({ type: 'SET_OCCASION', occasion: o.slug })}
              className={cn(
                'group relative overflow-hidden rounded-2xl transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500',
                active ? 'ring-2 ring-gold-500 shadow-gold-glow scale-[1.03]' : 'hover:scale-[1.02] hover:shadow-lg',
              )}
              style={{ height: 130 }}
            >
              {/* Image */}
              <img
                src={o.img}
                alt={o.label}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-200"
                style={{
                  background: `linear-gradient(to top, ${o.overlay}dd 0%, ${o.overlay}66 50%, transparent 100%)`,
                  opacity: active ? 1 : 0.85,
                }}
              />
              {/* Active checkmark */}
              {active && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-white text-[10px] font-bold shadow">
                  ✓
                </span>
              )}
              {/* Label */}
              <span className="absolute bottom-0 left-0 right-0 p-3 text-left">
                <span className={cn(
                  'block text-[11px] font-bold leading-tight text-white',
                  active ? 'opacity-100' : 'opacity-90',
                )}>
                  {o.label}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

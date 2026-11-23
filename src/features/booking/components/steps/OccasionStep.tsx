import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useBooking } from '../../state/booking.context'
import { OCCASIONS } from '@/content/occasions'
import { cn } from '@/lib/utils/cn'

const IMAGES: Record<string, string> = {
  birthday: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=500&q=75',
  anniversary: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&q=75',
  'date-night': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=75',
  proposal: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&q=75',
  family: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=500&q=75',
  friends: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&q=75',
  'sports-screening': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&q=75',
  corporate: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=75',
}

export function OccasionStep() {
  const { state, dispatch } = useBooking()
  return (
    <div>
      <h2 className="mb-1 font-display text-3xl font-bold text-[#3d0a24] md:text-4xl">What are you celebrating?</h2>
      <p className="mb-6 text-sm text-[#5b2535]">Pick the occasion and we will tailor the rest of your booking.</p>
      <div role="radiogroup" aria-label="Select occasion" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {OCCASIONS.map((o, i) => {
          const active = state.occasion === o.slug
          return (
            <motion.button
              key={o.slug}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => dispatch({ type: 'SET_OCCASION', occasion: o.slug })}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'group relative aspect-[4/5] overflow-hidden rounded-3xl text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c0125a]/40',
                active ? 'ring-[3px] ring-[#c0125a] shadow-[0_18px_40px_rgba(192,38,211,0.35)]' : 'shadow-[0_10px_26px_rgba(107,35,152,0.16)]',
              )}
            >
              <img src={IMAGES[o.slug] ?? o.heroImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <span className={cn('absolute inset-0 bg-gradient-to-t', active ? 'from-[#5c1535] via-[#5c1535]/40' : 'from-[#1d0a38]/90 via-[#1d0a38]/20', 'to-transparent')} />
              {active && (
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#c0125a] text-white shadow">
                  <Check size={15} strokeWidth={3} />
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 p-4">
                <span className="block text-2xl" aria-hidden="true">{o.emoji}</span>
                <span className="block font-display text-lg font-bold text-white">{o.label}</span>
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

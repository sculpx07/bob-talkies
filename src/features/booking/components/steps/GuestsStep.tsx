import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useBooking } from '../../state/booking.context'
import { GUEST_OPTIONS } from '@/lib/constants'
import { theatreKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Theatre } from '@/schemas/theatre'
import { cn } from '@/lib/utils/cn'

export function GuestsStep() {
  const { state, dispatch } = useBooking()
  const { data: theatres = [] } = useQuery({ queryKey: theatreKeys.list(), queryFn: () => api.get<Theatre[]>('/theatres') })
  const fits = theatres.filter((t) => t.capacityMin <= state.guests && t.capacityMax >= state.guests)

  return (
    <div>
      <h2 className="mb-1 font-display text-3xl font-bold text-[#3d0a24] md:text-4xl">How many guests?</h2>
      <p className="mb-6 text-sm text-[#5b2535]">Only theatres that comfortably fit your group are shown.</p>
      <div role="radiogroup" aria-label="Number of guests" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {GUEST_OPTIONS.map((n) => {
          const active = state.guests === n
          return (
            <motion.button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => dispatch({ type: 'SET_GUESTS', guests: n })}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                'flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-5 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c0125a]/40',
                active
                  ? 'border-transparent bg-[linear-gradient(135deg,#8b1a3a,#d9126a)] text-white shadow-[0_12px_28px_rgba(107,35,152,0.4)]'
                  : 'border-[#f5d5e0] bg-white text-[#5c1535] hover:border-[#c0125a]',
              )}
            >
              <Users size={18} aria-hidden="true" className={active ? 'text-white' : 'text-[#a81a3a]'} />
              <span className="text-2xl font-bold tabular-nums">{n === 30 ? '30+' : n}</span>
              <span className={cn('text-[11px] font-semibold uppercase tracking-wider', active ? 'text-white/80' : 'text-[#7d4555]')}>Guests</span>
            </motion.button>
          )
        })}
      </div>
      {theatres.length > 0 && (
        <p className="mt-5 rounded-2xl bg-[#fdf6ff] px-4 py-3 text-sm text-[#5b2535]">
          {fits.length > 0
            ? <>Suited to <strong className="text-[#5c1535]">{state.guests === 30 ? '30+' : state.guests} guests</strong>: {fits.map((t) => t.name).join(', ')}.</>
            : 'No theatre fits this group size. Please pick a different guest count.'}
        </p>
      )}
    </div>
  )
}

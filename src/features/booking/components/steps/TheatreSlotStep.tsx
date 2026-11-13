import { useQuery } from '@tanstack/react-query'
import { theatreKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Theatre } from '@/schemas/theatre'
import { useBooking } from '../../state/booking.context'
import { useSlots } from '../../hooks/useAvailability'
import { formatINR } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/Skeleton'
import { motion } from 'framer-motion'
import { Users, Monitor, Clock, Zap, CheckCircle2, Sparkles } from 'lucide-react'

export function TheatreSlotStep() {
  const { state, dispatch } = useBooking()

  const { data: theatres = [], isLoading: loadingTheatres } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })

  const eligibleTheatres = theatres.filter(
    (t) => t.capacityMin <= state.guests && t.capacityMax >= state.guests,
  )

  const selectedTheatre = eligibleTheatres.find((t) => t.id === state.theatreId) ?? null

  if (loadingTheatres) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-52 w-44 shrink-0 rounded-2xl" />)}
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-[#2a0e4f] mb-1">
        Choose your theatre
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        Showing theatres for <strong className="text-text-primary">{state.guests} guests</strong> on{' '}
        <strong className="text-text-primary">{state.date}</strong>
      </p>

      {eligibleTheatres.length === 0 ? (
        <p className="text-text-muted">No theatres available for this guest count. Please go back and adjust.</p>
      ) : (
        <>
          {/* Theatre picker */}
          <div className="grid gap-5 sm:grid-cols-2">
            {eligibleTheatres.map((theatre, i) => (
              <TheatreCard
                key={theatre.id}
                index={i}
                theatre={theatre}
                isSelected={state.theatreId === theatre.id}
                occasion={state.occasion}
                onSelect={() =>
                  dispatch({ type: 'SET_THEATRE_SLOT', theatreId: theatre.id, theatreSlug: theatre.slug, slotId: state.slotId ?? '' })
                }
              />
            ))}
          </div>

          {/* Slot picker for selected theatre */}
          {selectedTheatre && (
            <SlotPicker
              theatre={selectedTheatre}
              date={state.date!}
              selectedSlotId={state.slotId}
              onSelect={(slotId) =>
                dispatch({ type: 'SET_THEATRE_SLOT', theatreId: selectedTheatre.id, theatreSlug: selectedTheatre.slug, slotId })
              }
            />
          )}

          {!selectedTheatre && (
            <p className="mt-6 text-center text-sm text-text-muted py-8 rounded-2xl border border-dashed border-[#ddd0f5]">
              Select a theatre above to see available time slots
            </p>
          )}
        </>
      )}
    </div>
  )
}

function TheatreCard({
  theatre, isSelected, occasion, onSelect, index,
}: {
  theatre: Theatre; isSelected: boolean; occasion: string | null; onSelect: () => void; index: number
}) {
  const isRecommended =
    theatre.capacityMin <= 4 && (occasion === 'anniversary' || occasion === 'date-night' || occasion === 'proposal')
      ? theatre.id === 'th-delight'
      : false

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative aspect-[4/3] w-full overflow-hidden rounded-3xl text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c026d3]/40',
        isSelected
          ? 'shadow-[0_22px_50px_rgba(192,38,211,0.4)] ring-[3px] ring-[#c026d3]'
          : 'shadow-[0_14px_34px_rgba(107,35,152,0.18)]',
      )}
    >
      <img
        src={theatre.images[0]}
        alt={theatre.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-[#1b0b3a]/90 via-[#1b0b3a]/25 to-transparent" />

      {/* badges */}
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 pr-14">
        {isRecommended && (
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#6b2398] backdrop-blur">
            <Sparkles size={11} /> Recommended
          </span>
        )}
        {theatre.currentOffer && (
          <span className="rounded-full bg-[#ffe9f1]/95 px-2.5 py-1 text-[11px] font-bold text-[#c2255c]">
            {theatre.currentOffer}
          </span>
        )}
      </div>

      {/* selected tick */}
      <span
        className={cn(
          'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300',
          isSelected ? 'scale-100 bg-[#c026d3] text-white' : 'scale-90 border border-white/60 bg-white/20 text-transparent backdrop-blur',
        )}
        aria-hidden="true"
      >
        <CheckCircle2 size={20} />
      </span>

      {/* info */}
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="font-display text-2xl font-bold leading-tight">{theatre.name}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur"><Users size={12} />{theatre.capacityMin}–{theatre.capacityMax} guests</span>
          <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur"><Monitor size={12} />{theatre.screenSize}</span>
          <span className="ml-auto rounded-full bg-[#f5d7a1] px-3 py-1 text-xs font-bold text-[#4a2a00]">
            from {formatINR(theatre.startingPricePaise)}
          </span>
        </div>
      </div>
    </motion.button>
  )
}

function SlotPicker({
  theatre, date, selectedSlotId, onSelect,
}: {
  theatre: Theatre; date: string; selectedSlotId: string | null; onSelect: (slotId: string) => void
}) {
  const { data: slots = [], isLoading } = useSlots(theatre.id, date)

  return (
    <motion.div
      key={theatre.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 rounded-3xl border border-[#ecd9ec] bg-white/80 p-5 shadow-[0_10px_30px_rgba(107,35,152,0.08)] md:p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f6e6ef] text-[#6b2398]">
          <Clock size={20} />
        </span>
        <div>
          <p className="text-base font-bold text-[#2a0e4f]">Pick a time slot</p>
          <p className="text-xs text-[#7d7094]">{theatre.name} · {date}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-14 w-full" rounded="lg" />)}
        </div>
      ) : slots.length === 0 ? (
        <p className="py-2 text-sm text-[#7d7094]">No slots available on this date.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {slots.map((slot, i) => {
            const isSelected = selectedSlotId === slot.id
            const booked = slot.status === 'booked' || slot.status === 'held'
            const hot = slot.status === 'high_demand'
            return (
              <motion.button
                key={slot.id}
                type="button"
                onClick={() => !booked && onSelect(slot.id)}
                disabled={booked}
                aria-pressed={isSelected}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 + i * 0.05 }}
                whileHover={booked ? undefined : { y: -3 }}
                whileTap={booked ? undefined : { scale: 0.96 }}
                className={cn(
                  'relative flex h-14 flex-col items-center justify-center rounded-2xl border text-sm font-semibold transition-colors',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c026d3]',
                  booked && 'cursor-not-allowed opacity-40',
                  isSelected
                    ? 'border-transparent bg-[linear-gradient(135deg,#6b2398,#d946ef)] text-white shadow-[0_10px_24px_rgba(107,35,152,0.4)]'
                    : hot
                    ? 'border-[#f5a3c4] bg-[#fff6f9] text-[#c2255c]'
                    : 'border-[#e6cfe9] bg-white text-[#32105f] hover:border-[#c026d3]',
                )}
              >
                <span className={booked ? 'line-through' : ''}>{formatTime(slot.start)}</span>
                {hot && !isSelected && !booked && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide"><Zap size={9} /> Filling fast</span>
                )}
                {booked && <span className="text-[10px] font-bold uppercase tracking-wide">Booked</span>}
              </motion.button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

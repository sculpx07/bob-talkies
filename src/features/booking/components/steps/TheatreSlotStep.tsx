import { useQuery } from '@tanstack/react-query'
import { theatreKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Theatre } from '@/schemas/theatre'
import { useBooking } from '../../state/booking.context'
import { useSlots } from '../../hooks/useAvailability'
import { formatINR } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Users, Monitor, Volume2, Clock, Zap } from 'lucide-react'

export function TheatreSlotStep() {
  const { state, dispatch } = useBooking()

  const { data: theatres = [], isLoading: loadingTheatres } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })

  const eligibleTheatres = theatres.filter(
    (t) => t.capacityMin <= state.guests && t.capacityMax >= state.guests,
  )

  if (loadingTheatres) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-[#2a0e4f] mb-2">
        Choose your theatre
      </h2>
      <p className="text-text-secondary mb-6">
        Showing theatres that fit <strong className="text-text-primary">{state.guests} guests</strong> on{' '}
        <strong className="text-text-primary">{state.date}</strong>.
      </p>
      {eligibleTheatres.length === 0 ? (
        <p className="text-text-muted">No theatres available for this guest count. Please go back and adjust.</p>
      ) : (
        <div className="space-y-4">
          {eligibleTheatres.map((theatre) => (
            <TheatreWithSlots
              key={theatre.id}
              theatre={theatre}
              date={state.date!}
              selectedTheatreId={state.theatreId}
              selectedSlotId={state.slotId}
              onSelect={(slotId) =>
                dispatch({ type: 'SET_THEATRE_SLOT', theatreId: theatre.id, theatreSlug: theatre.slug, slotId })
              }
              occasion={state.occasion}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TheatreWithSlots({
  theatre, date, selectedTheatreId, selectedSlotId, onSelect, occasion,
}: {
  theatre: Theatre; date: string; selectedTheatreId: string | null;
  selectedSlotId: string | null; onSelect: (slotId: string) => void; occasion: string | null;
}) {
  const { data: slots = [], isLoading } = useSlots(theatre.id, date)
  const isTheatreSelected = selectedTheatreId === theatre.id
  const isRecommended =
    theatre.capacityMin <= 4 && (occasion === 'anniversary' || occasion === 'date-night' || occasion === 'proposal')
      ? theatre.id === 'th-delight'
      : false

  return (
    <div className={cn(
      'rounded-3xl overflow-hidden bg-white transition-all duration-200',
      isTheatreSelected
        ? 'ring-2 ring-[#c026d3] shadow-[0_16px_40px_rgba(107,35,152,0.25)]'
        : 'shadow-[0_8px_24px_rgba(107,35,152,0.1)] hover:shadow-[0_14px_34px_rgba(107,35,152,0.18)] hover:-translate-y-0.5',
    )}>
      <div className="flex gap-4 p-4">
        <img
          src={theatre.images[0]}
          alt={theatre.name}
          className="w-28 h-24 object-cover rounded-2xl shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-[#2a0e4f]">{theatre.name}</h3>
            {isRecommended && <Badge variant="gold" className="!border-0 !bg-[#f3e1ff] !text-[#6b2398] font-semibold">Recommended</Badge>}
            {theatre.currentOffer && <Badge variant="champagne" className="!border-0 !bg-[#ffe9f1] !text-[#c2255c] font-semibold">{theatre.currentOffer}</Badge>}
          </div>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-text-muted">
            <span className="flex items-center gap-1"><Users size={11} />{theatre.capacityMin}–{theatre.capacityMax}</span>
            <span className="flex items-center gap-1"><Monitor size={11} />{theatre.screenSize}</span>
            <span className="flex items-center gap-1"><Volume2 size={11} />{theatre.soundSystem}</span>
          </div>
          <p className="mt-1.5 inline-block rounded-full bg-[#fff1d6] px-2.5 py-0.5 text-xs font-semibold text-[#8f6420]">
            {formatINR(theatre.startingPricePaise)} onwards
          </p>
        </div>
      </div>

      <div className="bg-[#faf3fb] px-4 py-3.5">
        <p className="text-xs text-text-muted mb-2 flex items-center gap-1.5">
          <Clock size={12} aria-hidden="true" /> Available slots for {date}
        </p>
        {isLoading ? (
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-9 w-20" rounded="full" />)}
          </div>
        ) : slots.length === 0 ? (
          <p className="text-xs text-text-muted">No slots available on this date.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const isSelected = isTheatreSelected && selectedSlotId === slot.id
              const booked = slot.status === 'booked' || slot.status === 'held'
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => !booked && onSelect(slot.id)}
                  disabled={booked}
                  aria-pressed={isSelected}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c026d3]',
                    booked && 'opacity-30 cursor-not-allowed line-through',
                    isSelected
                      ? 'border-transparent bg-[linear-gradient(135deg,#6b2398,#d946ef)] text-white shadow-[0_6px_16px_rgba(107,35,152,0.35)]'
                      : slot.status === 'high_demand'
                      ? 'border-[#f5a3c4] bg-white text-[#c2255c] hover:bg-[#fff0f5]'
                      : 'border-[#e6cfe9] bg-white text-[#32105f] hover:border-[#c026d3] hover:text-[#6b2398]',
                  )}
                >
                  {formatTime(slot.start)}
                  {slot.status === 'high_demand' && <span className="ml-1"><Zap size={10} className="inline" /></span>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

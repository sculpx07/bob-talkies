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
import { Users, Monitor, Volume2, Clock, Zap, CheckCircle2 } from 'lucide-react'

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
          {/* Horizontal scroll theatre picker */}
          <div className="relative -mx-1">
            <div className="flex gap-3 overflow-x-auto pb-3 px-1 scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none' }}>
              {eligibleTheatres.map((theatre) => (
                <TheatreCard
                  key={theatre.id}
                  theatre={theatre}
                  isSelected={state.theatreId === theatre.id}
                  occasion={state.occasion}
                  onSelect={() =>
                    dispatch({ type: 'SET_THEATRE_SLOT', theatreId: theatre.id, theatreSlug: theatre.slug, slotId: state.slotId ?? '' })
                  }
                />
              ))}
            </div>
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
  theatre, isSelected, occasion, onSelect,
}: {
  theatre: Theatre; isSelected: boolean; occasion: string | null; onSelect: () => void
}) {
  const isRecommended =
    theatre.capacityMin <= 4 && (occasion === 'anniversary' || occasion === 'date-night' || occasion === 'proposal')
      ? theatre.id === 'th-delight'
      : false

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={cn(
        'relative shrink-0 snap-start w-44 rounded-2xl overflow-hidden text-left transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c026d3]',
        isSelected
          ? 'ring-2 ring-[#c026d3] shadow-[0_12px_30px_rgba(192,38,211,0.3)] -translate-y-1'
          : 'ring-1 ring-[#ecdaf5] shadow-md hover:shadow-lg hover:-translate-y-0.5',
      )}
    >
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={theatre.images[0]}
          alt={theatre.name}
          className="h-full w-full object-cover transition-transform duration-400 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {isRecommended && (
          <span className="absolute top-2 left-2 rounded-full bg-[#f3e1ff] px-2 py-0.5 text-[10px] font-bold text-[#6b2398]">
            ✦ Recommended
          </span>
        )}
        {theatre.currentOffer && (
          <span className="absolute top-2 right-2 rounded-full bg-[#ffe9f1] px-2 py-0.5 text-[10px] font-bold text-[#c2255c]">
            {theatre.currentOffer}
          </span>
        )}
        {isSelected && (
          <span className="absolute bottom-2 right-2 rounded-full bg-[#c026d3] p-0.5">
            <CheckCircle2 size={14} className="text-white" />
          </span>
        )}
      </div>

      {/* Info */}
      <div className={cn(
        'p-3 transition-colors duration-200',
        isSelected ? 'bg-[#faf0ff]' : 'bg-white',
      )}>
        <p className={cn('text-sm font-bold leading-tight truncate', isSelected ? 'text-[#6b2398]' : 'text-[#2a0e4f]')}>
          {theatre.name}
        </p>
        <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1 text-[10px] text-text-muted">
          <span className="flex items-center gap-0.5"><Users size={9} />{theatre.capacityMin}–{theatre.capacityMax}</span>
          <span className="flex items-center gap-0.5"><Monitor size={9} />{theatre.screenSize}</span>
        </div>
        <p className="mt-2 text-[11px] font-bold text-[#8f6420] bg-[#fff1d6] rounded-full px-2 py-0.5 inline-block">
          {formatINR(theatre.startingPricePaise)}+
        </p>
      </div>
    </button>
  )
}

function SlotPicker({
  theatre, date, selectedSlotId, onSelect,
}: {
  theatre: Theatre; date: string; selectedSlotId: string | null; onSelect: (slotId: string) => void
}) {
  const { data: slots = [], isLoading } = useSlots(theatre.id, date)

  return (
    <div className="mt-5 rounded-2xl bg-[#faf3fb] border border-[#ecdaf5] p-4 transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-[#6b2398]/10 flex items-center justify-center shrink-0">
          <Clock size={14} className="text-[#6b2398]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#2a0e4f]">Pick a time slot</p>
          <p className="text-xs text-text-muted">{theatre.name} · {date}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-9 w-24" rounded="full" />)}
        </div>
      ) : slots.length === 0 ? (
        <p className="text-sm text-text-muted py-2">No slots available on this date.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {slots.map((slot) => {
            const isSelected = selectedSlotId === slot.id
            const booked = slot.status === 'booked' || slot.status === 'held'
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => !booked && onSelect(slot.id)}
                disabled={booked}
                aria-pressed={isSelected}
                className={cn(
                  'px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-150',
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
                {slot.status === 'high_demand' && <Zap size={10} className="inline ml-1" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

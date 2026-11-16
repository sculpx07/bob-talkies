import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { getDay, parseISO } from 'date-fns'
import {
  ChevronLeft, ChevronRight, Users, Monitor, BadgeCheck, Sparkles, Zap, Palette, UserPlus, Cake,
} from 'lucide-react'
import { theatreKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Theatre } from '@/schemas/theatre'
import { useBooking } from '../../state/booking.context'
import { useSlots } from '../../hooks/useAvailability'
import { OCCASIONS } from '@/content/occasions'
import { THEATRE_LISTING, DECOR_PRICE_INR, LISTING_NOTES } from '@/content/theatreListing'
import { formatINR } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import { ADVANCE_PAYMENT_PERCENT } from '@/lib/constants'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/Skeleton'

const EASE = [0.22, 1, 0.36, 1] as const

export function TheatreSlotStep() {
  const { state, dispatch } = useBooking()

  const { data: theatres = [], isLoading } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })

  const occasion = OCCASIONS.find((o) => o.slug === state.occasion)
  // every theatre is listed, whatever occasion, guests or date was chosen on the home page
  const listed = theatres

  // the date arrives from the URL on first load; wait for it before rendering date-dependent cards
  if (isLoading || !state.date) {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        {[1, 2].map((i) => <Skeleton key={i} className="h-[520px] w-full rounded-3xl" />)}
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-1 font-display text-3xl font-bold text-[#2a0e4f] md:text-4xl">Choose your theatre</h2>
      <p className="mb-5 text-sm text-[#5b4578]">
        {occasion ? <><strong className="text-[#2a0e4f]">{occasion.emoji} {occasion.label}</strong> · </> : null}
        <strong className="text-[#2a0e4f]">{state.guests === 30 ? '30+' : state.guests} guests</strong> · <strong className="text-[#2a0e4f]">{state.date}</strong>
      </p>

      {listed.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#ddd0f5] px-4 py-10 text-center text-sm text-[#7d7094]">No theatres are available right now.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {listed.map((t, i) => (
            <TheatreListingCard
              key={t.id}
              index={i}
              theatre={t}
              recommended={Boolean(occasion) && occasion!.recommendedTheatres.includes(t.id)}
              occasionLabel={occasion?.label}
              guests={state.guests}
              date={state.date!}
              selectedSlotId={state.theatreId === t.id ? state.slotId : null}
              onPickSlot={(slotId) => dispatch({ type: 'SET_THEATRE_SLOT', theatreId: t.id, theatreSlug: t.slug, slotId })}
              onContinue={() => dispatch({ type: 'GO_STEP', step: 4 })}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TheatreListingCard({
  theatre, index, recommended, occasionLabel, guests, date, selectedSlotId, onPickSlot, onContinue,
}: {
  theatre: Theatre; index: number; recommended: boolean; occasionLabel?: string
  guests: number; date: string; selectedSlotId: string | null; onPickSlot: (slotId: string) => void; onContinue: () => void
}) {
  const [img, setImg] = useState(0)
  const { data: slots = [], isLoading } = useSlots(theatre.id, date)
  const info = THEATRE_LISTING[theatre.slug]
  const dow = getDay(parseISO(date))
  const isWeekend = dow === 0 || dow === 6
  const price = isWeekend ? theatre.weekendPricePaise : theatre.weekdayPricePaise // price for the chosen date
  const hasWeekdayDeal = theatre.weekdayPricePaise < theatre.weekendPricePaise
  const extraGuests = Math.max(0, guests - (info?.includedGuests ?? 0))
  const selected = selectedSlotId !== null
  // advance to reserve the slot: ADVANCE_PAYMENT_PERCENT of theatre price + extra guests (before tax and add-ons)
  const reservePaise = Math.round(((price + extraGuests * theatre.extraGuestPricePaise) * ADVANCE_PAYMENT_PERCENT) / 100)
  const n = theatre.images.length
  const go = (d: number) => setImg((i) => (i + d + n) % n)

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
      className={cn(
        'flex flex-col overflow-hidden rounded-[1.75rem] bg-white transition-shadow',
        selected
          ? 'shadow-[0_22px_50px_rgba(192,38,211,0.3)] ring-[3px] ring-[#c026d3]'
          : 'shadow-[0_14px_34px_rgba(107,35,152,0.14)] ring-1 ring-[#ecd9ec]',
      )}
    >
      {/* Photo carousel */}
      <div className="group relative aspect-[16/10] overflow-hidden bg-[#1b0b3a]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={img}
            src={theatre.images[img]}
            alt={`${theatre.name} theatre`}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </AnimatePresence>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1b0b3a]/55 via-transparent to-transparent" />

        {recommended && occasionLabel && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#6b2398] backdrop-blur">
            <Sparkles size={11} /> Great for {occasionLabel.toLowerCase()}
          </span>
        )}

        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-90 backdrop-blur transition hover:bg-black/60 sm:opacity-0 sm:group-hover:opacity-100">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-90 backdrop-blur transition hover:bg-black/60 sm:opacity-0 sm:group-hover:opacity-100">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {theatre.images.map((_, i) => (
                <span key={i} className={cn('h-1.5 rounded-full transition-all', i === img ? 'w-5 bg-white' : 'w-1.5 bg-white/55')} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <h3 className="font-display text-xl font-bold leading-tight text-[#2a0e4f]">{info?.displayName ?? theatre.name}</h3>

        <p className="mt-2 text-[15px] text-[#2a0e4f]">
          <strong>{formatINR(theatre.weekendPricePaise)} for {info?.includedGuests ?? '—'} people</strong> <span className="text-[#5b4578]">(including taxes)</span>
          {isWeekend && <span className="ml-2 rounded-full bg-[#e7f7ee] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Your date</span>}
        </p>
        <p className="text-sm text-[#5b4578]">
          Weekday Offer: <s className="font-semibold opacity-70">{formatINR(theatre.weekendPricePaise)}</s> <strong className="text-[#c2255c]">{formatINR(theatre.weekdayPricePaise)}</strong>
          {!isWeekend && <span className="ml-2 rounded-full bg-[#e7f7ee] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Your date</span>}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-[#f3e6ff] px-3.5 py-1.5 text-xs font-bold text-[#6b2398]">
            <Users size={13} /> Max {theatre.capacityMax} People
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-[#fff1d6] px-3.5 py-1.5 text-xs font-bold text-[#8f6420]">
            <Palette size={13} /> Decoration : ₹{DECOR_PRICE_INR}
          </span>
        </div>

        <ul className="mt-3 space-y-1.5 text-[12.5px] leading-snug text-[#5b4578]">
          <li className="flex items-start gap-2.5"><UserPlus size={14} className="mt-0.5 shrink-0 text-[#8e39c7]" />{formatINR(theatre.extraGuestPricePaise)} per extra person{guests > theatre.capacityMax && <strong className="text-[#c2255c]"> · fits up to {theatre.capacityMax} guests</strong>}</li>
          <li className="flex items-start gap-2.5"><Monitor size={14} className="mt-0.5 shrink-0 text-[#8e39c7]" />{info?.spec ?? `${theatre.screenSize} ${theatre.resolution} screen, ${theatre.soundSystem}`}</li>
          <li className="flex items-start gap-2.5"><Cake size={14} className="mt-0.5 shrink-0 text-[#8e39c7]" />{LISTING_NOTES.addOns}</li>
          <li className="flex items-start gap-2.5"><BadgeCheck size={14} className="mt-0.5 shrink-0 text-[#8e39c7]" />{LISTING_NOTES.cancellation}</li>
        </ul>

        {/* Time slots */}
        <p className="mb-1.5 mt-3 text-[13px] font-bold text-[#2a0e4f]">Select time slot</p>
        {isLoading ? (
          <div className="flex gap-1.5">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-20" rounded="lg" />)}</div>
        ) : slots.length === 0 ? (
          <p className="text-xs text-[#7d7094]">No slots on this date.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {slots.map((slot) => {
              const booked = slot.status === 'booked' || slot.status === 'held'
              const hot = slot.status === 'high_demand'
              const active = selectedSlotId === slot.id
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={booked}
                  aria-pressed={active}
                  title={hot && !booked ? 'Filling fast' : undefined}
                  onClick={() => onPickSlot(slot.id)}
                  className={cn(
                    'relative w-[4.6rem] rounded-lg border px-1 py-1 text-center text-[10px] font-semibold leading-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c026d3]',
                    booked && 'cursor-not-allowed border-[#eee6f1] bg-[#faf6fb] text-[#b9aac9] line-through',
                    !booked && !active && (hot ? 'border-[#f5a3c4] bg-[#fff6f9] text-[#c2255c] hover:border-[#c2255c]' : 'border-[#d9c4e3] bg-white text-[#32105f] hover:border-[#c026d3]'),
                    active && 'border-transparent bg-[linear-gradient(135deg,#6b2398,#d946ef)] text-white shadow-[0_6px_14px_rgba(107,35,152,0.35)]',
                  )}
                >
                  {formatTime(slot.start)} -<br />{formatTime(slot.end)}
                  {hot && !active && !booked && <Zap size={9} className="absolute -right-1 -top-1 rounded-full bg-white text-[#c2255c]" />}
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-auto">
          <AnimatePresence initial={false}>
            {selected && (
              <motion.div
                key="reserve"
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-2xl bg-[#f3ecf8] p-2.5">
                  <p className="mb-2 text-center text-[11.5px] text-[#5b4578]">
                    You pay only <strong className="text-[#32105f]">{formatINR(reservePaise)}</strong> ({ADVANCE_PAYMENT_PERCENT}%) to reserve the slot
                  </p>
                  <button
                    type="button"
                    onClick={onContinue}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#32105f,#4a1a8a)] px-4 py-3 text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(50,16,95,0.35)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Add details, cakes, add-ons <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  )
}

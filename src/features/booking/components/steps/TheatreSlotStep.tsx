import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getDay, parseISO } from 'date-fns'
import {
  ChevronLeft, ChevronRight, Users, Monitor, Zap, Palette, UserPlus, Cake,
} from 'lucide-react'
import type { Theatre } from '@/schemas/theatre'
import { useBooking } from '../../state/booking.context'
import { useSlots } from '../../hooks/useAvailability'
import { OCCASIONS } from '@/content/occasions'
import { formatINR } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/Skeleton'
import { BookingInclusions } from '../BookingInclusions'
import { ADD_ONS_NOTE } from '@/content/bookingInclusions'
import { useTheatres } from '@/features/catalog/api'
import { theatreSpec, theatreTitle } from '@/features/catalog/theatre'
import { useSiteConfig } from '@/features/site/api'

const EASE = [0.22, 1, 0.36, 1] as const

export function TheatreSlotStep() {
  const { state, dispatch } = useBooking()

  const { data: theatres = [], isLoading } = useTheatres()

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
        <div className="grid gap-7 sm:grid-cols-2">
          {listed.map((t, i) => (
            <TheatreListingCard
              key={t.id}
              index={i}
              theatre={t}
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
  theatre, index, guests, date, selectedSlotId, onPickSlot, onContinue,
}: {
  theatre: Theatre; index: number
  guests: number; date: string; selectedSlotId: string | null; onPickSlot: (slotId: string) => void; onContinue: () => void
}) {
  const [img, setImg] = useState(0)
  const [showIncluded, setShowIncluded] = useState(false)
  const { data: slots = [], isLoading } = useSlots(theatre.id, date)
  const { data: site } = useSiteConfig()
  const dow = getDay(parseISO(date))
  const isWeekend = dow === 0 || dow === 6
  const price = isWeekend ? theatre.weekendPricePaise : theatre.weekdayPricePaise // price for the chosen date
  const extraGuests = Math.max(0, guests - theatre.includedGuests)
  const selected = selectedSlotId !== null
  // advance to reserve the slot: the advance % (Settings) of theatre price + extra guests (before tax and add-ons)
  const reservePaise = Math.round(((price + extraGuests * theatre.extraGuestPricePaise) * (site?.pricing.advancePercent ?? 0)) / 100)
  const n = theatre.images.length
  const go = (d: number) => setImg((i) => (i + d + n) % n)

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
      className={cn(
        'flex flex-col overflow-hidden rounded-[2rem] bg-white transition-shadow',
        selected
          ? 'shadow-[0_22px_50px_rgba(192,38,211,0.3)] ring-[3px] ring-[#c026d3]'
          : 'shadow-[0_14px_34px_rgba(107,35,152,0.14)] ring-1 ring-[#ecd9ec]',
      )}
    >
      {/* Photo carousel */}
      <div className="group relative aspect-[2/1] overflow-hidden bg-[#1b0b3a]">
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
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="font-display text-xl font-bold leading-tight text-[#2a0e4f]">{theatreTitle(theatre)}</h3>

        <div className="mt-2.5">
          <p className="text-base text-[#2a0e4f]">
            <strong>{formatINR(price)} for {theatre.includedGuests} people</strong> <span className="text-sm text-[#7d7094]">(including taxes)</span>
            <span className="ml-2 rounded-full bg-[#e7f7ee] px-2 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-emerald-700">Your date</span>
          </p>
        </div>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] leading-snug text-[#5b4578]">
          <li className="flex items-center gap-2"><Users size={15} className="shrink-0 text-[#8e39c7]" />{`Max ${theatre.capacityMax} People`}{guests > theatre.capacityMax && <strong className="text-[#c2255c]"> (your group is larger)</strong>}</li>
          <li className="flex items-center gap-2"><Palette size={15} className="shrink-0 text-[#8e39c7]" />Decor {site ? formatINR(site.pricing.decorationPricePaise) : '…'} extra</li>
          <li className="flex items-center gap-2"><UserPlus size={15} className="shrink-0 text-[#8e39c7]" />Extra guests: {formatINR(theatre.extraGuestPricePaise)} each</li>
          <li className="flex items-center gap-2"><Monitor size={15} className="shrink-0 text-[#8e39c7]" />{theatreSpec(theatre)}</li>
          <li className="flex items-center gap-2"><Cake size={15} className="shrink-0 text-[#8e39c7]" />{ADD_ONS_NOTE}</li>
        </ul>

        {/* What's included (collapsed by default; does not affect slot selection) */}
        <button
          type="button"
          onClick={() => setShowIncluded((v) => !v)}
          aria-expanded={showIncluded}
          className="mt-3 inline-flex items-center gap-1.5 self-start text-[13px] font-semibold text-[#6b2398] hover:underline"
        >
          What's included in my booking?
          <ChevronRight size={14} className={cn('transition-transform', showIncluded && 'rotate-90')} />
        </button>
        {showIncluded && <BookingInclusions theatre={theatre} className="mt-2" />}

        {/* Time slots */}
        <div className="mt-3.5 border-t border-[#f1e2f0] pt-3.5">
          <p className="mb-2 text-sm font-bold text-[#2a0e4f]">Select time slot</p>
          {isLoading ? (
            <div className="flex gap-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-24" rounded="lg" />)}</div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-[#7d7094]">No slots on this date.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
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
                      'relative w-[5.2rem] rounded-xl border px-1 py-1.5 text-center text-[10.5px] font-semibold leading-snug transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c026d3]',
                      booked && 'cursor-not-allowed border-[#eee6f1] bg-[#faf6fb] text-[#b9aac9] line-through',
                      !booked && !active && (hot ? 'border-[#f5a3c4] bg-[#fff6f9] text-[#c2255c] hover:border-[#c2255c]' : 'border-[#d9c4e3] bg-white text-[#32105f] hover:border-[#c026d3]'),
                      active && 'border-transparent bg-[linear-gradient(135deg,#6b2398,#d946ef)] text-white shadow-[0_6px_14px_rgba(107,35,152,0.35)]',
                    )}
                  >
                    {formatTime(slot.start)} -<br />{formatTime(slot.end)}
                    <span className="mt-0.5 block text-[9px] font-bold leading-tight">
                      {!isWeekend && !booked && (
                        <s className={cn('mr-0.5 opacity-50', active ? 'text-white' : 'text-[#9a8cae]')}>
                          {formatINR(theatre.weekendPricePaise)}
                        </s>
                      )}
                      <span className={cn(active ? 'text-white/90' : booked ? 'text-[#b9aac9]' : !isWeekend ? 'text-[#c2255c]' : 'text-[#9a8cae]')}>
                        {formatINR(price)}
                      </span>
                    </span>
                    {hot && !active && !booked && <Zap size={10} className="absolute -right-1 -top-1 rounded-full bg-white text-[#c2255c]" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

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
                <div className="mt-3.5 rounded-2xl bg-[#f3ecf8] p-3">
                  <p className="mb-3 text-center text-xs text-[#5b4578]">
                    You pay only <strong className="text-[#32105f]">{formatINR(reservePaise)}</strong> ({site?.pricing.advancePercent ?? '…'}%) to reserve the slot
                  </p>
                  <button
                    type="button"
                    onClick={onContinue}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#32105f,#4a1a8a)] px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(50,16,95,0.35)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
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

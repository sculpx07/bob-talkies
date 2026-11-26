import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfDay, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useBooking } from '../../state/booking.context'
import type { CalendarDay } from '../../hooks/useAvailability'
import { useSlots } from '../../hooks/useAvailability'
import { availabilityKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Theatre } from '@/schemas/theatre'
import { cn } from '@/lib/utils/cn'
import { formatTime } from '@/lib/utils/date'
import { useTheatres } from '@/features/catalog/api'

/** Live slot availability for one theatre on the chosen date (real API data only). */
function TheatreAvailability({ theatre, date }: { theatre: Theatre; date: string }) {
  const { data: slots, isLoading, isError } = useSlots(theatre.id, date)
  const open = (slots ?? []).filter((s) => s.status === 'available' || s.status === 'high_demand')
  return (
    <li className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[#f5d5e0]">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-[#5c1535]">{theatre.name}</span>
        <span className="text-xs font-semibold text-[#7d4555]">
          {isLoading ? 'Checking…' : isError ? 'Unavailable' : open.length > 0 ? `${open.length} slot${open.length > 1 ? 's' : ''} open` : 'Fully booked'}
        </span>
      </div>
      {open.length > 0 && (
        <p className="mt-1.5 flex flex-wrap gap-1.5">
          {open.map((s) => (
            <span key={s.id} className="rounded-full bg-[#fce8f0] px-2.5 py-0.5 text-[11px] font-semibold text-[#8b1a3a]">{formatTime(s.start)}</span>
          ))}
        </p>
      )}
    </li>
  )
}

export function DateStep() {
  const { state, dispatch } = useBooking()
  const [currentMonth, setCurrentMonth] = useState(() => (state.date ? parseISO(state.date) : new Date()))
  const month = format(currentMonth, 'yyyy-MM')

  const { data: theatres = [] } = useTheatres()
  const eligible = theatres.filter((t) => t.capacityMin <= state.guests && t.capacityMax >= state.guests)

  const calendars = useQueries({
    queries: eligible.map((t) => ({
      queryKey: availabilityKeys.calendar(t.id, month),
      queryFn: () => api.get<CalendarDay[]>(`/availability/calendar?theatre=${t.id}&month=${month}`),
      staleTime: 60_000,
    })),
  })
  const calendarsReady = eligible.length > 0 && calendars.every((c) => c.data)

  const today = startOfDay(new Date())
  const monthStart = startOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) })

  // a day is blocked only when every theatre that fits the group is fully booked
  function status(day: Date): 'past' | 'booked' | 'busy' | 'open' {
    if (isBefore(day, today)) return 'past'
    if (!calendarsReady) return 'open'
    const ds = format(day, 'yyyy-MM-dd')
    const per = calendars.map((c) => c.data!.find((d) => d.date === ds)?.status ?? 'available')
    if (per.every((s) => s === 'fully_booked' || s === 'unavailable')) return 'booked'
    if (per.every((s) => s === 'high_demand' || s === 'fully_booked' || s === 'unavailable')) return 'busy'
    return 'open'
  }

  return (
    <div>
      <h2 className="mb-1 font-display text-3xl font-bold text-[#3d0a24] md:text-4xl">Pick your date</h2>
      <p className="mb-6 text-sm text-[#5b2535]">Availability is checked for theatres that fit {state.guests === 30 ? '30+' : state.guests} guests.</p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="rounded-3xl bg-white p-4 shadow-[0_10px_30px_rgba(107,35,152,0.1)] ring-1 ring-[#f5d5e0]">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => setCurrentMonth((m) => subMonths(m, 1))} disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), today)} aria-label="Previous month" className="rounded-full p-2 text-[#8b1a3a] hover:bg-[#f6e6ef] disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            <span className="font-display text-lg font-bold text-[#5c1535]">{format(currentMonth, 'MMMM yyyy')}</span>
            <button type="button" onClick={() => setCurrentMonth((m) => addMonths(m, 1))} aria-label="Next month" className="rounded-full p-2 text-[#8b1a3a] hover:bg-[#f6e6ef]">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d} className="py-1 text-center text-[11px] font-bold uppercase text-[#7d4555]">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: getDay(monthStart) }, (_, i) => <div key={`e${i}`} />)}
            {days.map((day) => {
              const ds = format(day, 'yyyy-MM-dd')
              const st = status(day)
              const disabled = st === 'past' || st === 'booked'
              const selected = state.date === ds
              return (
                <button
                  key={ds}
                  type="button"
                  disabled={disabled}
                  onClick={() => dispatch({ type: 'SET_DATE', date: ds })}
                  aria-pressed={selected}
                  aria-label={`${format(day, 'd MMMM yyyy')}${st === 'booked' ? ', fully booked' : st === 'busy' ? ', filling fast' : ''}`}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c0125a]',
                    selected && 'bg-[linear-gradient(135deg,#8b1a3a,#d9126a)] text-white shadow-[0_6px_16px_rgba(107,35,152,0.4)]',
                    !selected && st === 'open' && 'text-[#5c1535] hover:bg-[#fce8f0]',
                    !selected && st === 'busy' && 'bg-[#fff1f5] text-[#c2255c] hover:bg-[#ffe1ea]',
                    st === 'booked' && 'text-[#b9aac9] line-through',
                    st === 'past' && 'text-[#d6c9e0]',
                  )}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#7d4555]">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded bg-[#fff1f5] ring-1 ring-[#f5a3c4]" />Filling fast</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded bg-[#ece4f2]" />Fully booked</span>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8b1a3a]">Available theatres</p>
          {!state.date ? (
            <p className="rounded-2xl border border-dashed border-[#ddd0f5] px-4 py-10 text-center text-sm text-[#7d4555]">Choose a date to see live availability.</p>
          ) : eligible.length === 0 ? (
            <p className="rounded-2xl bg-[#fff1f5] px-4 py-4 text-sm text-[#c2255c]">No theatre fits this guest count. Go back and adjust the number of guests.</p>
          ) : (
            <>
              <p className="mb-3 text-sm text-[#5b2535]">{format(parseISO(state.date), 'EEEE, d MMMM yyyy')}</p>
              <ul className="space-y-2.5">
                {eligible.map((t) => <TheatreAvailability key={t.id} theatre={t} date={state.date!} />)}
              </ul>
              <p className="mt-3 text-xs text-[#7d4555]">You will pick your exact time slot together with your theatre in the next step.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

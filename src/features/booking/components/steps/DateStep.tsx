import { useState } from 'react'
import { useBooking } from '../../state/booking.context'
import { useCalendar } from '../../hooks/useAvailability'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfDay, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/Badge'

const STATUS_STYLES = {
  available: 'hover:bg-gold-500/10 hover:border-gold-500/40 cursor-pointer',
  high_demand: 'hover:bg-crimson-500/10 hover:border-crimson-500/40 cursor-pointer',
  offer_date: 'hover:bg-gold-500/15 hover:border-gold-500 cursor-pointer',
  fully_booked: 'opacity-40 cursor-not-allowed line-through',
  unavailable: 'opacity-30 cursor-not-allowed',
}

export function DateStep() {
  const { state, dispatch } = useBooking()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { data: calendar = [], isLoading } = useCalendar(
    state.theatreId,
    format(currentMonth, 'yyyy-MM'),
  )

  const today = startOfDay(new Date())
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDow = getDay(monthStart)

  function getStatus(date: Date): string {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (isBefore(date, today)) return 'unavailable'
    return calendar.find((c) => c.date === dateStr)?.status ?? 'available'
  }

  function handleSelectDate(date: Date) {
    const status = getStatus(date)
    if (status === 'unavailable' || status === 'fully_booked') return
    dispatch({ type: 'SET_DATE', date: format(date, 'yyyy-MM-dd') })
  }

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-2">
        Choose your date
      </h2>
      <p className="text-text-secondary mb-6">
        Select a date for your celebration. Available slots will update based on your selection.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-xs text-text-muted">
        {[
          { label: 'Available', color: 'bg-bg-elevated border-border-subtle' },
          { label: 'High Demand', color: 'bg-crimson-500/20 border-crimson-500/40' },
          { label: 'Offer Date', color: 'bg-gold-500/20 border-gold-500/40' },
          { label: 'Fully Booked', color: 'bg-bg-surface opacity-40' },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={cn('w-4 h-4 rounded border inline-block', l.color)} />
            {l.label}
          </span>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-bg-surface border border-border-subtle rounded-card p-4 max-w-sm">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1.5 rounded-lg text-text-muted hover:text-gold-400 hover:bg-bg-elevated transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-text-primary font-semibold text-sm">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-1.5 rounded-lg text-text-muted hover:text-gold-400 hover:bg-bg-elevated transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* DOW headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-xs text-text-muted py-1">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Offset blank cells */}
          {Array.from({ length: startDow }, (_, i) => <div key={`empty-${i}`} />)}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const status = getStatus(day)
            const isSelected = state.date === dateStr
            const disabled = status === 'unavailable' || status === 'fully_booked'
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => handleSelectDate(day)}
                disabled={disabled}
                aria-label={`${format(day, 'dd MMMM yyyy')}, ${status}`}
                aria-pressed={isSelected}
                className={cn(
                  'w-full aspect-square flex items-center justify-center rounded-lg border text-xs font-medium transition-all duration-100',
                  isSelected
                    ? 'bg-gold-500 border-gold-500 text-bg-base font-bold'
                    : [
                        'border-transparent',
                        STATUS_STYLES[status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.available,
                        status === 'high_demand' && 'text-crimson-500',
                        status === 'offer_date' && 'text-gold-400',
                        status === 'available' && 'text-text-primary',
                      ],
                )}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </div>

      {state.date && (
        <div className="mt-4 flex items-center gap-2">
          <Badge variant="gold">
            Selected: {format(parseISO(state.date), 'EEEE, dd MMMM yyyy')}
          </Badge>
        </div>
      )}
    </div>
  )
}

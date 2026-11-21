import { useDaySchedule } from '@/admin/features/slots/api'
import { formatTime } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { cn } from '@/admin/lib/utils/cn'

const STATUS_TEXT = { open: 'Open', held: 'Held', booked: 'Booked', blocked: 'Blocked' } as const

/** Pick an open slot of a theatre on a date (new booking, reschedule). */
export function SlotPicker({ theatreId, date, value, onChange, currentSlotId, invalid }: {
  theatreId: string
  date: string
  value: string
  onChange: (slotId: string) => void
  /** the booking's present slot (marked, not selectable) */
  currentSlotId?: string
  invalid?: boolean
}) {
  const day = useDaySchedule(theatreId, date)

  if (!theatreId || !date) return <p className="text-sm text-slate-500">Pick a theatre and date first.</p>
  if (day.isLoading) return <p className="text-sm text-slate-500">Loading slots…</p>
  if (!day.data?.slots.length) return <p className="text-sm text-slate-500">No slots run on this day.</p>

  return (
    <div role="radiogroup" aria-label="Slot" className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3', invalid && 'rounded-lg ring-2 ring-red-200 ring-offset-2')}>
      {day.data.dayBlocked && <p className="col-span-full text-sm text-slate-600">Whole day blocked: {day.data.dayBlocked.reason}</p>}
      {day.data.slots.map((s) => {
        const current = s.id === currentSlotId
        const free = s.status === 'open' && !current
        const selected = value === s.id
        return (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={!free}
            onClick={() => onChange(s.id)}
            className={cn(
              'focus-ring flex flex-col rounded-lg border px-3 py-2 text-left text-sm transition-colors',
              selected ? 'border-violet-600 bg-violet-50' : 'border-slate-300 hover:border-violet-400',
              !free && 'cursor-not-allowed opacity-50 hover:border-slate-300',
            )}
          >
            <span className="font-medium">{formatTime(s.startTime)} – {formatTime(s.endTime)}</span>
            <span className="text-xs text-slate-500">
              {current ? 'Current slot' : free ? `Open · ${formatPaise(s.pricePaise)}` : s.booking ? `${STATUS_TEXT[s.status]} · ${s.booking.customerName}` : STATUS_TEXT[s.status]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

import { Link } from 'react-router-dom'
import { addDays, format, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { Button, Card, ErrorState, IconButton, Input, Skeleton, StatusBadge } from '@/admin/components/ui'
import { SPECIAL_DATE_BADGE } from '@/admin/features/slots/utils'
import type { DaySchedule } from '@/admin/features/slots/types'
import { cn } from '@/admin/lib/utils/cn'
import { formatDate, formatTime, todayISO } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { useDayBoard } from '../api'
import { formatCountdown, useNow } from '../utils'

const shift = (date: string, days: number) => format(addDays(parseISO(date), days), 'yyyy-MM-dd')

const slotStyle = {
  open: 'border-emerald-200 bg-emerald-50/60 text-emerald-900',
  held: 'border-amber-300 bg-amber-50 text-amber-900',
  booked: 'border-violet-300 bg-violet-50 text-violet-900 hover:border-violet-500',
  blocked: 'border-slate-200 bg-slate-100 text-slate-500',
} as const

type BoardSlot = DaySchedule['slots'][number]

function SlotCell({ slot, now, theatreId, date }: { slot: BoardSlot; now: number; theatreId: string; date: string }) {
  const body = (
    <>
      <p className="text-xs font-semibold">{formatTime(slot.startTime)}</p>
      {slot.booking ? (
        <>
          <p className="mt-0.5 truncate text-sm font-medium">{slot.booking.customerName}</p>
          <p className="text-xs opacity-80">
            {slot.booking.guests} guests
            {slot.status === 'held' && slot.booking.holdExpiresAt && ` · hold ${formatCountdown(slot.booking.holdExpiresAt, now)}`}
          </p>
        </>
      ) : slot.status === 'blocked' ? (
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs"><Lock className="h-3 w-3 shrink-0" />{slot.blockReason}</p>
      ) : (
        <p className="mt-0.5 text-xs">Open · {formatPaise(slot.pricePaise)}</p>
      )}
    </>
  )
  const className = cn('block w-40 shrink-0 rounded-lg border px-3 py-2 text-left transition-colors', slotStyle[slot.status])
  if (slot.booking) {
    return <Link to={`/bookings/${slot.booking.id}`} className={cn('focus-ring', className)} title={`${slot.booking.bookingNumber} · ${slot.booking.status}`}>{body}</Link>
  }
  if (slot.status === 'open') {
    // an open slot starts a booking for exactly this theatre, date and slot
    return (
      <Link to={`/bookings/new?theatre=${theatreId}&date=${date}&slot=${slot.id}`} className={cn('focus-ring hover:border-emerald-500', className)} title="Book this slot">
        {body}
      </Link>
    )
  }
  return <div className={className}>{body}</div>
}

/** Every theatre's slots for one day: open, held (with countdown), booked (opens the booking) or blocked. */
export function DayBoardView({ date, onDateChange }: { date: string; onDateChange: (date: string) => void }) {
  const board = useDayBoard(date)
  const now = useNow()
  const all = board.data?.theatres.flatMap((t) => t.slots) ?? []
  const count = (s: BoardSlot['status']) => all.filter((x) => x.status === s).length

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <div className="flex items-center gap-1">
          <IconButton label="Previous day" variant="secondary" onClick={() => onDateChange(shift(date, -1))}><ChevronLeft className="h-4 w-4" /></IconButton>
          <Input aria-label="Board date" type="date" value={date} onChange={(e) => e.target.value && onDateChange(e.target.value)} className="w-40" />
          <IconButton label="Next day" variant="secondary" onClick={() => onDateChange(shift(date, 1))}><ChevronRight className="h-4 w-4" /></IconButton>
          {date !== todayISO() && <Button variant="ghost" size="sm" onClick={() => onDateChange(todayISO())}>Today</Button>}
        </div>
        <p className="text-sm font-medium text-slate-900">{formatDate(date)}</p>
        <div className="flex-1" />
        {board.data && (
          <p className="text-sm text-slate-500">
            <span className="font-medium text-violet-700">{count('booked')} booked</span> · <span className="text-amber-700">{count('held')} held</span> · <span className="text-emerald-700">{count('open')} open</span>
            {count('blocked') > 0 && <> · {count('blocked')} blocked</>}
          </p>
        )}
      </div>

      {board.error ? (
        <ErrorState error={board.error} retry={() => board.refetch()} />
      ) : board.isLoading ? (
        <div className="space-y-3 p-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <ul className={cn('divide-y divide-slate-100', board.isPlaceholderData && 'opacity-60')}>
          {board.data?.theatres.map((day) => (
            <li key={day.theatre.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-start">
              <div className="w-40 shrink-0">
                <p className="font-medium text-slate-900">{day.theatre.name}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {!day.theatre.isActive && <span className="text-xs text-red-600">Inactive</span>}
                  {day.dayBlocked && <span className="text-xs text-slate-500">Closed: {day.dayBlocked.reason}</span>}
                  {day.specialDate && <StatusBadge status={day.specialDate.type} map={SPECIAL_DATE_BADGE} />}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {day.slots.length
                  ? day.slots.map((s) => <SlotCell key={s.id} slot={s} now={now} theatreId={day.theatre.id} date={date} />)
                  : <p className="text-sm text-slate-400">No slots run this day</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

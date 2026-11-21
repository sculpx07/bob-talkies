import { Link } from 'react-router-dom'
import { CalendarOff, Lock } from 'lucide-react'
import { Badge, Card, CardBody, CardHeader, EmptyState, ErrorState, FormField, Input, Skeleton, StatusBadge } from '@/admin/components/ui'
import { BOOKING_STATUS_BADGE } from '@/admin/features/bookings/constants'
import { formatDate, formatTime } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { cn } from '@/admin/lib/utils/cn'
import { useDaySchedule } from '../api'
import type { TheatreRef } from '../types'
import { SCHEDULE_STATUS_BADGE, SPECIAL_DATE_BADGE, formatDuration } from '../utils'

/** What a theatre's day looks like to customers: each slot open / held / booked / blocked, with its price. */
export function DayPreviewTab({ theatre, date, onDateChange }: { theatre: TheatreRef; date: string; onDateChange: (date: string) => void }) {
  const day = useDaySchedule(theatre.id, date)
  const data = day.data

  return (
    <Card>
      <CardHeader
        title={`${theatre.name} on ${formatDate(date)}`}
        description={data ? `${data.isWeekend ? 'Weekend' : 'Weekday'} prices apply.` : undefined}
        actions={
          <FormField className="w-44">
            {(f) => <Input {...f} aria-label="Date" type="date" value={date} onChange={(e) => e.target.value && onDateChange(e.target.value)} />}
          </FormField>
        }
      />
      <CardBody className="space-y-4">
        {data?.dayBlocked && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
            <Lock className="h-4 w-4" /> Whole day blocked: {data.dayBlocked.reason}
          </div>
        )}
        {data?.specialDate && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <StatusBadge status={data.specialDate.type} map={SPECIAL_DATE_BADGE} />
            {data.specialDate.note}
          </div>
        )}
        {data && !data.theatre.isActive && <Badge tone="danger">Theatre is inactive: nothing can be booked</Badge>}

        {day.error ? (
          <ErrorState error={day.error} retry={() => day.refetch()} />
        ) : day.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
        ) : !data?.slots.length ? (
          <EmptyState icon={<CalendarOff className="h-5 w-5" />} title="No slots run on this day" description="Add slots, or check which days they run on." />
        ) : (
          <ul className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', day.isPlaceholderData && 'opacity-60')}>
            {data.slots.map((s) => (
              <li key={s.id} className={cn('rounded-xl border p-4', s.status === 'open' ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-white')}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{formatTime(s.startTime)} – {formatTime(s.endTime)}</p>
                    <p className="text-xs text-slate-500">{formatDuration(s.durationMinutes)}{s.label ? ` · ${s.label}` : ''}</p>
                  </div>
                  <StatusBadge status={s.status} map={SCHEDULE_STATUS_BADGE} />
                </div>
                <p className="mt-3 text-lg font-semibold tabular-nums text-slate-900">{formatPaise(s.pricePaise)}</p>
                <p className="text-xs text-slate-500">{s.priceSource === 'slot' ? 'Custom slot price' : 'Theatre price'}</p>
                {s.blockReason && !s.booking && <p className="mt-2 text-xs text-slate-600">Blocked: {s.blockReason}</p>}
                {s.booking && (
                  <Link to={`/bookings/${s.booking.id}`} className="focus-ring mt-3 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs hover:bg-slate-100">
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-800">{s.booking.customerName}</span>
                      <span className="text-slate-500">{s.booking.bookingNumber} · {s.booking.guests} guests</span>
                    </span>
                    <StatusBadge status={s.booking.status} map={BOOKING_STATUS_BADGE} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}

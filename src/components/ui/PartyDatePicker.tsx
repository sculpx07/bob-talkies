import { useState, type ReactNode } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  addMonths, eachDayOfInterval, endOfMonth, format, getDay, isBefore,
  isSameDay, parseISO, startOfDay, startOfMonth,
} from 'date-fns'
import { cn } from '@/lib/utils/cn'

interface PartyDatePickerProps {
  id: string
  /** yyyy-MM-dd, or '' when empty */
  value: string
  onChange: (value: string) => void
  /** earliest selectable date, yyyy-MM-dd */
  min?: string
  placeholder?: string
  icon: ReactNode
  /** When set, renders a small label above the value (compact bar mode) */
  label?: string
  className?: string
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

/** Custom calendar dropdown — same look as PartySelect, replaces the browser's native date popup. */
export function PartyDatePicker({ id, value, onChange, min, placeholder = 'Select date', icon, label, className }: PartyDatePickerProps) {
  const selected = value ? parseISO(value) : null
  const minDate = min ? startOfDay(parseISO(min)) : null
  const today = startOfDay(new Date())
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(() => startOfMonth(selected ?? today))

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const leading = getDay(days[0])
  const canGoBack = !minDate || !isBefore(endOfMonth(addMonths(month, -1)), minDate)

  function pick(d: Date) {
    onChange(format(d, 'yyyy-MM-dd'))
    setOpen(false)
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setMonth(startOfMonth(selected ?? today))
      }}
    >
      <Popover.Trigger
        id={id}
        className={cn(
          'group relative flex h-14 w-full items-center rounded-2xl border pl-11 pr-10 text-left text-base outline-none transition-colors',
          label && 'flex-col items-start justify-center gap-px',
          selected ? 'bg-[#ede8ff] border-[#c4b5fd] font-semibold text-[#160730]' : 'bg-[#fff7f0] border-[#ecd9ec] font-medium text-[#b0a0c8]',
          className,
        )}
      >
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8e39c7]" aria-hidden="true">
          {icon}
        </span>
        {label && (
          <span className="pointer-events-none text-[11px] font-bold uppercase tracking-[0.12em] text-black leading-none">
            {label}
          </span>
        )}
        <span className={cn('truncate', selected ? 'text-[#160730]' : 'text-[#b0a0c8]')}>
          {selected ? format(selected, 'EEE, d MMM yyyy') : placeholder}
        </span>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d7094] transition-transform group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="start"
          side="top"
          avoidCollisions
          collisionPadding={{ top: 80 }}
          className="z-[200] w-[272px] rounded-2xl border border-[#ecd9ec] bg-white p-3 shadow-[0_24px_50px_rgba(107,35,152,0.22)] data-[state=open]:animate-fade-in"
        >
          {/* month header */}
          <div className="mb-2 flex items-center justify-between">
            <p className="pl-1 text-sm font-bold text-[#2a0e4f]">{format(month, 'MMMM yyyy')}</p>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Previous month"
                disabled={!canGoBack}
                onClick={() => setMonth(addMonths(month, -1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b2398] transition-colors hover:bg-[#f6e6ef] disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setMonth(addMonths(month, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b2398] transition-colors hover:bg-[#f6e6ef]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* weekdays */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1 text-[11px] font-semibold uppercase tracking-wide text-[#7d7094]">{w}</span>
            ))}
          </div>

          {/* days */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: leading }, (_, i) => <span key={`b${i}`} />)}
            {days.map((d) => {
              const disabled = minDate ? isBefore(d, minDate) : false
              const isSel = selected ? isSameDay(d, selected) : false
              const isToday = isSameDay(d, today)
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(d)}
                  aria-pressed={isSel}
                  aria-label={format(d, 'EEEE, d MMMM yyyy')}
                  className={cn(
                    'mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    isSel
                      ? 'bg-[linear-gradient(135deg,#6b2398,#d946ef)] font-bold text-white shadow-[0_6px_14px_rgba(107,35,152,0.35)]'
                      : disabled
                      ? 'cursor-not-allowed text-[#d8cfe8] line-through'
                      : 'text-[#32105f] hover:bg-[#f6e6ef]',
                    isToday && !isSel && 'ring-1 ring-[#d946ef]',
                  )}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>

          {/* footer */}
          <div className="mt-2 flex items-center justify-between border-t border-[#f1e2f0] px-1 pt-2.5 text-sm font-semibold">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="text-[#7d7094] transition-colors hover:text-[#32105f]"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={minDate ? isBefore(today, minDate) : false}
              onClick={() => pick(today)}
              className="text-[#6b2398] transition-colors hover:text-[#d946ef] disabled:opacity-40"
            >
              Today
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

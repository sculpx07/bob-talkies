import type { ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PartyCounterProps {
  id: string
  value: string
  onValueChange: (value: string) => void
  min?: number
  max?: number
  label?: string
  icon: ReactNode
  className?: string
}

export function PartyCounter({
  id,
  value,
  onValueChange,
  min = 1,
  max = 30,
  label,
  icon,
  className,
}: PartyCounterProps) {
  const count = value ? parseInt(value, 10) : min

  function decrement() {
    if (count > min) onValueChange(String(count - 1))
  }

  function increment() {
    if (count < max) onValueChange(String(count + 1))
  }

  const displayLabel = count === 1 ? 'Guest' : count >= max ? 'Guests+' : 'Guests'

  return (
    <div
      id={id}
      className={cn(
        'relative flex h-14 w-full items-center rounded-2xl border pl-11 transition-colors',
        count > min ? 'bg-[#ede8ff] border-[#c4b5fd]' : 'bg-[#fff7f0] border-[#ecd9ec]',
        label ? 'flex-col items-start justify-center gap-[3px] pr-4' : 'pr-4',
        className,
      )}
    >
      {/* icon */}
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8e39c7]" aria-hidden="true">
        {icon}
      </span>

      {label ? (
        <>
          <span className="pointer-events-none text-[11px] font-bold uppercase tracking-[0.12em] text-black leading-none">
            {label}
          </span>
          <div className="flex w-full items-center gap-2">
            <span className="min-w-0 flex-1 whitespace-nowrap text-left text-base font-semibold tabular-nums text-[#5b1fa3]">
              {count} {displayLabel}
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={decrement}
                disabled={count <= min}
                aria-label="Fewer guests"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ede8f8] text-[#3b1278] transition-colors hover:bg-[#ddd4f5] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus size={13} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={increment}
                disabled={count >= max}
                aria-label="More guests"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ede8f8] text-[#3b1278] transition-colors hover:bg-[#ddd4f5] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex w-full items-center gap-2">
          <span className={cn('min-w-0 flex-1 whitespace-nowrap text-left text-base tabular-nums', count === min ? 'font-medium text-[#b0a0c8]' : 'font-semibold text-[#5b1fa3]')}>
            {count} {displayLabel}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={decrement}
              disabled={count <= min}
              aria-label="Fewer guests"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ede8f8] text-[#3b1278] transition-colors hover:bg-[#ddd4f5] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus size={13} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={increment}
              disabled={count >= max}
              aria-label="More guests"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ede8f8] text-[#3b1278] transition-colors hover:bg-[#ddd4f5] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

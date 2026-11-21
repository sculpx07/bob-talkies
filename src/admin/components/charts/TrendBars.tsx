import { useState, type ReactNode } from 'react'
import { cn } from '@/admin/lib/utils/cn'

export interface TrendPoint {
  /** shown under the axis (first / middle / last only) and in the tooltip */
  label: string
  value: number
  /** extra tooltip lines */
  details?: ReactNode
}

/**
 * One series over time as vertical bars, with a hover / focus tooltip.
 * Single series = one brand colour, no legend (the card title names it).
 */
export function TrendBars({ points, format, height = 180, ariaLabel }: {
  points: TrendPoint[]
  format: (value: number) => string
  height?: number
  ariaLabel: string
}) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(0, ...points.map((p) => p.value))
  const tickIdx = new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])
  const hovered = active !== null ? points[active] : null

  return (
    <div className="relative" onMouseLeave={() => setActive(null)}>
      {/* top gridline with the scale */}
      <div className="flex items-end justify-between pb-1 text-[11px] text-slate-400">
        <span className="tabular-nums">{max > 0 ? format(max) : ''}</span>
      </div>
      <div
        role="img"
        aria-label={ariaLabel}
        className="relative flex items-end gap-[2px] border-b border-slate-300"
        style={{ height }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-slate-200" aria-hidden="true" />
        {points.map((p, i) => {
          const pct = max ? (p.value / max) * 100 : 0
          return (
            <button
              key={p.label + i}
              type="button"
              aria-label={`${p.label}: ${format(p.value)}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group flex h-full min-w-0 flex-1 items-end focus:outline-none"
            >
              <span
                className={cn(
                  'block w-full rounded-t-[4px] transition-colors',
                  p.value > 0 ? 'bg-violet-500 group-hover:bg-violet-700 group-focus-visible:bg-violet-700' : 'bg-transparent',
                  active === i && p.value > 0 && 'bg-violet-700',
                )}
                style={{ height: p.value > 0 ? `max(${pct}%, 3px)` : 0 }}
              />
            </button>
          )
        })}
        {hovered && active !== null && (
          <div
            className="pointer-events-none absolute bottom-full z-10 mb-2 w-max max-w-[14rem] -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
            style={{ left: `clamp(4.5rem, ${((active + 0.5) / points.length) * 100}%, calc(100% - 4.5rem))` }}
          >
            <p className="font-medium text-slate-900">{hovered.label}</p>
            <p className="tabular-nums text-slate-700">{format(hovered.value)}</p>
            {hovered.details && <div className="mt-0.5 text-slate-500">{hovered.details}</div>}
          </div>
        )}
      </div>
      <div className="relative mt-1.5 h-4 text-[11px] text-slate-500">
        {points.map((p, i) =>
          tickIdx.has(i) ? (
            <span
              key={i}
              className={cn('absolute whitespace-nowrap', i === 0 ? 'left-0' : i === points.length - 1 ? 'right-0' : '-translate-x-1/2')}
              style={i !== 0 && i !== points.length - 1 ? { left: `${((i + 0.5) / points.length) * 100}%` } : undefined}
            >
              {p.label}
            </span>
          ) : null,
        )}
      </div>
    </div>
  )
}

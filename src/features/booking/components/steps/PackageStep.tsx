import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { packageKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Package } from '@/schemas/package'
import { useBooking } from '../../state/booking.context'
import { formatINR } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/Skeleton'
import { Check, CheckCircle2, Sparkles, Users } from 'lucide-react'

const TIERS: Record<string, { stub: string; chip: string }> = {
  silver: { stub: 'from-[#6b7280] to-[#a8b0bd]', chip: 'bg-[#eef0f4] text-[#4b5563]' },
  gold: { stub: 'from-[#b8872f] to-[#f0c868]', chip: 'bg-[#fff1d6] text-[#8f6420]' },
  diamond: { stub: 'from-[#2563eb] to-[#7dd3fc]', chip: 'bg-[#e0f2fe] text-[#0369a1]' },
  platinum: { stub: 'from-[#32105f] to-[#d946ef]', chip: 'bg-[#f6e6ef] text-[#6b2398]' },
  custom: { stub: 'from-[#0f766e] to-[#5eead4]', chip: 'bg-[#ccfbf1] text-[#0f766e]' },
}

export function PackageStep() {
  const { state, dispatch } = useBooking()

  const { data: packages = [], isLoading } = useQuery({
    queryKey: packageKeys.list(state.theatreId ?? undefined),
    queryFn: () => api.get<Package[]>(`/packages${state.theatreId ? `?theatreId=${state.theatreId}` : ''}`),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        {[1, 2].map((i) => <Skeleton key={i} className="h-56 w-full" rounded="lg" />)}
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-1 font-display text-3xl font-bold text-[#2a0e4f] md:text-4xl">Choose your package</h2>
      <p className="mb-6 text-sm text-[#5b4578]">
        Each package includes everything you need. You can add more in the next step.
      </p>
      <div role="radiogroup" aria-label="Packages" className="space-y-5">
        {packages.map((pkg, i) => (
          <PackageCard
            key={pkg.id}
            index={i}
            pkg={pkg}
            selected={state.packageId === pkg.id}
            onSelect={() => dispatch({ type: 'SET_PACKAGE', packageId: pkg.id })}
          />
        ))}
      </div>
    </div>
  )
}

function PackageCard({
  pkg, selected, onSelect, index,
}: { pkg: Package; selected: boolean; onSelect: () => void; index: number }) {
  const tier = TIERS[pkg.tier] ?? TIERS.silver

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        'group relative block w-full overflow-hidden rounded-3xl text-left transition-shadow duration-300',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c026d3]/40',
        selected
          ? 'bg-white shadow-[0_22px_50px_rgba(192,38,211,0.35)] ring-[3px] ring-[#c026d3]'
          : 'bg-white/85 shadow-[0_12px_32px_rgba(107,35,152,0.12)] ring-1 ring-[#ecd9ec] hover:shadow-[0_20px_44px_rgba(107,35,152,0.2)]',
      )}
    >
      <div className="grid sm:grid-cols-[150px_1fr]">
        {/* tier stub */}
        <div className={cn('relative flex flex-col items-center justify-center gap-1 bg-gradient-to-br px-4 py-6 text-center text-white', tier.stub)}>
          <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-xl" aria-hidden="true" />
          <Sparkles size={20} className="relative opacity-90" aria-hidden="true" />
          <p className="relative font-display text-2xl font-bold capitalize leading-none">{pkg.name}</p>
          <p className="relative mt-2 text-2xl font-bold tabular-nums">{formatINR(pkg.pricePaise)}</p>
          <p className="relative text-[11px] font-semibold uppercase tracking-wider text-white/85">incl. {pkg.includedGuests} guests</p>
        </div>

        {/* details */}
        <div className="relative p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2 pr-10">
            {pkg.badge && (
              <span className={cn('rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider', tier.chip)}>
                {pkg.badge}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-[#5b4578]">{pkg.description}</p>

          <ul className="mt-4 grid gap-x-4 gap-y-2 sm:grid-cols-2">
            {pkg.inclusions.map((inc) => (
              <li key={inc} className="flex items-start gap-2 text-[13px] text-[#2a0e4f]">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#e7f7ee] text-emerald-600">
                  <Check size={10} strokeWidth={3} aria-hidden="true" />
                </span>
                {inc}
              </li>
            ))}
          </ul>

          <p className="mt-4 flex items-center gap-1.5 border-t border-dashed border-[#e3cbe6] pt-3 text-xs text-[#7d7094]">
            <Users size={13} aria-hidden="true" />
            Includes {pkg.includedGuests} guests · Extra guests charged separately
          </p>

          {/* selected tick */}
          <span
            className={cn(
              'absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
              selected ? 'scale-100 bg-[#c026d3] text-white' : 'scale-90 border border-[#e3cbe6] text-transparent',
            )}
            aria-hidden="true"
          >
            <CheckCircle2 size={18} />
          </span>
        </div>
      </div>
    </motion.button>
  )
}

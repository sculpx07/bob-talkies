import { useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Users, Monitor, UtensilsCrossed, Palette, Gift, UserPlus, ShieldCheck, ChevronDown, Check } from 'lucide-react'
import { addonKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Addon } from '@/schemas/addon'
import type { Theatre } from '@/schemas/theatre'
import {
  CANCELLATION_LINES, CONFIRM_TEXT, getCapacityLines, getDecorationLines, getDurationLines, getExtraGuestLines,
  getFoodLines, getScreenSoundLines, type InclusionLine,
} from '@/content/bookingInclusions'
import { CATEGORY_LABEL } from '@/content/experienceServices'
import { cn } from '@/lib/utils/cn'


interface Row { id: string; icon: ReactNode; title: string; lines: InclusionLine[] }

/** "What's included in my booking?" accordion for one theatre. Only verified facts are shown. */
export function BookingInclusions({ theatre, className }: { theatre: Theatre; className?: string }) {
  const [open, setOpen] = useState<string | null>(null)

  // real add-on catalogue for this theatre (same query the add-ons step uses)
  const { data: addons } = useQuery({
    queryKey: addonKeys.list(theatre.id),
    queryFn: () => api.get<Addon[]>(`/addons?theatreId=${theatre.id}`),
  })

  const categories = [...new Set((addons ?? []).filter((a) => a.isAvailable).map((a) => a.category))]
  const addonLines: InclusionLine[] = categories.length
    ? [{ text: categories.map((c) => CATEGORY_LABEL[c] ?? c).join(' · ') }, { text: 'Choose them in the add-ons step of your booking' }]
    : [{ text: CONFIRM_TEXT, pending: true }]

  const rows: Row[] = [
    { id: 'duration', icon: <Clock size={16} />, title: 'Theatre duration', lines: getDurationLines(theatre.slug) },
    { id: 'capacity', icon: <Users size={16} />, title: 'Guest capacity', lines: getCapacityLines(theatre.slug) },
    { id: 'screen', icon: <Monitor size={16} />, title: 'Screen & sound', lines: getScreenSoundLines(theatre.slug) },
    { id: 'food', icon: <UtensilsCrossed size={16} />, title: 'Food', lines: getFoodLines() },
    { id: 'decor', icon: <Palette size={16} />, title: 'Decoration', lines: getDecorationLines() },
    { id: 'addons', icon: <Gift size={16} />, title: 'Add-on options', lines: addonLines },
    { id: 'extra', icon: <UserPlus size={16} />, title: 'Extra guest charges', lines: getExtraGuestLines() },
  ]
  // hidden until the business confirms which cancellation / rescheduling policy applies
  if (CANCELLATION_LINES) rows.push({ id: 'policy', icon: <ShieldCheck size={16} />, title: 'Cancellation & rescheduling', lines: CANCELLATION_LINES })

  return (
    <div className={cn('rounded-2xl bg-[#fdf6ff] ring-1 ring-[#ecd9ec]', className)}>
      <p className="px-4 pb-1 pt-3.5 font-display text-base font-bold text-[#2a0e4f]">What's included in my booking?</p>
      <ul className="px-2 pb-2">
        {rows.map((r) => {
          const isOpen = open === r.id
          return (
            <li key={r.id} className="border-b border-[#f0e1f3] last:border-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : r.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/70"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#8e39c7] shadow-sm">{r.icon}</span>
                <span className="flex-1 text-sm font-semibold text-[#2a0e4f]">{r.title}</span>
                <ChevronDown size={16} className={cn('shrink-0 text-[#7d7094] transition-transform', isOpen && 'rotate-180')} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    {r.lines.map((l, i) => (
                      <li key={i} className="flex items-start gap-2 px-2 pb-2 pl-[3.25rem] text-[13px] leading-snug text-[#5b4578]">
                        {!l.pending && <Check size={13} className="mt-0.5 shrink-0 text-emerald-600" />}
                        <span className={cn(l.pending && 'italic text-[#7d7094]')}>{l.text}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Users, Monitor, UtensilsCrossed, Palette, Gift, UserPlus, ShieldCheck, ChevronDown, Check } from 'lucide-react'
import type { Theatre } from '@/schemas/theatre'
import {
  CANCELLATION_LINES, CONFIRM_TEXT, getCapacityLines, getDecorationLines, getDurationLines, getExtraGuestLines,
  getFoodLines, getScreenSoundLines, type InclusionLine,
} from '@/content/bookingInclusions'
import { CATEGORY_LABEL } from '@/content/experienceServices'
import { cn } from '@/lib/utils/cn'
import { useAddons } from '@/features/catalog/api'
import { useSiteConfig } from '@/features/site/api'

interface Row { id: string; icon: ReactNode; title: string; lines: InclusionLine[] }

/** "What's included in my booking?" accordion for one theatre. Only verified facts are shown. */
export function BookingInclusions({ theatre, className, dark }: { theatre: Theatre; className?: string; dark?: boolean }) {
  const [open, setOpen] = useState<string | null>(null)

  // real add-on catalogue for this theatre (same query the add-ons step uses)
  const { data: addons } = useAddons(theatre.id)
  const { data: site } = useSiteConfig()

  const categories = [...new Set((addons ?? []).filter((a) => a.isAvailable).map((a) => a.category))]
  const addonLines: InclusionLine[] = categories.length
    ? [{ text: categories.map((c) => CATEGORY_LABEL[c] ?? c).join(' · ') }, { text: 'Choose them in the add-ons step of your booking' }]
    : [{ text: CONFIRM_TEXT, pending: true }]

  const rows: Row[] = [
    { id: 'duration', icon: <Clock size={16} />, title: 'Theatre duration', lines: getDurationLines(theatre) },
    { id: 'capacity', icon: <Users size={16} />, title: 'Guest capacity', lines: getCapacityLines(theatre) },
    { id: 'screen', icon: <Monitor size={16} />, title: 'Screen & sound', lines: getScreenSoundLines(theatre) },
    { id: 'food', icon: <UtensilsCrossed size={16} />, title: 'Food', lines: getFoodLines() },
    { id: 'decor', icon: <Palette size={16} />, title: 'Decoration', lines: getDecorationLines(site?.pricing.decorationPricePaise) },
    { id: 'addons', icon: <Gift size={16} />, title: 'Add-on options', lines: addonLines },
    { id: 'extra', icon: <UserPlus size={16} />, title: 'Extra guest charges', lines: getExtraGuestLines(theatre) },
  ]
  // hidden until the business confirms which cancellation / rescheduling policy applies
  if (CANCELLATION_LINES) rows.push({ id: 'policy', icon: <ShieldCheck size={16} />, title: 'Cancellation & rescheduling', lines: CANCELLATION_LINES })

  return (
    <div className={cn(
      'rounded-2xl ring-1',
      dark ? 'ring-white/15' : 'bg-[#fdf6ff] ring-[#f5d5e0]',
      className,
    )} style={dark ? { background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' } : undefined}>
      <p className={cn('px-4 pb-1 pt-3.5 font-display text-base font-bold', dark ? 'text-white' : 'text-[#3d0a24]')}>What's included in my booking?</p>
      <ul className="px-2 pb-2">
        {rows.map((r) => {
          const isOpen = open === r.id
          return (
            <li key={r.id} className={cn('border-b last:border-0', dark ? 'border-white/10' : 'border-[#f8dce4]')}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : r.id)}
                aria-expanded={isOpen}
                className={cn('flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors', dark ? 'hover:bg-white/8' : 'hover:bg-white/70')}
              >
                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#a81a3a]', dark ? 'bg-white/10' : 'bg-white shadow-sm')}>{r.icon}</span>
                <span className={cn('flex-1 text-sm font-semibold', dark ? 'text-white/90' : 'text-[#3d0a24]')}>{r.title}</span>
                <ChevronDown size={16} className={cn('shrink-0 transition-transform', dark ? 'text-white/50' : 'text-[#7d4555]', isOpen && 'rotate-180')} />
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
                      <li key={i} className={cn('flex items-start gap-2 px-2 pb-2 pl-[3.25rem] text-[13px] leading-snug', dark ? 'text-white/70' : 'text-[#5b2535]')}>
                        {!l.pending && <Check size={13} className="mt-0.5 shrink-0 text-emerald-400" />}
                        <span className={cn(l.pending && (dark ? 'italic text-white/40' : 'italic text-[#7d4555]'))}>{l.text}</span>
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

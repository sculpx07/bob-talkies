import { Info } from 'lucide-react'
import { PROVISIONAL_NOTE } from '@/content/bookingInclusions'
import { cn } from '@/lib/utils/cn'

/** Shown beside totals while the extra-guest rate is unconfirmed. Display only. */
export function ProvisionalNote({ className, short }: { className?: string; short?: string }) {
  return (
    <p role="note" className={cn('flex items-start gap-1.5 rounded-xl bg-[#fff6e0] px-3 py-2 text-[11.5px] leading-snug text-[#8f6420] ring-1 ring-[#f1dba4]', className)}>
      <Info size={13} className="mt-px shrink-0" aria-hidden="true" />
      <span>{short ?? PROVISIONAL_NOTE}</span>
    </p>
  )
}

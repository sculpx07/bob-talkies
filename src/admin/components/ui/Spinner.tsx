import { Loader2 } from 'lucide-react'
import { cn } from '@/admin/lib/utils/cn'

export function Spinner({ className, label = 'Loading' }: { className?: string; label?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-label={label} role="status" />
}

/** Centered spinner that fills its container (page / panel loading). */
export function LoadingBlock({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-[200px] items-center justify-center gap-2 text-sm text-slate-500', className)}>
      <Spinner className="h-5 w-5 text-violet-600" />
      {label}
    </div>
  )
}

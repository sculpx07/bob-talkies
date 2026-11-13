import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

type BadgeVariant = 'gold' | 'champagne' | 'crimson' | 'success' | 'warning' | 'muted' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  gold: 'bg-gold-500/20 text-gold-400 border border-gold-500/30',
  champagne: 'bg-champagne-200/15 text-champagne-200 border border-champagne-200/30',
  crimson: 'bg-crimson-500/20 text-crimson-500 border border-crimson-500/30',
  success: 'bg-success/20 text-success border border-success/30',
  warning: 'bg-warning/20 text-warning border border-warning/30',
  muted: 'bg-bg-elevated text-text-muted border border-border-subtle',
  outline: 'bg-transparent text-text-secondary border border-border-subtle',
}

export function Badge({ variant = 'gold', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

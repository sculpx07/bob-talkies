import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  hover?: boolean
}

export function Card({ glow, hover, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-bg-surface border border-border-subtle rounded-card overflow-hidden',
        hover && 'transition-all duration-200 hover:border-gold-500/40 hover:shadow-gold-glow cursor-pointer',
        glow && 'shadow-gold-glow border-gold-500/40',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return <div className={cn('p-5 pb-0', className)} {...props}>{children}</div>
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}
export function CardBody({ className, children, ...props }: CardBodyProps) {
  return <div className={cn('p-5', className)} {...props}>{children}</div>
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}
export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn('px-5 py-4 border-t border-border-subtle', className)} {...props}>
      {children}
    </div>
  )
}

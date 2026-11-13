import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && <div className="text-text-muted mb-4 opacity-50">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && <p className="text-sm text-text-secondary max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  )
}

interface ErrorStateProps extends EmptyStateProps {
  retry?: () => void
}

export function ErrorState({ retry, ...props }: ErrorStateProps) {
  return (
    <EmptyState
      {...props}
      title={props.title ?? 'Something went wrong'}
      description={props.description ?? 'Please try again or contact support.'}
      action={
        retry ? (
          <button
            onClick={retry}
            className="px-4 py-2 rounded-xl border border-gold-500 text-gold-400 text-sm hover:bg-gold-500/10 transition-colors"
          >
            Try Again
          </button>
        ) : undefined
      }
    />
  )
}

import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={areaId} className="text-sm font-medium text-text-secondary">
            {label}
            {props.required && <span className="text-crimson-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          aria-describedby={error ? `${areaId}-error` : undefined}
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'w-full bg-bg-surface border rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-muted',
            'transition-colors duration-150 resize-none',
            'focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/40',
            error ? 'border-danger' : 'border-border-subtle hover:border-text-muted',
            className,
          )}
          rows={4}
          {...props}
        />
        {error && (
          <p id={`${areaId}-error`} role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-text-muted">{hint}</p>
        )}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

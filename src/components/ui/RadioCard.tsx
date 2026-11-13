import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface RadioCardProps {
  value: string
  selected: boolean
  onSelect: (value: string) => void
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function RadioCard({ value, selected, onSelect, children, className, disabled }: RadioCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => !disabled && onSelect(value)}
      disabled={disabled}
      className={cn(
        'relative text-left p-4 rounded-card border-2 transition-all duration-150 w-full',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500 focus-visible:outline-offset-2',
        selected
          ? 'border-gold-500 bg-gold-500/10 shadow-gold-glow'
          : 'border-border-subtle bg-bg-surface hover:border-gold-500/40 hover:bg-bg-elevated',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {selected && (
        <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gold-500 flex items-center justify-center">
          <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 2" stroke="#0A0A0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      {children}
    </button>
  )
}

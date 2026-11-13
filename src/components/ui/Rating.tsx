import { Star } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const sizes = { sm: 14, md: 16, lg: 20 }

export function Rating({ value, max = 5, size = 'md', showValue, className }: RatingProps) {
  const starSize = sizes[size]
  return (
    <span className={cn('inline-flex items-center gap-1', className)} aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={starSize}
          className={i < Math.floor(value) ? 'text-gold-500 fill-gold-500' : 'text-border-subtle'}
          aria-hidden="true"
        />
      ))}
      {showValue && (
        <span className="text-text-secondary text-sm ml-1">{value.toFixed(1)}</span>
      )}
    </span>
  )
}

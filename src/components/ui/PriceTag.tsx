import { formatINR } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface PriceTagProps {
  paise: number
  prefix?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl font-bold',
  xl: 'text-3xl font-bold',
}

export function PriceTag({ paise, prefix = 'Starting from', className, size = 'md' }: PriceTagProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-1.5', className)}>
      {prefix && <span className="text-text-secondary text-xs">{prefix}</span>}
      <span className={cn('text-gold-400 font-semibold font-display', sizes[size])}>
        {formatINR(paise)}
      </span>
    </span>
  )
}

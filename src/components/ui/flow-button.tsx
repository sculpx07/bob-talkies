import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FlowButtonProps {
  text?: string
  to?: string
  onClick?: () => void
  /** outline: transparent, fills on hover. solid: filled, lightens on hover. */
  variant?: 'outline' | 'solid'
  className?: string
}

/* Brand purple — same as the navbar "Book Now" button */
export function FlowButton({ text = 'Modern Button', to, onClick, variant = 'outline', className }: FlowButtonProps) {
  const solid = variant === 'solid'
  const classes = cn(
    'group relative inline-flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] pl-6 pr-11 py-2.5 text-sm font-semibold cursor-pointer',
    'transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-[12px] active:scale-[0.95]',
    solid
      ? 'border-[#32105f] bg-[#32105f] text-white'
      : 'border-[#32105f]/40 bg-transparent text-[#32105f]',
    className,
  )

  const content = (
    <>
      {/* Left arrow */}
      <ArrowRight
        aria-hidden="true"
        className={cn(
          'absolute w-4 h-4 left-[-25%] fill-none z-[9] group-hover:left-4 transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          solid ? 'stroke-white' : 'stroke-[#32105f]',
        )}
      />
      {/* Text */}
      <span className="relative z-[1] group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>
      {/* Circle */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-[50%] opacity-0 group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]',
          'bg-transparent',
        )}
      />
      {/* Right arrow */}
      <ArrowRight
        aria-hidden="true"
        className={cn(
          'absolute w-4 h-4 right-5 fill-none z-[9] group-hover:right-[-25%] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          solid ? 'stroke-white' : 'stroke-[#32105f]',
        )}
      />
    </>
  )

  return to ? (
    <Link to={to} className={classes}>{content}</Link>
  ) : (
    <button type="button" onClick={onClick} className={classes}>{content}</button>
  )
}

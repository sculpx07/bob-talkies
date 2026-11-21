import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/admin/lib/utils/cn'

interface ControlProps {
  invalid?: boolean
  describedBy?: string
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, ControlProps {
  /** icon or text inside the left edge, e.g. a search icon or "₹" */
  leading?: ReactNode
  trailing?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, describedBy, leading, trailing, className, ...rest },
  ref,
) {
  const input = (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn('field h-9', invalid && 'field-invalid', leading && 'pl-9', trailing && 'pr-9', className)}
      {...rest}
    />
  )
  if (!leading && !trailing) return input
  return (
    <div className="relative">
      {leading && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">{leading}</span>}
      {input}
      {trailing && <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">{trailing}</span>}
    </div>
  )
})

/** Rupee amount input (the form holds rupees; convert to paise when sending). */
export const MoneyInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'leading'>>(function MoneyInput(props, ref) {
  return <Input ref={ref} type="number" inputMode="decimal" step="0.01" min={0} leading="₹" {...props} />
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & ControlProps>(
  function Textarea({ invalid, describedBy, className, rows = 3, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={cn('field py-2', invalid && 'field-invalid', className)}
        {...rest}
      />
    )
  },
)

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

/** Native select (accessible and fast); pass `options` or your own <option>s. */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & ControlProps & { options?: SelectOption[]; placeholder?: string }>(
  function Select({ invalid, describedBy, options, placeholder, className, children, ...rest }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn('field h-9 appearance-none pr-9', invalid && 'field-invalid', className)}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options?.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      </div>
    )
  },
)

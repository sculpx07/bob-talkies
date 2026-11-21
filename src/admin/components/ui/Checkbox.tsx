import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/admin/lib/utils/cn'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  description?: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, id, ...rest },
  ref,
) {
  return (
    <label htmlFor={id} className={cn('flex cursor-pointer items-start gap-2.5', rest.disabled && 'cursor-not-allowed opacity-60', className)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="focus-ring mt-0.5 h-4 w-4 rounded border-slate-300 accent-violet-600"
        {...rest}
      />
      {(label || description) && (
        <span className="text-sm">
          {label && <span className="font-medium text-slate-700">{label}</span>}
          {description && <span className="block text-xs text-slate-500">{description}</span>}
        </span>
      )}
    </label>
  )
})

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  description?: ReactNode
  disabled?: boolean
  id?: string
  className?: string
}

/** On / off toggle, e.g. "Active". */
export function Switch({ checked, onChange, label, description, disabled, id, className }: SwitchProps) {
  const toggle = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'focus-ring relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
        checked ? 'bg-violet-600' : 'bg-slate-300',
      )}
    >
      <span className={cn('inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5')} />
    </button>
  )
  if (!label && !description) return toggle
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="text-sm">
        {label && <label htmlFor={id} className="font-medium text-slate-700">{label}</label>}
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      {toggle}
    </div>
  )
}

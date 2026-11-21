import { useId, type ReactNode } from 'react'
import { cn } from '@/admin/lib/utils/cn'

interface FormFieldProps {
  label?: ReactNode
  /** id of the control; generated when omitted and passed to `children` */
  id?: string
  required?: boolean
  hint?: ReactNode
  error?: string
  className?: string
  children: (props: { id: string; invalid: boolean; describedBy?: string }) => ReactNode
}

/**
 * Label + control + hint / error, wired up for accessibility.
 *   <FormField label="Name" error={errors.name?.message}>
 *     {(field) => <Input {...field} {...register('name')} />}
 *   </FormField>
 */
export function FormField({ label, id, required, hint, error, className, children }: FormFieldProps) {
  const autoId = useId()
  const controlId = id ?? autoId
  const messageId = `${controlId}-message`
  const hasMessage = Boolean(error || hint)

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={controlId} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      {children({ id: controlId, invalid: Boolean(error), describedBy: hasMessage ? messageId : undefined })}
      {error ? (
        <p id={messageId} role="alert" className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

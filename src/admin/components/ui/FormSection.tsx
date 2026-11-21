import type { ReactNode } from 'react'
import { cn } from '@/admin/lib/utils/cn'
import { Card } from './Card'

/** A titled block of a long form: description on the left, fields on the right (stacked on mobile). */
export function FormSection({ title, description, children, className }: {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('grid gap-6 p-5 md:grid-cols-3 md:p-6', className)}>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">{children}</div>
    </Card>
  )
}

/** Makes a field span both columns inside a FormSection. */
export const FullWidth = ({ children }: { children: ReactNode }) => <div className="sm:col-span-2">{children}</div>

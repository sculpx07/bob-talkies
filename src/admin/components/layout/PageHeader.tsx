import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

/** Title row at the top of every page; also sets the browser tab title. */
export function PageHeader({ title, description, actions, back }: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  /** link shown above the title, e.g. { to: '/theatres', label: 'Theatres' } */
  back?: { to: string; label: string }
}) {
  useEffect(() => {
    document.title = `${title} · BOB Talkies Admin`
  }, [title])

  return (
    <div className="mb-6">
      {back && (
        <Link to={back.to} className="focus-ring mb-2 inline-flex items-center gap-1 rounded text-sm text-slate-500 hover:text-slate-800">
          <ChevronLeft className="h-4 w-4" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

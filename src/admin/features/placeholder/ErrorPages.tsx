import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { AlertTriangle, Compass } from 'lucide-react'
import { Button, EmptyState } from '@/admin/components/ui'

export function NotFoundPage() {
  return (
    <EmptyState
      icon={<Compass className="h-5 w-5" />}
      title="Page not found"
      description="The page you are looking for does not exist."
      action={<Link to="/"><Button variant="secondary">Back to dashboard</Button></Link>}
      className="py-24"
    />
  )
}

/** Shown when a page crashes while rendering, instead of a blank screen. */
export function RouteErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unexpected error'
  if (import.meta.env.DEV) console.error(error)

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        title="Something went wrong on this page"
        description={message}
        action={<Button variant="secondary" onClick={() => window.location.reload()}>Reload</Button>}
      />
    </div>
  )
}

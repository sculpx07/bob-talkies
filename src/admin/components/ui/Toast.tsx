import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/admin/lib/utils/cn'

type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  tone: ToastTone
  title: string
  description?: string
}

interface ToastApi {
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)
const DURATION_MS = 4500
let nextId = 1

const styles: Record<ToastTone, { icon: ReactNode; ring: string }> = {
  success: { icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, ring: 'ring-emerald-100' },
  error: { icon: <XCircle className="h-5 w-5 text-red-500" />, ring: 'ring-red-100' },
  info: { icon: <Info className="h-5 w-5 text-sky-500" />, ring: 'ring-sky-100' },
}

/** Small notifications in the bottom-right corner. Use with useToast(). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), [])

  const push = useCallback((tone: ToastTone, title: string, description?: string) => {
    const id = nextId++
    setToasts((all) => [...all.slice(-3), { id, tone, title, description }]) // keep at most 4
    window.setTimeout(() => dismiss(id), DURATION_MS)
  }, [dismiss])

  const api = useMemo<ToastApi>(() => ({
    success: (t, d) => push('success', t, d),
    error: (t, d) => push('error', t, d),
    info: (t, d) => push('info', t, d),
  }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(100vw-2rem,22rem)] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={cn('pointer-events-auto flex items-start gap-3 rounded-xl bg-white p-3.5 shadow-lg ring-1 animate-slide-up', styles[t.tone].ring)}>
            <span className="mt-0.5 shrink-0">{styles[t.tone].icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{t.title}</p>
              {t.description && <p className="mt-0.5 text-xs text-slate-500">{t.description}</p>}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} className="focus-ring rounded p-0.5 text-slate-400 hover:text-slate-600" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

import { NavLink } from 'react-router-dom'
import { useAuth } from '@/admin/auth/AuthProvider'
import { cn } from '@/admin/lib/utils/cn'
import { BRAND, NAV_SECTIONS } from './nav'

/** Navigation list; used fixed on desktop and inside a drawer on mobile. */
export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { hasRole } = useAuth()

  return (
    <nav className="flex h-full flex-col bg-white" aria-label="Main">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-100 px-5">
        <img src={BRAND.logo} alt={BRAND.name} className="h-8 w-auto max-w-[4.5rem] object-contain" />
        <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700">{BRAND.product}</span>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section, i) => {
          const items = section.items.filter((item) => !item.roles || hasRole(...item.roles))
          if (!items.length) return null
          return (
            <div key={section.title ?? i}>
              {section.title && <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{section.title}</p>}
              <ul className="space-y-0.5">
                {items.map(({ path, label, icon: Icon }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      end={path === '/'}
                      onClick={onNavigate}
                      className={({ isActive }) => cn(
                        'focus-ring flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </nav>
  )
}

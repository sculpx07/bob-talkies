import { useNavigate } from 'react-router-dom'
import { ChevronDown, ExternalLink, LogOut, Menu as MenuIcon, UserRound } from 'lucide-react'
import { useAuth, useCurrentUser } from '@/admin/auth/AuthProvider'
import { Badge, IconButton, Menu } from '@/admin/components/ui'
import { env } from '@/admin/config/env'
import { ROLES } from '@/admin/types/auth'

const initials = (name: string) => name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

export function Topbar({ onOpenNav }: { onOpenNav: () => void }) {
  const user = useCurrentUser()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <IconButton label="Open menu" className="lg:hidden" onClick={onOpenNav}>
        <MenuIcon className="h-5 w-5" />
      </IconButton>

      <div className="flex-1" />

      <a
        href={env.siteUrl}
        target="_blank"
        rel="noreferrer"
        className="focus-ring hidden items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-slate-500 hover:text-slate-800 sm:inline-flex"
      >
        View website <ExternalLink className="h-3.5 w-3.5" />
      </a>

      <Menu
        header={
          <div className="text-sm">
            <p className="font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
        }
        items={[
          { label: 'My account', icon: <UserRound />, onSelect: () => navigate('/account') },
          {
            label: 'Sign out',
            icon: <LogOut />,
            danger: true,
            onSelect: async () => {
              await signOut()
              navigate('/login', { replace: true })
            },
          },
        ]}
        trigger={
          <button type="button" className="focus-ring flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-xs font-semibold text-white">
              {initials(user.name)}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-medium text-slate-800">{user.name}</span>
              <span className="block text-xs text-slate-500">{user.role.displayName}</span>
            </span>
            {user.role.name === ROLES.SUPER_ADMIN && <Badge tone="brand" className="hidden md:inline-flex">Super admin</Badge>}
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        }
      />
    </header>
  )
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, refreshTokens } from '@/admin/lib/api/client'
import { tokens } from '@/admin/lib/api/tokens'
import { queryClient } from '@/admin/lib/api/queryClient'
import type { AdminUser, SignInResponse } from '@/admin/types/auth'
import type { Permission } from '@/admin/types/permissions'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  status: AuthStatus
  user: AdminUser | null
  /** true when the last session ended on its own (expired / revoked), for a login-page notice */
  sessionExpired: boolean
  signIn: (email: string, password: string) => Promise<AdminUser>
  signOut: () => Promise<void>
  /** true when the signed-in person has at least one of the permissions */
  can: (...permissions: Permission[]) => boolean
  /** refresh the signed-in user after they edit their own name or email */
  updateUser: (patch: Partial<Pick<AdminUser, 'name' | 'email'>>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AdminUser | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)

  // On load: a stored refresh token means we may still be signed in. Get a fresh
  // access token first (parallel callers share one refresh), then load the user.
  useEffect(() => {
    if (!tokens.getRefresh()) {
      setStatus('anonymous')
      return
    }
    let cancelled = false
    refreshTokens()
      .then((result) => {
        if (result === 'invalid') throw new Error('session ended')
        return api.get<{ user: AdminUser }>('/auth/me')
      })
      .then(({ user: me }) => {
        if (cancelled) return
        setUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        if (!tokens.getAccess()) tokens.clear()
        setStatus('anonymous')
      })
    return () => { cancelled = true }
  }, [])

  // The API client ends the session when a refresh is refused.
  useEffect(() => tokens.onSessionEnded(() => {
    setUser(null)
    setStatus('anonymous')
    setSessionExpired(true)
    queryClient.clear()
  }), [])

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.post<SignInResponse>('/auth/signin', { email, password }, { auth: false })
    tokens.set(result.accessToken, result.refreshToken)
    queryClient.clear()
    setUser(result.user)
    setSessionExpired(false)
    setStatus('authenticated')
    return result.user
  }, [])

  const signOut = useCallback(async () => {
    const refreshToken = tokens.getRefresh()
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }, { auth: false }).catch(() => { /* signed out locally anyway */ })
    }
    tokens.clear()
    queryClient.clear()
    setUser(null)
    setSessionExpired(false)
    setStatus('anonymous')
  }, [])

  const can = useCallback((...permissions: Permission[]) => Boolean(user && permissions.some((p) => user.permissions.includes(p))), [user])

  // Role changes made by someone else show up without signing out: re-read permissions when the tab is back in focus.
  useEffect(() => {
    if (status !== 'authenticated') return
    const reload = () => {
      if (document.visibilityState !== 'visible') return
      api.get<{ user: AdminUser }>('/auth/me').then(({ user: me }) => setUser(me)).catch(() => { /* session errors are handled by the API client */ })
    }
    document.addEventListener('visibilitychange', reload)
    return () => document.removeEventListener('visibilitychange', reload)
  }, [status])

  const updateUser = useCallback((patch: Partial<Pick<AdminUser, 'name' | 'email'>>) => {
    setUser((current) => (current ? { ...current, ...patch } : current))
  }, [])

  const value = useMemo(
    () => ({ status, user, sessionExpired, signIn, signOut, can, updateUser }),
    [status, user, sessionExpired, signIn, signOut, can, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** The signed-in user; only use inside routes wrapped by <RequireAuth>. */
export function useCurrentUser(): AdminUser {
  const { user } = useAuth()
  if (!user) throw new Error('useCurrentUser used outside a signed-in route')
  return user
}

/*
 * Auth tokens.
 *   access token  - short-lived (15 min), kept only in memory
 *   refresh token - long-lived, kept in localStorage so a page reload stays signed in;
 *                   the backend rotates it on every refresh
 */

const REFRESH_KEY = 'bob_admin_refresh_token'

let accessToken: string | null = null

const storage = {
  get(): string | null {
    try { return localStorage.getItem(REFRESH_KEY) } catch { return null }
  },
  set(value: string | null) {
    try {
      if (value) localStorage.setItem(REFRESH_KEY, value)
      else localStorage.removeItem(REFRESH_KEY)
    } catch { /* storage blocked: the session just will not survive a reload */ }
  },
}

type Listener = () => void
const sessionEndedListeners = new Set<Listener>()

export const tokens = {
  getAccess: () => accessToken,
  getRefresh: () => storage.get(),

  set(access: string, refresh: string) {
    accessToken = access
    storage.set(refresh)
  },

  clear() {
    accessToken = null
    storage.set(null)
  },

  /** Called when the session can no longer be refreshed (expired, revoked, signed out elsewhere). */
  onSessionEnded(listener: Listener) {
    sessionEndedListeners.add(listener)
    return () => { sessionEndedListeners.delete(listener) }
  },

  endSession() {
    this.clear()
    sessionEndedListeners.forEach((l) => l())
  },
}

// Signing out in another tab removes the refresh token there; end this tab's session too.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === REFRESH_KEY && !e.newValue && accessToken) tokens.endSession()
  })
}

import { useSyncExternalStore } from 'react'

/*
 * The signed-in customer (mobile number + OTP login). Kept in localStorage so a
 * reload stays signed in; the backend token itself expires after 30 days.
 */

export interface CustomerProfile {
  id: string
  mobile: string
  name: string
  email: string
}

export interface CustomerSession {
  token: string
  customer: CustomerProfile
}

const KEY = 'bob_customer_session'
const listeners = new Set<() => void>()
let cached: CustomerSession | null | undefined

function read(): CustomerSession | null {
  if (cached !== undefined) return cached
  try {
    const raw = localStorage.getItem(KEY)
    cached = raw ? (JSON.parse(raw) as CustomerSession) : null
  } catch {
    cached = null
  }
  return cached
}

function write(session: CustomerSession | null) {
  cached = session
  try {
    if (session) localStorage.setItem(KEY, JSON.stringify(session))
    else localStorage.removeItem(KEY)
  } catch { /* storage blocked: the session lasts until the tab closes */ }
  listeners.forEach((l) => l())
}

export const customerSession = {
  get: read,
  /** token for API calls that need the signed-in customer, if any */
  token: () => read()?.token ?? null,
  set: (session: CustomerSession) => write(session),
  clear: () => write(null),
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}

// signing in or out in another tab updates this one
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    cached = undefined
    listeners.forEach((l) => l())
  })
}

/** True when this device holds a login for that mobile number (booking needs it). */
export const isSignedInAs = (mobile: string) => read()?.customer.mobile === mobile && Boolean(read()?.token)

/** The signed-in customer, re-rendering when they sign in or out. */
export function useCustomerSession(): CustomerSession | null {
  return useSyncExternalStore(customerSession.subscribe, read, () => null)
}

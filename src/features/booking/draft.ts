import { useEffect, useRef, useSyncExternalStore } from 'react'
import { api } from '@/lib/api/client'
import { config } from '@/lib/config'
import type { BookingState } from './state/booking.reducer'

/*
 * Saves the booking form to the backend while the visitor fills it (PUT /booking-drafts/:draftId),
 * so a visitor who leaves halfway is still a lead. Nothing is shown on screen and failures are
 * ignored: the booking itself never depends on it.
 */

const ID_KEY = 'bob_booking_draft_id'
const SAVE_DELAY_MS = 1200

// ---------------------------------------------------------------- draft id (one per tab session)

function newId() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function draftId(): string {
  try {
    const existing = sessionStorage.getItem(ID_KEY)
    if (existing) return existing
    const id = newId()
    sessionStorage.setItem(ID_KEY, id)
    return id
  } catch {
    return (memoryId ??= newId()) // storage blocked: keep it for this page load
  }
}
let memoryId: string | undefined

/** The next save starts a new draft (the old one became a booking). */
function startNewDraft() {
  memoryId = undefined
  try { sessionStorage.removeItem(ID_KEY) } catch { /* ignore */ }
}

// ---------------------------------------------------------------- what is typed in the details form

/** The details form keeps its values to itself until "Next step"; it reports them here as they are typed. */
export interface TypedDetails { name?: string; mobile?: string; email?: string; personalMessage?: string }

let typed: TypedDetails = {}
const listeners = new Set<() => void>()
export const draftDetails = {
  set(next: TypedDetails) {
    typed = { ...typed, ...next }
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => { listeners.delete(l) }
  },
  get: () => typed,
}

// ---------------------------------------------------------------- saving

type DraftPayload = Record<string, unknown>

function payloadFrom(state: BookingState, details: TypedDetails): DraftPayload | null {
  const name = details.name ?? state.customerName
  const mobile = (details.mobile ?? state.customerMobile).replace(/\D/g, '').slice(0, 10)
  const email = details.email ?? state.customerEmail
  // only once the visitor has given something to follow up on
  if (!name.trim() && !mobile && !email.trim() && !state.theatreId) return null
  return {
    name: name.slice(0, 100),
    mobile,
    email: email.slice(0, 254),
    occasion: state.occasion ?? '',
    guests: state.guests,
    kids: state.kids,
    date: state.date ?? '',
    theatreId: state.theatreId ?? '',
    slotId: state.slotId ?? '',
    decoration: state.decoration,
    addonIds: state.addonIds,
    couponCode: state.couponCode ?? '',
    personalMessage: (details.personalMessage ?? state.personalMessage ?? '').slice(0, 500),
    step: state.step,
  }
}

function send(body: DraftPayload, keepalive = false) {
  const path = `/booking-drafts/${draftId()}`
  if (keepalive) {
    // the page is closing: a normal request could be cut off
    fetch(`${config.apiBaseUrl}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {})
    return
  }
  api.put<{ saved: boolean; converted: boolean }>(path, body)
    .then((r) => { if (r.converted) startNewDraft() })
    .catch(() => { /* a lost draft save is not worth bothering the visitor */ })
}

/** Keeps the draft in step with the booking form (debounced), and sends the last changes when the page closes. */
export function useDraftAutosave(state: BookingState) {
  const details = useSyncExternalStore(draftDetails.subscribe, draftDetails.get, draftDetails.get)
  const payload = payloadFrom(state, details)
  const json = payload ? JSON.stringify(payload) : ''
  const lastSent = useRef('')
  const pending = useRef<DraftPayload | null>(null)

  useEffect(() => {
    if (!payload || json === lastSent.current) return
    pending.current = payload
    const timer = setTimeout(() => {
      lastSent.current = json
      pending.current = null
      send(payload)
    }, SAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [json]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const flush = () => {
      if (!pending.current) return
      send(pending.current, true)
      pending.current = null
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush() // leaving the booking page inside the site
    }
  }, [])
}

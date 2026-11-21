import { useEffect, useState } from 'react'
import { ApiError } from '@/admin/lib/api/errors'
import type { BookingIssue } from './types'

/**
 * Readable reasons from a failed booking call. A refused booking (409) lists its
 * issues in `details`, e.g. "Already booked (BT…)" or "Bookings close 2 hours before the slot".
 */
export function bookingErrorMessages(err: unknown): string[] {
  if (err instanceof ApiError) {
    const issues = Array.isArray(err.details) ? (err.details as Partial<BookingIssue>[]).map((d) => d.message).filter(Boolean) as string[] : []
    return issues.length ? [err.message, ...issues] : [err.message]
  }
  return [err instanceof Error ? err.message : 'Something went wrong']
}

/** True when the refusal can be overridden by staff (backend ADMIN_OVERRIDABLE_ISSUES). */
export function needsOverride(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409 && /needs an override/i.test(err.message)
}

/** WhatsApp chat link for an Indian mobile number. */
export const whatsappLink = (mobile: string, text?: string) =>
  `https://wa.me/91${mobile}${text ? `?text=${encodeURIComponent(text)}` : ''}`

/** Re-renders every second; for live countdowns (slot holds). */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

/** "4:05" for the time left on a hold; "expired" once it has run out. */
export function formatCountdown(untilIso: string, now: number): string {
  const ms = new Date(untilIso).getTime() - now
  if (ms <= 0) return 'expired'
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Hours from now until a slot ("YYYY-MM-DD", "HH:mm") in the browser's time (staff are at the venue). */
export function hoursUntilSlot(date: string, time: string, now = Date.now()): number {
  return (new Date(`${date}T${time}:00`).getTime() - now) / 3_600_000
}

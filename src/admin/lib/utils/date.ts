import { format, formatDistanceToNow, parseISO } from 'date-fns'

/** Today as "YYYY-MM-DD" in the browser's timezone (staff are at the venue). */
export const todayISO = () => format(new Date(), 'yyyy-MM-dd')

/** "2026-12-02" -> "Wed, 2 Dec 2026" */
export const formatDate = (date: string | null | undefined) =>
  date ? format(parseISO(date), 'EEE, d MMM yyyy') : '—'

/** ISO timestamp -> "2 Dec 2026, 5:30 PM" */
export const formatDateTime = (iso: string | null | undefined) =>
  iso ? format(new Date(iso), 'd MMM yyyy, h:mm a') : '—'

/** ISO timestamp -> "5 minutes ago" */
export const timeAgo = (iso: string | null | undefined) =>
  iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : '—'

/** "17:30" -> "5:30 PM" */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '—'
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`
}

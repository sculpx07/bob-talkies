import type { BookingListItem, BookingSource, PaymentMethod } from '@/admin/features/bookings/types'
import type { LeadSource } from '@/admin/features/leads/types'

export interface ReportRange {
  from: string
  to: string
  theatre?: string
}

export interface ReportTotals {
  bookings: number
  revenuePaise: number
  paidPaise: number
  outstandingPaise: number
  collectedPaise: number
  averageOrderPaise: number
  guests: number
  discountPaise: number
  gstPaise: number
  addonsPaise: number
  cancelled: number
  cancellationRate: number
  noShows: number
  noShowRate: number
  sellableSlots: number
  occupancy: number
}

export interface DailyPoint {
  date: string
  bookings: number
  revenuePaise: number
  collectedPaise: number
}

export interface GroupRow<K = string> {
  key: K
  bookings: number
  revenuePaise: number
}

export interface ReportSummary {
  range: { from: string; to: string; days: number; theatre: string | null }
  previousRange: { from: string; to: string }
  totals: ReportTotals
  previous: Pick<ReportTotals, 'bookings' | 'revenuePaise' | 'collectedPaise' | 'averageOrderPaise' | 'guests' | 'cancellationRate'>
  daily: DailyPoint[]
  byTheatre: { theatre: { id: string; name: string; isActive: boolean }; bookings: number; revenuePaise: number; sellableSlots: number; occupancy: number }[]
  byOccasion: GroupRow<string | null>[]
  bySource: GroupRow<BookingSource>[]
  bySlotTime: GroupRow[]
  topAddons: { name: string; quantity: number; revenuePaise: number; bookings: number }[]
  offers: { code: string; uses: number; discountPaise: number; revenuePaise: number }[]
  paymentMethods: { method: PaymentMethod; amountPaise: number; count: number }[]
  leads: {
    received: number
    spam: number
    converted: number
    lost: number
    conversionRate: number
    avgFirstResponseMinutes: number | null
    bySource: { key: LeadSource; leads: number; converted: number; conversionRate: number }[]
  }
}

export type UnpaidBooking = Pick<
  BookingListItem,
  'id' | 'bookingNumber' | 'date' | 'slotStart' | 'slotEnd' | 'theatreName' | 'customer' | 'totalPaise' | 'amountPaidPaise' | 'balanceDuePaise' | 'paymentStatus' | 'status'
>

export interface ReportOverview {
  today: { date: string; bookings: number; guests: number; revenuePaise: number; collectedPaise: number; sellableSlots: number; occupancy: number }
  nextDays: { date: string; bookings: number; guests: number; sellableSlots: number; occupancy: number }[]
  activeHolds: number
  unpaidUpcoming: { count: number; amountPaise: number; bookings: UnpaidBooking[] }
}

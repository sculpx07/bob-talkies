import type { UserRef } from '@/admin/types/api'
import type { BookingStatus } from '@/admin/features/bookings/types'

/** Shapes from bob-admin: slot, slotBlock, specialDate models and the schedule service. Money is paise. */

export interface TheatreRef {
  id: string
  name: string
  slug: string
}

export type SlotOfferDiscountType = 'percent' | 'flat'

/** Automatic discount on a slot's price (e.g. "Happy hours" 20% off). */
export interface SlotOffer {
  isActive: boolean
  label: string
  discountType: SlotOfferDiscountType
  /** percent: 1-90; flat: paise */
  discountValue: number
  days: number[]
  /** optional YYYY-MM-DD range, both ends included */
  validFrom: string | null
  validUntil: string | null
}

export interface Slot {
  id: string
  theatre: TheatreRef
  startTime: string // "HH:mm"
  endTime: string // at or before startTime = ends after midnight
  label: string
  daysOfWeek: number[] // 0 = Sunday ... 6 = Saturday
  /** null = use the theatre's price */
  weekdayPricePaise: number | null
  weekendPricePaise: number | null
  /** null = no slot offer */
  offer: SlotOffer | null
  startMinutes: number
  durationMinutes: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SlotInput {
  theatre?: string // create only
  startTime: string
  endTime: string
  label: string
  daysOfWeek: number[]
  weekdayPricePaise: number | null
  weekendPricePaise: number | null
  offer: SlotOffer | null
  isActive: boolean
}

export interface SlotBlock {
  id: string
  /** null = every theatre */
  theatre: TheatreRef | null
  /** null = the whole day */
  slot: Pick<Slot, 'id' | 'startTime' | 'endTime' | 'label'> | null
  startDate: string
  endDate: string
  reason: string
  createdBy: UserRef | null
  createdAt: string
}

export interface SlotBlockInput {
  theatre: string | null
  slot: string | null
  startDate: string
  endDate: string
  reason: string
}

export type SpecialDateType = 'high_demand' | 'offer_date'

export interface SpecialDate {
  id: string
  theatre: TheatreRef | null
  date: string
  type: SpecialDateType
  note: string
  createdAt: string
}

export type ScheduleSlotStatus = 'open' | 'blocked' | 'held' | 'booked'

/** GET /slots/schedule?theatre=&date= */
export interface DaySchedule {
  date: string
  dayOfWeek: number
  isWeekend: boolean
  theatre: TheatreRef & { isActive: boolean }
  dayBlocked: { id: string; reason: string } | null
  specialDate: { id: string; type: SpecialDateType; note: string } | null
  slots: Array<{
    id: string
    startTime: string
    endTime: string
    label: string
    durationMinutes: number
    pricePaise: number
    priceSource: 'slot' | 'theatre'
    /** the slot offer that applies on this date, with the price after it */
    offer: { label: string; discountPaise: number; pricePaise: number } | null
    status: ScheduleSlotStatus
    blockReason: string | null
    booking: {
      id: string
      bookingNumber: string
      status: BookingStatus
      customerName: string
      guests: number
      holdExpiresAt: string | null
    } | null
  }>
}

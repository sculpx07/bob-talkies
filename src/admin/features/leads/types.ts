import type { UserRef } from '@/admin/types/api'
import type { BookingStatus } from '@/admin/features/bookings/types'

/** Lead shapes from the bob-admin backend (src/models/lead.model.js). */

export type LeadStatus = 'new' | 'contacted' | 'follow_up' | 'converted' | 'lost' | 'spam'
export type LeadSource = 'contact_page' | 'website' | 'vibe_hall_enquiry' | 'phone' | 'whatsapp' | 'instagram' | 'walk_in' | 'referral' | 'other'
export type LeadPriority = 'low' | 'normal' | 'high'
export type LeadActivityType = 'created' | 'note' | 'call' | 'whatsapp' | 'email' | 'status_change' | 'assigned' | 'converted'

export interface LeadActivity {
  type: LeadActivityType
  text: string
  from: LeadStatus | null
  to: LeadStatus | null
  by: UserRef | null
  at: string
}

/** A row in the inbox (no activity). */
export interface LeadListItem {
  id: string
  name: string
  mobile: string
  email: string
  occasion: string
  message: string
  consentWhatsapp: boolean
  source: LeadSource
  status: LeadStatus
  priority: LeadPriority
  assignedTo: UserRef | null
  followUpAt: string | null
  lostReason: string
  createdAt: string
  updatedAt: string
}

export interface Lead extends LeadListItem {
  utm: Partial<Record<'source' | 'medium' | 'campaign' | 'term' | 'content' | 'gclid' | 'fbclid' | 'referrer' | 'landingPage' | 'ref', string>> | null
  convertedBooking: { id: string; bookingNumber: string; status: BookingStatus; date: string; slotStart: string; theatreName: string; totalPaise: number } | null
  firstContactedAt: string | null
  closedAt: string | null
  activity: LeadActivity[]
  createdBy: UserRef | null
}

/** GET /leads/:id */
export interface LeadDetail {
  lead: Lead
  otherLeads: Array<{ id: string; name: string; status: LeadStatus; source: LeadSource; occasion: string; createdAt: string }>
  bookings: Array<{ id: string; bookingNumber: string; status: BookingStatus; date: string; slotStart: string; theatreName: string; totalPaise: number }>
}

/** GET /leads/stats */
export interface LeadStats {
  total: number
  byStatus: Record<LeadStatus, number>
  bySource: Record<string, number>
  open: number
  dueFollowUps: number
  unassignedOpen: number
  conversionRate: number
}

export interface LeadListParams {
  page?: number
  limit?: number
  sort?: string
  search?: string
  /** statuses, or "open" = new + contacted + follow_up */
  status?: Array<LeadStatus | 'open'>
  source?: LeadSource
  /** a user id, "me" or "unassigned" */
  assignedTo?: string
  priority?: LeadPriority
  followUp?: 'due' | 'scheduled'
}

export interface LeadInput {
  name: string
  mobile: string
  email?: string
  occasion?: string
  message?: string
  consentWhatsapp?: boolean
  source?: LeadSource
  priority?: LeadPriority
  assignedTo?: string | null
  followUpAt?: string | null
}

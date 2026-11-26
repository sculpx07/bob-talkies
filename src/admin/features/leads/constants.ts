import type { BadgeTone } from '@/admin/components/ui'
import type { LeadActivityType, LeadPriority, LeadSource, LeadStatus } from './types'

export const LEAD_STATUS_BADGE: Record<LeadStatus, { label: string; tone: BadgeTone }> = {
  new: { label: 'New', tone: 'info' },
  contacted: { label: 'Contacted', tone: 'brand' },
  follow_up: { label: 'Follow-up', tone: 'warning' },
  converted: { label: 'Converted', tone: 'success' },
  lost: { label: 'Lost', tone: 'neutral' },
  spam: { label: 'Spam', tone: 'danger' },
}

export const LEAD_STATUS_ORDER: LeadStatus[] = ['new', 'contacted', 'follow_up', 'converted', 'lost', 'spam']
export const OPEN_LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'follow_up']

/**
 * Changes allowed through "change status" (backend LEAD_TRANSITIONS).
 * "converted" is only reached by linking a booking and is final.
 */
export const LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacted', 'follow_up', 'lost', 'spam'],
  contacted: ['follow_up', 'lost', 'spam'],
  follow_up: ['contacted', 'lost', 'spam'],
  lost: ['contacted', 'follow_up'],
  spam: ['new', 'contacted'],
  converted: [],
}

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  contact_page: 'Website form',
  vibe_hall_enquiry: 'Vibe Hall form',
  website: 'Website',
  phone: 'Phone',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  walk_in: 'Walk-in',
  referral: 'Referral',
  other: 'Other',
}

/** Sources staff can pick when logging an enquiry by hand. */
export const MANUAL_LEAD_SOURCES: LeadSource[] = ['phone', 'whatsapp', 'instagram', 'walk_in', 'referral', 'other']

export const PRIORITY_BADGE: Record<LeadPriority, { label: string; tone: BadgeTone }> = {
  high: { label: 'High', tone: 'danger' },
  normal: { label: 'Normal', tone: 'neutral' },
  low: { label: 'Low', tone: 'neutral' },
}

export const ACTIVITY_LABELS: Record<LeadActivityType, string> = {
  created: 'Created',
  note: 'Note',
  call: 'Call',
  whatsapp: 'WhatsApp',
  email: 'Email',
  status_change: 'Status',
  assigned: 'Assigned',
  converted: 'Converted',
}

/** Activities staff log by hand. Logging contact on a new lead marks it contacted. */
export const MANUAL_ACTIVITY_TYPES = ['note', 'call', 'whatsapp', 'email'] as const

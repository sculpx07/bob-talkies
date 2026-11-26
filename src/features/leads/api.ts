import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

/*
 * Website enquiry forms (contact page, Vibe Hall). Each one lands in
 * Admin → Leads (bob-admin POST /public/leads).
 */

export interface LeadRequest {
  name: string
  mobile: string
  email?: string
  occasion?: string
  message: string
  consentWhatsapp?: boolean
  /** which form: 'contact_page' | 'vibe_hall_enquiry' */
  source: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface LeadReply {
  success: boolean
  leadId: string | null
  message: string
}

export const leadApi = {
  submit: (lead: LeadRequest) => api.post<LeadReply>('/leads', lead),
}

export function useSubmitLead() {
  return useMutation({ mutationFn: leadApi.submit })
}

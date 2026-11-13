import { useCallback } from 'react'
import { pushDataLayer } from './dataLayer'
import { api } from '@/lib/api/client'
import { getLastTouchUTM } from './utm'

type EventName =
  | 'page_view' | 'view_theatre' | 'view_package' | 'select_occasion'
  | 'select_date' | 'view_availability' | 'select_slot' | 'add_addon'
  | 'apply_coupon' | 'begin_checkout' | 'payment_started' | 'purchase'
  | 'booking_cancelled' | 'whatsapp_click' | 'call_click' | 'generate_lead'
  | 'search_performed'

export function trackEvent(name: EventName, params: Record<string, unknown> = {}): void {
  const utmData = getLastTouchUTM() ?? {}
  pushDataLayer({ event: name, ...params })
  api.post('/track/event', { event: name, params, utm: utmData, page: window.location.pathname }).catch(() => {})
}

export function useTrackEvent() {
  return useCallback((name: EventName, params: Record<string, unknown> = {}) => {
    trackEvent(name, params)
  }, [])
}

export function useTrackPageView(pageName: string, extraParams?: Record<string, unknown>) {
  const track = useTrackEvent()
  return useCallback(() => {
    track('page_view', { page_name: pageName, ...extraParams })
  }, [track, pageName, extraParams])
}

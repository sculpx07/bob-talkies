const UTM_FIRST_TOUCH_KEY = 'bob_utm_first'
const UTM_LAST_TOUCH_KEY = 'bob_utm_last'

export interface UTMData {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
  fbclid?: string
  referrer?: string
  landing_page?: string
  ref?: string
  captured_at: string
}

export function captureUTM(): UTMData | null {
  const params = new URLSearchParams(window.location.search)
  const hasUTM = params.has('utm_source') || params.has('gclid') || params.has('fbclid') || params.has('ref')
  if (!hasUTM) return null

  const data: UTMData = {
    utm_source: params.get('utm_source') ?? undefined,
    utm_medium: params.get('utm_medium') ?? undefined,
    utm_campaign: params.get('utm_campaign') ?? undefined,
    utm_term: params.get('utm_term') ?? undefined,
    utm_content: params.get('utm_content') ?? undefined,
    gclid: params.get('gclid') ?? undefined,
    fbclid: params.get('fbclid') ?? undefined,
    referrer: document.referrer || undefined,
    landing_page: window.location.pathname,
    ref: params.get('ref') ?? undefined,
    captured_at: new Date().toISOString(),
  }
  return data
}

export function storeUTM(data: UTMData): void {
  try {
    if (!localStorage.getItem(UTM_FIRST_TOUCH_KEY)) {
      localStorage.setItem(UTM_FIRST_TOUCH_KEY, JSON.stringify(data))
    }
    localStorage.setItem(UTM_LAST_TOUCH_KEY, JSON.stringify(data))
  } catch {
    // ignore storage errors
  }
}

export function getFirstTouchUTM(): UTMData | null {
  try {
    const v = localStorage.getItem(UTM_FIRST_TOUCH_KEY)
    return v ? (JSON.parse(v) as UTMData) : null
  } catch {
    return null
  }
}

export function getLastTouchUTM(): UTMData | null {
  try {
    const v = localStorage.getItem(UTM_LAST_TOUCH_KEY)
    return v ? (JSON.parse(v) as UTMData) : null
  } catch {
    return null
  }
}

export function initUTMCapture(): void {
  const data = captureUTM()
  if (data) storeUTM(data)
}

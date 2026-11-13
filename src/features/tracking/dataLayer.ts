import { hasConsent } from './consent'
import { getLastTouchUTM } from './utm'

type DataLayerEvent = Record<string, unknown> & { event: string }

declare global {
  interface Window {
    dataLayer: DataLayerEvent[]
  }
}

function ensureDataLayer(): void {
  window.dataLayer = window.dataLayer ?? []
}

export function pushDataLayer(event: DataLayerEvent): void {
  if (!hasConsent()) return
  ensureDataLayer()
  window.dataLayer.push({
    ...getLastTouchUTM(),
    ...event,
  })
}

export function initGTM(gtmId: string): void {
  if (!gtmId || !hasConsent()) return
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
  document.head.appendChild(script)
  pushDataLayer({ event: 'gtm.js', 'gtm.start': new Date().getTime() })
}

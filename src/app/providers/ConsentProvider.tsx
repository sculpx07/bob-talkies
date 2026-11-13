import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getConsent, setConsent, type ConsentState } from '@/features/tracking/consent'
import { initGTM } from '@/features/tracking/dataLayer'
import { config } from '@/lib/config'
import { Button } from '@/components/ui/Button'

interface ConsentContextValue {
  consent: ConsentState
  accept: () => void
  decline: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentState>(getConsent)

  const accept = () => {
    setConsent('accepted')
    setConsentState('accepted')
    initGTM(config.gtmId)
  }

  const decline = () => {
    setConsent('declined')
    setConsentState('declined')
  }

  useEffect(() => {
    if (consent === 'accepted' && config.gtmId) {
      initGTM(config.gtmId)
    }
  }, [consent])

  return (
    <ConsentContext.Provider value={{ consent, accept, decline }}>
      {children}
      {consent === 'pending' && <CookieBanner onAccept={accept} onDecline={decline} />}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be inside ConsentProvider')
  return ctx
}

function CookieBanner({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:max-w-sm z-50 bg-bg-elevated border border-border-subtle rounded-card p-4 shadow-2xl animate-slide-up"
    >
      <p className="text-sm text-text-secondary mb-3 leading-relaxed">
        We use cookies to improve your experience and show personalised content. By accepting, you help us serve you better.
      </p>
      <div className="flex gap-2">
        <Button size="sm" fullWidth onClick={onAccept}>Accept All</Button>
        <Button size="sm" variant="ghost" fullWidth onClick={onDecline}>Decline</Button>
      </div>
    </div>
  )
}

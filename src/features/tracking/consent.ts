const CONSENT_KEY = 'bob_consent'

export type ConsentState = 'pending' | 'accepted' | 'declined'

export function getConsent(): ConsentState {
  try {
    return (localStorage.getItem(CONSENT_KEY) as ConsentState) ?? 'pending'
  } catch {
    return 'pending'
  }
}

export function setConsent(state: 'accepted' | 'declined'): void {
  try {
    localStorage.setItem(CONSENT_KEY, state)
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent('bob:consent', { detail: state }))
}

export function hasConsent(): boolean {
  return getConsent() === 'accepted'
}

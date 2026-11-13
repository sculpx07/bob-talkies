import { MessageCircle } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { config } from '@/lib/config'
import { useTrackEvent } from '@/features/tracking/events'

export function WhatsAppFab() {
  const location = useLocation()
  const trackEvent = useTrackEvent()
  const pageMsg = encodeURIComponent(
    `Hi! I'm on the ${location.pathname === '/' ? 'homepage' : location.pathname} page and would like to know more about BOB Talkies.`,
  )
  const waLink = `https://wa.me/${config.whatsappNumber}?text=${pageMsg}`

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-30 hidden md:flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200 group"
      onClick={() => trackEvent('whatsapp_click', { source: 'fab', page: location.pathname })}
    >
      <MessageCircle size={26} className="text-white" aria-hidden="true" />
      <span className="absolute right-16 bg-bg-elevated border border-border-subtle text-text-primary text-xs px-3 py-1.5 rounded-pill whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        Chat on WhatsApp
      </span>
    </a>
  )
}

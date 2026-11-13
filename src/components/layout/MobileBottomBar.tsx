import { Link, useLocation } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { config } from '@/lib/config'
import { useTrackEvent } from '@/features/tracking/events'
import { cn } from '@/lib/utils/cn'

export function MobileBottomBar() {
  const location = useLocation()
  const trackEvent = useTrackEvent()

  // Hide inside booking wizard
  if (location.pathname.startsWith('/book') && location.pathname !== '/book/success' && location.pathname !== '/book/failed') {
    return null
  }

  const waMsg = encodeURIComponent(`Hi! I saw your website (${location.pathname}) and would like to know more about BOB Talkies.`)
  const waLink = `https://wa.me/${config.whatsappNumber}?text=${waMsg}`

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-bg-elevated/95 backdrop-blur-md border-t border-border-subtle px-4 py-3 safe-area-bottom">
      <div className="flex gap-3 max-w-sm mx-auto">
        <Button asChild fullWidth size="lg">
          <Link to="/book" onClick={() => trackEvent('begin_checkout', { source: 'mobile_bottom_bar' })}>
            Book Now
          </Link>
        </Button>
        <Button
          asChild
          variant="whatsapp"
          fullWidth
          size="lg"
          onClick={() => trackEvent('whatsapp_click', { source: 'mobile_bottom_bar', page: location.pathname })}
        >
          <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
            <MessageCircle size={18} aria-hidden="true" />
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  )
}

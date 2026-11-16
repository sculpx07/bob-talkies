import { Link, useLocation, NavLink } from 'react-router-dom'
import { MessageCircle, Ticket } from 'lucide-react'
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
      <div className="flex gap-2 max-w-sm mx-auto">
        <Button asChild fullWidth size="lg">
          <Link to="/" state={{ highlightPlan: true }} onClick={() => trackEvent('begin_checkout', { source: 'mobile_bottom_bar' })}>
            Book Now
          </Link>
        </Button>
        <NavLink
          to="/my-booking"
          className={({ isActive }) => cn(
            'flex flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-2 text-[10px] font-black transition-colors shrink-0',
            isActive ? 'bg-[#32105f] text-white' : 'bg-[#f6e6ef] text-[#6b2398]'
          )}
          aria-label="My Bookings"
        >
          <Ticket size={16} />
          <span>My Bookings</span>
        </NavLink>
        <Button
          asChild
          variant="whatsapp"
          size="lg"
          className="shrink-0"
          onClick={() => trackEvent('whatsapp_click', { source: 'mobile_bottom_bar', page: location.pathname })}
        >
          <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
            <MessageCircle size={18} aria-hidden="true" />
          </a>
        </Button>
      </div>
    </div>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { Clapperboard } from 'lucide-react'

/**
 * Floating shortcut to /vibe-hall.
 *
 * Right-edge stack, bottom to top (16px gaps): WhatsApp FAB -> this icon -> Scroll-to-Top.
 *  - desktop: WhatsApp occupies 24-80px; this sits at bottom-24 (96px, 56px tall); Scroll-to-Top is above it.
 *  - mobile: WhatsApp FAB is hidden and the bottom bar is ~72px tall; bottom-24 (96px, 48px tall) clears it.
 * No hover label by design.
 */
/** Pages where the icon is not shown (the Vibe Hall page itself, and the booking wizard). */
export function isVibeHallFabHidden(pathname: string) {
  if (pathname === '/vibe-hall') return true
  return pathname.startsWith('/book') && pathname !== '/book/success' && pathname !== '/book/failed'
}

export function VibeHallFab() {
  const { pathname } = useLocation()

  // Already on the page it points to, or inside the booking wizard: stay out of the way.
  if (isVibeHallFabHidden(pathname)) return null

  return (
    <>
      <style>{`
        @keyframes vhFabPulse {
          0%   { box-shadow: 0 6px 20px rgba(50,16,95,.45), 0 0 0 0 rgba(201,162,75,.55); }
          70%  { box-shadow: 0 6px 20px rgba(50,16,95,.45), 0 0 0 16px rgba(201,162,75,0); }
          100% { box-shadow: 0 6px 20px rgba(50,16,95,.45), 0 0 0 0 rgba(201,162,75,0); }
        }
        @keyframes vhFabGlow {
          0%, 100% { opacity: .55; transform: scale(1); }
          50%      { opacity: .95; transform: scale(1.12); }
        }
        .vh-fab { animation: vhFabPulse 2.4s ease-out infinite; }
        .vh-fab-glow { animation: vhFabGlow 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .vh-fab, .vh-fab-glow { animation: none; }
        }
      `}</style>
      <Link
        to="/vibe-hall"
        aria-label="Discover Vibe Hall"
        className="vh-fab fixed bottom-24 right-4 md:right-6 z-30 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full border border-[#C9A24B]/70 bg-gradient-to-br from-[#8b1a3a] to-[#5c1535] text-[#E8CC85] transition-transform duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A24B]"
      >
        <span
          aria-hidden="true"
          className="vh-fab-glow pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(232,204,133,.45)_0%,transparent_70%)]"
        />
        <Clapperboard className="relative h-5 w-5 md:h-6 md:w-6" strokeWidth={1.8} aria-hidden="true" />
      </Link>
    </>
  )
}

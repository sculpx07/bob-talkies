import { OCCASIONS } from '@/content/occasions'
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { config } from '@/lib/config'
import { useSavedPlan } from '@/features/booking/useSavedPlan'
import { OPEN_SAVED_EVENT } from '@/components/layout/SavedDrawer'

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Our Theatres', to: '/theatres' },
  { label: 'Celebrations', to: '/celebrations', hasMega: true },
  { label: 'Personalise', to: '/personalise' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Refund Policy', to: '/refund-policy' },
]

const OCCASION_LINKS = OCCASIONS.map((o) => ({ label: o.label, to: `/celebrations/${o.slug}`, emoji: o.emoji }))

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const megaRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const { plan: savedPlan } = useSavedPlan()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // over the dark hero video (home page, before scrolling) the menu turns white so it stays readable
  const heroDark = location.pathname === '/' && !scrolled
  const navText = heroDark ? 'text-white' : 'text-[#32105f]'
  const navLine = heroDark ? 'after:bg-white' : 'after:bg-[#32105f]'

  useEffect(() => {
    setMobileOpen(false)
    setMegaOpen(false)
  }, [location.pathname])

  // close the Celebrations dropdown when the visitor clicks/taps anywhere outside it, or presses Escape
  useEffect(() => {
    if (!megaOpen) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!megaRef.current?.contains(e.target as Node)) setMegaOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMegaOpen(false) }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [megaOpen])


  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        // pages that open on a dark hero need the light header background from the start so the nav stays readable
        (scrolled || /^\/(celebrations\/.+|personalise)/.test(location.pathname))
          ? 'bg-[#fffaf4]/85 backdrop-blur-md shadow-[0_4px_24px_rgba(50,16,95,0.08)]'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="shrink-0 justify-self-start" aria-label="BOB Talkies home">
            <img src="/logo.png" alt="BOB Talkies" className={cn('h-12 md:h-16 w-auto transition-[filter] duration-300', heroDark && 'brightness-0 invert')} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map((link) =>
              link.hasMega ? (
                <div key={link.label} ref={megaRef} className="relative">
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 text-base font-medium leading-6', navText,
                      'relative after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[2px] after:rounded-full', navLine, 'after:origin-right after:scale-x-0 after:transition-transform after:duration-500 after:ease-in-out hover:after:origin-left hover:after:scale-x-100',
                    )}
                    onClick={() => setMegaOpen(!megaOpen)}
                    aria-expanded={megaOpen}
                    aria-haspopup="true"
                  >
                    {link.label}
                    <ChevronDown size={14} className={cn('transition-transform', megaOpen && 'rotate-180')} />
                  </button>
                  {megaOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] bg-bg-elevated border border-border-subtle rounded-card shadow-2xl p-4 grid grid-flow-col grid-cols-2 grid-rows-9 gap-1">
                      {OCCASION_LINKS.map((o) => (
                        <Link
                          key={o.to}
                          to={o.to}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-gold-400 hover:bg-bg-surface transition-colors"
                        >
                          <span>{o.emoji}</span>
                          <span>{o.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2 text-base font-medium leading-6', navText,
                      'relative after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[2px] after:rounded-full', navLine, 'after:origin-right after:scale-x-0 after:transition-transform after:duration-500 after:ease-in-out hover:after:origin-left hover:after:scale-x-100',
                      isActive && 'after:scale-x-100 after:origin-left',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ),
            )}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-2 md:gap-3 justify-self-end">
            {savedPlan && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event(OPEN_SAVED_EVENT))}
                className={cn('hidden items-center gap-1.5 whitespace-nowrap px-2 py-2 text-base font-medium leading-6 md:flex', navText)}
                aria-label="Open your saved plan"
              >
                Saved
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6b2398] text-[11px] font-bold text-white">1</span>
              </button>
            )}
            {/* Animated Book Now CTA */}
            <Link
              to="/"
              state={{ highlightPlan: true }}
              className="group relative hidden sm:inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-black text-white whitespace-nowrap transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg,#32105f 0%,#5b1fa3 100%)',
                boxShadow: '0 0 0 0 rgba(91,31,163,0.5)',
                animation: 'bob-btn-pulse 2.4s ease-in-out infinite',
              }}
            >
              {/* shimmer sweep on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[130%]"
              />
              <span className="relative">Book Now</span>
              <ArrowRight size={14} className="relative transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <button
              className={cn('lg:hidden p-2 transition-colors', heroDark ? 'text-white' : 'text-[#32105f] hover:text-[#6b2398]')}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-bg-elevated border-t border-border-subtle">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive ? 'text-gold-400 bg-gold-500/10' : 'text-text-secondary hover:text-gold-400',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-border-subtle">
              <Button asChild fullWidth>
                <Link to="/" state={{ highlightPlan: true }}>Book Now </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

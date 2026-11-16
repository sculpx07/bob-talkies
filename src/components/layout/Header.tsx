import { OCCASIONS } from '@/content/occasions'
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, ArrowRight, Ticket } from 'lucide-react'
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
  { label: 'Rewards', to: '/rewards' },
]

const OCCASION_LINKS = OCCASIONS.map((o) => ({ label: o.label, to: `/celebrations/${o.slug}`, emoji: o.emoji }))

function MyBookingsMenu({ savedPlan, navText, heroDark }: { savedPlan: boolean; navText: string; heroDark: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | TouchEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('touchstart', close); document.removeEventListener('keydown', esc) }
  }, [open])

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all',
          heroDark
            ? 'border-white/30 text-white hover:bg-white/10'
            : 'border-[#32105f]/25 text-[#32105f] hover:bg-[#32105f]/5',
          open && (heroDark ? 'bg-white/10' : 'bg-[#32105f]/5'),
        )}
      >
        <Ticket size={14} />
        My Bookings
        {savedPlan && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6b2398] text-[9px] font-black text-white">1</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white shadow-[0_12px_40px_rgba(42,14,79,0.18)] ring-1 ring-[#f0e6cc] overflow-hidden z-50">
          <Link
            to="/my-booking"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-[#2a0e4f] hover:bg-[#f8f0ff] transition-colors"
          >
            <Ticket size={15} className="text-[#6b2398]" />
            <div>
              <p className="font-black text-[#2a0e4f] text-sm">My Bookings</p>
              <p className="text-[10px] text-[#5b4578]/60 font-normal">View history &amp; details</p>
            </div>
          </Link>
          <div className="h-px bg-[#f0e6cc]" />
          <button
            type="button"
            onClick={() => { window.dispatchEvent(new Event(OPEN_SAVED_EVENT)); setOpen(false) }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-sm text-[#2a0e4f] hover:bg-[#f8f0ff] transition-colors"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6b2398] text-[9px] font-black text-white shrink-0">
              {savedPlan ? '1' : '0'}
            </span>
            <div className="text-left">
              <p className="font-black text-[#2a0e4f] text-sm">Saved Plan</p>
              <p className="text-[10px] text-[#5b4578]/60 font-normal">{savedPlan ? 'Resume your booking' : 'No saved plan yet'}</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

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
  const heroDark = false // the hero no longer has a dark video behind the menu
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
          <div className="flex items-center gap-2 justify-self-end">
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
              <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[130%]" />
              <span className="relative">Book Now</span>
              <ArrowRight size={14} className="relative transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* My Bookings + Saved mini-dropdown */}
            <MyBookingsMenu savedPlan={!!savedPlan} navText={navText} heroDark={heroDark} />
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
            <NavLink
              to="/my-booking"
              className={({ isActive }) =>
                cn('px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-2',
                  isActive ? 'text-gold-400 bg-gold-500/10' : 'text-text-secondary hover:text-gold-400')
              }
            >
              <Ticket size={14} /> My Bookings
            </NavLink>
            <div className="pt-3 border-t border-border-subtle">
              <Button asChild fullWidth>
                <Link to="/" state={{ highlightPlan: true }}>Book Now</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

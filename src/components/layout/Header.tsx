import { OCCASIONS } from '@/content/occasions'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown, ArrowRight, Ticket, Bookmark } from 'lucide-react'
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
  { label: 'Gallery', to: '/gallery' },
]

const OCCASION_LINKS = OCCASIONS.map((o) => ({ label: o.label, to: `/celebrations/${o.slug}`, emoji: o.emoji }))

function MyBookingsLink({ navText, heroDark }: { navText: string; heroDark: boolean }) {
  return (
    <Link
      to="/my-booking"
      className={cn(
        'hidden sm:flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all',
        heroDark
          ? 'border-white/30 text-white hover:bg-white/10'
          : 'border-[#5c1535]/25 text-[#5c1535] hover:bg-[#5c1535]/5',
      )}
    >
      <Ticket size={14} />
      My Bookings
    </Link>
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
  const heroDark = true // whole site is dark purple, nav is always white
  const navText = 'text-white'
  const navLine = 'after:bg-white'

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
          ? 'bg-[#1a0438]/90 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.5)]'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="shrink-0 justify-self-start" aria-label="BOB Talkies home">
            <img src="/logo 2.png" alt="BOB Talkies" className="h-16 md:h-19 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map((link) =>
              link.hasMega ? (
                <div key={link.label} ref={megaRef} className="relative">
                  <button
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-2 text-sm font-medium leading-6', navText,
                      'relative after:absolute after:left-2.5 after:right-2.5 after:bottom-0 after:h-[2px] after:rounded-full', navLine, 'after:origin-right after:scale-x-0 after:transition-transform after:duration-500 after:ease-in-out hover:after:origin-left hover:after:scale-x-100',
                    )}
                    onClick={() => setMegaOpen(!megaOpen)}
                    aria-expanded={megaOpen}
                    aria-haspopup="true"
                  >
                    {link.label}
                    <ChevronDown size={14} className={cn('transition-transform', megaOpen && 'rotate-180')} />
                  </button>
                  <AnimatePresence>
                    {megaOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-1/2 top-full z-50 mt-2 w-[400px] -translate-x-1/2 origin-top overflow-hidden rounded-2xl bg-white shadow-[0_26px_60px_rgba(50,16,95,0.22)] ring-1 ring-[#f8dce4]"
                      >
                        <div className="flex items-center justify-between border-b border-[#f3e8f8] px-4 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9933a]">Celebrations</p>
                          <Link to="/celebrations" className="text-xs font-semibold text-[#8b1a3a] hover:underline">View all</Link>
                        </div>
                        <div className="grid grid-cols-2 gap-0.5 p-2">
                          {OCCASION_LINKS.map((o) => (
                            <Link
                              key={o.to}
                              to={o.to}
                              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] font-medium text-[#3b2a55] transition-colors hover:bg-[#fce8f0] hover:text-[#3d0a24]"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#fce8f0] text-sm transition-transform duration-200 group-hover:scale-110 group-hover:bg-white">{o.emoji}</span>
                              <span className="truncate">{o.label}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      'px-2.5 py-2 text-sm font-medium leading-6', navText,
                      'relative after:absolute after:left-2.5 after:right-2.5 after:bottom-0 after:h-[2px] after:rounded-full', navLine, 'after:origin-right after:scale-x-0 after:transition-transform after:duration-500 after:ease-in-out hover:after:origin-left hover:after:scale-x-100',
                      isActive && 'after:scale-x-100 after:origin-left',
                      isActive && heroDark && '!text-[#f5d7a1] after:!bg-[#f5d7a1]',
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
              className="group relative hidden sm:inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-sm font-black whitespace-nowrap transition-all duration-300 hover:scale-105 text-[#2a0e4f]"
              style={{
                background: 'linear-gradient(135deg,#f5d7a1 0%,#e0a94a 55%,#c9933a 100%)',
                boxShadow: '0 0 0 0 rgba(91,31,163,0.5)',
                animation: 'bob-btn-pulse 2.4s ease-in-out infinite',
              }}
            >
              <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/20 transition-all duration-700 group-hover:left-[130%]" />
              <span className="relative">Book Now</span>
              <ArrowRight size={14} className="relative transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            {/* My Bookings direct link */}
            <MyBookingsLink navText={navText} heroDark={heroDark} />

            {/* Saved plan quick-open — last */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_SAVED_EVENT))}
              aria-label="Open saved plan"
              title={savedPlan ? 'You have a saved plan' : 'No saved plan yet'}
              className={cn(
                'hidden sm:flex items-center justify-center rounded-full w-9 h-9 transition-all duration-200 ring-1',
                savedPlan
                  ? 'bg-[#c9a84c]/20 text-[#c9933a] ring-[#c9a84c]/60 hover:bg-[#c9a84c]/35'
                  : heroDark
                    ? 'bg-white/10 text-white ring-white/30 hover:bg-white/20'
                    : 'bg-[#5c1535]/8 text-[#5c1535] ring-[#5c1535]/20 hover:bg-[#5c1535]/12',
              )}
            >
              <Bookmark size={17} strokeWidth={2.2} fill={savedPlan ? '#c9a84c' : 'none'} />
            </button>

            <button
              className={cn('lg:hidden p-2 transition-colors', heroDark ? 'text-white' : 'text-[#5c1535] hover:text-[#8b1a3a]')}
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

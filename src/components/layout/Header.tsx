import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Phone, ChevronDown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { config } from '@/lib/config'

const NAV_LINKS = [
  { label: 'Our Theatres', to: '/theatres' },
  { label: 'Celebrations', to: '/celebrations', hasMega: true },
  { label: 'Packages', to: '/packages' },
  { label: 'Offers', to: '/offers' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Locations', to: '/locations' },
]

const OCCASION_LINKS = [
  { label: 'Birthday', to: '/celebrations/birthday', emoji: '🎂' },
  { label: 'Anniversary', to: '/celebrations/anniversary', emoji: '💑' },
  { label: 'Date Night', to: '/celebrations/date-night', emoji: '🌹' },
  { label: 'Proposal', to: '/celebrations/proposal', emoji: '💍' },
  { label: 'Bride To Be', to: '/celebrations/bride-to-be', emoji: '👰' },
  { label: 'Baby Shower', to: '/celebrations/baby-shower', emoji: '🍼' },
  { label: 'Family', to: '/celebrations/family', emoji: '👨‍👩‍👧‍👦' },
  { label: 'Friends', to: '/celebrations/friends', emoji: '🥳' },
  { label: 'Sports Screening', to: '/celebrations/sports-screening', emoji: '⚽' },
  { label: 'Corporate', to: '/celebrations/corporate', emoji: '💼' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMegaOpen(false)
  }, [location.pathname])

  const isHero = location.pathname === '/'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled || !isHero
          ? 'bg-[#fffaf4]/85 backdrop-blur-md shadow-[0_4px_24px_rgba(50,16,95,0.08)]'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="shrink-0 justify-self-start" aria-label="BOB Talkies home">
            <img src="/logo.png" alt="BOB Talkies" className="h-12 md:h-16 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-2" aria-label="Main navigation">
            {NAV_LINKS.map((link) =>
              link.hasMega ? (
                <div key={link.label} className="relative">
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 text-base font-medium leading-6 text-[#32105f]',
                      'relative after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[#32105f] after:origin-right after:scale-x-0 after:transition-transform after:duration-500 after:ease-in-out hover:after:origin-left hover:after:scale-x-100',
                    )}
                    onClick={() => setMegaOpen(!megaOpen)}
                    aria-expanded={megaOpen}
                    aria-haspopup="true"
                  >
                    {link.label}
                    <ChevronDown size={14} className={cn('transition-transform', megaOpen && 'rotate-180')} />
                  </button>
                  {megaOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] bg-bg-elevated border border-border-subtle rounded-card shadow-2xl p-4 grid grid-cols-2 gap-1">
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
                      'px-3 py-2 text-base font-medium leading-6 text-[#32105f]',
                      'relative after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[#32105f] after:origin-right after:scale-x-0 after:transition-transform after:duration-500 after:ease-in-out hover:after:origin-left hover:after:scale-x-100',
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
            <a
              href={`tel:+${config.whatsappNumber}`}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 leading-6 text-[#32105f] text-base font-medium"
              aria-label="Call us"
            >
              <Phone size={15} />
              <span>Call</span>
            </a>
            <Button
              asChild
              size="md"
              className="hidden sm:inline-flex !px-6 !bg-none !bg-[#32105f] !text-white hover:!bg-[#32105f] !rounded-full !shadow-none"
            >
              <Link to="/" state={{ highlightPlan: true }}>Book Now <ArrowRight size={14} /></Link>
            </Button>
            <button
              className="lg:hidden p-2 text-[#32105f] hover:text-[#6b2398] transition-colors"
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
                <Link to="/" state={{ highlightPlan: true }}>Book Your Theatre</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

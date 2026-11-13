import { Link } from 'react-router-dom'
import { Camera, PlayCircle, Globe, MessageCircle, Phone, MapPin, Mail } from 'lucide-react'
import { config } from '@/lib/config'

const THEATRE_LINKS = [
  { label: 'The Delight', to: '/theatres/delight' },
  { label: 'Heavens', to: '/theatres/heavens' },
  { label: 'Filmdom', to: '/theatres/filmdom' },
  { label: 'The Cosmos', to: '/theatres/cosmos' },
  { label: 'The Vibe Hall', to: '/theatres/vibe-hall' },
]

const BOOKING_LINKS = [
  { label: 'Book Now', to: '/book' },
  { label: 'Packages & Pricing', to: '/packages' },
  { label: 'Current Offers', to: '/offers' },
  { label: 'My Booking', to: '/my-booking' },
  { label: 'Search Theatres', to: '/search' },
]

const OCCASION_LINKS = [
  { label: 'Birthday', to: '/celebrations/birthday' },
  { label: 'Anniversary', to: '/celebrations/anniversary' },
  { label: 'Proposal', to: '/celebrations/proposal' },
  { label: 'Date Night', to: '/celebrations/date-night' },
  { label: 'Friends', to: '/celebrations/friends' },
]

const SUPPORT_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Blog', to: '/blog' },
  { label: 'Locations', to: '/locations' },
]

const LEGAL_LINKS = [
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Refund Policy', to: '/refund-policy' },
]

export function Footer() {
  const year = new Date().getFullYear()
  const waLink = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Hi! I\'d like to know more about BOB Talkies.')}`
  return (
    <footer className="bg-[#0d0a14] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <img src="/logo.png" alt="BOB Talkies" className="h-14 w-auto" />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-5 max-w-xs">
              Hyderabad's most loved private theatre experience for birthdays, anniversaries, proposals and every celebration worth remembering.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <a href={`tel:+${config.whatsappNumber}`} className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <Phone size={14} /> +91 {config.whatsappNumber.slice(2)}
              </a>
              <a href={waLink} className="flex items-center gap-2 hover:text-gold-400 transition-colors" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={14} /> WhatsApp Us
              </a>
              <div className="flex items-center gap-2">
                <MapPin size={14} /> Kukatpally, Hyderabad
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: <Camera size={18} />, href: '#', label: 'Instagram' },
                { icon: <Globe size={18} />, href: '#', label: 'Facebook' },
                { icon: <PlayCircle size={18} />, href: '#', label: 'YouTube' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white/60 hover:text-gold-400 hover:border-gold-500/40 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Our Theatres</h3>
            <ul className="space-y-2">
              {THEATRE_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/60 hover:text-gold-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Booking */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Booking</h3>
            <ul className="space-y-2">
              {BOOKING_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/60 hover:text-gold-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Occasions */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Celebrations</h3>
            <ul className="space-y-2">
              {OCCASION_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/60 hover:text-gold-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Support</h3>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/60 hover:text-gold-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white">
          <p>© {year} BOB Talkies. All rights reserved. Kukatpally, Hyderabad.</p>
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="text-white/80 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

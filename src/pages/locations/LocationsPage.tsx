import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Seo } from '@/components/seo/Seo'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { Mail, MapPin, Phone, PhoneCall, MessageCircle, Clock, Car, ArrowRight } from 'lucide-react'
import type { SVGProps } from 'react'
import { config } from '@/lib/config'

const LOCATIONS = [
  {
    id: 'loc-kukatpally',
    slug: 'kukatpally',
    name: 'BOB Talkies — Kukatpally',
    address: 'Kukatpally Housing Board Colony, Kukatpally, Hyderabad, Telangana 500072',
    phone: '+91 98765 43210',
    hours: '10:00 AM – 1:30 AM (next day)',
    landmarks: 'Near Kukatpally Bus Stand, 2 min from KPHB Metro Station',
    parking: 'Free parking available',
    theatreCount: 5,
    image: 'https://images.unsplash.com/photo-1555461083-e9a7f92d35e1?w=800',
  },
]

// lucide-react has no brand icons, so Instagram is drawn here in the same outline style
function InstagramIcon({ size = 20, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function YoutubeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/bob_talkies/', Icon: InstagramIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/@Bobtalkies-privatetheatres', Icon: YoutubeIcon },
  { label: 'Facebook', href: 'https://www.facebook.com/people/Bob-Talkies/61563074844760/', Icon: FacebookIcon },
]

const waNumber = config.whatsappNumber

const CONTACT_CARDS = [
  {
    icon: PhoneCall,
    title: `+91 ${waNumber.slice(2)}`,
    text: 'Call us for bookings, offers and any questions about your celebration.',
    cta: 'Call Us Now',
    href: `tel:+${waNumber}`,
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Us',
    text: 'Chat with our team for quick answers and instant help with your booking.',
    cta: 'Chat Now',
    href: `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I'd like to know more about BOB Talkies.")}`,
    external: true,
  },
  {
    icon: Mail,
    title: 'info@bobtalkies.com',
    text: 'Write to us for enquiries, group bookings and special celebration requests.',
    cta: 'Send Email Now',
    href: 'mailto:info@bobtalkies.com',
  },
  {
    icon: InstagramIcon,
    title: 'bob_talkies',
    text: 'See our latest celebrations, decor ideas and special offers on Instagram.',
    cta: 'Follow Us',
    href: 'https://www.instagram.com/bob_talkies/',
    external: true,
  },
]

const EASE = [0.22, 1, 0.36, 1] as const
const VIEW = { once: true, margin: '0px 0px -80px 0px' }

export default function LocationsPage() {
  return (
    <>
      <Seo
        title="Our Locations | BOB Talkies Hyderabad"
        description="Find BOB Talkies private theatre locations in Hyderabad. Currently located in Kukatpally."
        canonical="/locations"
      />
      <PageShell>
        <motion.div
          initial={{ opacity: 0, y: 50, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: EASE }}
        >
        <SectionHeader
          title="Find Us in Hyderabad"
          titleClassName="text-4xl md:text-6xl font-semibold"
          subtitle={'Visit us for a world-class private theatre experience \nCurrently open in Kukatpally'}
          centered
          className="mb-6 md:mb-6"
        />
        </motion.div>

        {/* Social links */}
        <div className="mb-12 flex justify-center gap-3 md:mb-16">
          {SOCIALS.map(({ label, href, Icon }, i) => (
            <motion.a
              key={label}
              initial={{ opacity: 0, scale: 0, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.5 + i * 0.12 }}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#6b2398]/60 bg-transparent text-[#6b2398] hover:border-[#6b2398] hover:bg-[#6b2398] hover:text-white"
            >
              <Icon size={20} />
            </motion.a>
          ))}
        </div>


        {/* Quick contact cards */}
        <ul className="mx-auto mb-16 grid max-w-6xl gap-5 sm:grid-cols-2 lg:mb-24 lg:grid-cols-4">
          {CONTACT_CARDS.map((c, idx) => {
            const Icon = c.icon
            const inner = (
              <>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f6e6ef] text-[#6b2398]">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 text-lg font-semibold uppercase tracking-wide break-words text-[#2a0e4f]">{c.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5b4578]">{c.text}</p>
                <span className="mt-auto inline-flex items-center gap-3 pt-5 text-sm font-semibold text-[#6b2398]">
                  {c.cta}
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </>
            )
            const cls =
              'group flex h-full flex-col rounded-3xl border border-[#ecd9ec] bg-white/80 p-6 shadow-[0_8px_24px_rgba(107,35,152,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(107,35,152,0.16)]'
            return (
              <motion.li
                key={c.title}
                initial={{ opacity: 0, y: 70, rotateX: -18, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                viewport={VIEW}
                transition={{ duration: 0.8, delay: idx * 0.12, ease: EASE }}
                style={{ transformPerspective: 1000 }}
              >
                <a href={c.href} className={cls} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{inner}</a>
              </motion.li>
            )
          })}
        </ul>

        {LOCATIONS.map((loc) => {
          const details = [
            { icon: MapPin, label: 'Address', value: loc.address },
            { icon: Clock, label: 'Opening Hours', value: loc.hours },
            { icon: Car, label: 'Parking & Landmarks', value: `${loc.parking} · ${loc.landmarks}` },
            { icon: Phone, label: 'Phone', value: loc.phone, href: `tel:${loc.phone}` },
          ]
          return (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 90, scale: 0.95, clipPath: 'inset(0 0 40% 0 round 2rem)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, clipPath: 'inset(0 0 0% 0 round 2rem)' }}
              viewport={{ once: true, margin: '0px 0px -120px 0px' }}
              transition={{ duration: 1, ease: EASE }}
              className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-[#ecd9ec] bg-white/85 shadow-[0_20px_50px_rgba(107,35,152,0.14)] backdrop-blur lg:grid-cols-2"
            >
              {/* Details */}
              <div className="flex flex-col p-7 md:p-10">
                <motion.h2
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={VIEW}
                  transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
                  className="font-display text-3xl font-bold leading-tight text-[#2a0e4f] md:text-4xl"
                >
                  {loc.name}
                </motion.h2>

                <ul className="mt-7 space-y-5">
                  {details.map((d, di) => {
                    const Icon = d.icon
                    return (
                      <motion.li
                        key={d.label}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={VIEW}
                        transition={{ duration: 0.7, delay: 0.4 + di * 0.13, ease: EASE }}
                        className="flex items-start gap-4"
                      >
                        <motion.span
                          initial={{ scale: 0, rotate: -45 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={VIEW}
                          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.5 + di * 0.13 }}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f6e6ef] text-[#6b2398]"
                        >
                          <Icon size={20} />
                        </motion.span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7d7094]">{d.label}</p>
                          {d.href ? (
                            <a href={d.href} className="mt-0.5 block text-[15px] font-medium text-[#2a0e4f] hover:underline">{d.value}</a>
                          ) : (
                            <p className="mt-0.5 text-[15px] font-medium leading-snug text-[#2a0e4f]">{d.value}</p>
                          )}
                        </div>
                      </motion.li>
                    )
                  })}
                </ul>

                <motion.div
                  className="mt-9"
                  initial={{ opacity: 0, y: 24, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={VIEW}
                  transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 1 }}
                >
                  <Link
                    to="/"
                    state={{ highlightPlan: true }}
                    className="inline-flex items-center justify-center rounded-full bg-[#32105f] px-6 py-2.5 text-sm font-medium text-white"
                  >
                    Book a Theatre
                  </Link>
                </motion.div>
              </div>

              {/* Map (fills the right half of the same box) */}
              <motion.div
                className="relative min-h-[360px] overflow-hidden lg:min-h-full"
                initial={{ opacity: 0, scale: 1.25 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={VIEW}
                transition={{ duration: 1.3, delay: 0.3, ease: EASE }}
              >
                <iframe
                  title={`${loc.name} on Google Maps`}
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.3984429088714!2d78.3820234!3d17.4884833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93000b9e61ab%3A0xdafc03a11081cfa!2sBob%20Talkies%20(Private%20Theatres)!5e0!3m2!1sen!2sin!4v1794570532227!5m2!1sen!2sin"
                  className="absolute inset-0 h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </motion.div>
            </motion.div>
          )
        })}
      </PageShell>
    </>
  )
}

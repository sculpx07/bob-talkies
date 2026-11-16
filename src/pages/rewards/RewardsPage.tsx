import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { PageShell } from '@/components/layout/PageShell'
import { ArrowRight, Gift, Users, Cake, RotateCcw, Zap, Calendar } from 'lucide-react'

const PERKS = [
  {
    icon: Gift,
    title: 'Earn BOB Points',
    desc: 'Earn reward points on eligible bookings and redeem them for benefits.',
    accent: '#c9a84c',
    glow: 'rgba(201,168,76,0.18)',
    badge: 'Points',
  },
  {
    icon: Users,
    title: 'Refer & Earn',
    desc: 'Refer friends and receive BOB credits when they complete eligible bookings.',
    accent: '#7c3aed',
    glow: 'rgba(124,58,237,0.15)',
    badge: 'Credits',
  },
  {
    icon: Cake,
    title: 'Birthday Specials',
    desc: 'Exclusive birthday-month offers and surprises just for you.',
    accent: '#e879a0',
    glow: 'rgba(232,121,160,0.15)',
    badge: 'Birthday',
  },
  {
    icon: RotateCcw,
    title: 'Repeat Guest Offers',
    desc: 'Special rewards and upgrades for returning customers who love BOB Talkies.',
    accent: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    badge: 'Loyalty',
  },
  {
    icon: Zap,
    title: 'Early Access',
    desc: 'Priority access to new experiences, seasonal themes and special events.',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
    badge: 'Priority',
  },
  {
    icon: Calendar,
    title: 'Weekday Deals',
    desc: 'Exclusive savings on eligible weekday bookings — more value, less wait.',
    accent: '#38bdf8',
    glow: 'rgba(56,189,248,0.15)',
    badge: 'Savings',
  },
]

function PerkCard({ perk, index }: { perk: typeof PERKS[number]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const Icon = perk.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col rounded-3xl overflow-hidden bg-white border border-[#f0e6cc]"
      style={{ boxShadow: `0 4px 24px ${perk.glow}` }}
    >
      {/* glow blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{ background: perk.glow }}
      />

      <div className="flex flex-col flex-1 p-7 gap-5 relative">
        {/* badge */}
        <div className="flex items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: perk.accent + '18' }}
          >
            <Icon size={22} style={{ color: perk.accent }} />
          </div>
          <span
            className="text-[9px] font-black uppercase tracking-widest rounded-full px-3 py-1"
            style={{ background: perk.accent + '18', color: perk.accent }}
          >{perk.badge}</span>
        </div>

        {/* text */}
        <div className="flex-1">
          <h3 className="font-black text-[#1a0840] text-lg mb-2">{perk.title}</h3>
          <p className="text-[#5b4578]/70 text-sm leading-relaxed">{perk.desc}</p>
        </div>

        {/* animated underline */}
        <div
          className="h-[2px] rounded-full transition-all duration-300 w-0 group-hover:w-full"
          style={{ background: `linear-gradient(90deg,${perk.accent},${perk.accent}44)` }}
        />
      </div>

      {/* accent stripe */}
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${perk.accent},${perk.accent}22)` }} />
    </motion.div>
  )
}

export default function RewardsPage() {
  const heroRef = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <>
      <Seo
        title="BOB Rewards — Earn Points, Perks & More | BOB Talkies"
        description="Join the BOB Rewards programme. Earn points on bookings, refer friends for credits, enjoy birthday specials and exclusive early access."
        canonical="/rewards"
      />
      <PageShell>
        {/* ── Hero ── */}
        <section ref={heroRef} className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20">
          {/* bg blobs */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full blur-3xl" style={{ background: 'rgba(201,168,76,0.12)' }} />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full blur-3xl" style={{ background: 'rgba(124,58,237,0.1)' }} />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 md:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 px-4 py-1.5 mb-6"
            >
              <Gift size={13} className="text-[#c9a84c]" />
              <span className="text-xs font-black uppercase tracking-widest text-[#c9933a]">BOB Rewards Programme</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-black text-[#2a0e4f] leading-tight mb-5"
            >
              Book More.{' '}
              <span style={{
                backgroundImage: 'linear-gradient(90deg,#c9a84c,#eed98a 50%,#c9a84c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Earn More.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.14, duration: 0.38 }}
              className="text-[#5b4578] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
            >
              Every booking gets you closer to something special. Discover all the ways BOB Talkies rewards your loyalty.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.35 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/book"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-black text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#32105f,#5b1fa3)', boxShadow: '0 8px 24px rgba(50,16,95,0.35)' }}
              >
                Book & Start Earning <ArrowRight size={15} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#2a0e4f] px-7 py-3 text-sm font-black text-[#2a0e4f] hover:bg-[#2a0e4f] hover:text-white transition-all"
              >
                Know More
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Perks grid ── */}
        <section className="pb-20 md:pb-28">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PERKS.map((perk, i) => (
                <PerkCard key={perk.title} perk={perk} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section className="pb-20 md:pb-28">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-3xl px-8 py-12 md:px-16 md:py-16 text-center"
              style={{ background: 'linear-gradient(135deg,#1a0840 0%,#2a0e4f 50%,#1e0a3c 100%)' }}
            >
              {/* glow orbs */}
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-1/4 h-48 w-48 rounded-full blur-3xl" style={{ background: 'rgba(201,168,76,0.12)' }} />
                <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full blur-3xl" style={{ background: 'rgba(124,58,237,0.12)' }} />
              </div>

              <div className="relative">
                <p className="text-[#c9a84c] text-xs font-black uppercase tracking-widest mb-3">Start Today</p>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
                  Your next booking earns your<br className="hidden md:block" /> first BOB Points.
                </h2>
                <p className="text-white/55 text-sm md:text-base mb-8 max-w-lg mx-auto">
                  No sign-up required. Book any experience at BOB Talkies and your rewards start accumulating automatically.
                </p>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-black text-[#2a0e4f] transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)', boxShadow: '0 8px 24px rgba(201,168,76,0.3)' }}
                >
                  Book Now <ArrowRight size={15} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </PageShell>
    </>
  )
}

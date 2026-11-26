import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { PageShell } from '@/components/layout/PageShell'
import { ArrowRight, Gift, Users, Cake, RotateCcw, Zap, Calendar, Star } from 'lucide-react'

const PERKS = [
  { icon: Gift,      title: 'Earn BOB Points',    desc: 'Earn reward points on eligible bookings and redeem them for benefits.', accent: '#c9a84c', badge: 'Points' },
  { icon: Users,     title: 'Refer & Earn',       desc: 'Refer friends and receive BOB credits when they complete eligible bookings.', accent: '#a81a3a', badge: 'Credits' },
  { icon: Cake,      title: 'Birthday Specials',  desc: 'Exclusive birthday-month offers and surprises just for you.', accent: '#e879a0', badge: 'Birthday' },
  { icon: RotateCcw, title: 'Repeat Guest Offers', desc: 'Special rewards and upgrades for returning customers who love BOB Talkies.', accent: '#10b981', badge: 'Loyalty' },
  { icon: Zap,       title: 'Early Access',       desc: 'Priority access to new experiences, seasonal themes and special events.', accent: '#f59e0b', badge: 'Priority' },
  { icon: Calendar,  title: 'Weekday Deals',      desc: 'Exclusive savings on eligible weekday bookings — more value, less wait.', accent: '#0ea5e9', badge: 'Savings' },
]

const EASE = [0.22, 1, 0.36, 1] as const

export default function RewardsPage() {
  return (
    <>
      <Seo
        title="BOB Rewards — Earn Points, Perks & More | BOB Talkies"
        description="Join the BOB Rewards programme. Earn points on bookings, refer friends for credits, enjoy birthday specials and exclusive early access."
        canonical="/rewards"
      />
      <PageShell className="!pt-0 md:!pt-0">
        {/* ── Hero: text left, floating points card right ── */}
        <section className="relative overflow-hidden pb-14 pt-20 md:pb-20 md:pt-24">
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-[1.1fr_1fr] md:px-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 ring-1 ring-[#f5d5e0] backdrop-blur"
              >
                <Gift size={13} className="text-[#c9933a]" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#c9933a]">BOB Rewards Programme</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
                className="mb-5 text-4xl font-black leading-[1.05] text-[#3d0a24] md:text-6xl"
              >
                Book More.{' '}
                <span className="bg-[linear-gradient(90deg,#a81a3a,#d9126a_50%,#c9933a)] bg-clip-text text-transparent">Earn More.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.5 }}
                className="mb-8 max-w-xl text-lg leading-relaxed text-[#5b2535]"
              >
                Every booking gets you closer to something special. Discover all the ways BOB Talkies rewards your loyalty.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.5 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link to="/book" className="group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#5c1535,#8b1a3a)] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(50,16,95,0.3)] transition-transform hover:-translate-y-0.5">
                  Book &amp; Start Earning <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-full bg-white/80 px-7 py-3.5 text-sm font-bold text-[#3d0a24] ring-1 ring-[#d9c4e3] backdrop-blur transition-colors hover:bg-white">
                  Know More
                </Link>
              </motion.div>
            </div>

            {/* floating member card with orbiting chips */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: -3 }} transition={{ delay: 0.2, duration: 0.8, ease: EASE }}
              className="relative mx-auto w-full max-w-sm"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#5c1535_0%,#5a1f9a_60%,#a81a3a_100%)] p-7 text-white shadow-[0_34px_70px_rgba(50,16,95,0.4)]"
              >
                <motion.span
                  className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/3 -skew-x-12 bg-white/10"
                  animate={{ left: ['-50%', '130%'] }} transition={{ duration: 5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                  aria-hidden="true"
                />
                <span className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#f5bd61]/30 blur-2xl" aria-hidden="true" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#f5d7a1]">BOB Points</p>
                    <p className="mt-2 font-display text-6xl font-bold leading-none">1,250</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25"><Star size={22} fill="#f5d7a1" stroke="none" /></span>
                </div>
                <div className="relative mt-8 flex items-center justify-between text-xs text-white/75">
                  <span>BOB Club member</span>
                  <span className="h-8 w-11 rounded-md bg-[linear-gradient(135deg,#f5d7a1,#c9a84c)]" aria-hidden="true" />
                </div>
              </motion.div>

              {[{ t: '+50 pts', c: '-right-4 top-6' }, { t: 'Birthday 🎂', c: '-left-6 top-1/2' }, { t: 'Refer & Earn', c: 'right-2 -bottom-4' }].map((chip, i) => (
                <motion.span
                  key={chip.t}
                  className={`absolute ${chip.c} rounded-full bg-white px-4 py-2 text-xs font-bold text-[#3d0a24] shadow-[0_10px_24px_rgba(107,35,152,0.2)] ring-1 ring-[#f8dce4]`}
                  animate={{ y: [0, -9, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                >
                  {chip.t}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Perks bento ── */}
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PERKS.map((perk, i) => {
                const Icon = perk.icon
                return (
                  <motion.div
                    key={perk.title}
                    initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: (i % 3) * 0.08, duration: 0.55, ease: EASE }}
                    whileHover={{ y: -8 }}
                    className="group relative overflow-hidden rounded-[1.75rem] bg-white/85 p-7 shadow-[0_14px_36px_rgba(107,35,152,0.1)] ring-1 ring-[#f8dce4] backdrop-blur"
                  >
                    <span className="pointer-events-none absolute -right-3 -top-5 font-display text-8xl font-bold leading-none text-[#fce8f0] transition-colors group-hover:text-[#efdcfa]" aria-hidden="true">{i + 1}</span>
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${perk.accent}, ${perk.accent}bb)` }}>
                      <Icon size={24} />
                    </span>
                    <span className="relative mt-5 inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest" style={{ background: perk.accent + '1f', color: perk.accent }}>{perk.badge}</span>
                    <h3 className="relative mt-3 text-lg font-bold text-[#250514]">{perk.title}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-[#5b2535]">{perk.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section className="pb-20 md:pb-28">
          <div className="mx-auto max-w-5xl px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease: EASE }}
              className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(120deg,#6b1535_0%,#8b1a3a_55%,#a81a3a_100%)] px-8 py-12 text-center shadow-[0_26px_60px_rgba(74,26,138,0.35)] md:px-16 md:py-14"
            >
              <motion.span className="pointer-events-none absolute -left-10 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#f5bd61]/25 blur-2xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} aria-hidden="true" />
              <span className="pointer-events-none absolute -bottom-24 right-20 h-64 w-96 rounded-[50%] bg-white/10" aria-hidden="true" />
              <div className="relative">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-[#f5d7a1]">Start Today</p>
                <h2 className="mb-4 text-2xl font-black !text-white md:text-4xl">
                  Your next booking earns your<br className="hidden md:block" /> first BOB Points.
                </h2>
                <p className="mx-auto mb-8 max-w-lg text-sm text-white/80 md:text-base">
                  No sign-up required. Book any experience at BOB Talkies and your rewards start accumulating automatically.
                </p>
                <Link to="/book" className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#3d0a24] shadow-[0_12px_28px_rgba(0,0,0,0.25)] transition-transform hover:scale-105">
                  Book Now <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </PageShell>
    </>
  )
}

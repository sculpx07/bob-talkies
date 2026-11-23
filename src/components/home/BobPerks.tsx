import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Gift, Users, Cake, Heart, Zap, CalendarDays,
  Lock, Clock, CheckCircle, DollarSign, Shield, Headphones,
  ArrowRight, Sparkles,
} from 'lucide-react'

const BENEFITS = [
  { icon: Gift,        color: '#f5d7a1', title: 'Earn BOB Points',    desc: 'Get reward points on every booking.' },
  { icon: Users,       color: '#d8c8ff', title: 'Refer & Earn',       desc: 'Earn credits when friends book.' },
  { icon: Cake,        color: '#ffc2d1', title: 'Birthday Specials',  desc: 'Exclusive offers in your birth month.' },
  { icon: Heart,       color: '#ffd2a8', title: 'Repeat Guest Perks', desc: 'Upgrades for returning guests.' },
  { icon: Zap,         color: '#b8f0d8', title: 'Early Access',       desc: 'First to know about new experiences.' },
  { icon: CalendarDays,color: '#c6ccff', title: 'Weekday Deals',      desc: 'Exclusive savings weekdays.' },
]

const PROMISES = [
  { icon: Lock,        title: 'Exclusively Yours',    desc: 'Your theatre — no shared screenings.' },
  { icon: Clock,       title: 'Ready Before You',     desc: 'Setup complete before you arrive.' },
  { icon: CheckCircle, title: 'Confirmed Add-Ons',    desc: 'Every add-on confirmed in advance.' },
  { icon: DollarSign,  title: 'Transparent Pricing',  desc: 'No hidden charges, ever.' },
  { icon: Shield,      title: 'Secure Booking',       desc: 'Payments protected end-to-end.' },
  { icon: Headphones,  title: '24/7 Support',         desc: "We're a message away, always." },
]

export function BobPerks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px 18% 0px' })

  return (
    <section ref={ref} className="relative overflow-x-clip pb-16 pt-6 md:pb-24 md:pt-8">
      {/* animated backdrop: slowly rotating dashed rings and drifting colour orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.span
          className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full border-2 border-dashed border-[#d9b8e0]/60"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full border-2 border-dashed border-[#f0d9a8]/70"
          animate={{ rotate: -360 }}
          transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute left-1/3 top-0 h-64 w-64 rounded-full bg-[#d9126a]/15 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-[#f5bd61]/20 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
        />
        {[['12%', '18%', 0], ['88%', '30%', 1.2], ['70%', '85%', 2.4], ['30%', '90%', 0.6]].map(([l, t, d], i) => (
          <motion.span
            key={i}
            className="absolute text-xl text-[#d4a94a]/70"
            style={{ left: l as string, top: t as string }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 3.5, delay: d as number, repeat: Infinity }}
          >
            ✦
          </motion.span>
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mb-0.5 flex items-center justify-center gap-2">
            <Sparkles size={15} className="text-[#d4a94a]" />
            <p className="font-cursive text-xl text-[#c9933a]">The BOB Family</p>
          </div>
          <h2 className="text-2xl font-black text-[#3d0a24] md:text-3xl">Club Benefits &amp; Our Promise</h2>
          <motion.div
            className="mx-auto mt-3 h-[3px] rounded-full bg-[#d4a94a]"
            initial={{ width: 0 }}
            animate={inView ? { width: 40 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </motion.div>

        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          {/* ── The BOB Club: benefits orbiting a join badge ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.08, duration: 0.7 }}
          >
            <p className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-[#c9933a]">
              The BOB Club
            </p>

            {/* desktop: orbit */}
            <div className="relative hidden h-[540px] w-[540px] xl:block">
              <motion.span
                className="absolute inset-[70px] rounded-full border-2 border-dashed border-[#d9b8e0]"
                animate={{ rotate: 360 }}
                transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                aria-hidden="true"
              />
              <motion.span
                className="absolute inset-[120px] rounded-full border border-[#f5d5e0]"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              />

              {/* centre badge */}
              <div className="absolute left-1/2 top-1/2 flex h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[linear-gradient(145deg,#5c1535_0%,#8b1a3a_100%)] p-5 text-center text-white shadow-[0_26px_60px_rgba(50,16,95,0.4)]">
                <motion.span
                  className="absolute inset-0 rounded-full ring-4 ring-[#d9126a]/30"
                  animate={{ scale: [1, 1.14], opacity: [0.7, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
                  aria-hidden="true"
                />
                <p className="relative text-base font-bold leading-tight">Join The BOB Club</p>
                <p className="relative mt-1 text-xs text-white/75">Start earning rewards today</p>
                <Link
                  to="/book"
                  className="group relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#3d0a24] shadow-lg transition-transform hover:scale-105"
                >
                  Join Now <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* orbiting benefit nodes */}
              {BENEFITS.map((b, i) => {
                const Icon = b.icon
                const ang = (-90 + i * 60) * (Math.PI / 180)
                const x = 50 + Math.cos(ang) * 41
                const y = 50 + Math.sin(ang) * 41
                return (
                  <motion.div
                    key={b.title}
                    className="absolute w-[158px]"
                    style={{ left: `${x}%`, top: `${y}%`, x: '-50%', y: '-50%' }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 180, damping: 16 }}
                  >
                    <motion.div
                      animate={{ y: [0, -7, 0] }}
                      transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                      className="rounded-3xl bg-white p-3.5 text-center shadow-[0_14px_34px_rgba(107,35,152,0.14)] ring-1 ring-[#f8dce4]"
                    >
                      <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5c1535,#a81a3a)] shadow-md">
                        <Icon size={19} strokeWidth={1.8} style={{ color: b.color }} />
                      </span>
                      <p className="text-[13px] font-bold leading-tight text-[#3d0a24]">{b.title}</p>
                      <p className="mt-1 text-[11px] leading-snug text-[#7d4555]">{b.desc}</p>
                    </motion.div>
                  </motion.div>
                )
              })}
            </div>

            {/* below xl: plain grid + join card */}
            <div className="xl:hidden">
              <div className="grid grid-cols-2 gap-3">
                {BENEFITS.map(b => {
                  const Icon = b.icon
                  return (
                    <div key={b.title} className="rounded-3xl bg-white p-4 text-center shadow-[0_12px_30px_rgba(107,35,152,0.12)] ring-1 ring-[#f8dce4]">
                      <span className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#5c1535,#a81a3a)]">
                        <Icon size={19} strokeWidth={1.8} style={{ color: b.color }} />
                      </span>
                      <p className="text-[13px] font-bold text-[#3d0a24]">{b.title}</p>
                      <p className="mt-1 text-[11px] leading-snug text-[#7d4555]">{b.desc}</p>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 rounded-3xl bg-[linear-gradient(145deg,#5c1535,#8b1a3a)] p-5 text-white">
                <div>
                  <p className="text-sm font-bold">Join The BOB Club</p>
                  <p className="mt-0.5 text-xs text-white/75">Start earning rewards today</p>
                </div>
                <Link to="/book" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#3d0a24]">
                  Join Now <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ── The BOB Promise: animated vertical timeline ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.12, duration: 0.6 }}
          >
            <p className="mb-7 flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-[#c9933a]">
              The BOB Promise <span className="h-px flex-1 bg-[#e6d4ee]" />
            </p>
            <ul className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
              {PROMISES.map((pr, i) => {
                const Icon = pr.icon
                return (
                  <motion.li
                    key={pr.title}
                    initial={{ opacity: 0, y: 26, scale: 0.9 }}
                    animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ delay: 0.25 + i * 0.1, type: 'spring', stiffness: 150, damping: 16 }}
                    className="group relative flex items-center gap-4"
                  >
                    {/* seal: spinning dashed ring around a gradient disc */}
                    <span className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center">
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-dashed border-[#d4a94a]"
                        animate={{ rotate: i % 2 ? -360 : 360 }}
                        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                        aria-hidden="true"
                      />
                      <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[linear-gradient(145deg,#5c1535,#a81a3a)] shadow-[0_10px_22px_rgba(50,16,95,0.3)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                        <Icon size={23} strokeWidth={1.7} className="text-[#f5d7a1]" />
                      </span>
                    </span>
                    <span className="relative min-w-0">
                      <span className="block text-[11px] font-black tracking-[0.25em] text-[#c9933a]" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                      <span className="relative mt-0.5 block text-[15px] font-bold leading-tight text-[#3d0a24]">{pr.title}</span>
                      <span className="relative mt-1 block text-sm leading-snug text-[#7d4555]">{pr.desc}</span>
                    </span>
                  </motion.li>
                )
              })}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

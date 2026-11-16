import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Gift, Users, Cake, Heart, Zap, CalendarDays,
  Lock, Clock, CheckCircle, DollarSign, Shield, Headphones,
  ArrowRight, Sparkles,
} from 'lucide-react'

const BENEFITS = [
  { icon: Gift,        color: '#c9a84c', bg: 'rgba(201,168,76,0.12)',   title: 'Earn BOB Points',    desc: 'Get reward points on every booking.' },
  { icon: Users,       color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',  title: 'Refer & Earn',       desc: 'Earn credits when friends book.' },
  { icon: Cake,        color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',    title: 'Birthday Specials',  desc: 'Exclusive offers in your birth month.' },
  { icon: Heart,       color: '#fb923c', bg: 'rgba(251,146,60,0.12)',   title: 'Repeat Guest Perks', desc: 'Upgrades for returning guests.' },
  { icon: Zap,         color: '#34d399', bg: 'rgba(52,211,153,0.12)',   title: 'Early Access',       desc: 'First to know about new experiences.' },
  { icon: CalendarDays,color: '#818cf8', bg: 'rgba(129,140,248,0.12)', title: 'Weekday Deals',      desc: 'Exclusive savings weekdays.' },
]

const PROMISES = [
  { icon: Lock,        title: 'Exclusively Yours',    desc: 'Your theatre — no shared screenings.' },
  { icon: Clock,       title: 'Ready Before You',     desc: 'Setup complete before you arrive.' },
  { icon: CheckCircle, title: 'Confirmed Add-Ons',    desc: 'Every add-on confirmed in advance.' },
  { icon: DollarSign,  title: 'Transparent Pricing',  desc: 'No hidden charges, ever.' },
  { icon: Shield,      title: 'Secure Booking',       desc: 'Payments protected end-to-end.' },
  { icon: Headphones,  title: '24/7 Support',         desc: 'We\'re a message away, always.' },
]

export function BobPerks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="py-14 md:py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#2a0e4f 0%,#32105f 55%,#2a0e4f 100%)' }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#c9a84c]/7 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#8e39c7]/10 blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">

        {/* Shared header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <Sparkles size={15} className="text-[#d4a94a]" />
            <p className="font-cursive text-xl text-[#c9933a]">The BOB Family</p>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            Club Benefits &amp; Our Promise
          </h2>
          <motion.div
            className="mx-auto mt-3 h-[3px] rounded-full bg-[#d4a94a]"
            initial={{ width: 0 }}
            animate={inView ? { width: 40 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </motion.div>

        {/* Two-column split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

          {/* ── Left: BOB Club ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.08, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#c9a84c]">The BOB Club</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {BENEFITS.map((b, i) => {
                const Icon = b.icon
                return (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
                    className="rounded-2xl border border-white/10 p-4"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <div
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl mb-2.5"
                      style={{ background: b.bg, border: `1px solid ${b.color}30` }}
                    >
                      <Icon size={17} style={{ color: b.color }} strokeWidth={1.8} />
                    </div>
                    <h3 className="font-bold text-white text-xs mb-1">{b.title}</h3>
                    <p className="text-white/40 text-[11px] leading-relaxed">{b.desc}</p>
                  </motion.div>
                )
              })}
            </div>
            {/* Join CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.42, duration: 0.4 }}
              className="rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
              style={{
                background: 'linear-gradient(135deg,rgba(201,168,76,0.18),rgba(201,168,76,0.06))',
                border: '1px solid rgba(201,168,76,0.3)',
              }}
            >
              <div>
                <p className="text-white font-bold text-sm">Join The BOB Club</p>
                <p className="text-white/45 text-xs mt-0.5">Start earning rewards today</p>
              </div>
              <Link
                to="/book"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black text-[#2a0e4f] transition-all hover:brightness-110 hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
              >
                Join Now <ArrowRight size={11} />
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Right: BOB Promise ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.12, duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-[#c9a84c]">The BOB Promise</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {PROMISES.map((p, i) => {
                const Icon = p.icon
                return (
                  <motion.div
                    key={p.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.14 + i * 0.05, duration: 0.35 }}
                    className="rounded-2xl border border-white/10 p-4"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <div
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl mb-2.5"
                      style={{
                        background: 'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(212,169,74,0.08))',
                        border: '1px solid rgba(201,168,76,0.3)',
                      }}
                    >
                      <Icon size={17} style={{ color: '#c9a84c' }} strokeWidth={1.8} />
                    </div>
                    <h3 className="font-bold text-white text-xs mb-1">{p.title}</h3>
                    <p className="text-white/40 text-[11px] leading-relaxed">{p.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

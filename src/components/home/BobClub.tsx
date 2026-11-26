import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Gift, Users, Cake, Heart, Zap, CalendarDays, ArrowRight, Sparkles } from 'lucide-react'

const BENEFITS = [
  {
    icon: Gift,
    color: '#c9a84c',
    bg: 'rgba(201,168,76,0.12)',
    title: 'Earn BOB Points',
    desc: 'Get reward points on every eligible booking and redeem them for exciting benefits.',
  },
  {
    icon: Users,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
    title: 'Refer & Earn',
    desc: 'Refer your friends and get BOB credits when they make a booking.',
  },
  {
    icon: Cake,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.12)',
    title: 'Birthday Specials',
    desc: 'Enjoy exclusive offers and surprises during your birthday month.',
  },
  {
    icon: Heart,
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.12)',
    title: 'Repeat Guest Offers',
    desc: 'Special rewards and upgrades for our valued returning customers.',
  },
  {
    icon: Zap,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    title: 'Early Access',
    desc: 'Be the first to know about new experiences, seasonal themes and special events.',
  },
  {
    icon: CalendarDays,
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.12)',
    title: 'Weekday Deals',
    desc: 'Enjoy exclusive savings on weekday bookings.',
  },
]

export function BobClub() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px 18% 0px' })

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#3d0a24 0%,#5c1535 55%,#3d0a24 100%)' }}
    >
      {/* Ambient glow — same style as existing dark sections */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#c9a84c]/8 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#c9a84c]/6 blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full bg-[#a81a3a]/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#d4a94a]" />
            <p className="font-cursive text-2xl md:text-3xl text-[#C69A55]">The BOB Club</p>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-2">
            <span className="text-white">Once a BOB Guest, </span>
            <span className="text-[#c9a84c]">Always a BOB Guest.</span>
          </h2>
          <motion.div
            className="mx-auto mt-3 h-[3px] rounded-full bg-[#C69A55]"
            initial={{ width: 0 }}
            animate={inView ? { width: 40 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <p className="mt-3 text-white/55 text-sm max-w-sm mx-auto">
            Join our loyalty programme and make every celebration at BOB Talkies more rewarding.
          </p>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.07 * i, duration: 0.45 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group rounded-2xl border border-white/10 p-5"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div
                  className="inline-flex h-12 w-12 items-center justify-center rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: b.bg, border: `1px solid ${b.color}30` }}
                >
                  <Icon size={22} style={{ color: b.color }} strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-white text-base mb-1.5">{b.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Join banner */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl px-6 py-10 md:px-12 md:py-10"
          style={{
            background: 'linear-gradient(135deg,rgba(201,168,76,0.18) 0%,rgba(201,168,76,0.06) 100%)',
            border: '1px solid rgba(201,168,76,0.3)',
          }}
        >
          <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#c9a84c]/10 blur-2xl translate-x-1/3" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-black text-white mb-2">
                Join The BOB Club Today!
              </h3>
              <div className="flex flex-wrap gap-4">
                {['More Rewards', 'Exclusive Experiences', 'Special Member Offers'].map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 text-xs text-[#c9a84c]/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" /> {tag}
                  </span>
                ))}
              </div>
            </div>
            <Link
              to="/book"
              className="shrink-0 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-black text-[#49283A] transition-all hover:brightness-110 hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
            >
              Join The BOB Club <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

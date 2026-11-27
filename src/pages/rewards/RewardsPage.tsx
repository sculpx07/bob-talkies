import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { PageShell } from '@/components/layout/PageShell'
import { ArrowRight, Gift, Star } from 'lucide-react'
import { useClubBenefits } from '@/features/rewards/benefits'
import { useMyRewards } from '@/features/rewards/api'
import { formatINR } from '@/lib/utils/currency'

// accent per benefit card, in order
const ACCENTS = ['#c9a84c', '#e0457b', '#0ea5e9', '#10b981', '#e879a0', '#f59e0b']

const EASE = [0.22, 1, 0.36, 1] as const

export default function RewardsPage() {
  // everything below comes from Admin → Settings (BOB Points, Regular customers) and the customer's own points
  const { enabled, program, benefits } = useClubBenefits()
  const { data: mine } = useMyRewards()
  const PERKS = benefits.map((b, i) => ({ ...b, desc: b.long, accent: ACCENTS[i % ACCENTS.length] }))
  const perBooking = program?.pointsPerBooking ?? 0
  const chips = program
    ? [
        { t: `+${perBooking} pts`, c: '-right-4 top-6' },
        { t: `Pay up to ${program.maxRedeemPercent}%`, c: '-left-6 top-1/2' },
        { t: 'Refer & Earn', c: 'right-2 -bottom-4' },
      ]
    : []

  return (
    <div
      className="rewards-plum"
      style={{
        // same magenta-plum background as the home page
        backgroundColor: '#430948',
        backgroundImage: [
          'radial-gradient(ellipse 48% 18% at 78% 20%, rgba(150,14,128,0.62), rgba(150,14,128,0) 100%)',
          'radial-gradient(ellipse 42% 20% at 16% 50%, rgba(122,10,112,0.55), rgba(122,10,112,0) 100%)',
          'radial-gradient(ellipse 50% 14% at 68% 84%, rgba(140,12,120,0.55), rgba(140,12,120,0) 100%)',
          'radial-gradient(ellipse 36% 8% at 14% 8%, rgba(96,8,92,0.5), rgba(96,8,92,0) 100%)',
          'linear-gradient(180deg, #2a0430 0%, #430948 100%)',
        ].join(','),
        backgroundSize: '100% 1600px, 100% 1600px, 100% 1600px, 100% 1600px, 100% 600px',
        backgroundRepeat: 'repeat-y, repeat-y, repeat-y, repeat-y, no-repeat',
      }}
    >
      <style>{`
        .rewards-plum .glass-card {
          background: linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(135,0,79,0.30) 45%, rgba(59,0,42,0.42) 100%) !important;
          -webkit-backdrop-filter: blur(14px) saturate(140%); backdrop-filter: blur(14px) saturate(140%);
          border: 1.5px solid rgba(245,199,106,0.62) !important;
          box-shadow: 0 12px 34px rgba(0,0,0,0.4), 0 0 26px rgba(245,199,106,0.22), 0 0 18px rgba(135,0,79,0.35), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 22px rgba(255,255,255,0.05) !important;
          --tw-ring-shadow: 0 0 #0000 !important;
        }
        .rewards-plum .glass-card [class*="text-[#5b2535]"] { color: rgba(255,255,255,0.78) !important; }
      `}</style>
      <Seo
        title="BOB Rewards — Earn Points, Perks & More | BOB Talkies"
        description="BOB Rewards: earn BOB Points on every celebration, refer friends for bonus points, enjoy repeat-guest perks and pay part of your next booking with points."
        canonical="/rewards"
      />
      <PageShell className="!pt-0 md:!pt-0">
        {/* ── Hero: text left, floating points card right ── */}
        <section className="relative overflow-hidden pb-14 pt-20 md:pb-20 md:pt-24">
          {/* unique backdrop: gold loyalty orbits circling the points card; small, centred and masked to nothing at the edges, so nothing is ever cut */}
          <svg
            aria-hidden="true"
            viewBox="0 0 600 600"
            className="pointer-events-none absolute right-[2%] top-1/2 z-0 hidden h-[560px] w-[560px] -translate-y-1/2 md:block lg:right-[5%]"
            style={{ maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 55%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 55%, transparent 100%)' }}
          >
            <g transform="translate(300 300)"><g fill="none" stroke="#F5C76A" strokeWidth="1.2">
              <ellipse rx="280" ry="105" transform="rotate(-20)" strokeOpacity="0.4" />
              <ellipse rx="235" ry="82" transform="rotate(16)" strokeOpacity="0.3" strokeDasharray="3 8" strokeLinecap="round" />
              <ellipse rx="190" ry="60" transform="rotate(-48)" strokeOpacity="0.22" />
            </g></g>
            <g fill="#FFE3A0">
              <circle cx="60" cy="372" r="5" opacity="0.85" />
              <circle cx="536" cy="232" r="4" opacity="0.7" />
              <circle cx="352" cy="62" r="3.5" opacity="0.65" />
              <circle cx="205" cy="548" r="4" opacity="0.6" />
            </g>
          </svg>
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-[1.1fr_1fr] md:px-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="glass-card mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
              >
                <Gift size={13} className="text-[#c9933a]" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#c9933a]">BOB Rewards Programme</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.6, ease: EASE }}
                className="mb-5 text-4xl font-black leading-[1.05] text-white md:text-6xl"
              >
                Book More.{' '}
                <span className="bg-[linear-gradient(90deg,#ff9bb8,#F5C76A_60%,#E8A83E)] bg-clip-text text-transparent">Earn More.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.5 }}
                className="mb-8 max-w-xl text-lg leading-relaxed text-white/85"
              >
                {enabled
                  ? 'Every booking gets you closer to something special. Discover all the ways BOB Talkies rewards your loyalty.'
                  : 'BOB Rewards are coming soon. Until then, enjoy our current offers on every celebration.'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.5 }}
                className="flex flex-wrap items-center gap-4"
              >
                <Link to="/book" className="group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#5c1535,#8b1a3a)] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(50,16,95,0.3)] transition-transform hover:-translate-y-0.5">
                  {enabled ? 'Book & Start Earning' : 'Book Now'} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to={enabled ? '/my-booking' : '/offers'} className="glass-card inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition-colors hover:brightness-125">
                  {enabled ? 'My Points' : 'See Offers'}
                </Link>
              </motion.div>
            </div>

            {/* floating member card with orbiting chips: the signed-in customer's balance, or what a celebration earns */}
            {enabled && program && (
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
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#f5d7a1]">{mine ? 'Your BOB Points' : 'Every celebration earns'}</p>
                    <p className="mt-2 font-display text-6xl font-bold leading-none">{mine ? mine.balance.toLocaleString('en-IN') : `+${perBooking}`}</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25"><Star size={22} fill="#f5d7a1" stroke="none" /></span>
                </div>
                <div className="relative mt-8 flex items-center justify-between text-xs text-white/75">
                  <span>{mine ? `Worth ${formatINR(mine.valuePaise)} · BOB Club member` : `BOB Points · 1 pt = ${formatINR(program.pointValuePaise)}`}</span>
                  <span className="h-8 w-11 rounded-md bg-[linear-gradient(135deg,#f5d7a1,#c9a84c)]" aria-hidden="true" />
                </div>
              </motion.div>

              {chips.map((chip, i) => (
                <motion.span
                  key={chip.t}
                  className={`absolute ${chip.c} rounded-full bg-white px-4 py-2 text-xs font-bold text-[#3d0a24] shadow-[0_10px_24px_rgba(107,35,152,0.2)] ring-1 ring-[#f8dce4]`}
                  animate={{ y: [0, -9, 0] }} transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                >
                  {chip.t}
                </motion.span>
              ))}
            </motion.div>
            )}
          </div>
        </section>

        {/* ── Perks bento (live rules; hidden while BOB Points are off) ── */}
        {PERKS.length > 0 && (
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PERKS.map((perk, i) => {
                const Icon = perk.icon
                return (
                  <motion.div
                    key={perk.key}
                    initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
                    transition={{ delay: (i % 3) * 0.08, duration: 0.55, ease: EASE }}
                    whileHover={{ y: -8 }}
                    className="glass-card group relative overflow-hidden rounded-[1.75rem] p-7"
                  >
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${perk.accent}, ${perk.accent}bb)` }}>
                      <Icon size={24} />
                    </span>
                    <span className="relative mt-5 inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest" style={{ background: perk.accent + '1f', color: perk.accent }}>{perk.badge}</span>
                    <h3 className="relative mt-3 text-lg font-bold text-white">{perk.title}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-[#5b2535]">{perk.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
        )}

        {/* ── CTA banner ── */}
        <section className="pb-20 md:pb-28">
          <div className="mx-auto max-w-5xl px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6, ease: EASE }}
              className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(120deg,#3B002A_0%,#6a0a5e_50%,#87004F_100%)] px-8 py-12 text-center shadow-[0_26px_60px_rgba(0,0,0,0.4)] md:px-16 md:py-14"
            >
              <motion.span className="pointer-events-none absolute -left-10 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#F5C76A]/12 blur-2xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} aria-hidden="true" />
              <span className="pointer-events-none absolute -bottom-24 right-20 h-64 w-96 rounded-[50%] bg-white/5" aria-hidden="true" />
              <div className="relative">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.3em] text-[#f5d7a1]">Start Today</p>
                <h2 className="mb-4 text-2xl font-black !text-white md:text-4xl">
                  {enabled
                    ? <>Your next celebration earns<br className="hidden md:block" /> {perBooking} BOB Points.</>
                    : <>Plan your next<br className="hidden md:block" /> private celebration.</>}
                </h2>
                <p className="mx-auto mb-8 max-w-lg text-sm text-white/80 md:text-base">
                  {enabled
                    ? 'No sign-up needed. Book with your mobile number and the points are added automatically once your celebration is completed.'
                    : 'Pick a theatre, a date and a slot — your private screen is ready when you arrive.'}
                </p>
                <Link to="/book" className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#3d0a24] shadow-[0_12px_28px_rgba(0,0,0,0.25)] transition-transform hover:scale-105">
                  Book Now <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </PageShell>
    </div>
  )
}

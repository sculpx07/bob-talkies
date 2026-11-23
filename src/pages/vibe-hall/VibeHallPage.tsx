import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Clapperboard, Cake, Monitor, ShieldCheck, Sparkles, Users, Volume2 } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { api } from '@/lib/api/client'
import { theatreKeys } from '@/lib/api/queryKeys'
import type { Theatre } from '@/schemas/theatre'

const EASE = [0.22, 1, 0.36, 1] as const
const VIEW = { once: true, margin: '0px 0px -80px 0px' }

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=85',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=85',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=85',
]

/** Package facts as published by BOB Talkies. All prices include taxes. */
const SHARED_INCLUSIONS = [
  { icon: Monitor, text: '180-inch cinematic screen' },
  { icon: Volume2, text: '3000W high-fidelity sound' },
  { icon: Sparkles, text: '4K visuals' },
  { icon: Cake, text: 'Cakes and photography can be added in the next step' },
] as const

const SPEC_TICKER = ['180" Cinematic Screen', '3000W Sound', '4K Visuals', 'Private Hall', 'Up to 40 Guests', 'Celebrations · Groups · Corporate']

function GoldRule() {
  return <span className="block h-px w-16 bg-gradient-to-r from-[#c9933a] to-transparent" aria-hidden="true" />
}

export default function VibeHallPage() {
  const reduce = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['0%', '18%'])
  const imgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.05, 1.18])

  const { data: theatres } = useQuery({ queryKey: theatreKeys.list(), queryFn: () => api.get<Theatre[]>('/theatres') })
  const vibe = theatres?.find((t) => t.slug === 'vibe-hall')
  const imgs = [0, 1, 2].map((i) => vibe?.images?.[i] ?? FALLBACK_IMAGES[i])
  const bookTo = vibe ? `/book?theatre=${vibe.id}` : '/theatres/vibe-hall'

  return (
    <>
      <Seo
        title="Vibe Hall: Private Celebration & Event Venue | BOB Talkies"
        description="Vibe Hall at BOB Talkies, Kukatpally: a private hall with a 180-inch cinematic screen, 3000W sound and 4K visuals for celebrations, group events and corporate gatherings."
        canonical="/vibe-hall"
      />

      <div className="overflow-x-clip pb-16 md:pb-24">
        {/* 1. HERO: cinematic stage */}
        <section ref={heroRef} className="relative mx-3 mt-20 md:mx-6 md:mt-24">
          <div className="relative isolate min-h-[88svh] overflow-hidden rounded-[2rem] bg-[#0d0420] md:rounded-[3rem]">
            <motion.img
              src={imgs[0]} alt="Vibe Hall private cinema hall"
              style={{ y: imgY, scale: imgScale }}
              className="absolute inset-0 -z-20 h-full w-full object-cover"
            />
            <span className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,#0d0420_8%,rgba(13,4,32,.78)_45%,rgba(13,4,32,.25)_100%)]" aria-hidden="true" />
            <span className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#0d0420] to-transparent" aria-hidden="true" />

            {/* projector beam */}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 top-0 -z-10 h-[140%] w-[55%] origin-top-right rotate-[18deg] bg-[linear-gradient(180deg,rgba(245,215,161,.28),transparent_70%)] blur-2xl"
              animate={reduce ? undefined : { opacity: [0.55, 0.9, 0.55] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="relative flex min-h-[88svh] flex-col justify-end px-6 pb-24 pt-32 md:px-16 md:pb-28">
              <motion.p
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}
                className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.35em] text-[#f5d7a1]"
              >
                <Clapperboard size={16} aria-hidden="true" /> BOB Talkies · Kukatpally
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1, ease: EASE }}
                className="mt-5 max-w-4xl font-display text-[2.9rem] font-semibold leading-[1.02] tracking-tight !text-white sm:text-6xl md:text-[5.5rem]"
              >
                Your night.
                <span className="block bg-gradient-to-r from-[#f5d7a1] via-[#e8b95c] to-[#c9933a] bg-clip-text text-transparent">Your hall. The big screen.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
                className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
              >
                Vibe Hall is a private space built around a 180-inch cinematic screen and 3000W sound. Celebrate, gather and present, with the whole hall to yourselves.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
                className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <Link
                  to={bookTo}
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#f5d7a1] to-[#e0a94a] px-8 py-4 text-sm font-black tracking-wide text-[#3d0a24] shadow-[0_18px_50px_rgba(224,169,74,.35)] transition-transform duration-300 hover:-translate-y-1"
                >
                  Book Vibe Hall
                  <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
                </Link>
                <a href="#packages" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10">
                  See packages
                </a>
              </motion.div>
            </div>

            {/* spec ticker */}
            <div className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/10 bg-[#0d0420]/70 py-3.5 backdrop-blur-md" aria-hidden="true">
              <motion.div
                className="flex w-max gap-12 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f5d7a1]/90"
                animate={reduce ? undefined : { x: ['0%', '-50%'] }}
                transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
              >
                {[...SPEC_TICKER, ...SPEC_TICKER, ...SPEC_TICKER, ...SPEC_TICKER].map((t, i) => (
                  <span key={i} className="flex items-center gap-12">{t}<span className="text-[#c9933a]">✦</span></span>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* 2. ABOUT: editorial collage */}
        <section className="mx-auto mt-24 grid max-w-7xl items-center gap-14 px-5 md:mt-36 md:grid-cols-12 md:px-8">
          <div className="md:col-span-5">
            <GoldRule />
            <p className="mt-5 font-cursive text-3xl text-[#c9933a]">The venue</p>
            <h2 className="mt-1 font-display text-4xl font-medium leading-[1.08] text-[#3d0a24] md:text-6xl">
              A private hall with a cinema's heart.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#4a3a66] md:text-lg">
              Vibe Hall is BOB Talkies' private space for celebrations, group events and corporate gatherings. It is yours alone for the whole slot, with a 180-inch screen, 4K visuals and high-fidelity sound for your guests.
            </p>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5">
              {[
                { icon: Users, k: 'Up to 40', v: 'guests' },
                { icon: Monitor, k: '180"', v: 'cinematic screen' },
                { icon: Volume2, k: '3000W', v: 'high-fidelity sound' },
                { icon: Sparkles, k: '4K', v: 'visuals' },
              ].map(({ icon: Icon, k, v }) => (
                <li key={v} className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3d0a24] text-[#f5d7a1]"><Icon size={18} aria-hidden="true" /></span>
                  <span><span className="block font-display text-xl font-semibold leading-none text-[#3d0a24]">{k}</span><span className="text-xs text-[#6b5a86]">{v}</span></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 50, rotate: -2 }} whileInView={{ opacity: 1, y: 0, rotate: -2 }} viewport={VIEW} transition={{ duration: 0.9, ease: EASE }}
              className="relative aspect-[4/3] w-[82%] overflow-hidden rounded-[1.75rem] shadow-[0_30px_70px_rgba(42,14,79,.35)]"
            >
              <img src={imgs[1]} alt="Guests celebrating in a private hall" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-105" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 60, rotate: 3 }} whileInView={{ opacity: 1, y: 0, rotate: 3 }} viewport={VIEW} transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
              className="absolute -bottom-10 right-0 aspect-square w-[46%] overflow-hidden rounded-[1.5rem] border-[6px] border-[#fdf6ff] shadow-[0_24px_60px_rgba(42,14,79,.35)]"
            >
              <img src={imgs[2]} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-110" />
            </motion.div>
          </div>
        </section>

        {/* 3. PACKAGES: two distinct presentations */}
        <section id="packages" className="relative mx-3 mt-32 scroll-mt-24 overflow-hidden rounded-[2rem] bg-[#0d0420] px-5 py-20 md:mx-6 md:mt-48 md:rounded-[3rem] md:px-10 md:py-28">
          <span className="pointer-events-none absolute -left-24 top-10 h-96 w-96 rounded-full bg-[#8b1a3a]/40 blur-[110px]" aria-hidden="true" />
          <span className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#c9933a]/25 blur-[110px]" aria-hidden="true" />

          <div className="relative mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-cursive text-3xl text-[#f5d7a1]">Choose your show</p>
              <h2 className="mt-1 font-display text-4xl font-medium leading-tight !text-white md:text-6xl">Two ways to take the hall</h2>
              <p className="mt-4 text-sm text-white/60 md:text-base">All prices include taxes. Maximum capacity is 40 people in both packages.</p>
            </div>

            <div className="mt-16 grid items-stretch gap-10 lg:grid-cols-2 lg:gap-8">
              {/* 3 HOURS: the admit-one ticket */}
              <motion.article
                initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW} transition={{ duration: 0.9, ease: EASE }}
                whileHover={reduce ? undefined : { y: -8, rotate: -0.6 }}
                className="relative flex flex-col text-[#3d0a24] [filter:drop-shadow(0_30px_50px_rgba(0,0,0,.45))]"
              >
                <div
                  className="relative flex-1 bg-[#fbf1dc] px-7 pb-8 pt-9 md:px-10"
                  style={{
                    WebkitMask: 'radial-gradient(circle 16px at 0 78%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 16px at 100% 78%, #0000 98%, #000) right / 51% 100% no-repeat',
                    mask: 'radial-gradient(circle 16px at 0 78%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 16px at 100% 78%, #0000 98%, #000) right / 51% 100% no-repeat',
                    borderRadius: '1.5rem',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#a9772a]">Admit · 20</p>
                      <h3 className="mt-2 font-display text-3xl font-semibold md:text-4xl">3 Hours</h3>
                    </div>
                    <Clapperboard size={34} className="text-[#a9772a]/70" aria-hidden="true" />
                  </div>

                  <div className="mt-6 flex items-end gap-3">
                    <p className="font-display text-6xl font-semibold leading-none tracking-tight md:text-7xl">₹7,999</p>
                    <p className="pb-2 text-xs font-semibold uppercase tracking-widest text-[#7d6a4c]">incl. taxes</p>
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#5a4630]">20 people included · Maximum capacity 40</p>

                  <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-[#3d0a24] px-5 py-3.5 text-white">
                    <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f5d7a1]">Weekday offer</span>
                    <span className="font-display text-2xl font-semibold">₹6,499</span>
                  </div>

                  <span className="mt-8 block border-t-2 border-dashed border-[#3d0a24]/25" aria-hidden="true" />

                  <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div><dt className="text-[11px] font-bold uppercase tracking-widest text-[#7d6a4c]">Extra person</dt><dd className="mt-0.5 font-display text-2xl font-semibold">₹300</dd></div>
                    <div><dt className="text-[11px] font-bold uppercase tracking-widest text-[#7d6a4c]">Decoration</dt><dd className="mt-0.5 font-display text-2xl font-semibold">₹749</dd></div>
                  </dl>
                </div>
              </motion.article>

              {/* 4 HOURS: the premiere */}
              <motion.article
                initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW} transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
                whileHover={reduce ? undefined : { y: -8 }}
                className="relative rounded-[1.75rem] bg-[linear-gradient(140deg,#e8b95c,#8b1a3a_45%,#e8b95c)] p-px shadow-[0_30px_70px_rgba(201,147,58,.25)]"
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-[1.7rem] bg-[linear-gradient(160deg,#1d0a42,#0d0420_70%)] px-7 pb-8 pt-9 text-white md:px-10">
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#e8b95c]/25 blur-3xl"
                    animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[#f5d7a1]">The Premiere</p>
                      <h3 className="mt-2 font-display text-3xl font-semibold !text-white md:text-4xl">4 Hours</h3>
                    </div>
                    <span className="rounded-full border border-[#e8b95c]/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#f5d7a1]">40 included</span>
                  </div>

                  <div className="relative mt-6 flex items-end gap-3">
                    <p className="bg-gradient-to-r from-[#f5d7a1] via-[#e8b95c] to-[#c9933a] bg-clip-text font-display text-6xl font-semibold leading-none tracking-tight text-transparent md:text-7xl">₹10,999</p>
                    <p className="pb-2 text-xs font-semibold uppercase tracking-widest text-white/50">incl. taxes</p>
                  </div>
                  <p className="relative mt-3 text-sm font-medium text-white/75">40 people included · Maximum capacity 40</p>

                  <span className="relative mt-8 block h-px bg-gradient-to-r from-transparent via-[#e8b95c]/60 to-transparent" aria-hidden="true" />

                  <dl className="relative mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div><dt className="text-[11px] font-bold uppercase tracking-widest text-white/50">Extra person</dt><dd className="mt-0.5 font-display text-2xl font-semibold">₹200</dd></div>
                    <div><dt className="text-[11px] font-bold uppercase tracking-widest text-white/50">Decoration</dt><dd className="mt-0.5 font-display text-2xl font-semibold">₹749</dd></div>
                  </dl>
                </div>
              </motion.article>
            </div>

            {/* shared inclusions */}
            <motion.div
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW} transition={{ duration: 0.9, ease: EASE }}
              className="mt-14 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm md:p-9"
            >
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.35em] text-[#f5d7a1]">In both packages</p>
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {SHARED_INCLUSIONS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm leading-snug text-white/85">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8b95c]/15 text-[#f5d7a1]"><Icon size={17} aria-hidden="true" /></span>
                    <span className="pt-2">{text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 flex items-center justify-center gap-2 border-t border-white/10 pt-6 text-center text-sm text-white/70">
                <ShieldCheck size={16} className="shrink-0 text-[#f5d7a1]" aria-hidden="true" />
                Refund eligible if cancelled 72 hours before the slot time.
              </p>
            </motion.div>

            <div className="mt-12 flex flex-col items-center gap-3">
              <Link
                to={bookTo}
                className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f5d7a1] to-[#e0a94a] px-10 py-4 text-sm font-black tracking-wide text-[#3d0a24] shadow-[0_18px_50px_rgba(224,169,74,.3)] transition-transform duration-300 hover:-translate-y-1"
              >
                Select your slot
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
              </Link>
              <p className="flex items-center gap-2 text-xs text-white/50"><Check size={13} aria-hidden="true" /> Cakes and photography are added in the next step</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

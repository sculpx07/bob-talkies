import { useParams, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Seo } from '@/components/seo/Seo'
import { Accordion } from '@/components/ui/Accordion'
import { TheatreCardSkeleton } from '@/components/ui/Skeleton'
import { formatINR } from '@/lib/utils/currency'
import { api } from '@/lib/api/client'
import { theatreKeys, packageKeys } from '@/lib/api/queryKeys'
import { OCCASIONS, getOccasionBySlug } from '@/content/occasions'
import type { Theatre } from '@/schemas/theatre'
import type { Package } from '@/schemas/package'

const EASE = [0.22, 1, 0.36, 1] as const
const VIEW = { once: true, margin: '0px 0px -80px 0px' }

// SEO slug → occasion slug mapping
const SEO_SLUG_MAP: Record<string, string> = {
  'private-theatre-hyderabad': 'birthday',
  'private-theatre-kukatpally': 'birthday',
  'private-theatre-birthday-hyderabad': 'birthday',
  'private-theatre-for-couples': 'date-night',
  'anniversary-celebration-hyderabad': 'anniversary',
  'date-night-hyderabad': 'date-night',
  'proposal-venue-hyderabad': 'proposal',
  'private-party-hall-hyderabad': 'friends',
  'corporate-event-venue-hyderabad': 'corporate',
}

export default function OccasionPage() {
  const { occasion: rawSlug } = useParams<{ occasion?: string }>()
  const location = useLocation()

  // Resolve slug — could be a celebration slug or an SEO landing slug
  const slug = rawSlug ?? SEO_SLUG_MAP[location.pathname.replace('/', '')] ?? 'birthday'
  const occasion = getOccasionBySlug(slug) ?? OCCASIONS[0]

  const { data: theatres, isLoading: theatresLoading } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })

  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: packageKeys.list(),
    queryFn: () => api.get<Package[]>('/packages'),
  })

  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const recommendedTheatres = theatres?.filter((t) => occasion.recommendedTheatres.includes(t.id)) ?? []

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: occasion.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <>
      <Seo
        title={`${occasion.heading} | BOB Talkies Hyderabad`}
        description={occasion.description}
        canonical={rawSlug ? `/celebrations/${slug}` : location.pathname}
        ogImage={occasion.heroImage}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <div className="pb-24">
        {/* Hero */}
        <section ref={heroRef} className="relative flex min-h-[72vh] items-end overflow-hidden px-4 pb-14 pt-32 md:px-6 md:pb-20">
          <motion.img
            src={occasion.heroImage}
            alt=""
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.2, ease: EASE }}
            style={{ y: imgY }}
            className="absolute inset-0 h-[125%] w-full object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-[#1b0b3a]/95 via-[#1b0b3a]/55 to-[#1b0b3a]/25" />
          <motion.span className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#d946ef]/30 blur-3xl" animate={{ x: [0, -40, 0], y: [0, 30, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} aria-hidden="true" />
          <motion.span className="pointer-events-none absolute -left-16 bottom-10 h-60 w-60 rounded-full bg-[#f5bd61]/25 blur-3xl" animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} aria-hidden="true" />
          <motion.div style={{ y: textY, opacity: textOpacity }} className="relative z-10 mx-auto w-full max-w-6xl text-white">
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 }}
              whileHover={{ rotate: 20, scale: 1.15 }}
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl shadow-lg"
            >
              {occasion.emoji}
            </motion.span>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: EASE }}
              className="font-cursive text-2xl text-[#f5d7a1] md:text-3xl"
            >
              Private Theatre Experience
            </motion.p>
            <h1 className="flex max-w-3xl flex-wrap font-display text-4xl font-semibold leading-[1.1] !text-white md:text-6xl" aria-label={occasion.heading}>
              {occasion.heading.split(' ').map((w, i) => (
                <span key={i} className="mr-[0.25em] overflow-hidden pb-1" aria-hidden="true">
                  <motion.span
                    className="inline-block"
                    initial={{ y: '110%', rotate: 6 }}
                    animate={{ y: 0, rotate: 0 }}
                    transition={{ delay: 0.4 + i * 0.09, duration: 0.8, ease: EASE }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
              className="mt-4 max-w-xl text-base text-white/85 md:text-lg"
            >
              {occasion.subheading}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/" state={{ highlightPlan: true }} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#32105f]">
                Book Now <ArrowRight size={15} />
              </Link>
              <Link to="/theatres" className="inline-flex items-center justify-center rounded-full border border-white/60 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                Explore Theatres
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* About + features */}
        <section className="mx-auto mt-14 grid max-w-6xl items-center gap-8 px-4 md:mt-20 md:grid-cols-2 md:gap-12 md:px-6">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={VIEW} transition={{ duration: 0.9, ease: EASE }}>
            <motion.p initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={VIEW} transition={{ duration: 0.7, ease: EASE }} className="font-cursive text-2xl text-[#6b2398] md:text-3xl">{occasion.label}</motion.p>
            <h2 className="font-display text-3xl font-semibold leading-tight text-[#2a0e4f] md:text-5xl">
              The Perfect {occasion.label} Experience
            </h2>
            <p className="mt-4 leading-relaxed text-[#5b4578]">{occasion.description}</p>
            <ul className="mt-6 space-y-3">
              {occasion.features.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={VIEW}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.6, ease: EASE }}
                  className="flex items-start gap-3 text-sm text-[#2a0e4f] md:text-[15px]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e7f7ee] text-emerald-600">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {f}
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 3 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={VIEW}
            transition={{ duration: 1, ease: EASE }}
          >
            <img
              src={occasion.heroImage}
              alt={`${occasion.label} at BOB Talkies`}
              loading="lazy"
              className="h-72 w-full rounded-[2rem] object-cover shadow-[0_24px_60px_rgba(107,35,152,0.25)] md:h-[26rem]"
            />
          </motion.div>
        </section>

        {/* Recommended theatres */}
        <section className="mx-auto mt-20 max-w-6xl px-4 md:mt-28 md:px-6">
          <div className="mb-8 text-center">
            <motion.p initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={VIEW} transition={{ duration: 0.7, ease: EASE }} className="font-cursive text-2xl text-[#6b2398] md:text-3xl">Recommended</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={VIEW} transition={{ duration: 0.8, ease: EASE }} className="font-display text-3xl font-semibold text-[#2a0e4f] md:text-5xl">Best Theatres for {occasion.label}</motion.h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {theatresLoading
              ? Array.from({ length: 3 }, (_, i) => <TheatreCardSkeleton key={i} />)
              : recommendedTheatres.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={VIEW}
                    transition={{ duration: 0.8, delay: i * 0.12, ease: EASE }}
                    whileHover={{ y: -6 }}
                  >
                    <Link to={`/theatres/${t.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[0_14px_36px_rgba(107,35,152,0.2)]">
                      <img src={t.images[0]} alt={t.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <span className="absolute inset-0 bg-gradient-to-t from-[#1b0b3a]/90 via-[#1b0b3a]/20 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                        <p className="font-display text-2xl font-semibold">{t.name}</p>
                        <p className="line-clamp-1 text-sm text-white/80">{t.tagline}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">{t.capacityMin}–{t.capacityMax} guests</span>
                          <span className="ml-auto rounded-full bg-[#f5d7a1] px-3 py-1 font-bold text-[#4a2a00]">from {formatINR(t.startingPricePaise)}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </section>

        {/* Packages */}
        <section className="mx-auto mt-20 max-w-6xl px-4 md:mt-28 md:px-6">
          <div className="mb-8 text-center">
            <motion.p initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={VIEW} transition={{ duration: 0.7, ease: EASE }} className="font-cursive text-2xl text-[#6b2398] md:text-3xl">Packages</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={VIEW} transition={{ duration: 0.8, ease: EASE }} className="font-display text-3xl font-semibold text-[#2a0e4f] md:text-5xl">Choose Your Package</motion.h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {packagesLoading
              ? Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-64 rounded-3xl" />)
              : packages?.slice(0, 4).map((pkg, i) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 60, scale: 0.94 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={VIEW}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
                    whileHover={{ y: -6 }}
                    className="flex flex-col overflow-hidden rounded-3xl bg-white/90 shadow-[0_12px_32px_rgba(107,35,152,0.14)] ring-1 ring-[#ecd9ec]"
                  >
                    <div className="bg-[linear-gradient(135deg,#32105f,#6b2398_60%,#d946ef)] px-5 py-4 text-white">
                      <p className="font-display text-xl font-semibold">{pkg.name}</p>
                      <p className="text-2xl font-bold">{formatINR(pkg.pricePaise)}</p>
                    </div>
                    <ul className="flex-1 space-y-2 p-5">
                      {pkg.inclusions.slice(0, 4).map((inc) => (
                        <li key={inc} className="flex items-start gap-2 text-[13px] text-[#2a0e4f]">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#e7f7ee] text-emerald-600">
                            <Check size={10} strokeWidth={3} />
                          </span>
                          {inc}
                        </li>
                      ))}
                    </ul>
                    <div className="px-5 pb-5">
                      <Link to="/" state={{ highlightPlan: true }} className="flex items-center justify-center rounded-full bg-[#32105f] px-5 py-2.5 text-sm font-medium text-white">
                        Choose
                      </Link>
                    </div>
                  </motion.div>
                ))}
          </div>
        </section>

        {/* FAQ */}
        {occasion.faqs.length > 0 && (
          <section className="mx-auto mt-20 max-w-3xl px-4 md:mt-28 md:px-6">
            <div className="mb-6 text-center">
              <motion.p initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={VIEW} transition={{ duration: 0.7, ease: EASE }} className="font-cursive text-2xl text-[#6b2398] md:text-3xl">FAQ</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={VIEW} transition={{ duration: 0.8, ease: EASE }} className="font-display text-3xl font-semibold text-[#2a0e4f] md:text-5xl">{occasion.label} FAQs</motion.h2>
            </div>
            <Accordion items={occasion.faqs.map((f, i) => ({ ...f, id: `faq-${i}` }))} />
          </section>
        )}

        {/* Final CTA */}
        <motion.section
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={VIEW}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative mx-4 mt-20 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#32105f,#6b2398_60%,#d946ef)] p-8 text-center text-white shadow-[0_24px_60px_rgba(107,35,152,0.35)] md:mx-auto md:mt-28 md:max-w-4xl md:p-12"
        >
          <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <h2 className="relative font-display text-3xl font-semibold !text-white md:text-4xl">Ready to Plan Your {occasion.label}?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/85">Book your slot online in minutes — no calls needed. Instant confirmation.</p>
          <Link to="/" state={{ highlightPlan: true }} className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#32105f]">
            Book Your Experience <ArrowRight size={15} />
          </Link>
        </motion.section>
      </div>
    </>
  )
}

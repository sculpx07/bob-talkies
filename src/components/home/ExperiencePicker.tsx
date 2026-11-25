import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { getOccasionBySlug } from '@/content/occasions'
import { useOccasionServices } from './OccasionServices'
import { cn } from '@/lib/utils/cn'

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=1000&q=80&auto=format&fit=crop`

/** Experiences offered on the homepage. Each one maps to an existing occasion page (or the celebrations hub). */
const PICKS = [
  { slug: 'birthday', to: '/celebrations/birthday', image: img('1464349153735-7db50ed83c84'), span: 'lg:col-span-5 lg:row-span-2', chips: 4 },
  { slug: 'proposal', to: '/celebrations/proposal', image: img('1515934751635-c81c6bc9a2d8'), span: 'lg:col-span-7', chips: 4 },
  { slug: 'private-screenings', to: '/celebrations/private-screenings', image: img('1517604931442-7e0c8ed2963c'), span: 'lg:col-span-4', chips: 2 },
  { slug: 'grand-gatherings', to: '/celebrations', image: img('1511795409834-ef04bbd61622'), span: 'lg:col-span-3', chips: 0, label: 'Celebrations', blurb: 'Every celebration we host, in one place.', cta: 'See all' },
] as const

type Pick = (typeof PICKS)[number]

function Card({ pick, index }: { pick: Pick; index: number }) {
  const occasion = getOccasionBySlug(pick.slug)
  const { groups } = useOccasionServices(pick.slug)
  if (!occasion) return null
  const label = 'label' in pick ? pick.label : occasion.label
  const blurb = 'blurb' in pick ? pick.blurb : occasion.subheading
  const big = index === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px 15% 0px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={cn('min-h-[280px]', pick.span)}
    >
      <Link
        to={pick.to}
        aria-label={`${label}: ${'cta' in pick ? pick.cta : 'Explore Experience'}`}
        className="group relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-[2rem] bg-[#1b0b3a] p-5 text-white shadow-[0_18px_44px_rgba(50,16,95,0.22)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_rgba(107,35,152,0.38)]"
      >
        <img src={pick.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-[#1b0b3a]/90 via-[#1b0b3a]/25 to-transparent" aria-hidden="true" />

        {/* top row */}
        <div className="relative flex items-start justify-between">
          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold tracking-wider backdrop-blur-md ring-1 ring-white/30">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5c1535] shadow-lg transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110">
            <ArrowUpRight size={18} />
          </span>
        </div>

        {/* glass caption */}
        <div className="relative rounded-2xl bg-white/12 p-4 backdrop-blur-md ring-1 ring-white/25">
          <h3 className={cn('font-display font-semibold leading-tight !text-white', big ? 'text-3xl' : 'text-2xl')}>{label}</h3>
          <p className={cn('mt-1 text-white/85', big ? 'text-base' : 'line-clamp-2 text-sm')}>{blurb}</p>
          {pick.chips > 0 && groups.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {groups.slice(0, pick.chips).map((g) => (
                <span key={g.key} className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold">{g.label}</span>
              ))}
              {groups.length > pick.chips && <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold">+{groups.length - pick.chips}</span>}
            </div>
          )}
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#f5d7a1]">{'cta' in pick ? pick.cta : 'Explore Experience'}</p>
        </div>
      </Link>
    </motion.div>
  )
}

export function ExperiencePicker() {
  return (
    <section className="relative py-16 md:py-24" aria-labelledby="experience-picker-heading">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-2 font-cursive text-2xl text-[#C69A55]">Choose an experience</p>
            <h2 id="experience-picker-heading" className="font-display text-3xl font-medium leading-tight text-[#49283A] md:text-5xl">Not just a theatre, your occasion made special</h2>
          </div>
          <p className="max-w-xs text-[#725968]">Pick what you are celebrating and see the services that go with it.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:auto-rows-[280px] lg:grid-cols-12 lg:gap-5">
          {PICKS.map((p, i) => <Card key={p.slug} pick={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}

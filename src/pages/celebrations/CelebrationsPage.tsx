import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { OCCASIONS } from '@/content/occasions'

const EASE = [0.22, 1, 0.36, 1] as const

export default function CelebrationsPage() {
  return (
    <>
      <Seo
        title="Celebrations — Every Occasion at BOB Talkies"
        description="From birthdays and anniversaries to proposals and baby showers — BOB Talkies has a perfect private theatre experience for every celebration in Hyderabad."
        canonical="/celebrations"
      />
      <div className="relative px-4 pb-24 pt-28 md:px-6 md:pt-36">
        <motion.span className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-[#d946ef]/15 blur-3xl" animate={{ x: [0, -50, 0], y: [0, 40, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} aria-hidden="true" />
        <motion.span className="pointer-events-none absolute left-0 top-[40%] h-64 w-64 rounded-full bg-[#f5bd61]/20 blur-3xl" animate={{ x: [0, 50, 0], y: [0, -40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} aria-hidden="true" />
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: EASE }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="font-cursive text-3xl font-semibold text-[#6b2398] md:text-4xl">Every Occasion</p>
          <h1 className="font-display text-4xl font-semibold text-[#2a0e4f] md:text-6xl">Choose Your Celebration</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#5b4578] md:text-lg">
            From intimate date nights to grand birthday bashes, there is a private theatre experience for every milestone.
          </p>
        </motion.div>

        {/* Occasion tiles */}
        <ul className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-3 md:mt-16 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {OCCASIONS.map((o, i) => (
            <motion.li
              key={o.slug}
              initial={{ opacity: 0, y: 80, scale: 0.88, rotate: i % 2 ? 4 : -4 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              whileHover={{ y: -8, rotate: i % 2 ? -1.5 : 1.5 }}
              viewport={{ once: true, margin: '0px 0px -60px 0px' }}
              transition={{ duration: 0.7, delay: (i % 4) * 0.08, ease: EASE }}
              className={i % 5 === 0 ? 'col-span-2 md:col-span-1 lg:col-span-2' : ''}
            >
              <Link
                to={`/celebrations/${o.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-[0_14px_36px_rgba(107,35,152,0.18)] md:rounded-[2rem] lg:aspect-auto lg:h-[340px]"
              >
                <img
                  src={o.heroImage}
                  alt={`${o.label} celebration at BOB Talkies`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[#1b0b3a]/90 via-[#1b0b3a]/25 to-transparent" />
                <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow-md md:left-4 md:top-4 md:h-11 md:w-11">
                  {o.emoji}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
                  <h2 className="font-display text-xl font-semibold leading-tight !text-white md:text-2xl">{o.label}</h2>
                  <p className="mt-1 line-clamp-2 text-xs text-white/80 md:text-sm">{o.subheading}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors group-hover:bg-white group-hover:text-[#32105f]">
                    Explore <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* Custom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative mx-auto mt-16 max-w-4xl overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#32105f,#6b2398_60%,#d946ef)] p-8 text-center text-white shadow-[0_24px_60px_rgba(107,35,152,0.35)] md:mt-24 md:p-12"
        >
          <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
          <span className="pointer-events-none absolute -bottom-12 left-10 h-40 w-40 rounded-full bg-[#f5bd61]/25 blur-2xl" aria-hidden="true" />
          <p className="relative font-cursive text-2xl text-[#f5d7a1] md:text-3xl">Something else in mind?</p>
          <h2 className="relative mt-1 font-display text-3xl font-semibold !text-white md:text-4xl">Don't See Your Occasion?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-white/85">
            We cater to every celebration you can imagine. Tell us what you have planned and we'll craft it.
          </p>
          <div className="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/" state={{ highlightPlan: true }} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#32105f]">
              Book Now <ArrowRight size={15} />
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              <Check size={15} /> Talk to Us
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}

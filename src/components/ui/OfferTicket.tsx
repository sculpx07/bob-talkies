import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Check, Copy } from 'lucide-react'
import { formatINR } from '@/lib/utils/currency'
import type { Offer } from '@/schemas/offer'

/** Counts from 0 up to `to` once the element scrolls into view. */
function CountUp({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setVal(Math.round(v)) })
    return () => controls.stop()
  }, [inView, to])

  return <span ref={ref}>{prefix}{val}{suffix}</span>
}

/** Modern coupon-style offer card: gradient stub with a counting discount + perforated edge + details. */
export function OfferTicket({ offer, index = 0 }: { offer: Offer; index?: number }) {
  const [copied, setCopied] = useState(false)
  const flat = offer.discountType === 'flat'
  const amount = flat ? Math.round(offer.discountValue / 100) : offer.discountValue

  function copyCode() {
    navigator.clipboard.writeText(offer.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 70, rotateX: -14, scale: 0.94, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.8, delay: (index % 2) * 0.14, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      style={{ transformPerspective: 1200 }}
      className="group relative h-full overflow-hidden rounded-3xl border border-[#ecd9ec] bg-white/85 shadow-[0_14px_40px_rgba(107,35,152,0.12)] backdrop-blur transition-shadow duration-500 hover:shadow-[0_24px_60px_rgba(107,35,152,0.22)]"
    >
      {/* shine sweep on hover */}
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-all duration-1000 group-hover:left-[130%] group-hover:opacity-100" aria-hidden="true" />

      <div className="grid h-full sm:grid-cols-[170px_1fr]">
        {/* stub */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[linear-gradient(145deg,#32105f,#6b2398_55%,#d946ef)] px-4 py-7 text-center text-white">
          <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
          <span className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-[#f5bd61]/25 blur-xl" aria-hidden="true" />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">Save</p>
          <p className="relative mt-1 font-display text-5xl font-bold leading-none tabular-nums">
            <CountUp to={amount} prefix={flat ? '₹' : ''} suffix={flat ? '' : '%'} />
          </p>
          <p className="relative mt-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5d7a1]">Off</p>
        </div>

        {/* perforation notches (desktop: vertical edge, mobile: horizontal edge) */}
        <span className="pointer-events-none absolute left-1/2 top-[calc(50%-0px)] z-10 hidden" aria-hidden="true" />

        {/* details */}
        <div className="relative flex flex-col p-5 sm:border-l sm:border-dashed sm:border-[#e3cbe6] sm:p-6">
          <span className="pointer-events-none absolute -left-3 top-3 hidden h-6 w-6 rounded-full bg-[#fff7f0] ring-1 ring-[#ecd9ec] sm:block" aria-hidden="true" />
          <span className="pointer-events-none absolute -bottom-3 -left-3 hidden h-6 w-6 rounded-full bg-[#fff7f0] ring-1 ring-[#ecd9ec] sm:block" aria-hidden="true" />

          {offer.badge && (
            <span className="mb-2 inline-flex w-fit items-center rounded-full bg-[#f6e6ef] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#6b2398]">
              {offer.badge}
            </span>
          )}
          <h3 className="font-display text-xl font-bold leading-tight text-[#2a0e4f]">{offer.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[#5b4578]">{offer.description}</p>

          <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-dashed border-[#d9b8e0] bg-[#fdf6ff] px-3.5 py-2.5">
            <span className="font-mono text-base font-bold tracking-[0.18em] text-[#32105f]">{offer.code}</span>
            <button
              type="button"
              onClick={copyCode}
              aria-label={`Copy code ${offer.code}`}
              className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#6b2398] shadow-sm transition-colors hover:bg-[#f6e6ef]"
            >
              {copied ? <><Check size={13} className="text-emerald-600" /> Copied</> : <><Copy size={13} /> Copy</>}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#7d7094]">
              {offer.minOrderPaise ? `Min order ${formatINR(offer.minOrderPaise)} · ` : ''}
              Valid till {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <Link
              to="/"
              state={{ highlightPlan: true }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#32105f] px-5 py-2 text-sm font-medium text-white"
            >
              Book Now <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

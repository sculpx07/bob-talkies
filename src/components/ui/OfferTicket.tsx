import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Check, Copy } from 'lucide-react'
import { formatINR } from '@/lib/utils/currency'
import type { Offer } from '@/schemas/offer'

function CountUp({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setVal(Math.round(v)) })
    return () => controls.stop()
  }, [inView, to])

  return <span ref={ref}>{prefix}{val}{suffix}</span>
}

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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group relative flex h-full overflow-hidden rounded-2xl border border-[#d4a94a]/40 bg-[linear-gradient(135deg,#fffdf7_0%,#fdf5e4_100%)] shadow-[0_6px_24px_rgba(180,130,30,0.10)] hover:border-[#c9a84c]/70 hover:shadow-[0_12px_32px_rgba(180,130,30,0.18)] transition-all duration-300"
    >
      {/* shine sweep */}
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-all duration-700 group-hover:left-[130%] group-hover:opacity-100" aria-hidden="true" />

      {/* Gold stub */}
      <div className="relative flex w-[82px] shrink-0 flex-col items-center justify-center bg-[linear-gradient(160deg,#7a5a0a,#c9a84c_52%,#eed98a)] px-3 py-6 text-center">
        {/* top notch */}
        <span className="absolute -right-[11px] -top-[11px] h-[22px] w-[22px] rounded-full bg-[#fdf5e4]" aria-hidden="true" />
        {/* bottom notch */}
        <span className="absolute -right-[11px] -bottom-[11px] h-[22px] w-[22px] rounded-full bg-[#fdf5e4]" aria-hidden="true" />

        <p className="text-[8px] font-black uppercase tracking-[0.22em] text-[#3a2800]/65 leading-none">Save</p>
        <p className="mt-1 font-display text-[32px] font-black leading-none text-[#1a1000] tabular-nums">
          <CountUp to={amount} prefix={flat ? '₹' : ''} suffix={flat ? '' : '%'} />
        </p>
        <p className="mt-1 text-[8px] font-black uppercase tracking-[0.22em] text-[#3a2800]/65 leading-none">OFF</p>
      </div>

      {/* Perforated divider */}
      <div className="w-px self-stretch border-l border-dashed border-[#c9a84c]/20 my-4" />

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between px-4 py-4">
        <div>
          {offer.badge && (
            <span className="mb-2 inline-flex items-center rounded-full bg-[#c9a84c]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#8a6200]">
              {offer.badge}
            </span>
          )}
          <h3 className="font-display text-[13px] font-bold text-[#2a0e4f] leading-snug">{offer.title}</h3>
          <p className="mt-1 text-[11px] text-[#5b4578]/70 leading-relaxed line-clamp-2">{offer.description}</p>
        </div>

        <div className="mt-3 space-y-2">
          {/* Code row */}
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#c9a84c]/40 bg-[#c9a84c]/8 px-3 py-1.5">
            <span className="flex-1 font-mono text-[11px] font-bold tracking-[0.18em] text-[#7a5500]">{offer.code}</span>
            <button
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1 text-[10px] font-semibold text-[#9a7020]/70 hover:text-[#7a5500] transition-colors"
              aria-label={`Copy code ${offer.code}`}
            >
              {copied ? <><Check size={10} className="text-emerald-600" />Copied</> : <><Copy size={10} />Copy</>}
            </button>
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[9px] text-[#7d6a90]/60 leading-tight">
              {offer.minOrderPaise ? `Min ${formatINR(offer.minOrderPaise)} · ` : ''}
              Till {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
            <Link
              to="/"
              state={{ highlightPlan: true }}
              className="inline-flex items-center gap-1 rounded-full bg-[#32105f] px-3 py-1 text-[10px] font-bold text-white hover:bg-[#4a1a8a] transition-colors"
            >
              Book Now <ArrowRight size={9} />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

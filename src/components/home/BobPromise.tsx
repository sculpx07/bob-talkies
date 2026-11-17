import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Lock, Clock, CheckCircle, DollarSign, Shield, Headphones } from 'lucide-react'

const PROMISES = [
  {
    icon: Lock,
    title: 'Exclusively Yours',
    desc: 'Your theatre is reserved only for you — no shared screenings, no strangers.',
  },
  {
    icon: Clock,
    title: 'Ready Before You Arrive',
    desc: 'Decorations, setup, and everything in place before you step in.',
  },
  {
    icon: CheckCircle,
    title: 'Confirmed Add-Ons',
    desc: 'Every add-on you choose is confirmed — no last-minute surprises.',
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    desc: 'What you see is what you pay. No hidden charges, ever.',
  },
  {
    icon: Shield,
    title: 'Secure Booking',
    desc: 'Your data and payments are protected with industry-standard security.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Our team is always a message away — before, during, and after your celebration.',
  },
]

export function BobPromise() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px 18% 0px' })

  return (
    <section
      ref={ref}
      className="py-16 md:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="font-cursive text-2xl md:text-3xl text-[#c9933a] mb-1">The BOB Promise</p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#2a0e4f] leading-tight mb-2">
            We Promise You Peace of Mind
          </h2>
          <motion.div
            className="mx-auto mt-3 h-[3px] rounded-full bg-[#d4a94a]"
            initial={{ width: 0 }}
            animate={inView ? { width: 40 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <p className="mt-3 text-[#5b4578] text-sm max-w-sm mx-auto">
            From the moment you book to the last memory you make, every detail is in our hands.
          </p>
        </motion.div>

        {/* Promise cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROMISES.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.07 * i, duration: 0.45 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group flex gap-4 rounded-2xl border border-[#f0e6cc] bg-white/70 p-5 backdrop-blur-sm"
                style={{ boxShadow: '0 2px 12px rgba(42,14,79,0.06)' }}
              >
                <div
                  className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(212,169,74,0.08))',
                    border: '1px solid rgba(201,168,76,0.3)',
                  }}
                >
                  <Icon size={20} style={{ color: '#c9a84c' }} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-bold text-[#2a0e4f] text-base mb-1">{p.title}</h3>
                  <p className="text-[#5b4578] text-sm leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

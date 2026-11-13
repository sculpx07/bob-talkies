import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { useBooking } from '../../state/booking.context'
import { bookingApi } from '../../api'
import { Check, X, Tag, Loader2 } from 'lucide-react'

const SUGGESTED_COUPONS = ['BOB500', 'WEEKDAY200']

export function CouponStep() {
  const { state, dispatch } = useBooking()
  const [code, setCode] = useState(state.couponCode ?? '')
  const [errorMsg, setErrorMsg] = useState('')
  const [appliedMsg, setAppliedMsg] = useState('')

  const { mutate: validate, isPending } = useMutation({
    mutationFn: (c: string) => bookingApi.validateCoupon(c, state.theatreId ?? undefined),
    onSuccess: (data, c) => {
      dispatch({ type: 'SET_COUPON', couponCode: c })
      const disc =
        data.offer.discountType === 'flat'
          ? `₹${data.offer.discountValue / 100} off`
          : `${data.offer.discountValue}% off`
      setAppliedMsg(`You get ${disc}.`)
      setErrorMsg('')
    },
    onError: (err: Error) => {
      setErrorMsg(err.message)
      setAppliedMsg('')
    },
  })

  function handleApply() {
    if (!code.trim()) return
    setErrorMsg('')
    setAppliedMsg('')
    validate(code.trim().toUpperCase())
  }

  function handleRemove() {
    setCode('')
    setAppliedMsg('')
    setErrorMsg('')
    dispatch({ type: 'SET_COUPON', couponCode: null })
  }

  return (
    <div>
      <h2 className="mb-1 font-display text-3xl font-bold text-[#2a0e4f] md:text-4xl">Have a coupon?</h2>
      <p className="mb-7 text-sm text-[#5b4578]">Apply a discount code to save on your booking. You can skip this step.</p>

      <AnimatePresence mode="wait">
        {state.couponCode ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="relative flex items-center gap-4 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#32105f,#6b2398_60%,#d946ef)] p-5 text-white shadow-[0_18px_44px_rgba(107,35,152,0.35)]"
          >
            <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
              <Check size={24} strokeWidth={3} />
            </span>
            <div className="relative min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Coupon applied</p>
              <p className="font-mono text-2xl font-bold tracking-[0.18em]">{state.couponCode}</p>
              {appliedMsg && <p className="text-sm text-[#f5d7a1]">{appliedMsg}</p>}
            </div>
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove coupon"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/30"
            >
              <X size={16} />
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-2 rounded-full border border-dashed border-[#d9b8e0] bg-[#fdf6ff] p-2 pl-5 focus-within:border-[#c026d3]">
              <Tag size={18} className="shrink-0 text-[#8e39c7]" aria-hidden="true" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                aria-label="Coupon code"
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                className="min-w-0 flex-1 bg-transparent font-mono text-lg font-bold tracking-[0.2em] text-[#32105f] outline-none placeholder:text-[#c9b3d3]"
              />
              <button
                type="button"
                onClick={handleApply}
                disabled={!code.trim() || isPending}
                className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#32105f] px-6 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
              </button>
            </div>
            {errorMsg && <p className="mt-2 pl-5 text-sm text-[#c2255c]">{errorMsg}</p>}

            <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#7d7094]">Popular codes</p>
            <div className="flex flex-wrap gap-3">
              {SUGGESTED_COUPONS.map((c, i) => (
                <motion.button
                  key={c}
                  type="button"
                  onClick={() => { setCode(c); validate(c) }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 + i * 0.1 }}
                  whileHover={{ y: -3 }}
                  className="rounded-2xl border border-dashed border-[#d9b8e0] bg-white px-4 py-2.5 font-mono text-sm font-bold tracking-widest text-[#6b2398] shadow-sm"
                >
                  {c}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-8 text-xs text-[#7d7094]">
        Skipping this step? No worries — you can always add a coupon on the next screen before confirming.
      </p>
    </div>
  )
}

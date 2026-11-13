import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useBooking } from '../../state/booking.context'
import { bookingApi } from '../../api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Check, X, Tag } from 'lucide-react'

const SUGGESTED_COUPONS = ['BOB500', 'WEEKDAY200']

export function CouponStep() {
  const { state, dispatch } = useBooking()
  const [code, setCode] = useState(state.couponCode ?? '')
  const [errorMsg, setErrorMsg] = useState('')
  const [appliedMsg, setAppliedMsg] = useState('')

  const { mutate: validate, isPending } = useMutation({
    mutationFn: (c: string) => bookingApi.validateCoupon(c, state.theatreId ?? undefined),
    onSuccess: (data) => {
      dispatch({ type: 'SET_COUPON', couponCode: code })
      const disc =
        data.offer.discountType === 'flat'
          ? `₹${data.offer.discountValue / 100} off`
          : `${data.offer.discountValue}% off`
      setAppliedMsg(`Coupon applied! You get ${disc}.`)
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
      <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-2">
        Have a coupon?
      </h2>
      <p className="text-text-secondary mb-6">
        Apply a discount code to save on your booking. You can skip this step.
      </p>

      <div className="max-w-sm">
        {state.couponCode ? (
          <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-card">
            <Check size={18} className="text-success shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-success">Coupon Applied!</p>
              <p className="text-xs text-text-secondary">{state.couponCode} · {appliedMsg}</p>
            </div>
            <button
              onClick={handleRemove}
              className="text-text-muted hover:text-danger transition-colors"
              aria-label="Remove coupon"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                error={errorMsg}
                leftIcon={<Tag size={15} />}
                aria-label="Coupon code"
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                className="font-mono tracking-widest"
              />
              <Button
                onClick={handleApply}
                loading={isPending}
                disabled={!code.trim()}
                size="md"
                className="shrink-0"
              >
                Apply
              </Button>
            </div>

            {/* Suggested coupons */}
            <div className="mt-4">
              <p className="text-xs text-text-muted mb-2">Popular codes:</p>
              <div className="flex gap-2 flex-wrap">
                {SUGGESTED_COUPONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCode(c); validate(c) }}
                    className="px-3 py-1.5 rounded-pill border border-border-subtle text-xs text-text-secondary hover:border-gold-500/40 hover:text-gold-400 transition-colors font-mono"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-text-muted mt-6">
        Skipping this step? No worries — you can always add a coupon on the next screen before confirming.
      </p>
    </div>
  )
}

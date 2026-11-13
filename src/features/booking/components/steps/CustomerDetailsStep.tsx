import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useBooking } from '../../state/booking.context'
import { CustomerSchema, type Customer } from '@/schemas/customer'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api/client'
import { Phone, MessageSquare, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function CustomerDetailsStep({ onVerified }: { onVerified: () => void }) {
  const { state, dispatch } = useBooking()
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [verified, setVerified] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<Customer>({
    resolver: zodResolver(CustomerSchema),
    defaultValues: {
      name: state.customerName,
      mobile: state.customerMobile,
      email: state.customerEmail,
      consentTnC: state.consentTnC,
      consentWhatsapp: state.consentWhatsapp,
    },
  })

  const { mutate: sendOtp, isPending: sendingOtp } = useMutation({
    mutationFn: (mobile: string) => api.post('/auth/otp/request', { mobile }),
    onSuccess: () => {
      setOtpSent(true)
      setResendCooldown(30)
      const timer = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) { clearInterval(timer); return 0 }
          return c - 1
        })
      }, 1000)
    },
  })

  const { mutate: verifyOtp, isPending: verifyingOtp } = useMutation({
    mutationFn: ({ mobile, otp }: { mobile: string; otp: string }) =>
      api.post('/auth/otp/verify', { mobile, otp }),
    onSuccess: () => {
      setVerified(true)
      setOtpError('')
      const v = getValues()
      dispatch({
        type: 'SET_CUSTOMER',
        name: v.name, mobile: v.mobile, email: v.email ?? '',
        instructions: v.specialInstructions ?? '',
        consentTnC: v.consentTnC, consentWhatsapp: v.consentWhatsapp,
      })
      onVerified()
    },
    onError: (err: Error) => setOtpError(err.message),
  })

  function onSaveAndSendOtp(data: Customer) {
    dispatch({
      type: 'SET_CUSTOMER',
      name: data.name, mobile: data.mobile, email: data.email ?? '',
      instructions: data.specialInstructions ?? '',
      consentTnC: data.consentTnC, consentWhatsapp: data.consentWhatsapp,
    })
    sendOtp(data.mobile)
  }

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-2">Your details</h2>
      <p className="text-text-secondary mb-6">
        Tell us about yourself so we can personalise your experience.
      </p>

      <form onSubmit={handleSubmit(onSaveAndSendOtp)} className="space-y-4 max-w-md">
        <Input
          label="Full Name"
          required
          placeholder="Your name"
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <Input
              label="Mobile Number"
              required
              placeholder="10-digit mobile"
              leftIcon={<Phone size={15} />}
              error={errors.mobile?.message}
              inputMode="numeric"
              maxLength={10}
              {...register('mobile')}
            />
          </div>
          {!verified && (
            <div className="pt-6">
              <Button
                type="submit"
                size="md"
                loading={sendingOtp}
                disabled={otpSent && resendCooldown > 0}
                variant={otpSent ? 'secondary' : 'primary'}
              >
                {otpSent
                  ? resendCooldown > 0
                    ? `Resend (${resendCooldown}s)`
                    : 'Resend OTP'
                  : 'Send OTP'}
              </Button>
            </div>
          )}
        </div>

        <Input
          label="Email (optional)"
          type="email"
          placeholder="your@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Textarea
          label="Special Instructions"
          placeholder="Cake flavour preference, surprise notes, any requests..."
          rows={3}
          {...register('specialInstructions')}
        />

        {/* Consents */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded border-border-subtle bg-bg-surface accent-[var(--gold-500)]"
              {...register('consentTnC')}
            />
            <span className="text-sm text-text-secondary">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-gold-400 hover:underline">Terms & Conditions</a>
              {' '}and{' '}
              <a href="/refund-policy" target="_blank" className="text-gold-400 hover:underline">Refund Policy</a>
              <span className="text-crimson-500 ml-1" aria-hidden="true">*</span>
            </span>
          </label>
          {errors.consentTnC && (
            <p role="alert" className="text-xs text-danger">{errors.consentTnC.message}</p>
          )}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="mt-0.5 w-4 h-4 rounded border-border-subtle bg-bg-surface accent-[var(--gold-500)]"
              {...register('consentWhatsapp')}
            />
            <span className="text-sm text-text-secondary">
              Send my booking confirmation and updates via WhatsApp
            </span>
          </label>
        </div>

        {/* OTP verification */}
        {otpSent && !verified && (
          <div className="mt-4 p-4 bg-bg-elevated border border-border-subtle rounded-card space-y-3">
            <p className="text-sm text-text-secondary">
              <MessageSquare size={14} className="inline mr-1.5" aria-hidden="true" />
              Enter the 6-digit OTP sent to your mobile
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                error={otpError}
                className="font-mono tracking-[0.5rem] text-center text-lg"
              />
              <Button
                type="button"
                size="md"
                loading={verifyingOtp}
                disabled={otp.length < 6}
                onClick={() => verifyOtp({ mobile: getValues('mobile'), otp })}
                className="shrink-0"
              >
                Verify
              </Button>
            </div>
            <p className="text-xs text-text-muted">Use OTP 123456 in test mode</p>
          </div>
        )}

        {verified && (
          <div className="flex items-center gap-2 text-success text-sm mt-2">
            <Check size={16} /> Mobile verified successfully!
          </div>
        )}
      </form>
    </div>
  )
}

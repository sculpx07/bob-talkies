import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useBooking } from '../../state/booking.context'
import { CustomerSchema, type Customer } from '@/schemas/customer'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { motion } from 'framer-motion'
import { api } from '@/lib/api/client'
import { Phone, MessageSquare, Check } from 'lucide-react'

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

  const field = '!rounded-2xl !border-[#ecd9ec] !bg-white !py-3 !text-[#2a0e4f] placeholder:!text-[#b0a0c8] hover:!border-[#c58be6] focus:!border-[#c026d3] focus:!ring-2 focus:!ring-[#c026d3]/25'

  return (
    <div>
      <h2 className="mb-1 font-display text-3xl font-bold text-[#2a0e4f] md:text-4xl">Your details</h2>
      <p className="mb-7 text-sm text-[#5b4578]">Tell us about yourself so we can personalise your experience.</p>

      <form onSubmit={handleSubmit(onSaveAndSendOtp)} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Full Name"
            required
            placeholder="Your name"
            error={errors.name?.message}
            className={field}
            {...register('name')}
          />
          <Input
            label="Email (optional)"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            className={field}
            {...register('email')}
          />
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-1">
            <Input
              label="Mobile Number"
              required
              placeholder="10-digit mobile"
              leftIcon={<Phone size={16} className="text-[#8e39c7]" />}
              error={errors.mobile?.message}
              inputMode="numeric"
              maxLength={10}
              className={field}
              {...register('mobile')}
            />
          </div>
          {!verified && (
            <button
              type="submit"
              disabled={sendingOtp || (otpSent && resendCooldown > 0)}
              className="mt-[26px] flex h-[50px] shrink-0 items-center rounded-full bg-[#32105f] px-6 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {sendingOtp
                ? 'Sending…'
                : otpSent
                  ? resendCooldown > 0
                    ? `Resend (${resendCooldown}s)`
                    : 'Resend OTP'
                  : 'Send OTP'}
            </button>
          )}
        </div>

        <Textarea
          label="Special Instructions"
          placeholder="Cake flavour preference, surprise notes, any requests..."
          rows={3}
          className="!rounded-2xl !border-[#ecd9ec] !bg-white !text-[#2a0e4f] placeholder:!text-[#b0a0c8] hover:!border-[#c58be6] focus:!border-[#c026d3] focus:!ring-2 focus:!ring-[#c026d3]/25"
          {...register('specialInstructions')}
        />

        {/* Consents */}
        <div className="space-y-3 rounded-2xl bg-[#fdf6ff] p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded accent-[#6b2398]"
              {...register('consentTnC')}
            />
            <span className="text-sm text-[#5b4578]">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="font-semibold text-[#6b2398] hover:underline">Terms & Conditions</a>
              {' '}and{' '}
              <a href="/refund-policy" target="_blank" className="font-semibold text-[#6b2398] hover:underline">Refund Policy</a>
              <span className="ml-1 text-[#c2255c]" aria-hidden="true">*</span>
            </span>
          </label>
          {errors.consentTnC && (
            <p role="alert" className="text-xs text-[#c2255c]">{errors.consentTnC.message}</p>
          )}
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="mt-0.5 h-4 w-4 rounded accent-[#6b2398]"
              {...register('consentWhatsapp')}
            />
            <span className="text-sm text-[#5b4578]">Send my booking confirmation and updates via WhatsApp</span>
          </label>
        </div>

        {/* OTP verification */}
        {otpSent && !verified && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="space-y-3 rounded-3xl bg-[linear-gradient(135deg,#32105f,#6b2398_60%,#d946ef)] p-5 text-white shadow-[0_16px_40px_rgba(107,35,152,0.3)]"
          >
            <p className="flex items-center gap-2 text-sm text-white/90">
              <MessageSquare size={16} aria-hidden="true" />
              Enter the 6-digit OTP sent to your mobile
            </p>
            <div className="flex items-center gap-2 rounded-full bg-white p-1.5">
              <input
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                aria-label="OTP"
                className="min-w-0 flex-1 bg-transparent px-4 text-center font-mono text-xl font-bold tracking-[0.5rem] text-[#32105f] outline-none placeholder:text-[#d6c5de]"
              />
              <button
                type="button"
                disabled={otp.length < 6 || verifyingOtp}
                onClick={() => verifyOtp({ mobile: getValues('mobile'), otp })}
                className="h-11 shrink-0 rounded-full bg-[#32105f] px-6 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              >
                {verifyingOtp ? 'Checking…' : 'Verify'}
              </button>
            </div>
            {otpError && <p className="text-sm text-[#ffd1e0]">{otpError}</p>}
            <p className="text-xs text-white/70">Use OTP 123456 in test mode</p>
          </motion.div>
        )}

        {verified && (
          <div className="flex items-center gap-2 rounded-2xl bg-[#e7f7ee] px-4 py-3 text-sm font-semibold text-emerald-700">
            <Check size={16} /> Mobile verified successfully!
          </div>
        )}
      </form>
    </div>
  )
}

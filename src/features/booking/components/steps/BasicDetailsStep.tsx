import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { CalendarDays, Check, Clapperboard, Clock, MapPin, Minus, MessageSquare, Plus } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useBooking } from '../../state/booking.context'
import { useSlots } from '../../hooks/useAvailability'
import { CouponStep } from './CouponStep'
import { PersonalisedMessage } from '../PersonalisedMessage'
import { Input } from '@/components/ui/Input'
import { formatTime } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { useTheatres } from '@/features/catalog/api'
import { useSiteConfig } from '@/features/site/api'
import { formatINR } from '@/lib/utils/currency'
import { useRequestOtp, useVerifyOtp } from '@/features/auth/api'
import { isSignedInAs } from '@/features/auth/session'
import { draftDetails } from '../../draft'

const DetailsSchema = z.object({
  name: z.string().trim().min(2, 'Please enter the booking name'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit WhatsApp number'),
  email: z.string().trim().email('Enter a valid email address'),
  personalMessage: z.string().trim().min(1, 'Please enter your personalised message').max(250, 'Maximum 250 characters'),
  consentTnC: z.boolean().refine((v) => v === true, { message: 'You must accept the Terms & Conditions' }),
})
type DetailsForm = z.infer<typeof DetailsSchema>

const field = '!rounded-2xl !border-[#f5d5e0] !bg-white !py-3 !text-[#3d0a24] placeholder:!text-[#b0a0c8] hover:!border-[#c58be6] focus:!border-[#c0125a] focus:!ring-2 focus:!ring-[#c0125a]/25'

function Counter({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-[#3d0a24]">{label}</p>
      <div className="inline-flex items-center rounded-2xl bg-white ring-1 ring-[#f5d5e0]">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Decrease ${label}`} className="flex h-11 w-11 items-center justify-center rounded-l-2xl text-[#8b1a3a] transition-colors hover:bg-[#f6e6ef] disabled:opacity-30">
          <Minus size={16} />
        </button>
        <span className="w-12 text-center text-base font-bold tabular-nums text-[#3d0a24]" aria-live="polite">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Increase ${label}`} className="flex h-11 w-11 items-center justify-center rounded-r-2xl text-[#8b1a3a] transition-colors hover:bg-[#f6e6ef] disabled:opacity-30">
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

export function BasicDetailsStep({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const { state, dispatch } = useBooking()
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  const { data: theatres = [] } = useTheatres()
  const { data: site } = useSiteConfig()
  const theatre = theatres.find((t) => t.id === state.theatreId)
  const { data: slots = [] } = useSlots(state.theatreId, state.date)
  const slot = slots.find((s) => s.id === state.slotId)
  const capacity = theatre?.capacityMax ?? 40

  // every theatre is listed on the previous page, so a larger group may have picked a smaller room: trim to fit
  useEffect(() => {
    if (!theatre) return
    if (state.guests > theatre.capacityMax) {
      dispatch({ type: 'SET_PEOPLE', guests: theatre.capacityMax })
      if (state.kids > 0) dispatch({ type: 'SET_KIDS', kids: 0 })
    } else if (state.guests + state.kids > theatre.capacityMax) {
      dispatch({ type: 'SET_KIDS', kids: Math.max(0, theatre.capacityMax - state.guests) })
    }
  }, [theatre?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const { register, handleSubmit, getValues, watch, formState: { errors } } = useForm<DetailsForm>({
    resolver: zodResolver(DetailsSchema),
    defaultValues: { name: state.customerName, mobile: state.customerMobile, email: state.customerEmail, personalMessage: state.personalMessage ?? '', consentTnC: state.consentTnC },
  })

  // report what is typed so far, so an unfinished booking is still saved as a lead (see draft.ts)
  useEffect(() => {
    const report = (v: Partial<DetailsForm>) => draftDetails.set({ name: v.name ?? '', mobile: v.mobile ?? '', email: v.email ?? '', personalMessage: v.personalMessage ?? '' })
    report(getValues())
    const sub = watch((v) => report(v))
    return () => sub.unsubscribe()
  }, [watch, getValues])

  const requestOtp = useRequestOtp()
  const verify = useVerifyOtp()
  const sending = requestOtp.isPending
  const verifying = verify.isPending

  const sendOtp = (mobile: string) =>
    requestOtp.mutate(mobile, {
      onSuccess: () => { setOtpSent(true); setOtpError('') },
      onError: (e) => setOtpError(e.message),
    })
  const verifyOtp = ({ mobile, code }: { mobile: string; code: string }) =>
    verify.mutate({ mobile, otp: code }, {
      onSuccess: () => {
        dispatch({ type: 'SET_VERIFIED_MOBILE', mobile: getValues('mobile') })
        onDone()
      },
      // a wrong code clears the box so it can simply be retyped
      onError: (e) => { setOtpError(e.message); setOtp('') },
    })

  // no Verify button: the code is checked as soon as the 6th digit is entered
  useEffect(() => {
    if (otpSent && otp.length === 6 && !verifying) verifyOtp({ mobile: getValues('mobile'), code: otp })
  }, [otp]) // eslint-disable-line react-hooks/exhaustive-deps

  function save(d: DetailsForm) {
    dispatch({
      type: 'SET_CUSTOMER', name: d.name, mobile: d.mobile, email: d.email,
      instructions: state.specialInstructions, consentTnC: d.consentTnC, consentWhatsapp: state.consentWhatsapp,
    })
  }

  // "Next step": a number already verified on this device (with its login saved) goes straight on; others get the OTP first
  function onNext(d: DetailsForm) {
    save(d)
    if (state.verifiedMobile === d.mobile && isSignedInAs(d.mobile)) { onDone(); return }
    sendOtp(d.mobile)
  }

  const prettyDate = state.date ? format(parseISO(state.date), 'MMMM d, yyyy') : '—'

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#8b1a3a] hover:underline">
        ← Back
      </button>

      {/* Overview */}
      <div className="rounded-3xl bg-[#fce8f0] p-5">
        <h2 className="mb-3 font-display text-2xl font-bold text-[#3d0a24]">Overview</h2>
        <ul className="grid gap-2.5 text-[15px] text-[#5c1535] sm:grid-cols-2">
          <li className="flex items-center gap-3"><Clapperboard size={17} className="text-[#a81a3a]" />{theatre ? `${theatre.name} Theatre` : '—'}</li>
          <li className="flex items-center gap-3"><MapPin size={17} className="text-[#a81a3a]" />Kukatpally, Hyderabad</li>
          <li className="flex items-center gap-3"><CalendarDays size={17} className="text-[#a81a3a]" />{prettyDate}</li>
          <li className="flex items-center gap-3"><Clock size={17} className="text-[#a81a3a]" />{slot ? `${formatTime(slot.start)} - ${formatTime(slot.end)}` : '—'}</li>
        </ul>
      </div>

      <h3 className="mb-4 mt-7 font-display text-2xl font-bold text-[#3d0a24]">Booking Details</h3>

      <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
        <Input label="Booking Name" required placeholder="Type here" error={errors.name?.message} className={field} {...register('name')} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Counter label="People (Above 10 yrs)" value={state.guests} min={1} max={Math.max(1, capacity - state.kids)} onChange={(n) => dispatch({ type: 'SET_PEOPLE', guests: n })} />
          <Counter label="Kids (3-10 yrs)" value={state.kids} min={0} max={Math.max(0, capacity - state.guests)} onChange={(n) => dispatch({ type: 'SET_KIDS', kids: n })} />
        </div>
        {theatre && <p className="-mt-2 text-xs text-[#7d4555]">{theatre.name} holds up to {theatre.capacityMax} guests.</p>}

        <Input label="WhatsApp Number" required placeholder="Type here" inputMode="numeric" maxLength={10} error={errors.mobile?.message} className={field} {...register('mobile')} />
        <Input label="Email ID" required type="email" placeholder="Type here" error={errors.email?.message} className={field} {...register('email')} />

        <div>
          <label htmlFor="decoration" className="mb-1.5 block text-sm font-semibold text-[#3d0a24]">
            Do you want decoration (just {site ? formatINR(site.pricing.decorationPricePaise) : '…'})? <span className="text-[#c2255c]">*</span>
          </label>
          <select
            id="decoration"
            value={state.decoration ? 'yes' : 'no'}
            onChange={(e) => dispatch({ type: 'SET_DECORATION', decoration: e.target.value === 'yes' })}
            className="h-12 w-full rounded-2xl border border-[#f5d5e0] bg-white px-4 text-[15px] text-[#3d0a24] outline-none focus:border-[#c0125a] focus:ring-2 focus:ring-[#c0125a]/25"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <PersonalisedMessage registration={register('personalMessage')} value={watch('personalMessage') ?? ''} error={errors.personalMessage?.message} />

        <CouponStep embedded />

        <div className="space-y-2 rounded-2xl bg-[#fdf6ff] p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-[#8b1a3a]" {...register('consentTnC')} />
            <span className="text-sm text-[#5b2535]">
              I agree to the <a href="/terms" target="_blank" className="font-semibold text-[#8b1a3a] hover:underline">Terms & Conditions</a> and <a href="/refund-policy" target="_blank" className="font-semibold text-[#8b1a3a] hover:underline">Refund Policy</a>
              <span className="ml-1 text-[#c2255c]" aria-hidden="true">*</span>
            </span>
          </label>
          {errors.consentTnC && <p role="alert" className="text-xs text-[#c2255c]">{errors.consentTnC.message}</p>}
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={state.consentWhatsapp}
              onChange={(e) => dispatch({ type: 'SET_CUSTOMER', name: state.customerName, mobile: state.customerMobile, email: state.customerEmail, instructions: state.specialInstructions, consentTnC: state.consentTnC, consentWhatsapp: e.target.checked })}
              className="mt-0.5 h-4 w-4 rounded accent-[#8b1a3a]"
            />
            <span className="text-sm text-[#5b2535]">Send my booking confirmation and updates via WhatsApp</span>
          </label>
        </div>

        {otpSent && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-3 rounded-3xl bg-[linear-gradient(135deg,#5c1535,#8b1a3a_60%,#d9126a)] p-5 text-white"
          >
            <p className="flex items-center gap-2 text-sm text-white/90"><MessageSquare size={16} /> Enter the 6-digit OTP sent to your mobile</p>
            <div className="rounded-full bg-white p-1.5">
              <input
                autoFocus
                value={otp} onChange={(e) => { setOtpError(''); setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)) }}
                readOnly={verifying}
                inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="------" aria-label="OTP"
                className="h-11 w-full bg-transparent px-4 text-center font-mono text-xl font-bold tracking-[0.5rem] text-[#5c1535] outline-none placeholder:text-[#d6c5de] read-only:opacity-60"
              />
            </div>
            <p className="text-xs text-white/70" aria-live="polite">
              {verifying ? 'Verifying…' : 'It is verified automatically once you enter all 6 digits. Use OTP 123456 in test mode.'}
            </p>
          </motion.div>
        )}
        {otpError && <p role="alert" className="text-sm text-[#c2255c]">{otpError}</p>}
        {state.verifiedMobile && state.verifiedMobile === getValues('mobile') && (
          <p className="flex items-center gap-2 rounded-2xl bg-emerald-400/20 px-4 py-3 text-sm font-semibold text-emerald-200"><Check size={16} /> Mobile verified</p>
        )}

        <button
          type="submit"
          disabled={sending || otpSent}
          className={cn(
            'h-14 w-full rounded-full text-base font-bold text-white shadow-[0_12px_28px_rgba(50,16,95,0.35)] transition-all',
            'bg-[linear-gradient(135deg,#5c1535,#6b1535)] hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60',
          )}
        >
          {sending ? 'Sending OTP…' : otpSent ? 'Enter the OTP above' : 'Next step'}
        </button>
      </form>
    </div>
  )
}

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Monitor, Users, Clock, Volume2, UtensilsCrossed, MessageCircle, Send } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { PartySelect } from '@/components/ui/PartySelect'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/api/client'
import { theatreKeys } from '@/lib/api/queryKeys'
import type { Theatre } from '@/schemas/theatre'
import { trackEvent } from '@/features/tracking/events'
import { getLastTouchUTM } from '@/features/tracking/utm'
import { config } from '@/lib/config'
import {
  CATERING_OPTIONS, CONFIRM_TEXT, EVENT_TYPES, GROUP_PACKAGES, VIBE_HALL_EXPERIENCES, VIBE_HALL_FACTS,
} from '@/content/vibeHall'

const EASE = [0.22, 1, 0.36, 1] as const
const VIEW = { once: true, margin: '0px 0px -60px 0px' }
const FALLBACK_HERO = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80'

const EnquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter the contact person name'),
  company: z.string().trim().min(2, 'Please enter your company or organisation'),
  email: z.string().trim().email('Enter a valid email address'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  eventType: z.string().min(1, 'Please choose an event type'),
  guests: z.string().regex(/^[1-9]\d{0,3}$/, 'Enter the expected number of guests'),
  date: z.string().optional(),
  requirements: z.string().max(500, 'Maximum 500 characters').optional(),
  consentWhatsapp: z.boolean(),
})
type EnquiryForm = z.infer<typeof EnquirySchema>

function scrollToEnquiry() {
  document.getElementById('enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function VibeHallPage() {
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const { data: theatres } = useQuery({ queryKey: theatreKeys.list(), queryFn: () => api.get<Theatre[]>('/theatres') })
  const vibe = theatres?.find((t) => t.slug === 'vibe-hall')
  const hero = vibe?.images?.[0] ?? FALLBACK_HERO

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EnquiryForm>({
    resolver: zodResolver(EnquirySchema),
    defaultValues: { consentWhatsapp: true, eventType: '' },
  })

  // POST /leads is the only enquiry endpoint, and it has no structured fields for company, event
  // type, guests or date, so these go inside the message text until the backend adds them.
  const { mutate: sendEnquiry, isPending } = useMutation({
    mutationFn: (d: EnquiryForm) => {
      const utm = getLastTouchUTM()
      const message = [
        'Vibe Hall enquiry',
        `Company / Organisation: ${d.company}`,
        `Event type: ${d.eventType}`,
        `Expected guests: ${d.guests}`,
        `Preferred date: ${d.date || 'Not specified'}`,
        `Additional requirements: ${d.requirements?.trim() || 'None'}`,
      ].join('\n')
      return api.post('/leads', {
        name: d.name,
        mobile: d.mobile,
        email: d.email,
        occasion: 'vibe-hall',
        message,
        consentWhatsapp: d.consentWhatsapp,
        source: 'vibe_hall_enquiry',
        utmSource: utm?.utm_source,
        utmMedium: utm?.utm_medium,
        utmCampaign: utm?.utm_campaign,
      })
    },
    onSuccess: () => {
      setSubmitted(true)
      trackEvent('generate_lead', { source: 'vibe_hall_enquiry' })
    },
    onError: () => toast('error', 'Could not send your enquiry', 'Please try again or reach us on WhatsApp.'),
  })

  const waLink = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Hi! I would like to enquire about a corporate / group event at Vibe Hall.')}`
  const facts = [
    { icon: <Users size={20} />, label: 'Guests', value: VIBE_HALL_FACTS.guestRange },
    { icon: <Monitor size={20} />, label: 'Screen & visuals', value: VIBE_HALL_FACTS.spec },
    { icon: <Volume2 size={20} />, label: 'Package', value: `${VIBE_HALL_FACTS.duration}, includes ${VIBE_HALL_FACTS.includedGuests} guests` },
    { icon: <Clock size={20} />, label: 'Seating & other facilities', value: CONFIRM_TEXT, pending: true },
  ]

  return (
    <>
      <Seo
        title="Vibe Hall for Corporate & Group Events | BOB Talkies"
        description="Host corporate presentations, team celebrations, seminars, private screenings and sports events at Vibe Hall, BOB Talkies' largest space in Kukatpally, Hyderabad."
        canonical="/vibe-hall"
      />

      <div className="pb-20">
        {/* 1. Hero */}
        <section className="mx-auto max-w-7xl px-4 pt-24 md:px-6 md:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}
            className="relative overflow-hidden rounded-[2.25rem] bg-[#1b0b3a] text-white shadow-[0_32px_80px_rgba(50,16,95,0.35)]"
          >
            <img src={hero} alt="Vibe Hall" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#1b0b3a] via-[#1b0b3a]/75 to-[#1b0b3a]/25" aria-hidden="true" />
            <motion.span className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[#d946ef]/30 blur-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 9, repeat: Infinity }} aria-hidden="true" />
            <div className="relative px-6 py-16 md:px-14 md:py-28">
              <p className="font-cursive text-2xl text-[#f5d7a1] md:text-3xl">Vibe Hall · Corporate &amp; Group Bookings</p>
              <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-[1.1] !text-white md:text-6xl">Bring Your Team Together at Vibe Hall</h1>
              <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">
                Our largest space for presentations, team celebrations, seminars, private screenings and sports events, with a big screen and cinema sound, private to your group.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={scrollToEnquiry} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#32105f] transition-transform hover:-translate-y-0.5">
                  Enquire Now <ArrowRight size={16} />
                </button>
                <a href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('whatsapp_click', { source: 'vibe_hall_page' })} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                  <MessageCircle size={16} /> WhatsApp us
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2. Experiences */}
        <section className="mx-auto mt-20 max-w-7xl px-4 md:mt-28 md:px-6">
          <div className="mb-10 max-w-2xl">
            <p className="font-cursive text-2xl text-[#c9933a]">Our experiences</p>
            <h2 className="font-display text-3xl font-medium text-[#2a0e4f] md:text-5xl">One hall, many ways to gather</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {VIBE_HALL_EXPERIENCES.map((e, i) => (
              <motion.article
                key={e.id}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={VIEW}
                transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease: EASE }}
                className={`group relative min-h-[300px] overflow-hidden rounded-[1.75rem] shadow-[0_16px_40px_rgba(107,35,152,0.2)] ${i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}`}
              >
                <img src={e.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#1b0b3a]/95 via-[#1b0b3a]/45 to-transparent" aria-hidden="true" />
                <div className="relative flex h-full min-h-[300px] flex-col justify-end p-5 text-white">
                  <span className="mb-2 text-2xl" aria-hidden="true">{e.emoji}</span>
                  <h3 className="font-display text-xl font-semibold !text-white">{e.title}</h3>
                  <p className="mt-1 text-sm text-white/80">{e.text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* 3. Group packages (data-driven: empty until packages are confirmed) */}
        <section className="mx-auto mt-20 max-w-7xl px-4 md:mt-28 md:px-6">
          <div className="mb-8 max-w-2xl">
            <p className="font-cursive text-2xl text-[#c9933a]">Group packages</p>
            <h2 className="font-display text-3xl font-medium text-[#2a0e4f] md:text-5xl">Plans for teams and groups</h2>
          </div>
          {GROUP_PACKAGES.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-3">
              {GROUP_PACKAGES.map((p) => (
                <div key={p.id} className="rounded-[1.75rem] bg-white p-6 shadow-[0_14px_34px_rgba(107,35,152,0.14)] ring-1 ring-[#f0e1f3]">
                  <h3 className="font-display text-xl font-bold text-[#2a0e4f]">{p.name}</h3>
                  <p className="mt-1 text-sm text-[#5b4578]">{p.description}</p>
                  <ul className="mt-4 space-y-2 text-sm text-[#2a0e4f]">
                    {p.inclusions.map((x) => <li key={x} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />{x}</li>)}
                  </ul>
                  <p className="mt-4 font-bold text-[#32105f]">{p.priceLabel ?? CONFIRM_TEXT}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start justify-between gap-4 rounded-[1.75rem] bg-[#f6eefb] p-6 ring-1 ring-[#ecd9ec] md:flex-row md:items-center md:p-8">
              <div>
                <p className="font-display text-xl font-bold text-[#2a0e4f]">Group package details: {CONFIRM_TEXT}</p>
                <p className="mt-1 text-sm text-[#5b4578]">Tell us about your group and we will share the options that fit.</p>
              </div>
              <button type="button" onClick={scrollToEnquiry} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#32105f,#6b2398)] px-7 py-3 text-sm font-bold text-white">
                Ask about group packages <ArrowRight size={15} />
              </button>
            </div>
          )}
        </section>

        {/* 4. Facilities & amenities */}
        <section className="mx-auto mt-20 max-w-7xl px-4 md:mt-28 md:px-6">
          <div className="mb-8 max-w-2xl">
            <p className="font-cursive text-2xl text-[#c9933a]">Facilities &amp; amenities</p>
            <h2 className="font-display text-3xl font-medium text-[#2a0e4f] md:text-5xl">What the hall offers</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-[1.5rem] bg-white p-5 shadow-[0_12px_30px_rgba(107,35,152,0.12)] ring-1 ring-[#f0e1f3]">
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6e6ef] text-[#6b2398]">{f.icon}</span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7d7094]">{f.label}</p>
                <p className={`mt-1 text-[15px] font-semibold ${f.pending ? 'italic text-[#7d7094]' : 'text-[#2a0e4f]'}`}>{f.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] bg-[#fdf6ff] p-5 ring-1 ring-[#ecd9ec]">
            <p className="flex items-center gap-2 font-display text-lg font-bold text-[#2a0e4f]"><UtensilsCrossed size={18} className="text-[#8e39c7]" /> Catering options</p>
            {CATERING_OPTIONS.length > 0 ? (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {CATERING_OPTIONS.map((c) => (
                  <li key={c.id} className="rounded-xl bg-white p-3 text-sm"><strong className="text-[#2a0e4f]">{c.name}</strong><span className="block text-[#5b4578]">{c.description}</span></li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm italic text-[#7d7094]">{CONFIRM_TEXT}</p>
            )}
          </div>
        </section>

        {/* 5. Enquiry form */}
        <section id="enquiry" className="mx-auto mt-20 max-w-5xl scroll-mt-28 px-4 md:mt-28 md:px-6">
          <div className="overflow-hidden rounded-[2.25rem] bg-white shadow-[0_32px_80px_rgba(107,35,152,0.2)] ring-1 ring-[#f0e1f3] lg:grid lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative overflow-hidden bg-[linear-gradient(160deg,#32105f_0%,#5a1f9a_60%,#8e39c7_100%)] p-8 text-white md:p-10">
              <span className="pointer-events-none absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-[#f5bd61]/25 blur-3xl" aria-hidden="true" />
              <p className="relative text-[11px] font-bold uppercase tracking-[0.3em] text-[#f5d7a1]">Enquiry</p>
              <h2 className="relative mt-3 font-display text-3xl font-bold leading-tight !text-white">Plan your event with us</h2>
              <p className="relative mt-3 text-sm leading-relaxed text-white/80">Share a few details and our team will get back to you about your event at Vibe Hall.</p>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold ring-1 ring-white/25 hover:bg-white/25">
                <MessageCircle size={16} /> Prefer WhatsApp?
              </a>
            </div>

            <div className="p-8 md:p-10">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center py-10 text-center" role="status">
                  <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50"><Check size={34} className="text-emerald-600" /></span>
                  <h3 className="font-display text-3xl font-bold text-[#2a0e4f]">Enquiry sent</h3>
                  <p className="mt-2 max-w-sm text-[#5b4578]">Thank you. Our team will contact you about your event. For urgent queries, chat with us on WhatsApp.</p>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit((d) => sendEnquiry(d))} className="space-y-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input label="Contact Person Name" required placeholder="Your name" error={errors.name?.message} {...register('name')} />
                    <Input label="Company / Organisation Name" required placeholder="Company name" error={errors.company?.message} {...register('company')} />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input label="Email Address" required type="email" placeholder="you@company.com" error={errors.email?.message} {...register('email')} />
                    <Input label="Phone Number" required placeholder="10-digit mobile" inputMode="numeric" maxLength={10} error={errors.mobile?.message} {...register('mobile')} />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="vh-event-type" className="text-sm font-medium text-text-secondary">Event Type <span className="ml-1 text-crimson-500" aria-hidden="true">*</span></label>
                      <PartySelect
                        id="vh-event-type"
                        value={watch('eventType') ?? ''}
                        onValueChange={(v) => setValue('eventType', v, { shouldValidate: true })}
                        options={EVENT_TYPES.map((t) => ({ value: t, label: t }))}
                        placeholder="Select event type"
                        icon={<Users size={16} />}
                        className="h-[46px] rounded-xl text-[15px]"
                      />
                      {errors.eventType && <p role="alert" className="text-xs text-danger">{errors.eventType.message}</p>}
                    </div>
                    <Input label="Expected Number of Guests" required placeholder="e.g. 30" inputMode="numeric" maxLength={4} error={errors.guests?.message} {...register('guests')} />
                  </div>
                  <Input label="Preferred Event Date" type="date" min={new Date().toISOString().slice(0, 10)} error={errors.date?.message} {...register('date')} />
                  <Textarea label="Additional Requirements" placeholder="Tell us about your event, equipment or catering needs" rows={4} error={errors.requirements?.message} {...register('requirements')} />
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#fdf6ff] p-3.5">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 rounded accent-[#6b2398]" {...register('consentWhatsapp')} />
                    <span className="text-sm text-[#5b4578]">I agree to receive updates on WhatsApp</span>
                  </label>
                  <button type="submit" disabled={isPending} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#32105f,#6b2398)] text-base font-bold text-white shadow-[0_14px_30px_rgba(50,16,95,0.3)] transition-all hover:-translate-y-0.5 disabled:opacity-60">
                    {isPending ? 'Sending…' : <>Submit Enquiry <Send size={17} /></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 6. Final CTA */}
        <motion.section
          initial={{ opacity: 0, y: 40, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={VIEW} transition={{ duration: 0.9, ease: EASE }}
          className="relative mx-4 mt-20 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#32105f,#6b2398_60%,#d946ef)] p-8 text-center text-white shadow-[0_24px_60px_rgba(107,35,152,0.35)] md:mx-auto md:mt-28 md:max-w-4xl md:p-12"
        >
          <h2 className="font-display text-3xl font-semibold !text-white md:text-4xl">Have an event in mind?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">Tell us what you are planning and we will help you shape it at Vibe Hall.</p>
          <button type="button" onClick={scrollToEnquiry} className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-[#32105f]">
            Enquire Now <ArrowRight size={15} />
          </button>
        </motion.section>
      </div>
    </>
  )
}

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Seo } from '@/components/seo/Seo'
import { PageShell } from '@/components/layout/PageShell'
import { PartySelect } from '@/components/ui/PartySelect'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { LeadSchema, type Lead } from '@/schemas/lead'
import { api } from '@/lib/api/client'
import { trackEvent } from '@/features/tracking/events'
import { getLastTouchUTM } from '@/features/tracking/utm'
import { Phone, MessageCircle, Mail, MapPin, Check, ArrowUpRight, Send, Sparkles } from 'lucide-react'
import { config } from '@/lib/config'
import { useState } from 'react'

const OCCASION_OPTIONS = [
  'Birthday', 'Anniversary', 'Proposal', 'Date Night',
  'Family', 'Friends', 'Sports Screening', 'Corporate', 'Other',
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Lead>({
    resolver: zodResolver(LeadSchema),
    defaultValues: { consentWhatsapp: true },
  })

  const { mutate: submitLead, isPending } = useMutation({
    mutationFn: (data: Lead) => {
      const utmData = getLastTouchUTM()
      return api.post('/leads', {
        ...data,
        source: 'contact_page',
        utmSource: utmData?.utm_source,
        utmMedium: utmData?.utm_medium,
        utmCampaign: utmData?.utm_campaign,
      })
    },
    onSuccess: () => {
      setSubmitted(true)
      trackEvent('generate_lead', { source: 'contact_page' })
    },
    onError: () => toast('error', 'Failed to submit', 'Please try again or reach us on WhatsApp.'),
  })

  const waLink = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Hi! I\'d like to know more about BOB Talkies.')}`

  const items = [
    { icon: <Phone size={18} />, label: 'Phone', value: `+91 ${config.whatsappNumber.slice(2)}`, href: `tel:+${config.whatsappNumber}` },
    { icon: <MessageCircle size={18} />, label: 'WhatsApp', value: 'Chat with us', href: waLink },
    { icon: <Mail size={18} />, label: 'Email', value: 'hello@bobtalkies.com', href: 'mailto:hello@bobtalkies.com' },
    { icon: <MapPin size={18} />, label: 'Location', value: 'Kukatpally, Hyderabad, Telangana', href: 'https://maps.google.com' },
  ]

  return (
    <>
      <Seo
        title="Contact Us | BOB Talkies"
        description="Get in touch with BOB Talkies — Hyderabad's premium private theatre. We're here to help plan your celebration."
        canonical="/contact"
      />
      <PageShell className="!pt-0 md:!pt-0">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 md:px-6 md:pb-24 md:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid overflow-hidden rounded-[2.25rem] bg-white shadow-[0_32px_80px_rgba(107,35,152,0.2)] ring-1 ring-[#f0e1f3] lg:grid-cols-[1fr_1.15fr]"
          >
            {/* Left: plum info panel */}
            <div className="relative overflow-hidden bg-[linear-gradient(160deg,#32105f_0%,#5a1f9a_60%,#8e39c7_100%)] p-8 text-white md:p-10">
              <motion.span className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#f5bd61]/30 blur-3xl" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity }} aria-hidden="true" />
              <motion.span className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#d946ef]/30 blur-3xl" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 10, repeat: Infinity }} aria-hidden="true" />
              {['🎟️', '🍿', '🎬'].map((e, i) => (
                <motion.span
                  key={e}
                  className="pointer-events-none absolute select-none text-3xl opacity-20"
                  style={{ right: `${8 + i * 12}%`, top: `${4 + (i % 2) * 6}%` }}
                  animate={{ y: [0, -14, 0], rotate: [-8, 8, -8] }}
                  transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                  aria-hidden="true"
                >
                  {e}
                </motion.span>
              ))}

              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#f5d7a1]">Contact Us</p>
                <h1 className="mt-3 font-display text-3xl font-bold leading-tight !text-white md:text-4xl">Let's Plan Your Celebration</h1>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">Have a question or want a custom package? Reach out and we'll get back to you within 2 hours.</p>

                <div className="mt-8 space-y-3">
                  {items.map((item, i) => (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.45 }}
                      className="group flex items-center gap-4 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/20"
                      onClick={() => item.label === 'WhatsApp' && trackEvent('whatsapp_click', { source: 'contact_page' })}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-[#f5d7a1]">{item.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">{item.label}</span>
                        <span className="block truncate text-[15px] font-semibold">{item.value}</span>
                      </span>
                      <ArrowUpRight size={16} className="shrink-0 text-white/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div className="p-8 md:p-10">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
                    <Check size={34} className="text-emerald-600" />
                  </span>
                  <h3 className="font-display text-3xl font-bold text-[#2a0e4f]">Message Sent!</h3>
                  <p className="mt-2 max-w-sm text-[#5b4578]">We'll get back to you within 2 hours. For urgent queries, chat with us on WhatsApp.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit((data) => submitLead(data))} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input label="Full Name" required placeholder="Your name" error={errors.name?.message} {...register('name')} />
                    <Input label="Mobile Number" required placeholder="10-digit mobile" inputMode="numeric" maxLength={10} error={errors.mobile?.message} {...register('mobile')} />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Input label="Email" type="email" placeholder="your@email.com" error={errors.email?.message} {...register('email')} />
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-occasion" className="text-sm font-medium text-text-secondary">Occasion</label>
                      <PartySelect
                        id="contact-occasion"
                        value={watch('occasion') ?? ''}
                        onValueChange={(v) => setValue('occasion', v)}
                        options={OCCASION_OPTIONS.map((o) => ({ value: o.toLowerCase(), label: o }))}
                        placeholder="Select (optional)"
                        icon={<Sparkles size={16} />}
                        className="h-[46px] rounded-xl text-[15px]"
                      />
                    </div>
                  </div>
                  <Textarea label="Message" required placeholder="Tell us how we can help..." error={errors.message?.message} rows={4} {...register('message')} />
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[#fdf6ff] p-3.5">
                    <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 rounded accent-[#6b2398]" {...register('consentWhatsapp')} />
                    <span className="text-sm text-[#5b4578]">I agree to receive updates on WhatsApp</span>
                  </label>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#32105f,#6b2398)] text-base font-bold text-white shadow-[0_14px_30px_rgba(50,16,95,0.3)] transition-all hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {isPending ? 'Sending…' : <>Send Message <Send size={17} /></>}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </PageShell>
    </>
  )
}

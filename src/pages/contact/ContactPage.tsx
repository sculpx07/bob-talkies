import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Seo } from '@/components/seo/Seo'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { LeadSchema, type Lead } from '@/schemas/lead'
import { api } from '@/lib/api/client'
import { trackEvent } from '@/features/tracking/events'
import { getLastTouchUTM } from '@/features/tracking/utm'
import { Phone, MessageCircle, Mail, MapPin, Check } from 'lucide-react'
import { config } from '@/lib/config'
import { useState } from 'react'

const OCCASION_OPTIONS = [
  'Birthday', 'Anniversary', 'Proposal', 'Date Night',
  'Family', 'Friends', 'Sports Screening', 'Corporate', 'Other',
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm<Lead>({
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

  return (
    <>
      <Seo
        title="Contact Us | BOB Talkies"
        description="Get in touch with BOB Talkies — Hyderabad's premium private theatre. We're here to help plan your celebration."
        canonical="/contact"
      />
      <PageShell>
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Left: info */}
          <div>
            <SectionHeader
              eyebrow="Contact Us"
              title="Let's Plan Your Celebration"
              subtitle="Have a question or want a custom package? Reach out and we'll get back to you within 2 hours."
            />
            <div className="space-y-5">
              {[
                { icon: <Phone size={18} />, label: 'Phone', value: `+91 ${config.whatsappNumber.slice(2)}`, href: `tel:+${config.whatsappNumber}` },
                { icon: <MessageCircle size={18} />, label: 'WhatsApp', value: 'Chat with us', href: waLink },
                { icon: <Mail size={18} />, label: 'Email', value: 'hello@bobtalkies.com', href: 'mailto:hello@bobtalkies.com' },
                { icon: <MapPin size={18} />, label: 'Location', value: 'Kukatpally, Hyderabad, Telangana', href: 'https://maps.google.com' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-start gap-4 group"
                  onClick={() => item.label === 'WhatsApp' && trackEvent('whatsapp_click', { source: 'contact_page' })}
                >
                  <span className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:bg-gold-500/20 transition-colors shrink-0">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-xs text-text-muted">{item.label}</p>
                    <p className="text-text-primary group-hover:text-gold-400 transition-colors">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div>
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-success/15 border-2 border-success flex items-center justify-center mb-4">
                  <Check size={28} className="text-success" />
                </div>
                <h3 className="font-display text-2xl text-text-primary mb-2">Message Sent!</h3>
                <p className="text-text-secondary">We'll get back to you within 2 hours. For urgent queries, chat with us on WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit((data) => submitLead(data))} className="space-y-4">
                <Input label="Full Name" required placeholder="Your name" error={errors.name?.message} {...register('name')} />
                <Input label="Mobile Number" required placeholder="10-digit mobile" inputMode="numeric" maxLength={10} error={errors.mobile?.message} {...register('mobile')} />
                <Input label="Email" type="email" placeholder="your@email.com" error={errors.email?.message} {...register('email')} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">Occasion</label>
                  <select
                    {...register('occasion')}
                    className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/40"
                  >
                    <option value="">Select occasion (optional)</option>
                    {OCCASION_OPTIONS.map((o) => <option key={o} value={o.toLowerCase()}>{o}</option>)}
                  </select>
                </div>
                <Textarea label="Message" required placeholder="Tell us how we can help..." error={errors.message?.message} rows={4} {...register('message')} />
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 rounded accent-[var(--gold-500)]" {...register('consentWhatsapp')} />
                  <span className="text-sm text-text-secondary">I agree to receive updates on WhatsApp</span>
                </label>
                <Button type="submit" fullWidth size="lg" loading={isPending}>Send Message</Button>
              </form>
            )}
          </div>
        </div>
      </PageShell>
    </>
  )
}

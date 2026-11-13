import { useParams, useLocation } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { PageShell } from '@/components/layout/PageShell'

const LEGAL_CONTENT: Record<string, { title: string; seoTitle: string; lastUpdated: string; sections: { heading: string; body: string }[] }> = {
  terms: {
    title: 'Terms & Conditions',
    seoTitle: 'Terms & Conditions | BOB Talkies',
    lastUpdated: '1 January 2025',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: `By booking a theatre at BOB Talkies ("BOB Talkies", "we", "our", "us"), you agree to these Terms & Conditions. If you do not agree, please do not proceed with a booking. These terms govern all bookings made through our website, WhatsApp, or any other channel.`,
      },
      {
        heading: '2. Bookings & Payments',
        body: `All bookings require an advance payment of 50% of the total booking value at the time of reservation. The remaining balance is payable before or on the day of the event. Bookings are confirmed only after payment is received. We accept UPI, credit/debit cards, and net banking through our secure payment gateway.`,
      },
      {
        heading: '3. Cancellations & Refunds',
        body: `Cancellations made more than 48 hours before the booking date are eligible for a full refund of the advance payment. Cancellations made between 24–48 hours before the booking date attract a 50% cancellation fee. Cancellations made within 24 hours are non-refundable. Rescheduling is allowed subject to availability; one free reschedule is permitted per booking with at least 48 hours notice.`,
      },
      {
        heading: '4. Permitted Use',
        body: `Our theatres are for personal, private celebrations only. Commercial filming, live streaming, subletting, or use for unlawful purposes is strictly prohibited. All guests must be 18+ or accompanied by a guardian. We reserve the right to refuse entry or terminate a booking without refund if our terms are violated.`,
      },
      {
        heading: '5. Conduct & Responsibility',
        body: `Guests are responsible for the conduct of all members in their party. Any damage caused to our equipment, furniture, or premises will be charged at full replacement or repair cost. We are not responsible for any personal belongings left on our premises. Alcohol is permitted in designated theatres only; please confirm with us at the time of booking.`,
      },
      {
        heading: '6. Liability',
        body: `BOB Talkies is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our maximum liability is limited to the amount paid for the booking in question. We reserve the right to cancel a booking in exceptional circumstances (force majeure, technical failure); in such cases, a full refund will be issued.`,
      },
      {
        heading: '7. Privacy',
        body: `Your personal data is processed in accordance with our Privacy Policy. By making a booking, you consent to us contacting you regarding your booking and, with your explicit consent, promotional communications.`,
      },
      {
        heading: '8. Governing Law',
        body: `These terms are governed by the laws of Telangana, India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.`,
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    seoTitle: 'Privacy Policy | BOB Talkies',
    lastUpdated: '1 January 2025',
    sections: [
      {
        heading: '1. Information We Collect',
        body: `We collect information you provide directly: name, mobile number, email address, and booking details. We also collect usage data automatically (pages visited, referring URL, device type) using cookies and analytics tools. We do not collect payment card details directly — payments are processed by our PCI-DSS-compliant payment partner.`,
      },
      {
        heading: '2. How We Use Your Information',
        body: `We use your information to process and confirm bookings, send booking-related communications (confirmations, reminders, e-passes), handle support queries, improve our services, and — with your consent — send promotional offers and event updates.`,
      },
      {
        heading: '3. Data Sharing',
        body: `We do not sell your personal data. We share data only with service providers who assist our operations (payment gateway, SMS provider, email service) under data processing agreements. We may disclose data if required by law or to protect our rights.`,
      },
      {
        heading: '4. Cookies',
        body: `We use strictly necessary cookies (session management), analytics cookies (Google Analytics — opted in via our cookie banner), and marketing cookies (Google Ads remarketing — opted in via our cookie banner). You can manage cookie preferences at any time via the cookie settings link in our footer.`,
      },
      {
        heading: '5. Data Retention',
        body: `Booking records are retained for 7 years for accounting and legal compliance. Marketing preferences and analytics data are retained for up to 2 years. You may request deletion of your personal data at any time (subject to legal retention requirements) by emailing privacy@bobtalkies.com.`,
      },
      {
        heading: '6. Your Rights',
        body: `Under applicable law you have the right to access, correct, delete, or port your personal data, and to withdraw consent for marketing. To exercise your rights, email privacy@bobtalkies.com with your registered mobile number.`,
      },
      {
        heading: '7. Security',
        body: `We use industry-standard encryption (TLS) for data in transit. Access to personal data is restricted to authorised personnel. Despite our best efforts, no transmission over the internet is 100% secure.`,
      },
      {
        heading: '8. Contact',
        body: `For privacy queries, contact our Data Protection Officer at privacy@bobtalkies.com or write to: BOB Talkies, Kukatpally Housing Board Colony, Kukatpally, Hyderabad — 500072.`,
      },
    ],
  },
  'refund-policy': {
    title: 'Refund Policy',
    seoTitle: 'Refund & Cancellation Policy | BOB Talkies',
    lastUpdated: '1 January 2025',
    sections: [
      {
        heading: 'Our Refund Promise',
        body: `We want every booking to go ahead as planned. If circumstances change, here is exactly how our refund policy works. All refunds are processed to the original payment method within 5–7 business days of approval.`,
      },
      {
        heading: 'Cancellations',
        body: `More than 48 hours before the slot: 100% refund of the advance amount paid.\n\n24–48 hours before the slot: 50% refund of the advance amount paid.\n\nLess than 24 hours before the slot: No refund.\n\nNo-show (failure to arrive without prior notice): No refund.\n\nTo cancel, WhatsApp us or email bookings@bobtalkies.com with your booking ID.`,
      },
      {
        heading: 'Rescheduling',
        body: `You may reschedule your booking once at no charge, provided you request it at least 48 hours before your original slot and the new slot is within 30 days. Additional reschedules may incur a ₹500 rescheduling fee. Rescheduling within 24 hours of a slot is treated as a cancellation per the policy above.`,
      },
      {
        heading: 'Addon & Decoration Refunds',
        body: `Addons and decoration packages that have already been prepared or ordered cannot be refunded if cancellation occurs within 48 hours of the slot. If we cancel or modify your booking (e.g., due to technical failure), all amounts including addons are refunded in full.`,
      },
      {
        heading: 'Coupon & Offer Codes',
        body: `Coupon discounts are applied at the time of booking. If you cancel and rebook, the coupon may no longer be valid if its usage limit has been reached. Refunds are calculated on the amount actually paid after discount.`,
      },
      {
        heading: 'Force Majeure',
        body: `If BOB Talkies cancels your booking due to circumstances beyond our control (power outage, natural disaster, government order, etc.), you will receive a full refund of all amounts paid within 7 business days.`,
      },
      {
        heading: 'How to Raise a Refund Request',
        body: `WhatsApp: +91 98765 43210\nEmail: bookings@bobtalkies.com\nPlease include your Booking ID and the reason for cancellation. Our team responds within 2 business hours (10 AM – 10 PM, 7 days a week).`,
      },
    ],
  },
}

export default function LegalPage() {
  const { slug: paramSlug } = useParams<{ slug: string }>()
  const location = useLocation()
  // Support both /legal/:slug and flat routes like /terms, /privacy, /refund-policy
  const pathSlug = location.pathname.replace(/^\//, '')
  const slug = paramSlug ?? (LEGAL_CONTENT[pathSlug] ? pathSlug : undefined)
  const content = LEGAL_CONTENT[slug ?? ''] ?? LEGAL_CONTENT['terms']

  return (
    <>
      <Seo
        title={content.seoTitle}
        description={`Read the ${content.title} for BOB Talkies, Hyderabad's premium private theatre experience.`}
        canonical={`/legal/${slug ?? 'terms'}`}
        noindex
      />
      <PageShell>
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="text-xs text-text-muted uppercase tracking-widest font-medium mb-2">Legal</p>
            <h1 className="font-display text-4xl text-text-primary mb-2">{content.title}</h1>
            <p className="text-sm text-text-muted">Last updated: {content.lastUpdated}</p>
          </div>

          <div className="space-y-10">
            {content.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="font-display text-xl text-text-primary mb-3">{section.heading}</h2>
                {section.body.split('\n\n').map((para, i) => (
                  <p key={i} className="text-text-secondary leading-relaxed mb-3 text-sm whitespace-pre-line">
                    {para}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-14 pt-8 border-t border-border-subtle">
            <p className="text-xs text-text-muted">
              For any questions about this {content.title.toLowerCase()}, contact us at{' '}
              <a href="mailto:hello@bobtalkies.com" className="text-gold-400 hover:underline">hello@bobtalkies.com</a>{' '}
              or WhatsApp{' '}
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:underline">+91 98765 43210</a>.
            </p>
          </div>
        </div>
      </PageShell>
    </>
  )
}

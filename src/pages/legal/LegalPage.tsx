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
        heading: 'Overview',
        body: `An advance amount of ₹750 (Delight / Heavens / Filmdom), ₹1,250 (Cosmos) or ₹1,750 (Vibe Hall) is collected to confirm your booking. A partial advance of ₹500 (Delight / Heavens / Filmdom), ₹1,000 (Cosmos) or ₹1,250 (Vibe Hall) is refundable if you cancel your slot at least 72 hours prior to the booking time.\n\nPlease be aware that refunds are not provided for cancellations made after the 72-hour window. Additionally, no refunds are given for no-shows or late arrivals.`,
      },
      {
        heading: '1. Advance Payment & Booking Confirmation',
        body: `To confirm a booking, an advance payment is required based on the selected hall:\n\nDelight / Heavens / Filmdom – ₹750\nCosmos – ₹1,250\nVibe Hall – ₹1,750`,
      },
      {
        heading: '2. Cancellation & Refund Eligibility',
        body: `If you need to cancel your booking, you may be eligible for a partial refund depending on when you make the cancellation.\n\nRefundable Amounts (if cancelled at least 72 hours before booking time):\n\nDelight / Heavens / Filmdom – ₹500 refunded\nCosmos – ₹1,000 refunded\nVibe Hall – ₹1,250 refunded`,
      },
      {
        heading: '3. Non-Refundable Scenarios',
        body: `Refunds will not be provided under the following circumstances:\n\nLate Cancellations: If you cancel within 72 hours of your booking time.\n\nNo-Shows: If you fail to attend your scheduled booking without prior notice.\n\nLate Arrivals & Shortened Bookings: No refund or adjustments will be provided.`,
      },
      {
        heading: '4. How to Request a Cancellation & Refund',
        body: `If you need to cancel your booking, please contact us as soon as possible via:\n\n📱 WhatsApp: 9888 99 49 89\n\nWhen making a cancellation request, please provide:\n• Your full name\n• Booking date and time\n• The venue / hall name`,
      },
      {
        heading: '5. Refund Processing Timeline',
        body: `Refunds will be processed within 7 business days after the cancellation request is received.\n\nThe refunded amount will be issued via the original payment method or an alternative method as agreed upon.`,
      },
      {
        heading: '6. Exceptions & Special Considerations',
        body: `Force Majeure: In cases of natural disasters, government restrictions, or technical failures, BOB Talkies reserves the right to issue refunds or reschedule bookings at its discretion.\n\nManagement Discretion: Any refunds outside the scope of this policy will be decided at the sole discretion of BOB Talkies.`,
      },
      {
        heading: 'Contact Us',
        body: `If you have any questions or concerns regarding our refund policy, please feel free to reach out. We are always happy to assist!\n\n📞 WhatsApp: 9888 99 49 89\n\n📍 BOB Talkies (Private Theatres)\nPlot 2 & 3, 4th Floor, SR A2Z Heights\nGokul Plots Junction, near KPHB 9th Phase\nKukatpally, Hyderabad – 500085\n\nThank you for choosing BOB Talkies! We look forward to providing you with a fantastic entertainment experience.`,
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

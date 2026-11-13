import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { MapPin, Phone, Clock, Car, ExternalLink } from 'lucide-react'

export default function LocationDetailPage() {
  return (
    <>
      <Seo
        title="BOB Talkies Kukatpally | Private Theatre Hyderabad"
        description="BOB Talkies private theatre in Kukatpally, Hyderabad. 5 private theatres for 2–40 guests. Easy to reach, free parking."
        canonical="/locations/kukatpally"
      />
      <PageShell>
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            eyebrow="Our Location"
            title="BOB Talkies — Kukatpally"
            subtitle="Hyderabad's most loved private theatre experience, right in the heart of Kukatpally."
          />

          <div className="grid md:grid-cols-2 gap-10 mb-12">
            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-3 text-text-secondary">
                <MapPin size={18} className="text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-text-primary mb-0.5">Address</p>
                  Kukatpally Housing Board Colony,<br />Kukatpally, Hyderabad, Telangana 500072
                </div>
              </div>
              <div className="flex items-start gap-3 text-text-secondary">
                <Clock size={18} className="text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-text-primary mb-0.5">Operating Hours</p>
                  Monday – Sunday: 10:00 AM – 1:30 AM (next day)<br />
                  Open all public holidays
                </div>
              </div>
              <div className="flex items-start gap-3 text-text-secondary">
                <Car size={18} className="text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-text-primary mb-0.5">Parking & Access</p>
                  Free parking available on premises<br />
                  2 min from KPHB Metro Station<br />
                  Near Kukatpally Bus Stand
                </div>
              </div>
              <div className="flex items-start gap-3 text-text-secondary">
                <Phone size={18} className="text-gold-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-text-primary mb-0.5">Contact</p>
                  <a href="tel:+919876543210" className="hover:text-gold-400 transition-colors">+91 98765 43210</a>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-bg-surface border border-border-subtle rounded-card overflow-hidden h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="text-gold-400 mx-auto mb-2" />
                <p className="text-text-muted text-sm mb-3">Map loads when you visit</p>
                <a
                  href="https://maps.google.com/?q=Kukatpally+Hyderabad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gold-400 hover:underline flex items-center gap-1 justify-center"
                >
                  Open in Google Maps <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          <Button asChild size="xl" className="w-full md:w-auto">
            <Link to="/book">Book a Theatre Here</Link>
          </Button>
        </div>
      </PageShell>
    </>
  )
}

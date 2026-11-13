import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { MapPin, Phone, Clock, Car } from 'lucide-react'

const LOCATIONS = [
  {
    id: 'loc-kukatpally',
    slug: 'kukatpally',
    name: 'BOB Talkies — Kukatpally',
    address: 'Kukatpally Housing Board Colony, Kukatpally, Hyderabad, Telangana 500072',
    phone: '+91 98765 43210',
    hours: '10:00 AM – 1:30 AM (next day)',
    landmarks: 'Near Kukatpally Bus Stand, 2 min from KPHB Metro Station',
    parking: 'Free parking available',
    theatreCount: 5,
    image: 'https://images.unsplash.com/photo-1555461083-e9a7f92d35e1?w=800',
  },
]

export default function LocationsPage() {
  return (
    <>
      <Seo
        title="Our Locations | BOB Talkies Hyderabad"
        description="Find BOB Talkies private theatre locations in Hyderabad. Currently located in Kukatpally."
        canonical="/locations"
      />
      <PageShell>
        <SectionHeader
          eyebrow="Our Locations"
          title="Find Us in Hyderabad"
          subtitle="Visit us for a world-class private theatre experience. Currently open in Kukatpally."
          centered
        />

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {LOCATIONS.map((loc) => (
            <div key={loc.id} className="bg-bg-surface border border-border-subtle rounded-card overflow-hidden hover:border-gold-500/40 transition-all">
              <img src={loc.image} alt={loc.name} className="w-full h-48 object-cover" loading="lazy" />
              <div className="p-6">
                <h2 className="font-display text-xl font-semibold text-text-primary mb-4">{loc.name}</h2>
                <div className="space-y-3 text-sm text-text-secondary mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin size={15} className="text-gold-400 mt-0.5 shrink-0" />
                    <span>{loc.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={15} className="text-gold-400 shrink-0" />
                    <span>{loc.hours}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Car size={15} className="text-gold-400 mt-0.5 shrink-0" />
                    <span>{loc.parking} · {loc.landmarks}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={15} className="text-gold-400 shrink-0" />
                    <a href={`tel:${loc.phone}`} className="hover:text-gold-400 transition-colors">{loc.phone}</a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button asChild fullWidth>
                    <Link to="/book">Book a Theatre</Link>
                  </Button>
                  <Button asChild variant="secondary" fullWidth>
                    <Link to={`/locations/${loc.slug}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageShell>
    </>
  )
}

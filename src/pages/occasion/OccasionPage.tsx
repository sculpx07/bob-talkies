import { useParams, Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronRight } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { PriceTag } from '@/components/ui/PriceTag'
import { Accordion } from '@/components/ui/Accordion'
import { TheatreCardSkeleton } from '@/components/ui/Skeleton'
import { Section, SectionHeader } from '@/components/layout/PageShell'
import { PageShell } from '@/components/layout/PageShell'
import { api } from '@/lib/api/client'
import { theatreKeys, packageKeys } from '@/lib/api/queryKeys'
import { OCCASIONS, getOccasionBySlug } from '@/content/occasions'
import type { Theatre } from '@/schemas/theatre'
import type { Package } from '@/schemas/package'

// SEO slug → occasion slug mapping
const SEO_SLUG_MAP: Record<string, string> = {
  'private-theatre-hyderabad': 'birthday',
  'private-theatre-kukatpally': 'birthday',
  'private-theatre-birthday-hyderabad': 'birthday',
  'private-theatre-for-couples': 'date-night',
  'anniversary-celebration-hyderabad': 'anniversary',
  'date-night-hyderabad': 'date-night',
  'proposal-venue-hyderabad': 'proposal',
  'private-party-hall-hyderabad': 'friends',
  'corporate-event-venue-hyderabad': 'corporate',
}

export default function OccasionPage() {
  const { occasion: rawSlug } = useParams<{ occasion?: string }>()
  const location = useLocation()

  // Resolve slug — could be a celebration slug or an SEO landing slug
  const slug = rawSlug ?? SEO_SLUG_MAP[location.pathname.replace('/', '')] ?? 'birthday'
  const occasion = getOccasionBySlug(slug) ?? OCCASIONS[0]

  const { data: theatres, isLoading: theatresLoading } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })

  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: packageKeys.list(),
    queryFn: () => api.get<Package[]>('/packages'),
  })

  const recommendedTheatres = theatres?.filter((t) => occasion.recommendedTheatres.includes(t.id)) ?? []

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: occasion.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }

  return (
    <>
      <Seo
        title={`${occasion.heading} | BOB Talkies Hyderabad`}
        description={occasion.description}
        canonical={rawSlug ? `/celebrations/${slug}` : location.pathname}
        ogImage={occasion.heroImage}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <PageShell fullWidth>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${occasion.heroImage}')` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-base/90 via-bg-base/70 to-bg-base/40" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-16">
            <span className="text-5xl mb-4 block">{occasion.emoji}</span>
            <Badge variant="gold" className="mb-4">Private Theatre Experience</Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-text-primary mb-4 max-w-2xl leading-tight">
              {occasion.heading}
            </h1>
            <p className="text-text-secondary text-lg max-w-xl leading-relaxed mb-8">
              {occasion.subheading}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="xl">
                <Link to={`/book?occasion=${slug}`}>Book Now</Link>
              </Button>
              <Button asChild variant="secondary" size="xl">
                <Link to="/theatres">Explore Theatres</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Description + Features */}
        <Section bg="surface">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader
                eyebrow={occasion.label}
                title={`The Perfect ${occasion.label} Experience`}
              />
              <p className="text-text-secondary leading-relaxed mb-6">{occasion.description}</p>
              <ul className="space-y-3">
                {occasion.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-text-secondary text-sm">
                    <Check size={16} className="text-gold-500 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-card overflow-hidden border border-border-subtle">
              <img
                src={occasion.heroImage}
                alt={`${occasion.label} at BOB Talkies`}
                className="w-full h-72 md:h-96 object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </Section>

        {/* Recommended Theatres */}
        <Section bg="base">
          <SectionHeader
            eyebrow="Recommended"
            title={`Best Theatres for ${occasion.label}`}
            subtitle="Handpicked theatres that work best for this occasion."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {theatresLoading
              ? Array.from({ length: 3 }, (_, i) => <TheatreCardSkeleton key={i} />)
              : recommendedTheatres.map((theatre) => (
                  <Card key={theatre.id} hover className="flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={theatre.images[0]}
                        alt={theatre.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs text-text-muted bg-bg-base/80 px-2 py-0.5 rounded-pill">
                          {theatre.capacityMin}–{theatre.capacityMax} guests
                        </span>
                      </div>
                    </div>
                    <CardBody className="flex-1 flex flex-col">
                      <h3 className="font-display text-xl text-text-primary mb-1">{theatre.name}</h3>
                      <p className="text-sm text-text-secondary mb-3 flex-1">{theatre.tagline}</p>
                      <PriceTag paise={theatre.startingPricePaise} className="mb-4" />
                      <div className="flex gap-2">
                        <Button asChild variant="secondary" size="sm" className="flex-1">
                          <Link to={`/theatres/${theatre.slug}`}>Details</Link>
                        </Button>
                        <Button asChild size="sm" className="flex-1">
                          <Link to={`/book?occasion=${slug}&theatre=${theatre.id}`}>Book</Link>
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
          </div>
        </Section>

        {/* Packages */}
        <Section bg="navy">
          <SectionHeader
            eyebrow="Packages"
            title="Choose Your Package"
            subtitle="Tailored packages to make your celebration perfect."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {packagesLoading
              ? Array.from({ length: 4 }, (_, i) => <Card key={i}><CardBody><div className="space-y-2">{Array.from({ length: 5 }, (_, j) => <div key={j} className="skeleton h-4 rounded" />)}</div></CardBody></Card>)
              : packages?.slice(0, 4).map((pkg) => (
                  <Card key={pkg.id} hover className="flex flex-col">
                    <CardBody className="flex-1 flex flex-col">
                      <h3 className="font-display text-xl text-text-primary mb-2">{pkg.name}</h3>
                      <PriceTag paise={pkg.pricePaise} className="mb-3" />
                      <ul className="space-y-1.5 flex-1 mb-4">
                        {pkg.inclusions.slice(0, 4).map((inc, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                            <span className="text-gold-500 shrink-0">✓</span> {inc}
                          </li>
                        ))}
                      </ul>
                      <Button asChild size="sm" fullWidth>
                        <Link to={`/book?occasion=${slug}&package=${pkg.id}`}>Choose</Link>
                      </Button>
                    </CardBody>
                  </Card>
                ))}
          </div>
        </Section>

        {/* FAQ */}
        {occasion.faqs.length > 0 && (
          <Section bg="surface">
            <div className="max-w-3xl mx-auto">
              <SectionHeader
                eyebrow="FAQ"
                title={`${occasion.label} FAQs`}
                centered
              />
              <Accordion items={occasion.faqs.map((f, i) => ({ ...f, id: `faq-${i}` }))} />
            </div>
          </Section>
        )}

        {/* Final CTA */}
        <Section bg="base">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-4xl text-text-primary mb-4">
              Ready to Plan Your <span className="text-gold-400">{occasion.label}?</span>
            </h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Book your slot online in minutes — no calls needed. Instant confirmation.
            </p>
            <Button asChild size="xl">
              <Link to={`/book?occasion=${slug}`}>Book Your Experience</Link>
            </Button>
          </div>
        </Section>
      </PageShell>
    </>
  )
}

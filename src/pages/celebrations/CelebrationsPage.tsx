import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { PageShell, Section, SectionHeader } from '@/components/layout/PageShell'
import { OCCASIONS } from '@/content/occasions'

export default function CelebrationsPage() {
  return (
    <>
      <Seo
        title="Celebrations — Every Occasion at BOB Talkies"
        description="From birthdays and anniversaries to proposals and baby showers — BOB Talkies has a perfect private theatre experience for every celebration in Hyderabad."
        canonical="/celebrations"
      />
      <PageShell fullWidth>
        <div className="border-b border-border-subtle pt-28 pb-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-3">Every Occasion</p>
            <h1 className="font-display text-4xl md:text-5xl text-text-primary mb-4">Choose Your Celebration</h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
              Whether it's an intimate date night or a grand birthday bash, we have the perfect private theatre experience for every milestone in your life.
            </p>
          </div>
        </div>

        <Section bg="base">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OCCASIONS.map((occasion) => (
              <Link
                key={occasion.slug}
                to={`/celebrations/${occasion.slug}`}
                className="group relative overflow-hidden rounded-card border border-border-subtle bg-bg-surface hover:border-gold-500/50 transition-all duration-300 hover:shadow-gold-glow"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={occasion.heroImage}
                    alt={`${occasion.label} celebration at BOB Talkies`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-base/90 via-bg-base/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <span className="text-3xl">{occasion.emoji}</span>
                    <h2 className="font-display text-2xl text-text-primary">{occasion.label}</h2>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">{occasion.subheading}</p>
                  <ul className="space-y-1.5 mb-5">
                    {occasion.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="text-gold-500">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gold-400 font-medium group-hover:text-gold-500 transition-colors">
                      Explore {occasion.label} →
                    </span>
                    <ChevronRight size={16} className="text-gold-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <Section bg="navy">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display text-3xl text-text-primary mb-4">Don't See Your Occasion?</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              We cater to every celebration you can imagine. Contact us and we'll craft a custom experience just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/book">Book Now</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/contact">Talk to Us</Link>
              </Button>
            </div>
          </div>
        </Section>
      </PageShell>
    </>
  )
}

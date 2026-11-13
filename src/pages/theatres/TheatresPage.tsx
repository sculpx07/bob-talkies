import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, Monitor, Speaker, ChevronRight } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PriceTag } from '@/components/ui/PriceTag'
import { TheatreCardSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/EmptyState'
import { PageShell, Section, SectionHeader } from '@/components/layout/PageShell'
import { api } from '@/lib/api/client'
import { theatreKeys } from '@/lib/api/queryKeys'
import type { Theatre } from '@/schemas/theatre'

export default function TheatresPage() {
  const { data: theatres, isLoading, isError, refetch } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })

  return (
    <>
      <Seo
        title="Our Private Theatres | BOB Talkies Hyderabad"
        description="Explore 5 premium private theatres in Hyderabad — from intimate 2-person suites to grand 40-person celebration halls. 4K, Dolby Atmos, full decoration and photography."
        canonical="/theatres"
      />
      <PageShell fullWidth>
        {/* Page hero */}
        <div className="bg-bg-navy border-b border-border-subtle pt-28 pb-16 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-3">Premium Private Cinemas</p>
            <h1 className="font-display text-4xl md:text-5xl text-text-primary mb-4">Our Theatres</h1>
            <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
              Five uniquely designed private theatres, each built for a different kind of celebration. Every screen is 4K, every system is Dolby Atmos, and every session is exclusively yours.
            </p>
          </div>
        </div>

        <Section bg="base">
          {isError ? (
            <ErrorState title="Failed to Load Theatres" retry={refetch} />
          ) : (
            <div className="space-y-10">
              {isLoading
                ? Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-6 bg-bg-surface rounded-card overflow-hidden border border-border-subtle">
                      <TheatreCardSkeleton />
                    </div>
                  ))
                : theatres?.map((theatre, idx) => (
                    <article
                      key={theatre.id}
                      className="flex flex-col md:flex-row gap-0 bg-bg-surface rounded-card overflow-hidden border border-border-subtle hover:border-gold-500/30 transition-all duration-200 group"
                    >
                      <div className={`relative w-full md:w-80 shrink-0 h-56 md:h-auto overflow-hidden ${idx % 2 === 1 ? 'md:order-last' : ''}`}>
                        <img
                          src={theatre.images[0]}
                          alt={`${theatre.name} private theatre`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-bg-surface/40" />
                        {theatre.currentOffer && (
                          <Badge variant="crimson" className="absolute top-3 left-3">Special Offer</Badge>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 p-6 md:p-8">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h2 className="font-display text-2xl md:text-3xl text-text-primary">{theatre.name}</h2>
                            <p className="text-text-secondary text-sm mt-1 italic">{theatre.tagline}</p>
                          </div>
                          <PriceTag paise={theatre.startingPricePaise} className="shrink-0 ml-4" />
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed mb-5">{theatre.description}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Users size={15} className="text-gold-500" />
                            {theatre.capacityMin}–{theatre.capacityMax} guests
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Monitor size={15} className="text-gold-500" />
                            {theatre.screenSize}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Speaker size={15} className="text-gold-500" />
                            {theatre.soundSystem.split(' ').slice(0, 2).join(' ')}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {theatre.suitableFor.map((s) => (
                            <Badge key={s} variant="muted" className="capitalize">{s.replace('-', ' ')}</Badge>
                          ))}
                        </div>
                        <div className="flex gap-3 mt-auto">
                          <Button asChild variant="secondary" size="md">
                            <Link to={`/theatres/${theatre.slug}`}>
                              View Details <ChevronRight size={16} />
                            </Link>
                          </Button>
                          <Button asChild size="md">
                            <Link to={`/book?theatre=${theatre.id}`}>Book This Theatre</Link>
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
            </div>
          )}
        </Section>
      </PageShell>
    </>
  )
}

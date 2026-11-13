import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { packageKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Package } from '@/schemas/package'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageShell, SectionHeader, Section } from '@/components/layout/PageShell'
import { formatINR } from '@/lib/utils/currency'
import { Check, Users } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function PackagesPage() {
  const [isWeekend, setIsWeekend] = useState(false)
  const { data: packages = [], isLoading } = useQuery({
    queryKey: packageKeys.list(),
    queryFn: () => api.get<Package[]>('/packages'),
  })

  const tierColors: Record<string, string> = {
    silver: 'text-text-secondary border-border-subtle',
    gold: 'text-gold-400 border-gold-500/40',
    diamond: 'text-blue-300 border-blue-400/40',
    platinum: 'text-champagne-200 border-champagne-200/40',
  }
  const tierGlows: Record<string, string> = {
    gold: 'shadow-gold-glow',
    platinum: 'shadow-[0_0_20px_rgba(241,227,184,0.2)]',
  }

  return (
    <>
      <Seo
        title="Packages & Pricing | BOB Talkies"
        description="Explore BOB Talkies private theatre packages — Silver, Gold, Diamond and Platinum. Find the perfect package for your celebration in Hyderabad."
        canonical="/packages"
      />
      <PageShell>
        <SectionHeader
          eyebrow="Packages & Pricing"
          title="Choose Your Experience"
          subtitle="Every package includes the theatre, decoration and personalised touches. Add more as you go."
          centered
        />

        {/* Weekday / Weekend toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-bg-elevated border border-border-subtle rounded-pill p-1 gap-1">
            <button
              onClick={() => setIsWeekend(false)}
              className={cn('px-5 py-2 rounded-pill text-sm font-medium transition-colors', !isWeekend ? 'bg-gold-gradient text-bg-base' : 'text-text-secondary hover:text-text-primary')}
              aria-pressed={!isWeekend}
            >
              Weekday
            </button>
            <button
              onClick={() => setIsWeekend(true)}
              className={cn('px-5 py-2 rounded-pill text-sm font-medium transition-colors', isWeekend ? 'bg-gold-gradient text-bg-base' : 'text-text-secondary hover:text-text-primary')}
              aria-pressed={isWeekend}
            >
              Weekend / Holiday
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-96 w-full" rounded="lg" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={cn(
                  'bg-bg-surface border-2 rounded-card p-6 flex flex-col',
                  tierColors[pkg.tier] ?? 'border-border-subtle',
                  pkg.tier === 'gold' && tierGlows.gold,
                  pkg.tier === 'platinum' && tierGlows.platinum,
                )}
              >
                {pkg.badge && (
                  <Badge variant={pkg.tier === 'gold' ? 'gold' : 'champagne'} className="mb-3 self-start">
                    {pkg.badge}
                  </Badge>
                )}
                <h2 className={cn('font-display text-2xl font-bold mb-1', tierColors[pkg.tier]?.split(' ')[0] ?? 'text-text-primary')}>
                  {pkg.name}
                </h2>
                <p className="text-text-secondary text-sm mb-4 leading-relaxed">{pkg.description}</p>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-gold-400 font-display">
                    {formatINR(isWeekend ? pkg.weekendPricePaise : pkg.pricePaise)}
                  </span>
                  <span className="text-text-muted text-xs ml-1">onwards</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {pkg.inclusions.map((inc) => (
                    <li key={inc} className="flex items-start gap-2 text-xs text-text-secondary">
                      <Check size={12} className="text-success mt-0.5 shrink-0" aria-hidden="true" />
                      {inc}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-1.5 text-xs text-text-muted border-t border-border-subtle pt-4 mb-4">
                  <Users size={12} aria-hidden="true" />
                  Includes {pkg.includedGuests} guests
                </div>

                <Button asChild fullWidth>
                  <Link to={`/book?package=${pkg.id}`}>Book This Package</Link>
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-text-secondary mb-4">Want something custom?</p>
          <Button asChild variant="secondary" size="lg">
            <Link to="/book">Build Your Own Package</Link>
          </Button>
        </div>
      </PageShell>
    </>
  )
}

import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { theatreKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Theatre } from '@/schemas/theatre'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { formatINR } from '@/lib/utils/currency'
import { trackEvent } from '@/features/tracking/events'
import { Users, Monitor, Search } from 'lucide-react'

export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [date, setDate] = useState(params.get('date') ?? '')
  const [guests, setGuests] = useState(params.get('guests') ?? '2')
  const [occasion, setOccasion] = useState(params.get('occasion') ?? '')
  const [hasSearched, setHasSearched] = useState(false)

  const { data: theatres = [], isLoading, refetch } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
    enabled: false,
  })

  function handleSearch() {
    setHasSearched(true)
    refetch()
    trackEvent('search_performed', { date, guests: parseInt(guests), occasion })
  }

  const filtered = theatres.filter(
    (t) => t.capacityMin <= parseInt(guests) && t.capacityMax >= parseInt(guests),
  )

  return (
    <>
      <Seo title="Search Theatres | BOB Talkies" description="Search available private theatres at BOB Talkies by date, guests and occasion." canonical="/search" />
      <PageShell>
        <SectionHeader eyebrow="Search" title="Find Your Theatre" centered />

        {/* Search form */}
        <div className="max-w-2xl mx-auto bg-bg-surface border border-border-subtle rounded-card p-6 mb-10">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-gold-500"
              >
                {[2, 4, 6, 8, 10, 15, 20, 30].map((n) => (
                  <option key={n} value={n}>{n} guests</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Occasion (optional)</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-gold-500"
              >
                <option value="">Any occasion</option>
                {['Birthday', 'Anniversary', 'Date Night', 'Proposal', 'Friends', 'Family', 'Corporate'].map((o) => (
                  <option key={o} value={o.toLowerCase().replace(' ', '-')}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <Button fullWidth size="lg" onClick={handleSearch} loading={isLoading}>
            <Search size={16} /> Show Available Theatres
          </Button>
        </div>

        {/* Results */}
        {hasSearched && (
          isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-72 w-full" rounded="lg" />)}
            </div>
          ) : (
            <>
              <p className="text-text-muted text-sm mb-6">{filtered.length} theatres available for {guests} guests</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((t) => (
                  <div key={t.id} className="bg-bg-surface border border-border-subtle rounded-card overflow-hidden hover:border-gold-500/40 transition-all">
                    <img src={t.images[0]} alt={t.name} className="w-full h-44 object-cover" loading="lazy" />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-display text-lg font-semibold text-text-primary">{t.name}</h3>
                        {t.currentOffer && <Badge variant="gold">{t.currentOffer}</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-text-muted mb-3">
                        <span className="flex items-center gap-1"><Users size={11} />{t.capacityMin}–{t.capacityMax}</span>
                        <span className="flex items-center gap-1"><Monitor size={11} />{t.screenSize}</span>
                      </div>
                      <p className="text-gold-400 font-semibold text-sm mb-4">{formatINR(t.startingPricePaise)} onwards</p>
                      <Button asChild fullWidth size="sm">
                        <Link to={`/book?theatre=${t.id}&date=${date}&guests=${guests}&occasion=${occasion}`}>Book Now</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </PageShell>
    </>
  )
}

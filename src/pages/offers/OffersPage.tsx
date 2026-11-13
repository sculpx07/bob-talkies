import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { offerKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Offer } from '@/schemas/offer'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { formatINR } from '@/lib/utils/currency'
import { Tag, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function OffersPage() {
  const { data: offers = [], isLoading } = useQuery({
    queryKey: offerKeys.list(),
    queryFn: () => api.get<Offer[]>('/offers'),
  })

  return (
    <>
      <Seo
        title="Offers & Discounts | BOB Talkies"
        description="Current offers and discount coupons for private theatre bookings at BOB Talkies, Hyderabad."
        canonical="/offers"
      />
      <PageShell>
        <SectionHeader
          eyebrow="Current Offers"
          title="Save on Your Celebration"
          subtitle="Use these exclusive discount codes to get the best deals on your private theatre booking."
          centered
        />

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full" rounded="lg" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </PageShell>
    </>
  )
}

function OfferCard({ offer }: { offer: Offer }) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(offer.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const discount = offer.discountType === 'flat'
    ? `₹${offer.discountValue / 100} off`
    : `${offer.discountValue}% off`

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-card overflow-hidden hover:border-gold-500/40 transition-all">
      {offer.image && (
        <img src={offer.image} alt={offer.title} className="w-full h-40 object-cover" loading="lazy" />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-text-primary text-lg leading-tight">{offer.title}</h3>
          {offer.badge && <Badge variant="gold">{offer.badge}</Badge>}
        </div>
        <p className="text-text-secondary text-sm mb-4">{offer.description}</p>

        <div className="flex items-center gap-3 p-3 bg-bg-elevated rounded-xl border border-border-subtle mb-4">
          <Tag size={16} className="text-gold-400 shrink-0" aria-hidden="true" />
          <span className="font-mono font-bold text-gold-400 flex-1 tracking-widest">{offer.code}</span>
          <button
            onClick={copyCode}
            className="text-xs text-text-muted hover:text-gold-400 flex items-center gap-1 transition-colors"
            aria-label={`Copy code ${offer.code}`}
          >
            {copied ? <><Check size={12} className="text-success" /> Copied!</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>

        <div className="text-xs text-text-muted mb-4">
          {offer.minOrderPaise && <span>Min order: {formatINR(offer.minOrderPaise)} · </span>}
          Valid until {new Date(offer.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>

        <Button asChild fullWidth>
          <Link to={`/book?coupon=${offer.code}`}>Book Now with {discount}</Link>
        </Button>
      </div>
    </div>
  )
}

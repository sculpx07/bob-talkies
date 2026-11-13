import { useQuery } from '@tanstack/react-query'
import { offerKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Offer } from '@/schemas/offer'
import { Seo } from '@/components/seo/Seo'
import { OfferTicket } from '@/components/ui/OfferTicket'
import { Skeleton } from '@/components/ui/Skeleton'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'

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
          eyebrowClassName="font-cursive normal-case tracking-normal text-3xl md:text-4xl font-semibold text-[#6b2398]"
          title="Save on Your Celebration"
          titleClassName="text-4xl md:text-5xl font-bold"
          subtitle="Use these exclusive discount codes to get the best deals on your private theatre booking."
          centered
        />

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full" rounded="lg" />)}
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
            {offers.map((offer, i) => (
              <OfferTicket key={offer.id} offer={offer} index={i} />
            ))}
          </div>
        )}
      </PageShell>
    </>
  )
}

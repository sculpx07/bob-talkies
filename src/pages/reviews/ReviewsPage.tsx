import { useQuery } from '@tanstack/react-query'
import { reviewKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import { Seo } from '@/components/seo/Seo'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { Rating } from '@/components/ui/Rating'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'

interface ReviewData {
  averageRating: number
  totalCount: number
  data: Array<{
    id: string; name: string; rating: number; text: string;
    occasion: string; theatreName: string; date: string;
  }>
}

export default function ReviewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: reviewKeys.list(),
    queryFn: () => api.get<ReviewData>('/reviews'),
  })

  return (
    <>
      <Seo
        title="Customer Reviews | BOB Talkies"
        description="See what customers are saying about their private theatre experience at BOB Talkies, Hyderabad. 4.9 stars, 800+ happy celebrations."
        canonical="/reviews"
      />
      <PageShell>
        {/* Rating header */}
        <div className="text-center mb-14">
          {isLoading ? (
            <div className="space-y-3 flex flex-col items-center">
              <Skeleton className="h-16 w-32" />
              <Skeleton className="h-6 w-48" />
            </div>
          ) : data ? (
            <>
              <div className="font-display text-7xl font-bold text-gold-400 mb-2">{data.averageRating.toFixed(1)}</div>
              <Rating value={data.averageRating} size="lg" className="justify-center mb-2" />
              <p className="text-text-secondary">{data.totalCount.toLocaleString()} reviews on Google</p>
            </>
          ) : null}
        </div>

        <SectionHeader title="What Our Guests Are Saying" centered />

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-56 w-full" rounded="lg" />)}
          </div>
        ) : data ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((review) => (
              <div key={review.id} className="bg-bg-surface border border-border-subtle rounded-card p-6 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center font-bold text-gold-400">
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{review.name}</p>
                      <p className="text-xs text-text-muted">{new Date(review.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <Rating value={review.rating} size="sm" />
                </div>
                <p className="text-text-secondary text-sm leading-relaxed flex-1 mb-3">"{review.text}"</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="gold">{review.occasion}</Badge>
                  <Badge variant="muted">{review.theatreName}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-16 text-center">
          <p className="text-text-secondary mb-6">Ready to create your own story?</p>
          <Button asChild size="xl">
            <Link to="/book">Book Your Private Theatre</Link>
          </Button>
        </div>
      </PageShell>
    </>
  )
}

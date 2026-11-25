import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ChevronRight, MapPin } from 'lucide-react'
import { api } from '@/lib/api/client'
import { theatreKeys } from '@/lib/api/queryKeys'
import { cn } from '@/lib/utils/cn'
import type { Theatre } from '@/schemas/theatre'

function locationLabel(locationId: string) {
  const name = locationId.replace(/^loc-/, '').replace(/-/g, ' ')
  return `${name.replace(/\b\w/g, (c) => c.toUpperCase())}, Hyderabad`
}

const IDENTITY: Record<string, { accent: string; glow: string; gradient: string; label: string }> = {
  delight:     { accent: '#f43f5e', glow: 'rgba(244,63,94,0.28)',   gradient: 'from-[#881337]/80 via-[#be123c]/15 to-transparent', label: 'INTIMATE'   },
  heavens:     { accent: '#a78bfa', glow: 'rgba(167,139,250,0.28)', gradient: 'from-[#4c1d95]/80 via-[#6d28d9]/15 to-transparent', label: 'STYLISH'    },
  filmdom:     { accent: '#fbbf24', glow: 'rgba(251,191,36,0.28)',  gradient: 'from-[#78350f]/80 via-[#b45309]/15 to-transparent', label: 'CINEMATIC'  },
  cosmos:      { accent: '#818cf8', glow: 'rgba(129,140,248,0.28)', gradient: 'from-[#1e1b4b]/80 via-[#3730a3]/15 to-transparent', label: 'GRAND'      },
  'vibe-hall': { accent: '#34d399', glow: 'rgba(52,211,153,0.28)',  gradient: 'from-[#064e3b]/80 via-[#065f46]/15 to-transparent', label: 'PARTY HALL' },
}
const FALLBACK = IDENTITY['delight']

export function FeaturedTheatres() {
  const { data: theatres = [] } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })
  const featured = theatres.filter((t) => t.images[0]).slice(0, 5)

  return (
    <section className="py-14 md:py-20" aria-labelledby="featured-theatres-heading">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-12 items-center">

        {/* ── Left copy ── */}
        <div>
          {/* Decorative title */}
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1.5" aria-hidden>
              <span className="block h-px w-8 bg-gradient-to-r from-transparent to-[#c9a84c]" />
              <span className="text-[#c9a84c] text-sm leading-none">✦</span>
            </span>
            <h2
              id="featured-theatres-heading"
              className="font-display text-2xl md:text-3xl font-black text-[#3d0a24] leading-tight"
            >
              Explore Our Private Theatres
            </h2>
            <span className="flex items-center gap-1.5" aria-hidden>
              <span className="text-[#c9a84c] text-sm leading-none">✦</span>
              <span className="block h-px w-8 bg-gradient-to-l from-transparent to-[#c9a84c]" />
            </span>
          </div>

          <p className="text-base text-[#5b2535] leading-relaxed max-w-xs">
            Five unique theatres. Perfect for every celebration.
          </p>
          <Link
            to="/theatres"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#5c1535]/60 px-6 py-2.5 text-sm font-semibold text-[#5c1535] transition-colors hover:bg-[#5c1535]/5"
          >
            Explore All Theatres <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Cards strip ── */}
        <div
          className="relative overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          }}
        >
          <ul
            className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {featured.map((t, i) => {
              const id = IDENTITY[t.slug] ?? FALLBACK
              return (
                <li key={t.id} className="shrink-0 w-[185px] sm:w-[200px]">
                  <Link
                    to={`/theatres/${t.slug}`}
                    className="group relative flex flex-col overflow-hidden rounded-3xl"
                    style={{ boxShadow: `0 10px 30px rgba(50,16,95,0.15), 0 4px 16px ${id.glow}` }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={t.images[0]}
                        alt={`${t.name} private theatre`}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className={cn('absolute inset-0 bg-gradient-to-t', id.gradient)} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Identity badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className="inline-block rounded-full px-2.5 py-[3px] text-[8px] font-black tracking-[0.22em] uppercase text-white"
                          style={{ background: id.accent }}
                        >
                          {id.label}
                        </span>
                      </div>
                    </div>

                    {/* Info overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="truncate text-base font-semibold text-white">{t.name}</p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1 text-sm text-white/80 min-w-0">
                          <MapPin size={12} className="shrink-0" style={{ color: id.accent }} />
                          <span className="truncate">{locationLabel(t.locationId)}</span>
                        </p>
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                            i === 0 ? 'bg-white text-[#1a1a1a]' : 'bg-[#f3d9a8] text-[#1a1a1a]',
                          )}
                          aria-hidden="true"
                        >
                          <ChevronRight size={18} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

      </div>
    </section>
  )
}

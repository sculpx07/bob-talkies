import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Ticket, X, Pause, Play, Images } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { PriceTag } from '@/components/ui/PriceTag'
import { ErrorState } from '@/components/ui/EmptyState'
import { PageShell } from '@/components/layout/PageShell'
import { api } from '@/lib/api/client'
import { theatreKeys } from '@/lib/api/queryKeys'
import type { Theatre } from '@/schemas/theatre'

const AUTOPLAY_MS = 7000
const CONDENSED = "'Bebas Neue', 'Oswald', 'Anton', 'Arial Narrow', sans-serif"

const pad = (n: number) => String(n).padStart(2, '0')

export default function TheatresPage() {
  const { data: theatres, isLoading, isError, refetch } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })

  const [active, setActive] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [autoPaused, setAutoPaused] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const isPaused = showDetails || autoPaused
  const count = theatres?.length ?? 0

  const go = useCallback(
    (dir: 1 | -1) => {
      if (!count) return
      setActive((i) => (i + dir + count) % count)
    },
    [count],
  )

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // Cards shown on the right = every theatre after the active one, wrapping around
  const upcoming = useMemo(() => {
    if (!theatres?.length) return []
    return Array.from({ length: theatres.length - 1 }, (_, i) => {
      const index = (active + 1 + i) % theatres.length
      return { theatre: theatres[index], index }
    })
  }, [theatres, active])

  const current = theatres?.[active]

  return (
    <>
      <Seo
        title="Our Private Theatres | BOB Talkies Hyderabad"
        description="Explore 5 premium private theatres in Hyderabad — from intimate 2-person suites to grand 40-person celebration halls. 4K, Dolby Atmos, full decoration and photography."
        canonical="/theatres"
      />

      {/* Local styles: condensed display font + slide animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        @keyframes tp-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes tp-rise { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes tp-card { from { opacity: 0; transform: translateX(48px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes tp-zoom { from { transform: scale(1.08) } to { transform: scale(1) } }
        .tp-rise { animation: tp-rise .8s cubic-bezier(.2,.7,.2,1) both }
        .tp-card { animation: tp-card .7s cubic-bezier(.2,.7,.2,1) both }
        .tp-zoom { animation: tp-zoom 1.6s ease-out both }
        .tp-hero:hover .tp-progress { animation-play-state: paused }
        @media (prefers-reduced-motion: reduce) {
          .tp-rise, .tp-card, .tp-zoom { animation: none }
        }
      `}</style>

      <PageShell fullWidth>
        {isError ? (
          <div className="min-h-screen bg-bg-navy flex items-center justify-center px-4">
            <ErrorState title="Failed to Load Theatres" retry={refetch} />
          </div>
        ) : isLoading || !current ? (
          <div className="min-h-screen bg-bg-navy animate-pulse" aria-busy="true" aria-label="Loading theatres" />
        ) : (
          <section
            className="tp-hero relative min-h-screen w-full overflow-hidden bg-bg-navy text-white"
            aria-roledescription="carousel"
            aria-label="Private theatres"
          >
            {/* Background images (cross-fade) */}
            {theatres!.map((t, i) => (
              <div
                key={t.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  i === active ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={i !== active}
              >
                <img
                  key={i === active ? `on-${active}` : `off-${i}`}
                  src={t.images[0]}
                  alt={`${t.name} private theatre`}
                  className={`h-full w-full object-cover ${i === active ? 'tp-zoom' : ''}`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}

            {/* Legibility overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

            {/* Top autoplay progress line — advances the slide when it finishes */}
            <div className="absolute left-0 right-0 top-0 z-20 h-[3px] bg-white/10">
              <div
                key={active}
                className="tp-progress h-full origin-left bg-gold-500"
                style={{
                  animation: `tp-progress ${AUTOPLAY_MS}ms linear forwards`,
                  animationPlayState: isPaused ? 'paused' : 'running',
                }}
                onAnimationEnd={() => { if (!isPaused) go(1) }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col justify-end px-6 pb-28 pt-32 md:px-12 lg:block lg:pb-0 lg:pt-0">
              {/* Left: slide text */}
              <div
                key={current.id}
                className="max-w-xl lg:absolute lg:left-12 lg:top-1/2 lg:-translate-y-[6%]"
              >
                <span className="tp-rise mb-4 block h-[2px] w-5 bg-white" style={{ animationDelay: '.05s' }} />
                <p className="tp-rise text-base text-white/90 md:text-lg" style={{ animationDelay: '.1s' }}>
                  {current.capacityMin}–{current.capacityMax} Guests · {current.screenSize}
                </p>
                <h1
                  className="tp-rise mt-2 text-6xl uppercase leading-[0.95] tracking-wide md:text-7xl lg:text-8xl"
                  style={{ fontFamily: CONDENSED, animationDelay: '.18s' }}
                >
                  {current.name}
                </h1>
                <p
                  className="tp-rise mt-5 max-w-md text-sm leading-relaxed text-white/70 line-clamp-3"
                  style={{ animationDelay: '.28s' }}
                >
                  {current.description}
                </p>

                <div className="tp-rise mt-7 flex flex-wrap items-center gap-4" style={{ animationDelay: '.38s' }}>
                  <Link
                    to={`/book?theatre=${current.id}`}
                    aria-label={`Book ${current.name}`}
                    title="Book this theatre"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-black transition-transform hover:scale-110"
                  >
                    <Ticket size={18} />
                  </Link>
                  <Link
                    to={`/theatres/${current.slug}`}
                    className="rounded-full border border-white/40 px-7 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:border-gold-500 hover:text-gold-500"
                  >
                    Discover Theatre
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setShowDetails(true); setAutoPaused(true) }}
                    className="flex items-center gap-2 rounded-full border border-white/40 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:border-gold-500 hover:text-gold-500"
                  >
                    <Images size={13} /> Gallery
                  </button>
                  <span className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/60">
                    From <PriceTag paise={current.startingPricePaise} />
                  </span>
                </div>
              </div>

              {/* Right: upcoming theatre cards */}
              <div className="mt-10 lg:absolute lg:bottom-[24%] lg:left-[44%] lg:right-0 lg:mt-0 lg:overflow-hidden lg:py-4">
                <div
                  key={active}
                  className="flex gap-4 overflow-x-auto pb-2 lg:overflow-visible lg:pb-0"
                  role="list"
                >
                  {upcoming.map(({ theatre, index }, i) => (
                    <button
                      key={theatre.id}
                      role="listitem"
                      type="button"
                      onClick={() => setActive(index)}
                      aria-label={`Show ${theatre.name}`}
                      className="tp-card group relative h-52 w-36 shrink-0 overflow-hidden rounded-2xl text-left shadow-[0_18px_30px_-10px_rgba(0,0,0,0.65)] outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-gold-500 md:h-60 md:w-40 lg:h-[16.5rem] lg:w-[9.5rem] xl:w-44"
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      <img
                        src={theatre.images[0]}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-white/5 backdrop-blur-[1px]" />
                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <span className="mb-2 block h-[2px] w-3 bg-white/80" />
                        <p className="text-[10px] text-white/80">
                          {theatre.capacityMin}–{theatre.capacityMax} Guests
                        </p>
                        <p
                          className="mt-1 text-xl uppercase leading-[1.05] tracking-wide"
                          style={{ fontFamily: CONDENSED }}
                        >
                          {theatre.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Controls: arrows + progress line + counter + pause */}
              <div className={`absolute inset-x-6 flex items-center gap-4 md:inset-x-12 lg:inset-x-auto lg:left-[44%] lg:right-12 transition-all duration-500 ${showDetails ? 'bottom-[calc(60vh+8px)]' : 'bottom-8 lg:bottom-[9%]'}`}>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous theatre"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:border-gold-500 hover:text-gold-500"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next theatre"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:border-gold-500 hover:text-gold-500"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setAutoPaused(p => !p)}
                  aria-label={autoPaused ? 'Resume auto-advance' : 'Pause auto-advance'}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/50 text-white transition-colors hover:border-gold-500 hover:text-gold-500"
                >
                  {autoPaused ? <Play size={16} /> : <Pause size={16} />}
                </button>

                <div className="relative mx-2 hidden h-px flex-1 bg-white/30 sm:block">
                  <div
                    className="absolute left-0 top-0 h-px bg-gold-500 transition-all duration-700"
                    style={{ width: `${((active + 1) / count) * 100}%` }}
                  />
                </div>

                <span
                  className="ml-auto text-5xl leading-none tracking-wide sm:ml-0"
                  style={{ fontFamily: CONDENSED }}
                  aria-live="polite"
                >
                  {pad(active + 1)}
                </span>
              </div>
            </div>

            {/* Details drawer — slides up from bottom */}
            <div
              className={`absolute inset-x-0 bottom-0 z-30 transition-transform duration-500 ease-in-out ${showDetails ? 'translate-y-0' : 'translate-y-full'}`}
              style={{ height: '60vh' }}
            >
              <div className="h-full overflow-y-auto bg-black/85 backdrop-blur-md border-t border-white/15 px-6 pt-5 pb-8 md:px-12">
                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/40 mb-0.5">Gallery & Details</p>
                    <p className="text-white font-semibold text-lg" style={{ fontFamily: CONDENSED }}>{current?.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDetails(false)}
                    aria-label="Close details"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white/60 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Image gallery strip */}
                <div className="flex gap-3 mb-6 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                  {current?.images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightbox(img)}
                      className="shrink-0 group relative overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-gold-500"
                      style={{ width: 200, height: 120 }}
                    >
                      <img src={img} alt={`${current.name} view ${i + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
                    </button>
                  ))}
                </div>

                {/* Specs row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 pb-5 border-b border-white/10">
                  {[
                    { label: 'Screen', value: current?.screenSize },
                    { label: 'Resolution', value: current?.resolution },
                    { label: 'Sound', value: current?.soundSystem },
                    { label: 'Seating', value: current?.seatingType },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="text-[10px] uppercase tracking-widest text-white/35 mb-1">{s.label}</p>
                      <p className="text-white text-sm font-medium leading-snug">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Full description */}
                <p className="text-white/60 text-sm leading-relaxed mb-5">{current?.description}</p>

                {/* Facilities chips */}
                <div className="flex flex-wrap gap-2">
                  {current?.facilities.map(f => (
                    <span key={f} className="text-[11px] text-white/70 border border-white/20 rounded-full px-3 py-1 bg-white/5">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Lightbox */}
            {lightbox && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
                onClick={() => setLightbox(null)}
              >
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  aria-label="Close image"
                  className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white hover:border-white transition-colors"
                >
                  <X size={18} />
                </button>
                <img
                  src={lightbox.replace('w=1920', 'w=2400').replace('w=1200', 'w=1920')}
                  alt="Theatre"
                  className="max-h-[90vh] max-w-[95vw] rounded-2xl object-contain shadow-2xl"
                  onClick={e => e.stopPropagation()}
                />
              </div>
            )}
          </section>
        )}
      </PageShell>
    </>
  )
}
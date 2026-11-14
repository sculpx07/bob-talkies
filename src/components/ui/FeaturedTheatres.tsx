import { useEffect, useRef } from 'react'
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

  const sectionRef  = useRef<HTMLElement>(null)
  const copyRef     = useRef<HTMLDivElement>(null)
  const stripRef    = useRef<HTMLUListElement>(null)
  const cardRefs    = useRef<(HTMLLIElement | null)[]>([])

  /* ── Scroll-reveal on the copy panel ── */
  useEffect(() => {
    const section = sectionRef.current
    const copy    = copyRef.current
    if (!section || !copy) return

    function onScroll() {
      const rect = section!.getBoundingClientRect()
      const vh   = window.innerHeight
      const cp   = Math.max(0, Math.min((vh - rect.top) / (vh * 0.55), 1))
      copy!.style.opacity   = String(cp)
      copy!.style.transform = `perspective(900px) rotateY(${(1 - cp) * -30}deg) translateX(${(1 - cp) * -50}px)`
    }

    copy.style.opacity    = '0'
    copy.style.transform  = 'perspective(900px) rotateY(-30deg) translateX(-50px)'
    copy.style.willChange = 'transform, opacity'
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Scroll-reveal on each card ── */
  useEffect(() => {
    const section = sectionRef.current
    const cards   = cardRefs.current
    if (!section) return

    function onScroll() {
      const rect = section!.getBoundingClientRect()
      const vh   = window.innerHeight
      const p    = Math.max(0, Math.min((vh - rect.top) / (vh * 0.65), 1))
      const rotY = [-22, -11, 0, 11, 22]

      cards.forEach((card, i) => {
        if (!card) return
        const stagger = i * 0.09
        const cp = Math.max(0, Math.min((p - stagger) / (1 - stagger), 1))
        card.style.opacity   = String(cp)
        card.style.transform = `perspective(1000px) rotateX(${(1 - cp) * 52}deg) rotateY(${(1 - cp) * (rotY[i] ?? 0)}deg) translateY(${(1 - cp) * 110}px) scale(${0.70 + cp * 0.30})`
        card.style.willChange = 'transform, opacity'
      })
    }

    cards.forEach((card) => { if (card) { card.style.opacity = '0'; card.style.willChange = 'transform, opacity' } })
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [featured.length])

  /* ── Auto-scroll the cards strip ── */
  useEffect(() => {
    const el = stripRef.current
    if (!el || featured.length <= 3) return

    let paused   = false
    let frameId: number

    function step() {
      if (!paused) {
        el!.scrollLeft += 0.6
        // loop: once the last card's right edge reaches the scroll end, jump back
        if (el!.scrollLeft >= el!.scrollWidth - el!.clientWidth) {
          el!.scrollLeft = 0
        }
      }
      frameId = requestAnimationFrame(step)
    }

    const pause  = () => { paused = true }
    const resume = () => { paused = false }
    el.addEventListener('mouseenter',  pause)
    el.addEventListener('mouseleave',  resume)
    el.addEventListener('touchstart',  pause,  { passive: true })
    el.addEventListener('touchend',    resume)

    frameId = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(frameId)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
      el.removeEventListener('touchstart', pause)
      el.removeEventListener('touchend',   resume)
    }
  }, [featured.length])

  return (
    <section
      ref={sectionRef}
      className="py-14 md:py-20"
      aria-labelledby="featured-theatres-heading"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-12 items-center">

        {/* ── Left copy (unchanged) ── */}
        <div ref={copyRef}>
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-[#32105f]">
            <span className="h-px w-4 bg-gold-500" aria-hidden="true" />
            Featured Theatres
            <span className="h-px w-4 bg-gold-500" aria-hidden="true" />
          </p>
          <h2 id="featured-theatres-heading" className="mt-4 font-display font-bold text-4xl md:text-5xl leading-[1.1] text-[#2a0e4f]">
            Moments
            <br />
            That Matter
          </h2>
          <p className="mt-5 text-base text-[#5b4578] leading-relaxed max-w-xs">
            Discover our most loved theatres and find the perfect space for your celebration.
          </p>
          <Link
            to="/theatres"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#32105f]/60 px-6 py-2.5 text-sm font-semibold text-[#32105f] transition-colors hover:bg-[#32105f]/5"
          >
            Explore All Theatres <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Auto-scrolling cards strip (all 5) ── */}
        <div
          className="relative overflow-hidden"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
            maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
          }}
        >
          <ul
            ref={stripRef}
            className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1"
            style={{
              scrollbarWidth: 'none',
              perspective: '1000px',
              perspectiveOrigin: 'center bottom',
            }}
          >
            {featured.map((t, i) => {
              const id = IDENTITY[t.slug] ?? FALLBACK
              return (
                <li
                  key={t.id}
                  className="shrink-0 w-[185px] sm:w-[200px]"
                  ref={(el) => { cardRefs.current[i] = el }}
                >
                  <Link
                    to={`/theatres/${t.slug}`}
                    className="group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1"
                    style={{ boxShadow: `0 10px_30px_rgba(50,16,95,0.15), 0 4px 16px ${id.glow}` }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={t.images[0]}
                        alt={`${t.name} private theatre`}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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

                    {/* Info */}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="truncate text-base font-semibold text-white">{t.name}</p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <p className="flex items-center gap-1 text-sm text-white/80 min-w-0">
                          <MapPin size={12} className="shrink-0" style={{ color: id.accent }} />
                          <span className="truncate">{locationLabel(t.locationId)}</span>
                        </p>
                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110',
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

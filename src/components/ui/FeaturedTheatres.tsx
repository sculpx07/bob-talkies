import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, ChevronRight, MapPin } from 'lucide-react'
import { api } from '@/lib/api/client'
import { theatreKeys } from '@/lib/api/queryKeys'
import { cn } from '@/lib/utils/cn'
import type { Theatre } from '@/schemas/theatre'

/** "loc-kukatpally" -> "Kukatpally, Hyderabad" */
function locationLabel(locationId: string) {
  const name = locationId.replace(/^loc-/, '').replace(/-/g, ' ')
  return `${name.replace(/\b\w/g, (c) => c.toUpperCase())}, Hyderabad`
}

export function FeaturedTheatres() {
  const { data: theatres = [] } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })
  const featured = theatres.filter((t) => t.images[0]).slice(0, 3)

  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current
    const cards = cardRefs.current
    if (!section) return

    function onScroll() {
      const rect = section!.getBoundingClientRect()
      const vh = window.innerHeight
      // p = 0 when section top is at bottom of screen, 1 when section top is 40% up the screen
      const p = Math.max(0, Math.min((vh - rect.top) / (vh * 0.65), 1))

      // Left copy: sweeps in from the left with a Y-rotation
      if (copy) {
        const cp = Math.max(0, Math.min((vh - rect.top) / (vh * 0.55), 1))
        copy.style.opacity = String(cp)
        copy.style.transform = `perspective(900px) rotateY(${(1 - cp) * -30}deg) translateX(${(1 - cp) * -50}px)`
      }

      // Cards: each rises from deep below with tilt, staggered by index
      cards.forEach((card, i) => {
        if (!card) return
        // stagger: card i starts animating slightly later
        const stagger = i * 0.12
        const cp = Math.max(0, Math.min((p - stagger) / (1 - stagger), 1))
        const rotX = (1 - cp) * 52     // tilted back 52° → 0°
        const rotY = (1 - cp) * (i === 1 ? 0 : i === 0 ? -18 : 18) // outer cards fan in
        const ty   = (1 - cp) * 110    // rises 110px
        const sc   = 0.7 + cp * 0.3    // grows from 70% to 100%
        const op   = cp                 // fades in

        card.style.opacity = String(op)
        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(${ty}px) scale(${sc})`
        card.style.willChange = 'transform, opacity'
      })
    }

    // Set initial hidden state
    if (copy) {
      copy.style.opacity = '0'
      copy.style.transform = 'perspective(900px) rotateY(-30deg) translateX(-50px)'
      copy.style.willChange = 'transform, opacity'
    }
    cards.forEach((card) => {
      if (!card) return
      card.style.opacity = '0'
      card.style.willChange = 'transform, opacity'
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // run once in case section already visible
    return () => window.removeEventListener('scroll', onScroll)
  }, [featured.length])

  return (
    <section
      ref={sectionRef}
      className="py-14 md:py-20"
      aria-labelledby="featured-theatres-heading"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-12 items-center">
        {/* Left copy */}
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

        {/* Cards */}
        <ul className="grid gap-5 sm:grid-cols-3" style={{ perspective: '1000px', perspectiveOrigin: 'center bottom' }}>
          {featured.map((t, i) => (
            <li
              key={t.id}
              ref={(el) => { cardRefs.current[i] = el }}
            >
              <Link
                to={`/theatres/${t.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-3xl shadow-[0_10px_30px_rgba(50,16,95,0.15)]"
              >
                <img
                  src={t.images[0]}
                  alt={`${t.name} private theatre`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-white">{t.name}</p>
                    <p className="mt-1.5 flex items-center gap-1 text-sm text-white/85">
                      <MapPin size={13} className="text-gold-400 shrink-0" /> <span className="truncate">{locationLabel(t.locationId)}</span>
                    </p>
                  </div>
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
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

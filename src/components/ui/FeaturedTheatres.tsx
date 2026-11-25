import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Users } from 'lucide-react'
import { api } from '@/lib/api/client'
import { theatreKeys } from '@/lib/api/queryKeys'
import { formatINR } from '@/lib/utils/currency'
import type { Theatre } from '@/schemas/theatre'

export function FeaturedTheatres() {
  const { data: theatres = [] } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })
  const featured = theatres.filter((t) => t.images[0]).slice(0, 5)
  const stripRef = useRef<HTMLUListElement>(null)

  // slow auto-scroll to the left, looping seamlessly over a duplicated list; pauses on hover
  useEffect(() => {
    const node = stripRef.current
    if (!node || featured.length === 0) return
    let frameId = 0
    let paused = false
    let pos = node.scrollLeft
    const step = () => {
      const loop = node.scrollWidth / 2
      if (!paused && loop > 0) {
        if (Math.abs(node.scrollLeft - pos) > 2) pos = node.scrollLeft // visitor scrolled by hand
        pos += 0.6
        if (pos >= loop) pos = 0
        node.scrollLeft = pos
      }
      frameId = requestAnimationFrame(step)
    }
    const pause = () => { paused = true }
    const resume = () => { paused = false }
    node.addEventListener('mouseenter', pause)
    node.addEventListener('mouseleave', resume)
    frameId = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(frameId)
      node.removeEventListener('mouseenter', pause)
      node.removeEventListener('mouseleave', resume)
    }
  }, [featured.length])

  return (
    <section className="py-14 md:py-20" aria-labelledby="featured-theatres-heading">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-12 items-center">

        {/* ── Left copy ── */}
        <div>
          {/* Decorative title */}
          <div className="mb-4">
            <h2
              id="featured-theatres-heading"
              className="font-display text-2xl md:text-3xl font-black text-white leading-tight"
            >
              Explore Our Private Theatres
            </h2>
          </div>

          <p className="text-base text-white/80 leading-relaxed max-w-xs">
            Five unique theatres. Perfect for every celebration.
          </p>
          <Link
            to="/theatres"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#f5d7a1]/70 px-6 py-2.5 text-sm font-semibold text-[#f5d7a1] transition-colors hover:bg-white/10"
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
            ref={stripRef}
            className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {[...featured, ...featured].map((t, n) => {
              const i = n % featured.length
              return (
                <li key={`${t.id}-${n}`} aria-hidden={n >= featured.length || undefined} className="shrink-0 w-[236px] sm:w-[250px]">
                  <Link
                    to={`/theatres/${t.slug}`}
                    className="group flex flex-col rounded-[1.75rem] border border-[#f3d9e4] p-2.5 transition-shadow hover:shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
                    style={{ background: 'linear-gradient(180deg,#fffdfb 0%,#fdf1ef 100%)', boxShadow: '0 10px 28px rgba(0,0,0,0.28)' }}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                      <img
                        src={t.images[0]}
                        alt={`${t.name} private theatre`}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>

                    <div className="px-1.5 pb-1 pt-3">
                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-display text-xl font-bold text-[#3d0a24]">{t.name}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-[#5b2535]/80">
                            <Users size={13} className="shrink-0" />
                            {t.capacityMin} – {t.capacityMax} Guests
                          </p>
                        </div>
                        <div className="shrink-0 rounded-xl bg-[#f8e7d6] px-2.5 py-1 text-right">
                          <p className="text-[9px] font-medium leading-none text-[#5b2535]/70">From</p>
                          <p className="mt-0.5 text-sm font-black leading-none text-[#3d0a24]">{formatINR(t.startingPricePaise)}</p>
                        </div>
                      </div>
                      <span
                        className="mt-3 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#5c1a6b 0%,#3d0a4f 100%)' }}
                      >
                        View &amp; Book <ArrowRight size={15} />
                      </span>
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

import { Link } from 'react-router-dom'
import type { Theatre } from '@/schemas/theatre'

const CARD_W = 168
const GAP = 24
const UNIT = CARD_W + GAP
const TILTS = [-4, 3, -2, 4, -3, 2]

/** One string segment: a gentle smooth wave, one per card, so the string looks continuous. */
function StringSegment() {
  const u = UNIT
  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      width={u}
      height="44"
      viewBox={`0 0 ${u} 44`}
      aria-hidden="true"
    >
      <path
        d={`M0 8 C${u * 0.25} 8 ${u * 0.25} 22 ${u * 0.5} 22 S${u * 0.75} 8 ${u} 8`}
        fill="none"
        stroke="#8b7f78"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
    </svg>
  )
}

/** Smoothly sliding row of theatre photos (seats, screens, film running) hanging from a string. */
export function TheatreStrip({ theatres }: { theatres: Theatre[] }) {
  // every photo of every theatre
  const items = theatres.flatMap((t) => t.images.map((src, i) => ({ key: `${t.id}-${i}`, src, theatre: t })))
  if (items.length === 0) return null
  const loop = [...items, ...items]

  return (
    <div
      className="group relative left-1/2 mt-10 w-screen -translate-x-1/2 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      aria-label="Our theatres"
    >
      <ul
        className="flex w-max animate-marquee will-change-transform group-hover:[animation-play-state:paused]"
        style={{ ['--marquee-distance' as string]: `-${items.length * UNIT}px` }}
      >
        {loop.map((it, k) => (
          <li key={`${it.key}-${k}`} className="relative shrink-0" style={{ width: UNIT, height: 300 }} aria-hidden={k >= items.length}>
            <StringSegment />
            <Link
              to={`/theatres/${it.theatre.slug}`}
              tabIndex={k >= items.length ? -1 : undefined}
              className="absolute left-1/2 top-[34px] block origin-top rounded-[18px] bg-white p-2 shadow-[0_6px_20px_rgba(50,16,95,0.12)] transition-transform duration-300 hover:scale-105"
              style={{ width: CARD_W, transform: `translateX(-50%) rotate(${TILTS[k % TILTS.length]}deg)` }}
              aria-label={it.theatre.name}
            >
              {/* green clip pinned on the string */}
              <span className="absolute -top-[13px] left-1/2 h-[22px] w-3 -translate-x-1/2 rounded-b-[2px] rounded-t-[6px] bg-[#22b24c]" aria-hidden="true">
                <span className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/80" />
              </span>
              <img
                src={it.src}
                alt={`${it.theatre.name} private theatre`}
                loading="lazy"
                draggable={false}
                className="h-[150px] w-full rounded-[12px] object-cover"
              />
              <div className="px-1 pb-1 pt-2 text-left">
                <p className="font-body text-[13px] font-bold leading-tight text-[#1a1a1a]">{it.theatre.name}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

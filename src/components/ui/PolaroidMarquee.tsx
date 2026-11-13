import { Link } from 'react-router-dom'
import { OCCASIONS } from '@/content/occasions'

const CARD_W = 178
const GAP = 34
const UNIT = CARD_W + GAP

/** One string segment: rises at both edges, sags in the middle where the card hangs.
 *  Segments sit side by side so the string reads as one continuous drooping line. */
function StringSegment() {
  const u = UNIT
  return (
    <svg
      className="absolute left-0 top-0 pointer-events-none"
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

const TILTS = [-4, 3, -2, 4, -3, 2]

function Card({ index }: { index: number }) {
  const o = OCCASIONS[index % OCCASIONS.length]
  const tilt = TILTS[index % TILTS.length]
  return (
    <li className="relative shrink-0" style={{ width: UNIT, height: 300 }}>
      <StringSegment />
      <Link
        to={`/celebrations/${o.slug}`}
        className="absolute left-1/2 top-[34px] block bg-white rounded-[18px] p-2 shadow-[0_6px_20px_rgba(50,16,95,0.12)] origin-top transition-transform duration-300 hover:scale-105"
        style={{ width: CARD_W, transform: `translateX(-50%) rotate(${tilt}deg)` }}
        aria-label={`${o.label} celebrations`}
      >
        {/* green clip pinned on the string */}
        <span className="absolute -top-[13px] left-1/2 -translate-x-1/2 w-3 h-[22px] rounded-t-[6px] rounded-b-[2px] bg-[#22b24c]" aria-hidden="true">
          <span className="absolute left-1/2 -translate-x-1/2 top-1.5 w-1.5 h-1.5 rounded-full bg-white/80" />
        </span>
        <img
          src={o.heroImage}
          alt=""
          loading="lazy"
          draggable={false}
          className="w-full h-[150px] object-cover rounded-[12px]"
        />
        <div className="px-1 pt-2 pb-1 text-left">
          <p className="text-[13px] font-bold text-[#1a1a1a] font-body leading-tight">{o.label}</p>
          <p className="mt-0.5 text-[9px] leading-snug text-[#8a8a94] font-body line-clamp-1">{o.subheading}</p>
        </div>
      </Link>
    </li>
  )
}

export function PolaroidMarquee() {
  const count = OCCASIONS.length
  const items = Array.from({ length: count }, (_, i) => i)
  return (
    <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden mt-10 group [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" aria-label="Celebrations gallery">
      <ul
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused] will-change-transform"
        style={{ ['--marquee-distance' as string]: `-${count * UNIT}px` }}
      >
        {[...items, ...items].map((i, k) => (
          <Card key={k} index={i} />
        ))}
      </ul>
    </div>
  )
}

import { Play, BadgeCheck } from 'lucide-react'

const HANDLE = 'bob_talkies'
const IG_URL = 'https://www.instagram.com/bob_talkies/'

const POSTS = [
  { label: 'Surprise Birthday', img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=600&q=80' },
  { label: '5th Anniversary', img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80' },
  { label: 'She Said Yes!', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80' },
  { label: 'Squad Night Out', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80' },
  { label: 'Birthday Bash', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80' },
  { label: 'IPL Final', img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80' },
  { label: 'Date Night', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
  { label: 'Family Celebration', img: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=600&q=80' },
]

// Instagram's own action icons (outline style, as shown on instagram.com)
const igProps = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
const IgHeart = () => (
  <svg {...igProps}><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938Z" /></svg>
)
const IgComment = () => (
  <svg {...igProps}><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" /></svg>
)
const IgShare = () => (
  <svg {...igProps}><line x1="22" x2="9.218" y1="3" y2="10.083" /><polygon points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" /></svg>
)
const IgSave = () => (
  <svg {...igProps}><polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21" /></svg>
)

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function InstagramSection() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-[#c9933a]"><InstagramIcon size={16} /> Instagram</p>
            <h2 className="font-display text-3xl font-medium leading-tight text-white md:text-4xl">Follow us on Instagram</h2>
            <p className="mt-2 text-white/80">Real celebrations, decor ideas and surprises from our guests — <span className="font-semibold text-[#f5d7a1]">@{HANDLE}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <a href={IG_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#c9933a,#e8b95c)] !text-[#3d0a24] px-6 text-sm font-bold text-white shadow-[0_12px_26px_rgba(50,16,95,0.3)] transition-transform hover:-translate-y-0.5">
              <InstagramIcon size={16} /> Follow
            </a>
          </div>
        </div>
      </div>

      <style>{`@keyframes ig-marquee{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}@media (prefers-reduced-motion:reduce){.ig-track{animation:none!important}}`}</style>
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="ig-track flex w-max pb-12 pt-4 hover:[animation-play-state:paused]" style={{ animation: 'ig-marquee 50s linear infinite' }}>
          {[...POSTS, ...POSTS].map((p, i) => (
            <a
              key={`${p.label}-${i}`}
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-hidden={i >= POSTS.length ? true : undefined}
              tabIndex={i >= POSTS.length ? -1 : undefined}
              className="group mr-5 w-[270px] shrink-0 overflow-hidden rounded-[1.75rem] glass-card bg-white shadow-[0_18px_44px_rgba(107,35,152,0.16)] ring-1 ring-[#f8dce4] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_rgba(107,35,152,0.26)]"
            >
              <div className="flex items-center gap-2.5 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#5c1535,#a81a3a)] p-[2px]">
                  <img src="/logo.png" alt="" className="h-full w-full rounded-full bg-white object-contain p-0.5" />
                </span>
                <span className="flex min-w-0 flex-1 items-center gap-1 text-sm font-semibold text-[#3d0a24]"><span className="truncate">{HANDLE}</span><BadgeCheck size={15} className="shrink-0 text-[#3b82f6]" /></span>
                <span className="text-lg leading-none text-[#9a6575]">···</span>
              </div>

              <div className="relative aspect-[4/5] overflow-hidden bg-[#f3e8fa]">
                <img src={p.img} alt={p.label} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#5c1535]/70 via-transparent to-transparent" aria-hidden="true" />
                <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#8b1a3a] shadow-lg transition-transform group-hover:scale-110"><Play size={22} fill="currentColor" /></span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                  <p className="mb-2 text-sm font-bold text-white">{p.label}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 px-4 py-3.5 text-[#3d0a24]">
                <IgHeart /><IgComment /><IgShare />
                <span className="ml-auto"><IgSave /></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

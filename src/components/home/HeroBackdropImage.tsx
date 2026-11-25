import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useReducedMotion } from 'framer-motion'
import { api } from '@/lib/api/client'
import { theatreKeys } from '@/lib/api/queryKeys'
import type { Theatre } from '@/schemas/theatre'

/**
 * Home hero artwork: the cleaned auditorium picture (no baked-in screen content).
 * The theatre screen then plays a loop: the BoB Talkies logo (breathing + golden glow), followed by the
 * theatre photos one by one, then back to the logo.
 *
 * Sizing replicates `background-size: cover; background-position: center top` for the 1672 x 941 picture,
 * so the screen stays glued to the artwork at every viewport. The screen content lives in a fixed 1672 x 941
 * "stage" that is scaled to the picture, and is pinned to the screen's four corners with a perspective
 * (matrix3d) transform, so nothing can spill outside the screen.
 */

const W = 1672
const H = 941
// the four corners of the projection screen inside the 1672 x 941 picture (a hair inside the black frame)
const SCREEN: [number, number][] = [
  [1141, 179], // top-left
  [1478, 109.5], // top-right
  [1484, 270.5], // bottom-right
  [1141, 275], // bottom-left
]
// size of the flat surface that gets mapped onto those corners (2.5 : 1, close to the screen's shape)
const CW = 1000
const CH = 400

// birthday and proposal photos already used on the Gallery page, interleaved after the theatre photos
const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`
const BIRTHDAY = [19310813, 9319090, 1684039, 1729808]
const PROPOSAL = [11643622, 16662071, 18612640, 3038145]
const CELEBRATION_PHOTOS = BIRTHDAY.flatMap((b, i) => [
  { id: `bd-${b}`, src: px(b), name: 'Birthday' },
  { id: `pr-${PROPOSAL[i]}`, src: px(PROPOSAL[i]), name: 'Proposal' },
])

const LOGO_MS = 4600
const SLIDE_MS = 3200
const FADE_MS = 1200

/** CSS matrix3d that maps the rectangle (0,0)-(w,h) onto the quad `q` (TL, TR, BR, BL). */
function quadMatrix(w: number, h: number, q: [number, number][]) {
  const src: [number, number][] = [[0, 0], [w, 0], [w, h], [0, h]]
  const A: number[][] = []
  const b: number[] = []
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i]
    const [u, v] = q[i]
    A.push([x, y, 1, 0, 0, 0, -x * u, -y * u])
    b.push(u)
    A.push([0, 0, 0, x, y, 1, -x * v, -y * v])
    b.push(v)
  }
  // gaussian elimination
  const n = 8
  for (let i = 0; i < n; i++) {
    let p = i
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r
    ;[A[i], A[p]] = [A[p], A[i]]
    ;[b[i], b[p]] = [b[p], b[i]]
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i]
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]
      b[r] -= f * b[i]
    }
  }
  const h8 = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i]
    for (let c = i + 1; c < n; c++) s -= A[i][c] * h8[c]
    h8[i] = s / A[i][i]
  }
  const [a, bb, c, d, e, f, g, h2] = h8
  return `matrix3d(${a},${d},0,${g},${bb},${e},0,${h2},0,0,1,0,${c},${f},0,1)`
}

export function HeroBackdropImage() {
  const reduce = useReducedMotion()
  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [step, setStep] = useState(0)

  const { data: theatres = [] } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })
  const photos = useMemo(
    () => [...theatres.map((t) => ({ id: t.id, src: t.images[0], name: t.name })).filter((p) => p.src), ...CELEBRATION_PHOTOS],
    [theatres],
  )
  // only mount a photo once the loop is about to reach it, so the extra images don't all load up front
  const [reached, setReached] = useState(2)
  // step 0 = logo, 1..n = theatre photos
  const total = 1 + photos.length

  // keep the stage scaled to the rendered picture width
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const update = () => setScale(el.getBoundingClientRect().width / W)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // advance the loop (reduced motion: stay on the logo)
  useEffect(() => {
    if (reduce || total < 2) return
    const t = window.setTimeout(() => setStep((s) => (s + 1) % total), step === 0 ? LOGO_MS : SLIDE_MS)
    return () => window.clearTimeout(t)
  }, [step, total, reduce])

  const matrix = useMemo(() => quadMatrix(CW, CH, SCREEN), [])
  const active = reduce ? 0 : step % total
  useEffect(() => {
    // mount the current photo and the NEXT one, so the next image is already loaded when its turn comes
    setReached((r) => Math.max(r, active + 2))
  }, [active])

  return (
    <div
      className="hero-curve pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        containerType: 'size',
        // solid deep purple hero base (no fade mask), ended by the curved ivory edge at the bottom
        background: 'linear-gradient(180deg, #2a0430 0%, #3d0a43 55%, #4a0b4e 100%)',
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes heroLogoBreath {
          0%, 100% { transform: scale(1);     filter: drop-shadow(0 0 6px rgba(255,205,110,0.35)) drop-shadow(0 0 16px rgba(255,190,80,0.18)); }
          50%      { transform: scale(1.035); filter: drop-shadow(0 0 14px rgba(255,214,130,0.9)) drop-shadow(0 0 34px rgba(255,190,80,0.5)); }
        }
        /* the hero ends in a soft curve; whatever is behind (the page background) shows below it */
        .hero-curve { --curve-h: 32px;
          -webkit-mask-image: linear-gradient(#000,#000), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 56' preserveAspectRatio='none'%3E%3Cpath d='M0 0 L0 30 C280 6 520 4 760 20 C1020 38 1240 30 1440 10 L1440 0 Z' fill='%23000'/%3E%3C/svg%3E");
          mask-image: linear-gradient(#000,#000), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 56' preserveAspectRatio='none'%3E%3Cpath d='M0 0 L0 30 C280 6 520 4 760 20 C1020 38 1240 30 1440 10 L1440 0 Z' fill='%23000'/%3E%3C/svg%3E");
          -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
          -webkit-mask-size: 100% calc(100% - var(--curve-h) + 1px), 100% var(--curve-h);
          mask-size: 100% calc(100% - var(--curve-h) + 1px), 100% var(--curve-h);
          -webkit-mask-position: top, bottom; mask-position: top, bottom; }
        @media (min-width: 768px) { .hero-curve { --curve-h: 56px; } }
        .hero-screen-logo { transform-origin: 50% 50%; }
        .hero-screen-logo.is-on { animation: heroLogoBreath 4s ease-in-out infinite; will-change: transform, filter; }
        /* incoming slide fades in on top while the outgoing one stays fully opaque beneath it, then drops out: no dark dip */
        .hero-slide { opacity: 0; z-index: 1; transition: opacity 0s linear ${FADE_MS}ms; }
        .hero-slide.is-on { opacity: 1; z-index: 2; transition: opacity ${FADE_MS}ms ease-in-out; }
        .hero-photo img { transform: scale(1); transition: transform 0s linear ${FADE_MS}ms; }
        .hero-photo.is-on img { transform: scale(1.07); transition: transform ${SLIDE_MS + FADE_MS}ms linear; }
        /* narrow screens: fit the whole picture to the width at the top so the screen stays in view */
        .hero-frame { position: absolute; top: 0; left: 0; width: 100cqw;
          -webkit-mask-image: linear-gradient(to bottom, #000 72%, transparent 100%); mask-image: linear-gradient(to bottom, #000 72%, transparent 100%); }
        @media (min-width: 1200px) {
          .hero-frame { left: 50%; transform: translateX(-50%); width: max(100cqw, calc(100cqh * ${W} / ${H}));
            -webkit-mask-image: none; mask-image: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-screen-logo.is-on { animation: none; will-change: auto; }
          .hero-slide, .hero-photo img { transition: none; }
        }
      `}</style>

      <div
        ref={frameRef}
        className="hero-frame"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        <img src="/bg-1-clean.png" alt="" className="block h-full w-full select-none" draggable={false} />

        {/* screen content, laid out in picture coordinates and scaled to the picture */}
        <div className="absolute left-0 top-0" style={{ width: W, height: H, transformOrigin: '0 0', transform: `scale(${scale})` }}>
          <div
            className="absolute left-0 top-0 overflow-hidden"
            style={{ width: CW, height: CH, transformOrigin: '0 0', transform: matrix, background: '#3a0a4e' }}
          >
            {/* logo phase */}
            <div className={`hero-slide absolute inset-0 flex items-center justify-center ${active === 0 ? 'is-on' : ''}`}>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(18,2,28,0.62) 0%, rgba(18,2,28,0.35) 45%, rgba(18,2,28,0) 75%)' }} />
              <img
                src="/logo 2.png"
                alt=""
                draggable={false}
                className={`hero-screen-logo relative select-none ${active === 0 ? 'is-on' : ''}`}
                style={{ height: '96%', width: 'auto' }}
              />
            </div>

            {/* theatre photos */}
            {photos.map((p, i) => i + 1 <= reached && (
              <div key={p.id} className={`hero-slide hero-photo absolute inset-0 ${active === i + 1 ? 'is-on' : ''}`}>
                <img src={p.src} alt="" draggable={false} className="h-full w-full select-none object-cover" style={{ objectPosition: 'center' }} />
                {/* a touch of projector light and a soft vignette so it sits on the screen */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(90,20,130,0.08), rgba(20,0,30,0.06))' }} />
                <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 70px 14px rgba(15,0,25,0.32)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

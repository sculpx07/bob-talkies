import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export interface AlbumPhoto {
  src: string
  alt: string
}

interface AlbumViewerProps {
  photos: AlbumPhoto[]
  /** index of the opened photo, or null when closed */
  index: number | null
  onClose: () => void
  onChange: (index: number) => void
}

const big = (src: string) => src.replace('w=600', 'w=1400')

/** One half of a photo spread: the left or right half of the image, clipped to its page. */
function Half({ src, side, className = '' }: { src: string; side: 'left' | 'right'; className?: string }) {
  return (
    <div className={`absolute top-0 h-full w-1/2 overflow-hidden ${side === 'left' ? 'left-0' : 'left-1/2'} ${className}`}>
      <img
        src={big(src)}
        alt=""
        draggable={false}
        className="absolute top-0 h-full w-[200%] max-w-none object-cover"
        style={{ left: side === 'left' ? 0 : '-100%' }}
      />
    </div>
  )
}

/** Photo-album viewer: opens like a book and turns its pages like a real album. */
export function AlbumViewer({ photos, index, onClose, onChange }: AlbumViewerProps) {
  const [flip, setFlip] = useState<1 | -1 | null>(null)
  const open = index !== null
  const n = photos.length

  const go = useCallback(
    (step: 1 | -1) => {
      if (index === null || n < 2 || flip) return
      setFlip(step)
    },
    [index, n, flip],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go, onClose])

  const cur = index !== null ? photos[index] : null
  const nxt = index !== null ? photos[(index + 1) % n] : null
  const prv = index !== null ? photos[(index - 1 + n) % n] : null
  const prevStack = index !== null ? [1, 2, 3].map((k) => photos[(index - k + n * 4) % n]) : []
  const nextStack = index !== null ? [1, 2, 3].map((k) => photos[(index + k) % n]) : []

  function finishFlip() {
    if (index === null || flip === null) return
    const target = (index + flip + n) % n
    setFlip(null)
    onChange(target)
  }

  return (
    <AnimatePresence>
      {open && cur && nxt && prv && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b0b3a]/90 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Photo album"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close album"
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <X size={22} />
          </button>

          {n > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => { e.stopPropagation(); go(-1) }}
                className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25 md:left-8"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => { e.stopPropagation(); go(1) }}
                className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25 md:right-8"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}

          {/* the book */}
          <div className="w-full max-w-[1000px] [perspective:2200px]" onClick={(e) => e.stopPropagation()}>
            <motion.div
              className="relative mx-auto aspect-[16/10] w-[82%] [transform-style:preserve-3d] md:w-[78%]"
              initial={{ opacity: 0, scale: 0.55, rotateX: 28, rotateY: -40, y: 60 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, rotateX: 20, rotateY: 30, y: 40 }}
              transition={{ type: 'spring', stiffness: 120, damping: 17 }}
            >
              {/* page stacks on both sides */}
              {prevStack.map((p, k) => (
                <div
                  key={`l${k}`}
                  className="absolute top-[4%] h-[92%] w-[9%] overflow-hidden rounded-l-md shadow-xl"
                  style={{ right: `${100 - k * 2.2}%`, transform: 'rotateY(62deg)', transformOrigin: 'right center', opacity: 1 - k * 0.2 }}
                >
                  <img src={p.src} alt="" className="h-full w-full object-cover" draggable={false} />
                  <span className="absolute inset-0 bg-gradient-to-r from-black/45 to-transparent" />
                </div>
              ))}
              {nextStack.map((p, k) => (
                <div
                  key={`r${k}`}
                  className="absolute top-[4%] h-[92%] w-[9%] overflow-hidden rounded-r-md shadow-xl"
                  style={{ left: `${100 - k * 2.2}%`, transform: 'rotateY(-62deg)', transformOrigin: 'left center', opacity: 1 - k * 0.2 }}
                >
                  <img src={p.src} alt="" className="h-full w-full object-cover" draggable={false} />
                  <span className="absolute inset-0 bg-gradient-to-l from-black/45 to-transparent" />
                </div>
              ))}

              {/* the open spread */}
              <div className="absolute inset-0 rounded-md bg-[#f6efe6] shadow-[0_30px_80px_rgba(0,0,0,0.55)] [transform-style:preserve-3d]">
                {/* static pages underneath */}
                {flip === 1 ? (
                  <>
                    <Half src={cur.src} side="left" className="rounded-l-md" />
                    <Half src={nxt.src} side="right" className="rounded-r-md" />
                  </>
                ) : flip === -1 ? (
                  <>
                    <Half src={prv.src} side="left" className="rounded-l-md" />
                    <Half src={cur.src} side="right" className="rounded-r-md" />
                  </>
                ) : (
                  <>
                    <Half src={cur.src} side="left" className="rounded-l-md" />
                    <Half src={cur.src} side="right" className="rounded-r-md" />
                  </>
                )}

                {/* the turning leaf: front face = page being lifted, back face = the page it reveals */}
                {flip !== null && (
                  <motion.div
                    key={`${index}-${flip}`}
                    className="absolute top-0 h-full w-1/2 [transform-style:preserve-3d]"
                    style={{
                      left: flip === 1 ? '50%' : 0,
                      transformOrigin: flip === 1 ? 'left center' : 'right center',
                    }}
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: flip === 1 ? -180 : 180 }}
                    transition={{ duration: 0.95, ease: [0.45, 0.05, 0.25, 1] }}
                    onAnimationComplete={finishFlip}
                  >
                    {/* front */}
                    <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden]">
                      <img
                        src={big(cur.src)}
                        alt=""
                        draggable={false}
                        className="absolute top-0 h-full w-[200%] max-w-none object-cover"
                        style={{ left: flip === 1 ? '-100%' : 0 }}
                      />
                      <motion.span
                        className="absolute inset-0 bg-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.45, 0.45] }}
                        transition={{ duration: 0.95 }}
                      />
                    </div>
                    {/* back */}
                    <div className="absolute inset-0 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <img
                        src={big((flip === 1 ? nxt : prv).src)}
                        alt=""
                        draggable={false}
                        className="absolute top-0 h-full w-[200%] max-w-none object-cover"
                        style={{ left: flip === 1 ? 0 : '-100%' }}
                      />
                      <motion.span
                        className="absolute inset-0 bg-black"
                        initial={{ opacity: 0.45 }}
                        animate={{ opacity: [0.45, 0.45, 0] }}
                        transition={{ duration: 0.95 }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* spine + page shading */}
                <span className="pointer-events-none absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/40 to-transparent" />
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-l-md bg-gradient-to-r from-black/15 via-transparent to-black/10" />
                <span className="pointer-events-none absolute inset-y-0 right-0 w-1/2 rounded-r-md bg-gradient-to-l from-black/15 via-transparent to-black/5" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

import { useRef, type ReactNode } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'

/**
 * Scroll-reveal wrapper. Each style is a different premium entrance so every homepage
 * section animates its own way. Plays once, when ~15% of the section is on screen,
 * and respects the visitor's reduced-motion setting.
 */
export type RevealStyle =
  | 'curtain'   // clip-path wipes open from the centre, like a stage curtain
  | 'rise'      // soft rise with a blur-to-sharp focus pull
  | 'zoom'      // slow cinematic zoom-out from slightly oversized
  | 'tilt'      // 3D flip up from a tilted plane
  | 'slide'     // slides in from the side with a skew that settles
  | 'unfold'    // scales open from the top edge

const EASE = [0.22, 1, 0.36, 1] as const

const STYLES: Record<RevealStyle, Variants> = {
  curtain: {
    hidden: { opacity: 0, clipPath: 'inset(0% 50% 0% 50%)' },
    show: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 1.1, ease: EASE } },
  },
  rise: {
    hidden: { opacity: 0, y: 90, filter: 'blur(14px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.95, ease: EASE } },
  },
  zoom: {
    hidden: { opacity: 0, scale: 1.12 },
    show: { opacity: 1, scale: 1, transition: { duration: 1.2, ease: EASE } },
  },
  tilt: {
    hidden: { opacity: 0, rotateX: 18, y: 60, transformPerspective: 1200, transformOrigin: '50% 100%' },
    show: { opacity: 1, rotateX: 0, y: 0, transformPerspective: 1200, transition: { duration: 1.05, ease: EASE } },
  },
  slide: {
    hidden: { opacity: 0, x: -110, skewX: -4 },
    show: { opacity: 1, x: 0, skewX: 0, transition: { duration: 1, ease: EASE } },
  },
  unfold: {
    hidden: { opacity: 0, scaleY: 0.82, transformOrigin: '50% 0%' },
    show: { opacity: 1, scaleY: 1, transformOrigin: '50% 0%', transition: { duration: 1, ease: EASE } },
  },
}

export function SectionReveal({ children, style = 'rise', className }: { children: ReactNode; style?: RevealStyle; className?: string }) {
  const watchRef = useRef<HTMLDivElement>(null)
  const motionRef = useRef<HTMLDivElement>(null)
  // the visibility check lives on an unclipped outer wrapper, so clip-path styles can still be detected
  const seen = useInView(watchRef, { once: true, amount: 0.12 })
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce) return <div className={className}>{children}</div>
  return (
    <div ref={watchRef} className={className}>
      <motion.div
        ref={motionRef}
        variants={STYLES[style]}
        initial="hidden"
        animate={seen ? 'show' : 'hidden'}
        // the curtain clip is only needed while opening; release it so shadows are never cut off
        onAnimationComplete={(def) => { if (def === 'show' && motionRef.current) motionRef.current.style.clipPath = 'none' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

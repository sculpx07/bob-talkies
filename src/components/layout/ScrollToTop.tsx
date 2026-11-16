import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

const SHOW_AFTER_PX = 400

/** Plain round "back to top" button. Sits just above the WhatsApp button. */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, y: 24, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.6 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          whileHover={{ y: -4, scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          // desktop: directly above the WhatsApp button (bottom-6 + 56px button + 16px gap); mobile: above the bottom bar
          className="fixed bottom-24 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#32105f] text-white shadow-[0_10px_24px_rgba(50,16,95,0.35)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#c026d3]/40 md:right-6 md:h-14 md:w-14"
        >
          <ArrowUp size={22} strokeWidth={2.5} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

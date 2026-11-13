import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Bookmark, CalendarDays, MessageCircle, Trash2, Users, X } from 'lucide-react'
import { api } from '@/lib/api/client'
import { packageKeys, theatreKeys } from '@/lib/api/queryKeys'
import { config } from '@/lib/config'
import { formatINR } from '@/lib/utils/currency'
import { OCCASIONS } from '@/content/occasions'
import { SAVED_EVENT, useSavedPlan } from '@/features/booking/useSavedPlan'
import type { Package } from '@/schemas/package'
import type { Theatre } from '@/schemas/theatre'

export const OPEN_SAVED_EVENT = 'bob-open-saved'

/** Right-hand "Saved for later" panel. Open it with window.dispatchEvent(new Event(OPEN_SAVED_EVENT)). */
export function SavedDrawer() {
  const [open, setOpen] = useState(false)
  const { plan, resume } = useSavedPlan()

  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener(OPEN_SAVED_EVENT, show)
    return () => window.removeEventListener(OPEN_SAVED_EVENT, show)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const { data: theatres = [] } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
    enabled: open,
  })
  const { data: packages = [] } = useQuery({
    queryKey: packageKeys.list(plan?.theatreId ?? undefined),
    queryFn: () => api.get<Package[]>(`/packages${plan?.theatreId ? `?theatreId=${plan.theatreId}` : ''}`),
    enabled: open && Boolean(plan),
  })

  const theatre = theatres.find((t) => t.id === plan?.theatreId) ?? null
  const pkg = packages.find((p) => p.id === plan?.packageId) ?? null
  const occ = OCCASIONS.find((o) => o.slug === plan?.occasion)
  const pretty = plan ? new Date(`${plan.date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : ''

  function remove() {
    try { localStorage.removeItem('bob_saved_plan') } catch { /* ignore */ }
    window.dispatchEvent(new Event(SAVED_EVENT))
  }

  const wa = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
    `Hi! I'd like to know more about my saved plan: ${occ?.label ?? ''}${theatre ? ` at ${theatre.name}` : ''}${pkg ? `, ${pkg.name} package` : ''} on ${pretty} for ${plan?.guests} guests.`,
  )}`

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-[60] bg-[#1b0b3a]/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Saved for later"
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-[440px] flex-col bg-white shadow-[-20px_0_60px_rgba(50,16,95,0.25)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <div className="flex items-start justify-between border-b border-[#f1e2f0] px-6 py-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6e6ef] px-3 py-1 text-xs font-bold text-[#6b2398]">
                  <Bookmark size={12} /> Saved for later
                </span>
                <p className="mt-3 font-display text-3xl font-bold text-[#2a0e4f]">Saved Plan</p>
                <p className="mt-1 text-sm text-[#5b4578]">Your celebration plan, ready when you are</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#32105f] transition-colors hover:bg-[#f6e6ef]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#fdf9ff] p-5">
              {plan ? (
                <motion.article
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-3xl bg-white p-4 shadow-[0_10px_30px_rgba(107,35,152,0.12)] ring-1 ring-[#ecd9ec]"
                >
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f6e6ef]">
                      {theatre?.images[0] && <img src={theatre.images[0]} alt={theatre.name} className="h-full w-full object-cover" />}
                      {occ && (
                        <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                          {occ.label}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-[#8e39c7]">
                          <span className="flex items-center gap-1"><Users size={12} /> {plan.guests} guests</span>
                          <span className="flex items-center gap-1"><CalendarDays size={12} /> {pretty}</span>
                        </p>
                        <button
                          type="button"
                          onClick={remove}
                          aria-label="Remove saved plan"
                          className="shrink-0 rounded-full p-1.5 text-[#7d7094] transition-colors hover:bg-[#fff0f5] hover:text-[#c2255c]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="mt-1 font-display text-xl font-bold leading-snug text-[#2a0e4f]">
                        {theatre ? theatre.name : 'Theatre not chosen yet'}
                      </p>
                      {pkg && (
                        <p className="text-sm text-[#5b4578]">
                          {pkg.name} package · <span className="font-semibold text-[#32105f]">{formatINR(pkg.pricePaise)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {pkg && <p className="mt-3 text-sm leading-relaxed text-[#5b4578]">{pkg.description}</p>}
                  {pkg && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pkg.inclusions.slice(0, 3).map((inc) => (
                        <span key={inc} className="rounded-full bg-[#f6e6ef] px-3 py-1 text-[11px] font-medium text-[#6b2398]">{inc}</span>
                      ))}
                      {pkg.inclusions.length > 3 && (
                        <span className="rounded-full bg-[#f6e6ef] px-3 py-1 text-[11px] font-medium text-[#6b2398]">+{pkg.inclusions.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-[#e3cbe6] pt-4">
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full border border-[#32105f]/25 px-4 py-2 text-sm font-semibold text-[#32105f] transition-colors hover:bg-[#32105f]/5"
                    >
                      <MessageCircle size={15} /> Enquire
                    </a>
                    <button
                      type="button"
                      onClick={() => { setOpen(false); resume() }}
                      className="group flex items-center gap-1.5 rounded-full bg-[#32105f] px-5 py-2 text-sm font-semibold text-white"
                    >
                      Continue booking
                      <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </motion.article>
              ) : (
                <div className="mt-16 text-center text-sm text-[#7d7094]">
                  <Bookmark size={32} className="mx-auto mb-3 text-[#d9b8e0]" />
                  Nothing saved yet. Tap Save on the booking page to keep your plan here.
                </div>
              )}
            </div>

            <div className="border-t border-[#f1e2f0] px-6 py-4 text-center text-sm text-[#7d7094]">
              Need custom arrangements?{' '}
              <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#6b2398] hover:underline">Chat with us</a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

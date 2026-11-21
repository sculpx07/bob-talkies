import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { addonKeys } from '@/lib/api/queryKeys'
import { api } from '@/lib/api/client'
import type { Addon } from '@/schemas/addon'
import { useBooking } from '../../state/booking.context'
import { formatINR } from '@/lib/utils/currency'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils/cn'

/** Cakes whose largest size is at or above this price are listed under "Premium Cakes". */
const PREMIUM_FROM_PAISE = 99900

const TILES = [
  'from-[#fbe3ec] to-[#f6c9dc]', 'from-[#f3e6ff] to-[#dcc4f5]', 'from-[#fff1d6] to-[#f8dca0]', 'from-[#e4f1ff] to-[#c6dcf5]',
]

interface Cake {
  name: string
  image?: string
  sizes: Addon[] // one add-on per size, cheapest first
}

function CakePhoto({ cake, index, className }: { cake: Cake; index: number; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (cake.image && !failed) {
    return <img src={cake.image} alt={cake.name} loading="lazy" onError={() => setFailed(true)} className={cn('h-full w-full object-cover', className)} />
  }
  return (
    <span className={cn('flex h-full w-full items-center justify-center bg-gradient-to-br text-5xl', TILES[index % TILES.length], className)} aria-hidden="true">🎂</span>
  )
}

export function CakeStep({ onBack, onSkip }: { onBack: () => void; onSkip: () => void }) {
  const { state, dispatch } = useBooking()
  const [tab, setTab] = useState<'standard' | 'premium'>('standard')
  const [openCake, setOpenCake] = useState<{ cake: Cake; index: number } | null>(null)

  const { data: addons = [], isLoading } = useQuery({
    queryKey: addonKeys.list(state.theatreId ?? undefined),
    queryFn: () => api.get<Addon[]>(`/addons${state.theatreId ? `?theatreId=${state.theatreId}` : ''}`),
  })

  // one card per cake, with a size option each
  const cakes = useMemo<Cake[]>(() => {
    const byName = new Map<string, Cake>()
    for (const a of addons.filter((x) => x.category === 'cake')) {
      const name = a.cakeName ?? a.name
      const cake = byName.get(name) ?? { name, image: a.image, sizes: [] }
      cake.sizes.push(a)
      byName.set(name, cake)
    }
    return [...byName.values()].map((c) => ({ ...c, sizes: c.sizes.sort((a, b) => a.pricePaise - b.pricePaise) }))
  }, [addons])
  const allCakeIds = useMemo(() => new Set(cakes.flatMap((c) => c.sizes.map((s) => s.id))), [cakes])
  const shown = cakes.filter((c) => (tab === 'premium') === (c.sizes[c.sizes.length - 1].pricePaise >= PREMIUM_FROM_PAISE))

  const chosenSize = (cake: Cake) => cake.sizes.find((s) => state.addonIds.includes(s.id))

  // one cake per booking: picking a size replaces any earlier cake; picking it again removes it
  function pickSize(size: Addon) {
    const rest = state.addonIds.filter((id) => !allCakeIds.has(id))
    dispatch({ type: 'SET_ADDONS', addonIds: state.addonIds.includes(size.id) ? rest : [...rest, size.id] })
    window.setTimeout(() => setOpenCake(null), 380)
  }
  function removeCake() {
    dispatch({ type: 'SET_ADDONS', addonIds: state.addonIds.filter((id) => !allCakeIds.has(id)) })
    setOpenCake(null)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6b2398] hover:underline">
          <ArrowLeft size={15} /> Back
        </button>
        <button type="button" onClick={onSkip} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6b2398] hover:underline">
          Add later after booking <ArrowRight size={15} />
        </button>
      </div>

      <h2 className="font-display text-3xl font-bold text-[#2a0e4f] md:text-4xl">Choose cake</h2>
      <p className="mb-6 mt-1 text-sm text-[#5b4578]">Pick a cake below, or describe a customized one. You can skip this step.</p>
      {(
        <div className="mb-7 rounded-2xl bg-[#fdf6ff] p-4 ring-1 ring-[#ecd9ec]">
          <label htmlFor="custom-request" className="mb-1.5 block text-sm font-semibold text-[#2a0e4f]">Customize as per your requirement</label>
          <textarea
            id="custom-request" rows={3} value={state.customRequest}
            onChange={(e) => dispatch({ type: 'SET_CUSTOM_REQUEST', text: e.target.value.slice(0, 400) })}
            placeholder="Flavour, theme, message on the cake, anything special"
            className="w-full resize-none rounded-xl border border-[#ecd9ec] bg-white px-4 py-3 text-sm text-[#2a0e4f] outline-none placeholder:text-[#b0a0c8] focus:border-[#c026d3] focus:ring-2 focus:ring-[#c026d3]/25"
          />
          <p className="mt-1 text-right text-[11px] text-[#7d7094]">{state.customRequest.length}/400. Our team will confirm custom cakes with you.</p>
        </div>
      )}

      <div role="tablist" aria-label="Cake type" className="mb-5 flex gap-2">
        {([['standard', 'Standard Cakes'], ['premium', 'Premium Cakes']] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              tab === id ? 'bg-[linear-gradient(135deg,#32105f,#6b2398)] text-white shadow-[0_8px_18px_rgba(50,16,95,0.3)]' : 'bg-[#f3ecf8] text-[#5b4578] hover:bg-[#eadcf5]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-square w-full" rounded="lg" />)}</div>
      ) : shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#ddd0f5] px-4 py-10 text-center text-sm text-[#7d7094]">No cakes in this list yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((cake, i) => {
            const size = chosenSize(cake)
            return (
              <motion.button
                key={cake.name}
                type="button"
                aria-haspopup="dialog"
                aria-pressed={Boolean(size)}
                onClick={() => setOpenCake({ cake, index: i })}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="group text-center focus-visible:outline-none"
              >
                <span
                  className={cn(
                    'relative block aspect-square w-full overflow-hidden rounded-2xl transition-all',
                    size ? 'ring-[3px] ring-[#c026d3] shadow-[0_14px_30px_rgba(192,38,211,0.3)]' : 'ring-1 ring-[#ecd9ec] group-focus-visible:ring-2 group-focus-visible:ring-[#c026d3]',
                  )}
                >
                  <CakePhoto cake={cake} index={i} className="transition-transform duration-500 group-hover:scale-105" />
                  {size && (
                    <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#c026d3] text-white shadow">
                      <Check size={15} strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span className="mt-2 block text-sm font-semibold leading-tight text-[#2a0e4f]">{cake.name}</span>
                <span className="block text-sm text-[#5b4578]">
                  {size ? <strong className="text-[#6b2398]">{size.sizeLabel} · {formatINR(size.pricePaise)}</strong> : <>from {formatINR(cake.sizes[0].pricePaise)}</>}
                </span>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Size picker */}
      <Dialog.Root open={Boolean(openCake)} onOpenChange={(o) => !o && setOpenCake(null)}>
        <AnimatePresence>
          {openCake && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-[300] bg-[#1d0a38]/55 backdrop-blur-sm"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount aria-describedby={undefined}>
                <div
                  className="fixed inset-0 z-[310] flex items-end justify-center focus:outline-none sm:items-center sm:p-4"
                  onMouseDown={(e) => { if (e.target === e.currentTarget) setOpenCake(null) }}
                >
                <motion.div
                  className="w-full max-w-md rounded-t-[2rem] bg-white p-5 shadow-[0_-20px_70px_rgba(29,10,56,0.4)] sm:rounded-[2rem]"
                  initial={{ opacity: 0, y: 60, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 40, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-[#ecd9ec]">
                        <CakePhoto cake={openCake.cake} index={openCake.index} className="!text-2xl" />
                      </span>
                      <div className="min-w-0">
                        <Dialog.Title className="text-lg font-bold leading-tight text-[#2a0e4f]">Customize as per requirement</Dialog.Title>
                        <p className="truncate text-sm text-[#7d7094]">{openCake.cake.name}</p>
                      </div>
                    </div>
                    <Dialog.Close aria-label="Close" className="shrink-0 rounded-full p-1.5 text-[#2a0e4f] transition-colors hover:bg-[#f6e6ef]">
                      <X size={20} />
                    </Dialog.Close>
                  </div>

                  <div role="radiogroup" aria-label="Cake size" className="space-y-3">
                    {openCake.cake.sizes.map((size, i) => {
                      const active = state.addonIds.includes(size.id)
                      return (
                        <motion.button
                          key={size.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => pickSize(size)}
                          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.08 + i * 0.06, duration: 0.3 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c026d3]',
                            active ? 'border-[#c026d3] bg-[#faf0ff]' : 'border-[#e8dcef] bg-white hover:border-[#c58be6]',
                          )}
                        >
                          <span className="font-semibold text-[#2a0e4f]">{size.sizeLabel}</span>
                          <span className="flex items-center gap-3">
                            <span className="font-semibold tabular-nums text-[#2a0e4f]">{formatINR(size.pricePaise)}</span>
                            <span className={cn('flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors', active ? 'border-[#c026d3] bg-[#c026d3]' : 'border-[#b9b2c4]')}>
                              {active && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} className="flex"><Check size={14} strokeWidth={3} className="text-white" /></motion.span>}
                            </span>
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>

                  {chosenSize(openCake.cake) && (
                    <button type="button" onClick={removeCake} className="mt-4 w-full text-center text-sm font-semibold text-[#c2255c] hover:underline">
                      Remove this cake
                    </button>
                  )}
                </motion.div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </div>
  )
}

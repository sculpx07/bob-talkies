import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, Clock, Clapperboard, Users, BadgeCheck, ShieldCheck } from 'lucide-react'
import { api } from '@/lib/api/client'
import { Seo } from '@/components/seo/Seo'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/EmptyState'
import { formatDate, formatTime } from '@/lib/utils/date'
import { formatINR } from '@/lib/utils/currency'

interface PassData {
  id: string; theatreName: string; date: string; slotStart: string; slotEnd: string;
  guests: number; customerName: string; packageName?: string; totalPaise: number;
  balancePaise: number; status: string; qrCode: string;
}

const EASE = [0.22, 1, 0.36, 1] as const

export default function PassPage() {
  const { token } = useParams()
  const { data: pass, isLoading, isError, refetch } = useQuery({
    queryKey: ['pass', token],
    queryFn: () => api.get<PassData>(`/passes/${token}`),
    enabled: Boolean(token),
  })

  return (
    <>
      <Seo title="Your Booking Pass" description="Digital pass for your BOB Talkies booking." noindex />
      <div className="flex min-h-screen items-center justify-center px-4 pb-10 pt-24 md:pt-28">
        {isLoading ? (
          <div className="w-full max-w-4xl">
            <Skeleton className="h-[300px] w-full" rounded="lg" />
          </div>
        ) : isError ? (
          <ErrorState title="Pass not found" description="This pass may have expired or is invalid." retry={refetch} />
        ) : pass ? (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="w-full max-w-4xl"
          >
            {/* three columns on wide screens: main | tear line | QR stub; stacked on phones */}
            <article className="relative grid overflow-hidden rounded-[2rem] bg-[#140930] text-white shadow-[0_40px_90px_rgba(42,14,79,0.45)] ring-1 ring-white/10 md:grid-cols-[1fr_auto_17rem]">
              <span className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[#d9126a]/35 blur-3xl" aria-hidden="true" />
              <span className="pointer-events-none absolute -bottom-24 right-48 h-64 w-64 rounded-full bg-[#f5bd61]/20 blur-3xl" aria-hidden="true" />

              {/* Main: guest + details */}
              <div className="relative p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-[14px] font-medium tracking-[0.07em] text-[#f5d7a1]">
                    BOB Talkies <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true" /> Booking Pass
                  </p>                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-300/30">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                    </span>
                    Valid
                  </span>
                </div>

                <p className="mt-6 text-xs text-white/60">Guest</p>
                <h1 className="mt-0.5 font-display text-3xl font-semibold leading-tight !text-white sm:text-4xl">{pass.customerName}</h1>
                <p className="mt-1 text-sm text-[#f5d7a1]">Private Theatre Experience</p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Tile icon={<CalendarDays size={15} />} label="Date" value={formatDate(pass.date)} />
                  <Tile icon={<Clock size={15} />} label="Time" value={formatTime(pass.slotStart)} />
                  <Tile icon={<Clapperboard size={15} />} label="Theatre" value={pass.theatreName} />
                  <Tile icon={<Users size={15} />} label="Guests" value={String(pass.guests)} />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f5bd61]/12 px-5 py-4 ring-1 ring-[#f5bd61]/25">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#f5d7a1]">Balance due at venue</span>
                  <span className="font-display text-xl font-semibold tabular-nums text-[#f5d7a1]">{formatINR(pass.balancePaise)}</span>
                </div>
              </div>

              {/* Tear line: horizontal on phones, vertical on wide screens, with cut-outs at the ends */}
              <div className="relative h-0 md:h-auto md:w-0">
                <span className="absolute left-0 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff3ea]" aria-hidden="true" />
                <span className="absolute right-0 top-0 h-8 w-8 -translate-y-1/2 translate-x-1/2 rounded-full bg-[#fff3ea] md:bottom-0 md:left-0 md:right-auto md:top-auto md:-translate-x-1/2 md:translate-y-1/2" aria-hidden="true" />
                <span className="absolute inset-x-8 top-0 border-t-2 border-dashed border-white/20 md:inset-x-auto md:inset-y-8 md:left-0 md:border-l-2 md:border-t-0" />
              </div>

              {/* Stub: QR */}
              <div className="relative flex flex-col items-center justify-center px-6 pb-7 pt-8 md:py-6">
                <div className="relative rounded-3xl bg-white p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                  {['left-2 top-2 border-l-2 border-t-2 rounded-tl-xl', 'right-2 top-2 border-r-2 border-t-2 rounded-tr-xl', 'bottom-2 left-2 border-b-2 border-l-2 rounded-bl-xl', 'bottom-2 right-2 border-b-2 border-r-2 rounded-br-xl'].map((c) => (
                    <span key={c} className={`pointer-events-none absolute h-5 w-5 border-[#c9a84c] ${c}`} aria-hidden="true" />
                  ))}
                  <img src={pass.qrCode} alt={`QR code for booking ${pass.id}`} className="h-36 w-36" />
                </div>
                <p className="mt-3 break-all text-center font-mono text-[11px] tracking-[0.14em] text-white/70">{pass.id}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-300"><BadgeCheck size={14} /> Booking confirmed</p>
              </div>
            </article>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-[#7d4555]">
              <ShieldCheck size={13} /> Show this pass at the venue. Present a photo ID if requested.
            </p>
          </motion.div>
        ) : null}
      </div>
    </>
  )
}

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/55">
        <span className="text-[#f5d7a1]">{icon}</span> {label}
      </p>
      <p className="mt-2 truncate text-[15px] font-semibold text-white">{value}</p>
    </div>
  )
}

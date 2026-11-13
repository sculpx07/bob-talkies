import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, Monitor, Volume2, Sofa, ChevronLeft, ChevronRight, Check, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react'
import { format, addMonths, parseISO, getDay } from 'date-fns'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Seo } from '@/components/seo/Seo'
import { PriceTag } from '@/components/ui/PriceTag'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/EmptyState'
import { PageShell } from '@/components/layout/PageShell'
import { api } from '@/lib/api/client'
import { theatreKeys, packageKeys, availabilityKeys } from '@/lib/api/queryKeys'
import { formatINR } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import type { Theatre } from '@/schemas/theatre'
import type { Package } from '@/schemas/package'

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }
const stagger = { show: { transition: { staggerChildren: 0.07 } } }

function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? 'show' : 'hidden'}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  )
}

function StaggerGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'show' : 'hidden'} className={className}>
      {children}
    </motion.div>
  )
}

interface Slot {
  id: string
  start: string
  end: string
  status: 'available' | 'booked' | 'high_demand' | 'held'
  pricePaise: number
}

interface CalendarDay {
  date: string
  status: 'available' | 'fully_booked' | 'high_demand' | 'offer_date' | 'unavailable'
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="font-display text-xl font-bold text-[#2a0e4f] whitespace-nowrap">{children}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-[#c9a84c]/40 to-transparent" />
    </div>
  )
}

export default function TheatreDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [activeImg, setActiveImg] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'))

  const { data: theatre, isLoading, isError, refetch } = useQuery({
    queryKey: theatreKeys.detail(slug ?? ''),
    queryFn: () => api.get<Theatre>(`/theatres/${slug}`),
    enabled: !!slug,
  })

  const { data: packages } = useQuery({
    queryKey: packageKeys.list(theatre?.id),
    queryFn: () => api.get<Package[]>(`/packages?theatreId=${theatre?.id}`),
    enabled: !!theatre?.id,
  })

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: availabilityKeys.slots(theatre?.id ?? '', selectedDate),
    queryFn: () => api.get<Slot[]>(`/availability?theatre=${theatre?.id}&date=${selectedDate}`),
    enabled: !!theatre?.id && !!selectedDate,
  })

  const { data: calendar } = useQuery({
    queryKey: availabilityKeys.calendar(theatre?.id ?? '', currentMonth),
    queryFn: () => api.get<CalendarDay[]>(`/availability/calendar?theatre=${theatre?.id}&month=${currentMonth}`),
    enabled: !!theatre?.id,
  })

  if (isLoading) {
    return (
      <PageShell>
        <Skeleton className="h-[480px] w-full mb-6 rounded-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </PageShell>
    )
  }

  if (isError || !theatre) {
    return (
      <PageShell>
        <ErrorState title="Theatre Not Found" description="This theatre doesn't exist or is currently unavailable." retry={refetch} />
      </PageShell>
    )
  }

  const calendarDays = calendar ?? []
  const monthStart = parseISO(`${currentMonth}-01`)
  const startDow = getDay(monthStart)
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <>
      <Seo
        title={`${theatre.name} — Private Theatre Hyderabad | BOB Talkies`}
        description={`Book ${theatre.name} at BOB Talkies. ${theatre.capacityMin}–${theatre.capacityMax} guests, ${theatre.screenSize} screen, ${theatre.soundSystem}. Starting from ${formatINR(theatre.startingPricePaise)}.`}
        canonical={`/theatres/${slug}`}
        ogImage={theatre.images[0]}
      />

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 hidden md:block bg-white/95 backdrop-blur-md border-t border-[#e8d5a3] shadow-[0_-4px_20px_rgba(50,16,95,0.08)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-display text-lg font-bold text-[#2a0e4f]">{theatre.name}</span>
            <span className="h-4 w-px bg-[#e8d5a3]" />
            <span className="text-sm text-[#5b4578]/60">{theatre.capacityMin}–{theatre.capacityMax} guests</span>
          </div>
          <div className="flex items-center gap-5">
            <PriceTag paise={theatre.startingPricePaise} />
            <Link to={`/book?theatre=${theatre.id}`} className="inline-flex items-center gap-2 rounded-full bg-[#32105f] text-white text-sm font-bold px-6 py-2.5 hover:bg-[#4a1a8a] transition-colors shadow-[0_4px_16px_rgba(50,16,95,0.25)]">
              Book Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <PageShell fullWidth className="pb-24 bg-[#fffaf4]">

        {/* ── Hero ── */}
        <div className="relative">
          <div className="relative h-[55vh] md:h-[68vh] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                src={theatre.images[activeImg]}
                alt={`${theatre.name} interior view ${activeImg + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </AnimatePresence>
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

            {/* Back link */}
            <Link to="/theatres" className="absolute top-6 left-6 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              <ChevronLeft size={15} /> All Theatres
            </Link>

            {/* Image nav arrows */}
            {theatre.images.length > 1 && (
              <>
                <button onClick={() => setActiveImg((p) => (p - 1 + theatre.images.length) % theatre.images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-all"
                  aria-label="Previous image"><ChevronLeft size={16} /></button>
                <button onClick={() => setActiveImg((p) => (p + 1) % theatre.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-all"
                  aria-label="Next image"><ChevronRight size={16} /></button>
              </>
            )}

            {/* Dot nav */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {theatre.images.map((_, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`rounded-full transition-all duration-300 ${i === activeImg ? 'bg-[#c9a84c] w-5 h-1.5' : 'bg-white/40 w-1.5 h-1.5'}`}
                  aria-label={`Image ${i + 1}`} />
              ))}
            </div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="absolute bottom-10 left-6 md:left-12 md:bottom-14"
            >
              <motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
                className="text-[#d4a94a] text-xs uppercase tracking-[0.3em] font-semibold mb-1.5">{theatre.tagline}</motion.p>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-xl">{theatre.name}</h1>
              <motion.div initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }} style={{ transformOrigin: 'left' }}
                className="mt-3 flex items-center gap-3">
                <div className="h-[2px] w-10 bg-gradient-to-r from-[#c9a84c] to-[#eed98a] rounded-full" />
                <span className="text-white/60 text-sm">{theatre.capacityMin}–{theatre.capacityMax} guests</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Thumbnail strip */}
          <div className="bg-white border-b border-[#e8d5a3] px-4 md:px-12 py-2.5 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {theatre.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-[#c9a84c] shadow-[0_0_8px_rgba(201,168,76,0.35)]' : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#e8d5a3]'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick stats bar ── */}
        <div className="bg-white border-b border-[#f0e6cc]">
          <motion.div
            className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-wrap gap-6 md:gap-10"
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
          >
            {[
              { icon: <Users size={15} />, label: `${theatre.capacityMin}–${theatre.capacityMax} Guests` },
              { icon: <Monitor size={15} />, label: theatre.screenSize },
              { icon: <Monitor size={15} />, label: theatre.resolution },
              { icon: <Volume2 size={15} />, label: theatre.soundSystem },
              { icon: <Sofa size={15} />, label: theatre.seatingType },
              { icon: <MapPin size={15} />, label: 'Kukatpally, Hyderabad' },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} transition={{ duration: 0.4 }}
                className="flex items-center gap-2 text-sm">
                <span className="text-[#c9a84c]">{s.icon}</span>
                <span className="text-[#2a0e4f] font-medium">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Main grid ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <div className="grid lg:grid-cols-[1fr_340px] gap-10 xl:gap-14">

            {/* ── Left column ── */}
            <div className="space-y-12">

              {/* About */}
              <RevealSection>
                <SectionTitle>About this Theatre</SectionTitle>
                <p className="text-[#5b4578]/80 leading-relaxed text-base">{theatre.description}</p>
              </RevealSection>

              {/* Facilities */}
              <RevealSection>
                <SectionTitle>Facilities Included</SectionTitle>
                <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {theatre.facilities.map((f) => (
                    <motion.li key={f} variants={fadeUp} transition={{ duration: 0.35 }}
                      whileHover={{ y: -3, boxShadow: '0 6px 20px rgba(201,168,76,0.15)' }}
                      className="flex items-center gap-2.5 bg-white rounded-xl px-4 py-3 border border-[#f0e6cc] text-sm text-[#2a0e4f] font-medium shadow-sm list-none cursor-default">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30">
                        <Check size={11} className="text-[#c9a84c]" />
                      </span>
                      {f}
                    </motion.li>
                  ))}
                </StaggerGrid>
              </RevealSection>

              {/* Suitable for */}
              <RevealSection>
                <SectionTitle>Perfect For</SectionTitle>
                <StaggerGrid className="flex flex-wrap gap-2">
                  {theatre.suitableFor.map((s) => (
                    <motion.span key={s} variants={fadeUp} transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.06 }}
                      className="capitalize text-sm font-semibold text-[#7a5500] border border-[#c9a84c]/40 bg-[#c9a84c]/10 rounded-full px-4 py-1.5 hover:bg-[#c9a84c]/20 transition-colors cursor-default">
                      {s.replace(/-/g, ' ')}
                    </motion.span>
                  ))}
                </StaggerGrid>
              </RevealSection>

              {/* Packages */}
              {packages && packages.length > 0 && (
                <RevealSection>
                  <SectionTitle>Available Packages</SectionTitle>
                  <StaggerGrid className="grid sm:grid-cols-2 gap-5">
                    {packages.map((pkg) => (
                      <motion.div key={pkg.id} variants={fadeUp} transition={{ duration: 0.4 }}
                        whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(201,168,76,0.18)' }}
                        className="bg-white rounded-2xl border border-[#f0e6cc] hover:border-[#c9a84c] transition-all group overflow-hidden">
                        {/* Top accent strip */}
                        <div className="h-1 bg-gradient-to-r from-[#c9a84c] to-[#eed98a]" />
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-display text-lg font-bold text-[#2a0e4f]">{pkg.name}</h3>
                            {pkg.badge && (
                              <span className="text-[9px] font-black uppercase tracking-widest text-[#7a5500] border border-[#c9a84c]/40 bg-[#c9a84c]/10 rounded-full px-2.5 py-0.5 ml-2 shrink-0">{pkg.badge}</span>
                            )}
                          </div>
                          <PriceTag paise={pkg.pricePaise} className="mb-2" />
                          <p className="text-xs text-[#5b4578]/50 mb-4">Includes {pkg.includedGuests} guests · Extra: {formatINR(theatre.extraGuestPricePaise)}/person</p>
                          <ul className="space-y-1.5 mb-5">
                            {pkg.inclusions.slice(0, 4).map((inc, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-[#5b4578]/70">
                                <Check size={11} className="text-[#c9a84c] mt-0.5 shrink-0" />{inc}
                              </li>
                            ))}
                          </ul>
                          <Link
                            to={`/book?theatre=${theatre.id}&package=${pkg.id}`}
                            className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#32105f] text-white text-sm font-bold py-2.5 hover:bg-[#4a1a8a] transition-colors"
                          >
                            Choose Package <ArrowRight size={14} />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </StaggerGrid>
                </RevealSection>
              )}
            </div>

            {/* ── Sidebar ── */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}>
              <div className="sticky top-24 bg-white rounded-2xl border border-[#f0e6cc] shadow-[0_8px_32px_rgba(50,16,95,0.08)] overflow-hidden">
                {/* Header */}
                <div className="bg-[#32105f] px-5 py-4">
                  <h3 className="font-display text-lg font-bold text-white">Check Availability</h3>
                  <p className="text-white/60 text-xs mt-0.5">Pick a date to see open slots</p>
                </div>

                <div className="p-5 space-y-5">
                  {/* Mini calendar */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => setCurrentMonth(format(addMonths(parseISO(`${currentMonth}-01`), -1), 'yyyy-MM'))}
                        className="p-1.5 rounded-lg text-[#5b4578]/50 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors"
                        aria-label="Previous month"><ChevronLeft size={16} /></button>
                      <span className="text-sm font-bold text-[#2a0e4f]">{format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}</span>
                      <button onClick={() => setCurrentMonth(format(addMonths(parseISO(`${currentMonth}-01`), 1), 'yyyy-MM'))}
                        className="p-1.5 rounded-lg text-[#5b4578]/50 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors"
                        aria-label="Next month"><ChevronRight size={16} /></button>
                    </div>
                    <div className="grid grid-cols-7 text-center mb-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <span key={i} className="text-[9px] text-[#5b4578]/40 py-1 font-bold uppercase tracking-widest">{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-y-0.5">
                      {Array.from({ length: startDow }, (_, i) => <div key={`e-${i}`} />)}
                      {calendarDays.map((day) => {
                        const isSelected = day.date === selectedDate
                        const isPast = day.date < today
                        const isUnavail = day.status === 'unavailable' || day.status === 'fully_booked' || isPast
                        return (
                          <button
                            key={day.date}
                            disabled={isUnavail}
                            onClick={() => !isUnavail && setSelectedDate(day.date)}
                            className={`text-xs py-1.5 rounded-lg transition-all font-semibold ${
                              isSelected
                                ? 'bg-[#c9a84c] text-white shadow-[0_2px_8px_rgba(201,168,76,0.4)]'
                                : isUnavail
                                ? 'text-[#5b4578]/20 cursor-not-allowed'
                                : day.status === 'high_demand'
                                ? 'text-orange-500 hover:bg-orange-50'
                                : day.status === 'offer_date'
                                ? 'text-[#c9a84c] hover:bg-[#c9a84c]/10'
                                : 'text-[#2a0e4f]/70 hover:bg-[#c9a84c]/10 hover:text-[#2a0e4f]'
                            }`}
                          >
                            {parseInt(day.date.split('-')[2])}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Slots */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar size={13} className="text-[#c9a84c]" />
                      <span className="text-sm font-bold text-[#2a0e4f]">{format(parseISO(selectedDate), 'dd MMM yyyy')}</span>
                    </div>
                    {slotsLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-11 w-full" />)}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {slots?.map((slot) => (
                          <Link
                            key={slot.id}
                            to={`/book?theatre=${theatre.id}&date=${selectedDate}&slot=${slot.id}`}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
                              slot.status === 'booked' || slot.status === 'held'
                                ? 'border-[#f0e6cc] text-[#5b4578]/30 cursor-not-allowed pointer-events-none bg-[#fafafa]'
                                : slot.status === 'high_demand'
                                ? 'border-orange-200 bg-orange-50 text-[#2a0e4f] hover:bg-orange-100'
                                : 'border-[#f0e6cc] hover:border-[#c9a84c] hover:bg-[#c9a84c]/5 text-[#2a0e4f]'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Clock size={12} className="text-[#c9a84c]/70" />
                              {formatTime(slot.start)} – {formatTime(slot.end)}
                              {slot.status === 'high_demand' && (
                                <span className="text-[9px] font-black uppercase text-orange-500 border border-orange-200 bg-orange-50 rounded-full px-1.5 py-0.5 tracking-wide">Hot</span>
                              )}
                            </span>
                            <span className="font-bold text-[#7a5500] text-sm">{formatINR(slot.pricePaise)}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Book CTA */}
                  <div className="pt-4 border-t border-[#f0e6cc]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-[#5b4578]/50">Starting from</span>
                      <PriceTag paise={theatre.startingPricePaise} />
                    </div>
                    <Link
                      to={`/book?theatre=${theatre.id}&date=${selectedDate}`}
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#32105f] text-white text-sm font-bold py-3 hover:bg-[#4a1a8a] transition-colors shadow-[0_4px_16px_rgba(50,16,95,0.22)]"
                    >
                      Book Now <ArrowRight size={14} />
                    </Link>
                    <p className="text-center text-[10px] text-[#5b4578]/40 mt-2">No advance payment required</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </PageShell>
    </>
  )
}

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users, Monitor, Volume2, Sofa, ChevronLeft, ChevronRight, Check, MapPin, Calendar, Clock } from 'lucide-react'
import { format, addMonths, parseISO, getDay } from 'date-fns'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { PriceTag } from '@/components/ui/PriceTag'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/EmptyState'
import { PageShell, Section, SectionHeader } from '@/components/layout/PageShell'
import { api } from '@/lib/api/client'
import { theatreKeys, packageKeys, availabilityKeys } from '@/lib/api/queryKeys'
import { formatINR } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import type { Theatre } from '@/schemas/theatre'
import type { Package } from '@/schemas/package'

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

const STATUS_COLORS: Record<string, string> = {
  available: 'text-success border-success/30 bg-success/10',
  high_demand: 'text-warning border-warning/30 bg-warning/10',
  booked: 'text-text-muted border-border-subtle bg-bg-elevated opacity-50 cursor-not-allowed',
  held: 'text-text-muted border-border-subtle bg-bg-elevated opacity-50 cursor-not-allowed',
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
        <Skeleton className="h-96 w-full mb-6" />
        <Skeleton className="h-8 w-1/2 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
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

      {/* Sticky booking bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e8d5a3] px-4 py-3 md:block hidden shadow-[0_-4px_20px_rgba(180,130,30,0.08)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="font-display text-xl text-[#2a0e4f]">{theatre.name}</span>
            <span className="text-[#5b4578]/50 text-sm ml-3">{theatre.capacityMin}–{theatre.capacityMax} guests</span>
          </div>
          <div className="flex items-center gap-4">
            <PriceTag paise={theatre.startingPricePaise} />
            <Button asChild size="md">
              <Link to={`/book?theatre=${theatre.id}`}>Book This Theatre</Link>
            </Button>
          </div>
        </div>
      </div>

      <PageShell fullWidth className="pb-24 bg-[#fffdf7]">
        {/* Hero gallery */}
        <div className="relative bg-[#fffdf7]">
          <div className="relative h-72 md:h-[520px] overflow-hidden">
            <img
              src={theatre.images[activeImg]}
              alt={`${theatre.name} interior view ${activeImg + 1}`}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#fffdf7] via-[#fffdf7]/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

            {/* Dot indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {theatre.images.map((_, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImg ? 'bg-[#c9a84c] w-6' : 'bg-white/50 w-1.5'}`} aria-label={`View image ${i + 1}`} />
              ))}
            </div>

            {/* Arrow nav */}
            {theatre.images.length > 1 && (
              <>
                <button onClick={() => setActiveImg((p) => (p - 1 + theatre.images.length) % theatre.images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm border border-[#e8d5a3] flex items-center justify-center text-[#2a0e4f] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all" aria-label="Previous image"><ChevronLeft size={18} /></button>
                <button onClick={() => setActiveImg((p) => (p + 1) % theatre.images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm border border-[#e8d5a3] flex items-center justify-center text-[#2a0e4f] hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all" aria-label="Next image"><ChevronRight size={18} /></button>
              </>
            )}

            {/* Title overlay */}
            <div className="absolute bottom-8 left-6 md:left-12">
              <p className="text-[#c9a84c] text-xs uppercase tracking-[0.3em] font-semibold mb-1 drop-shadow">{theatre.tagline}</p>
              <h1 className="font-display text-4xl md:text-5xl text-white drop-shadow-lg leading-tight">{theatre.name}</h1>
              <div className="mt-2 h-[2px] w-12 bg-gradient-to-r from-[#c9a84c] to-[#eed98a] rounded-full" />
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-2 px-4 md:px-12 py-3 overflow-x-auto bg-white border-b border-[#e8d5a3] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {theatre.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-[#c9a84c] shadow-[0_0_10px_rgba(201,168,76,0.3)]' : 'border-[#e8d5a3] opacity-70 hover:opacity-100'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-12">

              {/* Specs */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="font-display text-2xl text-[#2a0e4f]">Theatre Specifications</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#c9a84c]/40 to-transparent" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: <Users size={18} />, label: 'Capacity', value: `${theatre.capacityMin}–${theatre.capacityMax} guests` },
                    { icon: <Monitor size={18} />, label: 'Screen Size', value: theatre.screenSize },
                    { icon: <Monitor size={18} />, label: 'Resolution', value: theatre.resolution },
                    { icon: <Volume2 size={18} />, label: 'Sound System', value: theatre.soundSystem },
                    { icon: <Sofa size={18} />, label: 'Seating', value: theatre.seatingType },
                    { icon: <MapPin size={18} />, label: 'Location', value: 'Kukatpally, Hyderabad' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl p-4 border border-[#e8d5a3] hover:border-[#c9a84c] hover:shadow-[0_4px_16px_rgba(201,168,76,0.12)] transition-all group">
                      <div className="flex items-center gap-2 text-[#c9a84c] mb-2">{s.icon}</div>
                      <p className="text-[10px] uppercase tracking-widest text-[#5b4578]/40 mb-1">{s.label}</p>
                      <p className="text-sm font-semibold text-[#2a0e4f]">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-display text-2xl text-[#2a0e4f]">Facilities</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#c9a84c]/40 to-transparent" />
                </div>
                <ul className="grid grid-cols-2 gap-3">
                  {theatre.facilities.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#5b4578]/80">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30">
                        <Check size={11} className="text-[#c9a84c]" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suitable for */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-display text-2xl text-[#2a0e4f]">Suitable For</h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#c9a84c]/40 to-transparent" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {theatre.suitableFor.map((s) => (
                    <span key={s} className="capitalize text-xs font-semibold text-[#7a5500] border border-[#c9a84c]/40 bg-[#c9a84c]/10 rounded-full px-4 py-1.5">
                      {s.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Packages */}
              {packages && packages.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="font-display text-2xl text-[#2a0e4f]">Available Packages</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#c9a84c]/40 to-transparent" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="bg-white rounded-2xl border border-[#e8d5a3] p-5 hover:border-[#c9a84c] hover:shadow-[0_8px_30px_rgba(201,168,76,0.14)] transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-display text-xl text-[#2a0e4f]">{pkg.name}</h3>
                          {pkg.badge && <span className="text-[10px] font-bold uppercase tracking-widest text-[#7a5500] border border-[#c9a84c]/40 bg-[#c9a84c]/10 rounded-full px-2.5 py-0.5">{pkg.badge}</span>}
                        </div>
                        <PriceTag paise={pkg.pricePaise} className="mb-3" />
                        <p className="text-xs text-[#5b4578]/50 mb-3">Includes {pkg.includedGuests} guests · Extra guest: {formatINR(theatre.extraGuestPricePaise)}/person</p>
                        <ul className="space-y-1.5 mb-5">
                          {pkg.inclusions.slice(0, 4).map((inc, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-[#5b4578]/70">
                              <Check size={11} className="text-[#c9a84c] mt-0.5 shrink-0" /> {inc}
                            </li>
                          ))}
                        </ul>
                        <Link to={`/book?theatre=${theatre.id}&package=${pkg.id}`} className="block w-full text-center rounded-full bg-[#32105f] text-white text-sm font-bold py-2.5 hover:bg-[#4a1a8a] transition-colors">
                          Choose This Package
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: availability */}
            <div className="space-y-6">
              <div className="bg-white border border-[#e8d5a3] rounded-2xl p-5 sticky top-24 shadow-[0_4px_24px_rgba(180,130,30,0.10)]">
                <h3 className="font-display text-xl text-[#2a0e4f] mb-1">Check Availability</h3>
                <div className="h-[2px] w-8 bg-gradient-to-r from-[#c9a84c] to-[#eed98a] rounded-full mb-4" />

                {/* Mini calendar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => setCurrentMonth(format(addMonths(parseISO(`${currentMonth}-01`), -1), 'yyyy-MM'))} className="p-1 text-[#5b4578]/50 hover:text-[#c9a84c] transition-colors" aria-label="Previous month"><ChevronLeft size={18} /></button>
                    <span className="text-sm font-semibold text-[#2a0e4f]">{format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}</span>
                    <button onClick={() => setCurrentMonth(format(addMonths(parseISO(`${currentMonth}-01`), 1), 'yyyy-MM'))} className="p-1 text-[#5b4578]/50 hover:text-[#c9a84c] transition-colors" aria-label="Next month"><ChevronRight size={18} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                      <span key={d} className="text-[10px] text-[#5b4578]/40 py-1 font-semibold uppercase tracking-widest">{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
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
                          className={`text-xs py-1.5 rounded-lg transition-all font-medium ${
                            isSelected ? 'bg-[#c9a84c] text-white font-bold shadow-[0_2px_8px_rgba(201,168,76,0.4)]' :
                            isUnavail ? 'text-[#5b4578]/20 cursor-not-allowed' :
                            day.status === 'high_demand' ? 'text-orange-500 hover:bg-orange-50' :
                            day.status === 'offer_date' ? 'text-[#c9a84c] hover:bg-[#c9a84c]/10' :
                            'text-[#2a0e4f]/70 hover:bg-[#c9a84c]/10 hover:text-[#2a0e4f]'
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
                    <Calendar size={14} className="text-[#c9a84c]" />
                    <span className="text-sm font-semibold text-[#2a0e4f]">{format(parseISO(selectedDate), 'dd MMM yyyy')}</span>
                  </div>
                  {slotsLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {slots?.map((slot) => (
                        <Link
                          key={slot.id}
                          to={`/book?theatre=${theatre.id}&date=${selectedDate}&slot=${slot.id}`}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
                            slot.status === 'booked' || slot.status === 'held'
                              ? 'border-[#e8d5a3]/50 text-[#5b4578]/30 cursor-not-allowed pointer-events-none'
                              : slot.status === 'high_demand'
                              ? 'border-orange-300 bg-orange-50 text-[#2a0e4f] hover:bg-orange-100'
                              : 'border-[#e8d5a3] hover:border-[#c9a84c] hover:bg-[#c9a84c]/5 text-[#2a0e4f]'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Clock size={13} className="text-[#c9a84c]/70" />
                            {formatTime(slot.start)} – {formatTime(slot.end)}
                            {slot.status === 'high_demand' && (
                              <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500 border border-orange-300 bg-orange-50 rounded-full px-1.5 py-0.5">Hot</span>
                            )}
                          </span>
                          <span className="font-bold text-[#7a5500]">{formatINR(slot.pricePaise)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-[#e8d5a3]">
                  <PriceTag paise={theatre.startingPricePaise} className="mb-4" />
                  <Link to={`/book?theatre=${theatre.id}&date=${selectedDate}`} className="block w-full text-center rounded-full bg-[#32105f] text-white text-sm font-bold py-3 hover:bg-[#4a1a8a] transition-colors shadow-[0_4px_16px_rgba(50,16,95,0.25)]">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </>
  )
}

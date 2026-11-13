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
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-bg-elevated/95 backdrop-blur-md border-t border-border-subtle px-4 py-3 md:block hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="font-display text-xl text-text-primary">{theatre.name}</span>
            <span className="text-text-muted text-sm ml-3">{theatre.capacityMin}–{theatre.capacityMax} guests</span>
          </div>
          <div className="flex items-center gap-4">
            <PriceTag paise={theatre.startingPricePaise} />
            <Button asChild size="md">
              <Link to={`/book?theatre=${theatre.id}`}>Book This Theatre</Link>
            </Button>
          </div>
        </div>
      </div>

      <PageShell fullWidth className="pb-24">
        {/* Gallery */}
        <div className="relative bg-bg-base">
          <div className="relative h-72 md:h-[500px] overflow-hidden">
            <img
              src={theatre.images[activeImg]}
              alt={`${theatre.name} interior view ${activeImg + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-base/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {theatre.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-gold-400 w-6' : 'bg-white/40'}`}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
            {theatre.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg((p) => (p - 1 + theatre.images.length) % theatre.images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg-base/60 flex items-center justify-center text-white hover:bg-bg-base/80 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setActiveImg((p) => (p + 1) % theatre.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bg-base/60 flex items-center justify-center text-white hover:bg-bg-base/80 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <div className="absolute bottom-6 left-6">
              <h1 className="font-display text-3xl md:text-4xl text-text-primary">{theatre.name}</h1>
              <p className="text-text-secondary italic">{theatre.tagline}</p>
            </div>
          </div>
          <div className="flex gap-2 px-4 md:px-6 py-3 overflow-x-auto">
            {theatre.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-gold-500' : 'border-border-subtle'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Specs */}
              <div>
                <h2 className="font-display text-2xl text-text-primary mb-5">Theatre Specifications</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: <Users size={18} />, label: 'Capacity', value: `${theatre.capacityMin}–${theatre.capacityMax} guests` },
                    { icon: <Monitor size={18} />, label: 'Screen Size', value: theatre.screenSize },
                    { icon: <Monitor size={18} />, label: 'Resolution', value: theatre.resolution },
                    { icon: <Volume2 size={18} />, label: 'Sound System', value: theatre.soundSystem },
                    { icon: <Sofa size={18} />, label: 'Seating', value: theatre.seatingType },
                    { icon: <MapPin size={18} />, label: 'Location', value: 'Kukatpally, Hyderabad' },
                  ].map((s) => (
                    <div key={s.label} className="bg-bg-surface rounded-xl p-4 border border-border-subtle">
                      <div className="flex items-center gap-2 text-gold-500 mb-2">{s.icon}</div>
                      <p className="text-xs text-text-muted mb-1">{s.label}</p>
                      <p className="text-sm font-medium text-text-primary">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h2 className="font-display text-2xl text-text-primary mb-4">Facilities</h2>
                <ul className="grid grid-cols-2 gap-2">
                  {theatre.facilities.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                      <Check size={15} className="text-gold-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suitable for */}
              <div>
                <h2 className="font-display text-2xl text-text-primary mb-4">Suitable For</h2>
                <div className="flex flex-wrap gap-2">
                  {theatre.suitableFor.map((s) => (
                    <Badge key={s} variant="gold" className="capitalize">{s.replace('-', ' ')}</Badge>
                  ))}
                </div>
              </div>

              {/* Packages */}
              {packages && packages.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl text-text-primary mb-5">Available Packages</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {packages.map((pkg) => (
                      <Card key={pkg.id} glow={pkg.tier === 'gold'} hover>
                        <CardBody>
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-display text-xl text-text-primary">{pkg.name}</h3>
                            {pkg.badge && <Badge variant="champagne">{pkg.badge}</Badge>}
                          </div>
                          <PriceTag paise={pkg.pricePaise} className="mb-3" />
                          <p className="text-xs text-text-muted mb-3">Includes {pkg.includedGuests} guests · Extra guest: {formatINR(theatre.extraGuestPricePaise)}/person</p>
                          <ul className="space-y-1.5 mb-4">
                            {pkg.inclusions.slice(0, 4).map((inc, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                                <Check size={12} className="text-gold-500 mt-0.5 shrink-0" /> {inc}
                              </li>
                            ))}
                          </ul>
                          <Button asChild fullWidth size="sm">
                            <Link to={`/book?theatre=${theatre.id}&package=${pkg.id}`}>Choose This Package</Link>
                          </Button>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: availability */}
            <div className="space-y-6">
              <div className="bg-bg-surface border border-border-subtle rounded-card p-5 sticky top-24">
                <h3 className="font-display text-xl text-text-primary mb-4">Check Availability</h3>

                {/* Mini calendar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => setCurrentMonth(format(addMonths(parseISO(`${currentMonth}-01`), -1), 'yyyy-MM'))} className="p-1 hover:text-gold-400 transition-colors" aria-label="Previous month">
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm font-medium text-text-primary">{format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}</span>
                    <button onClick={() => setCurrentMonth(format(addMonths(parseISO(`${currentMonth}-01`), 1), 'yyyy-MM'))} className="p-1 hover:text-gold-400 transition-colors" aria-label="Next month">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                      <span key={d} className="text-xs text-text-muted py-1">{d}</span>
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
                          className={`text-xs py-1.5 rounded transition-all ${
                            isSelected ? 'bg-gold-500 text-bg-base font-bold' :
                            isUnavail ? 'text-text-muted opacity-30 cursor-not-allowed' :
                            day.status === 'high_demand' ? 'text-warning hover:bg-warning/20' :
                            day.status === 'offer_date' ? 'text-gold-400 hover:bg-gold-500/20' :
                            'text-text-secondary hover:bg-bg-elevated'
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
                    <Calendar size={15} className="text-gold-500" />
                    <span className="text-sm font-medium text-text-primary">{format(parseISO(selectedDate), 'dd MMM yyyy')}</span>
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
                              ? 'border-border-subtle text-text-muted cursor-not-allowed opacity-50 pointer-events-none'
                              : slot.status === 'high_demand'
                              ? 'border-warning/40 bg-warning/5 text-text-primary hover:bg-warning/10'
                              : 'border-border-subtle hover:border-gold-500/50 hover:bg-gold-500/5 text-text-primary'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Clock size={13} className="text-text-muted" />
                            {formatTime(slot.start)} – {formatTime(slot.end)}
                            {slot.status === 'high_demand' && (
                              <Badge variant="warning" className="text-xs">Hot</Badge>
                            )}
                          </span>
                          <span className="font-medium text-gold-400">{formatINR(slot.pricePaise)}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-border-subtle">
                  <PriceTag paise={theatre.startingPricePaise} className="mb-4" />
                  <Button asChild fullWidth size="lg">
                    <Link to={`/book?theatre=${theatre.id}&date=${selectedDate}`}>Book Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </>
  )
}

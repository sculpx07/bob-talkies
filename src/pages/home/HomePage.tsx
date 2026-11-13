import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Star, MapPin, Phone, MessageCircle, Play, Sparkles, Camera, Cake, Music, Users, Tv, Shield, Award } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { Rating } from '@/components/ui/Rating'
import { PriceTag } from '@/components/ui/PriceTag'
import { Skeleton, TheatreCardSkeleton } from '@/components/ui/Skeleton'
import { Section, SectionHeader } from '@/components/layout/PageShell'
import { api } from '@/lib/api/client'
import { theatreKeys, offerKeys, packageKeys, reviewKeys } from '@/lib/api/queryKeys'
import { formatINR } from '@/lib/utils/currency'
import { GUEST_OPTIONS, OCCASION_SLUGS } from '@/lib/constants'
import { OCCASIONS } from '@/content/occasions'
import { config } from '@/lib/config'
import type { Theatre } from '@/schemas/theatre'
import type { Offer } from '@/schemas/offer'
import type { Package } from '@/schemas/package'

const OCCASION_QUICK = OCCASIONS.map((o) => ({ label: o.label, slug: o.slug, emoji: o.emoji }))

export default function HomePage() {
  const navigate = useNavigate()
  const [selectedOccasion, setSelectedOccasion] = useState('')
  const [guests, setGuests] = useState(2)
  const [date, setDate] = useState('')

  const { data: theatres, isLoading: theatresLoading } = useQuery({
    queryKey: theatreKeys.list(),
    queryFn: () => api.get<Theatre[]>('/theatres'),
  })

  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: offerKeys.list(),
    queryFn: () => api.get<Offer[]>('/offers'),
  })

  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: packageKeys.list(),
    queryFn: () => api.get<Package[]>('/packages'),
  })

  const { data: reviewsData } = useQuery({
    queryKey: reviewKeys.list(),
    queryFn: () => api.get<{ averageRating: number; totalCount: number; data: Array<{ id: string; name: string; rating: number; text: string; occasion: string; theatreName: string; date: string }> }>('/reviews'),
  })

  function handleQuickBook() {
    const params = new URLSearchParams()
    if (selectedOccasion) params.set('occasion', selectedOccasion)
    params.set('guests', String(guests))
    if (date) params.set('date', date)
    navigate(`/book?${params.toString()}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <Seo
        title="BOB Talkies — Premium Private Theatre in Hyderabad"
        description="Book a private theatre in Hyderabad for birthdays, anniversaries, proposals, date nights and all celebrations. 4K projection, Dolby Atmos, in-house decoration and photography. Book online in minutes."
        canonical="/"
      />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-base">
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600"
          aria-hidden="true"
        >
          <source src="" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base/60 via-transparent to-bg-base" />
        <div className="film-grain absolute inset-0 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24">
          <Badge variant="gold" className="mb-6 text-sm px-4 py-1.5">
            <Sparkles size={12} />
            Hyderabad's Premium Private Theatres
          </Badge>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-text-primary leading-tight mb-6">
            Your Celebration.<br />
            <span className="text-gold-400">Your Theatre.</span><br />
            Your Memories.
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Hyderabad's most loved private cinema experience for birthdays, anniversaries, proposals and every celebration worth remembering. 4K · Dolby Atmos · Fully Private.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="xl">
              <Link to="/book">Book Your Theatre</Link>
            </Button>
            <Button asChild variant="secondary" size="xl">
              <Link to="/theatres">
                <Play size={18} /> Explore Our Theatres
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-text-muted">
            <span className="flex items-center gap-1.5"><Star size={14} className="text-gold-500 fill-gold-500" /> 4.9/5 Google Rating</span>
            <span className="hidden sm:block">•</span>
            <span>847+ Happy Customers</span>
            <span className="hidden sm:block">•</span>
            <span>5 Premium Theatres</span>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <ChevronRight size={24} className="text-gold-500 rotate-90" />
        </div>
      </section>

      {/* Quick Booking Widget */}
      <Section bg="navy">
        <SectionHeader
          eyebrow="Book in Minutes"
          title="Find Your Perfect Theatre"
          subtitle="Tell us about your celebration and we'll show you available options instantly."
          centered
        />
        <div className="max-w-3xl mx-auto bg-bg-elevated border border-border-subtle rounded-card p-6 md:p-8 shadow-2xl">
          <div className="mb-5">
            <p className="text-sm font-medium text-text-secondary mb-3">What are you celebrating?</p>
            <div className="flex flex-wrap gap-2">
              {OCCASION_QUICK.map((o) => (
                <button
                  key={o.slug}
                  onClick={() => setSelectedOccasion(selectedOccasion === o.slug ? '' : o.slug)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-sm border transition-all ${
                    selectedOccasion === o.slug
                      ? 'bg-gold-500/20 border-gold-500 text-gold-400'
                      : 'border-border-subtle text-text-secondary hover:border-gold-500/40'
                  }`}
                >
                  <span>{o.emoji}</span>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Number of Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-gold-500"
              >
                {GUEST_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}{n === 30 ? '+' : ''} Guests</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Date</label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-bg-surface border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>
          <Button fullWidth size="lg" onClick={handleQuickBook}>
            Show Available Options
            <ChevronRight size={18} />
          </Button>
        </div>
      </Section>

      {/* Live Offers */}
      {(offersLoading || (offers && offers.length > 0)) && (
        <Section bg="base">
          <SectionHeader eyebrow="Limited Time" title="Current Offers" subtitle="Exclusive deals for your next celebration." />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {offersLoading
              ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-40" />)
              : offers?.map((offer) => (
                  <Card key={offer.id} hover className="border-gold-500/30 overflow-hidden">
                    <CardBody>
                      {offer.badge && <Badge variant="champagne" className="mb-3">{offer.badge}</Badge>}
                      <h3 className="font-semibold text-text-primary mb-1">{offer.title}</h3>
                      <p className="text-sm text-text-secondary mb-4 leading-relaxed">{offer.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-gold-400 bg-gold-500/10 px-2 py-1 rounded-lg text-sm tracking-wider">
                          {offer.code}
                        </span>
                        <Button asChild size="sm" variant="secondary">
                          <Link to={`/book?coupon=${offer.code}`}>Book</Link>
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
          </div>
          <div className="text-center mt-6">
            <Button asChild variant="ghost">
              <Link to="/offers">View All Offers <ChevronRight size={16} /></Link>
            </Button>
          </div>
        </Section>
      )}

      {/* Our Theatres */}
      <Section bg="surface">
        <SectionHeader
          eyebrow="5 Premium Theatres"
          title="Explore Our Theatres"
          subtitle="Every theatre is a world of its own — pick the one that matches your celebration."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {theatresLoading
            ? Array.from({ length: 5 }, (_, i) => <TheatreCardSkeleton key={i} />)
            : theatres?.map((theatre) => (
                <Card key={theatre.id} hover className="flex flex-col">
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={theatre.images[0]}
                      alt={`${theatre.name} private theatre interior`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-base/80 to-transparent" />
                    {theatre.currentOffer && (
                      <Badge variant="crimson" className="absolute top-3 right-3">Offer Available</Badge>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-xs text-text-muted bg-bg-base/80 px-2 py-0.5 rounded-pill">
                        {theatre.capacityMin}–{theatre.capacityMax} guests
                      </span>
                    </div>
                  </div>
                  <CardBody className="flex-1 flex flex-col">
                    <h3 className="font-display text-xl text-text-primary mb-1">{theatre.name}</h3>
                    <p className="text-sm text-text-secondary mb-3 flex-1 line-clamp-2">{theatre.tagline}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <Badge variant="muted">{theatre.resolution}</Badge>
                      <Badge variant="muted">{theatre.soundSystem.split(' ').slice(0, 2).join(' ')}</Badge>
                    </div>
                    <PriceTag paise={theatre.startingPricePaise} className="mb-4" />
                    <div className="flex gap-2 mt-auto">
                      <Button asChild variant="secondary" size="sm" className="flex-1">
                        <Link to={`/theatres/${theatre.slug}`}>View Details</Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1">
                        <Link to={`/book?theatre=${theatre.id}`}>Book Now</Link>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="secondary" size="lg">
            <Link to="/theatres">View All Theatres <ChevronRight size={18} /></Link>
          </Button>
        </div>
      </Section>

      {/* Choose Your Celebration */}
      <Section bg="base">
        <SectionHeader eyebrow="Every Occasion" title="Choose Your Celebration" centered />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {OCCASIONS.map((o) => (
            <Link
              key={o.slug}
              to={`/celebrations/${o.slug}`}
              className="group flex flex-col items-center gap-2 p-4 rounded-card border border-border-subtle bg-bg-surface hover:border-gold-500/50 hover:bg-bg-elevated transition-all duration-200"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{o.emoji}</span>
              <span className="text-sm font-medium text-text-secondary group-hover:text-gold-400 transition-colors text-center">{o.label}</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Featured Packages */}
      <Section bg="navy">
        <SectionHeader
          eyebrow="Packages"
          title="Curated Celebration Packages"
          subtitle="From intimate to grand — choose a package that tells your story."
        />
        {packagesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-80" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages?.slice(0, 4).map((pkg) => (
              <Card key={pkg.id} glow={pkg.tier === 'gold'} className="flex flex-col relative">
                {pkg.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                    <Badge variant="gold">{pkg.badge}</Badge>
                  </div>
                )}
                <CardBody className="flex-1 flex flex-col">
                  <div className="text-center mb-4">
                    <span className="font-display text-xl text-text-primary">{pkg.name}</span>
                    <div className="mt-2">
                      <PriceTag paise={pkg.pricePaise} prefix="Starting from" size="lg" />
                    </div>
                    <p className="text-xs text-text-muted mt-1">For {pkg.includedGuests} guests</p>
                  </div>
                  <ul className="space-y-2 flex-1 mb-6">
                    {pkg.inclusions.slice(0, 5).map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-gold-500 mt-0.5 shrink-0">✓</span>
                        {inc}
                      </li>
                    ))}
                    {pkg.inclusions.length > 5 && (
                      <li className="text-xs text-text-muted">+{pkg.inclusions.length - 5} more inclusions</li>
                    )}
                  </ul>
                  <Button asChild fullWidth size="sm">
                    <Link to={`/book?package=${pkg.id}`}>Choose This Package</Link>
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Button asChild variant="secondary" size="lg">
            <Link to="/packages">Compare All Packages <ChevronRight size={18} /></Link>
          </Button>
        </div>
      </Section>

      {/* It's More Than a Movie */}
      <Section bg="surface">
        <SectionHeader
          eyebrow="The BOB Experience"
          title="It's More Than a Movie"
          subtitle="Every element of your celebration is crafted with care."
          centered
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: <Tv size={28} />, title: 'Private 4K Cinema', desc: 'Your own massive 4K screen and Dolby Atmos sound — no strangers, no noise.' },
            { icon: <Sparkles size={28} />, title: 'Premium Decoration', desc: 'Floral arrangements, LED boards, cold fire and fog entry — crafted for your occasion.' },
            { icon: <Cake size={28} />, title: 'Custom Cakes', desc: 'Freshly baked, beautifully designed cakes for every celebration.' },
            { icon: <Camera size={28} />, title: 'Photography', desc: 'Professional photographers who capture every smile and surprise moment.' },
            { icon: <Music size={28} />, title: 'Dolby Atmos Sound', desc: 'Immersive surround sound that makes every moment more cinematic.' },
            { icon: <Shield size={28} />, title: 'Complete Privacy', desc: 'Your own private space — no other guests, fully secured and comfortable.' },
            { icon: <Users size={28} />, title: 'Groups of 2–40', desc: 'Intimate for couples or grand for large gatherings — we have a theatre for every size.' },
            { icon: <Award size={28} />, title: 'Premium Hospitality', desc: 'Our team is trained to make you feel like royalty from start to finish.' },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center p-5 rounded-card bg-bg-elevated border border-border-subtle hover:border-gold-500/30 transition-colors group">
              <div className="text-gold-500 mb-3 group-hover:scale-110 transition-transform duration-200">{f.icon}</div>
              <h3 className="font-semibold text-text-primary text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Reviews */}
      <Section bg="base">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <SectionHeader
            eyebrow="Real Stories"
            title="What Our Guests Say"
            className="mb-0"
          />
          {reviewsData && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center">
                <span className="font-display text-5xl text-gold-400 font-bold">{reviewsData.averageRating}</span>
                <span className="block text-xs text-text-muted">out of 5</span>
              </div>
              <div>
                <Rating value={reviewsData.averageRating} size="lg" />
                <p className="text-sm text-text-secondary mt-1">{reviewsData.totalCount}+ Google reviews</p>
              </div>
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviewsData?.data.slice(0, 6).map((r) => (
            <Card key={r.id} className="flex flex-col">
              <CardBody>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gold-500/20 flex items-center justify-center font-semibold text-gold-400 text-sm">
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary text-sm">{r.name}</p>
                      <p className="text-xs text-text-muted">{r.theatreName}</p>
                    </div>
                  </div>
                  <Rating value={r.rating} size="sm" />
                </div>
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-4">"{r.text}"</p>
                <Badge variant="muted" className="mt-3">{r.occasion}</Badge>
              </CardBody>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="secondary" size="lg">
            <Link to="/reviews">Read All Reviews <ChevronRight size={18} /></Link>
          </Button>
        </div>
      </Section>

      {/* Location */}
      <Section bg="navy">
        <SectionHeader eyebrow="Find Us" title="Visit BOB Talkies" centered />
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-gold-400" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary mb-0.5">Address</p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    BOB Talkies, Kukatpally,<br />Hyderabad, Telangana 500072
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-gold-400" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary mb-0.5">Phone & WhatsApp</p>
                  <a href={`tel:+${config.whatsappNumber}`} className="text-gold-400 hover:text-gold-500 text-sm">
                    +91 {config.whatsappNumber.slice(2)}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-gold-400 text-sm font-bold">hrs</span>
                </div>
                <div>
                  <p className="font-semibold text-text-primary mb-0.5">Operating Hours</p>
                  <p className="text-text-secondary text-sm">10:00 AM – 1:00 AM · 365 Days</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button asChild size="lg">
                <Link to="/book">Book a Theatre</Link>
              </Button>
              <Button asChild variant="whatsapp" size="lg">
                <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={18} /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
          <div className="rounded-card overflow-hidden border border-border-subtle h-72">
            <iframe
              title="BOB Talkies Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30449.63!2d78.3980!3d17.4849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x19688381b30a1!2sKukatpally%2C+Hyderabad!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section bg="base">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl text-text-primary mb-4">
            Ready to Make It <span className="text-gold-400">Special?</span>
          </h2>
          <p className="text-text-secondary text-lg mb-8 leading-relaxed">
            Join thousands of happy customers who chose BOB Talkies for the most memorable celebrations of their lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="xl">
              <Link to="/book">Check Available Slots</Link>
            </Button>
            <Button asChild variant="secondary" size="xl">
              <Link to="/contact">Talk to Us</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  )
}

import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, Monitor, Volume2, ChevronLeft, ChevronRight, Check, MapPin, Calendar, Clock, ArrowRight, Star, Play } from 'lucide-react'
import { format, addMonths, parseISO, getDay } from 'date-fns'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Seo } from '@/components/seo/Seo'
import { PriceTag } from '@/components/ui/PriceTag'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/EmptyState'
import { PageShell } from '@/components/layout/PageShell'
import { formatINR } from '@/lib/utils/currency'
import { formatTime } from '@/lib/utils/date'
import { BookingInclusions } from '@/features/booking/components/BookingInclusions'
import { guestRangeText, theatreFacts, theatreSpec } from '@/features/catalog/theatre'
import { useTheatre } from '@/features/catalog/api'
import { useCalendar, useSlots } from '@/features/booking/hooks/useAvailability'

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <h2 className="font-display text-xl font-bold text-white whitespace-nowrap">{children}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-[#c9a84c]/60 to-transparent" />
    </div>
  )
}

// ─── Per-theatre reviews data ────────────────────────────────────────────────

const DETAIL_REVIEWS: Record<string, {
  name: string; occasion: string; stars: number; text: string;
  avatar: string; thumb: string; hasVideo: boolean;
}[]> = {
  delight: [
    { name: 'Priya & Arjun', occasion: 'Surprise Proposal 💍', stars: 5, text: 'Absolutely magical! The intimate setting made every moment feel so personal. The decor was breathtaking.', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=480&q=80', hasVideo: true },
    { name: 'Sneha R.', occasion: 'Anniversary 🌹', stars: 5, text: 'Perfect cosy theatre for two. The rose petals, the LED board with our names — it was everything I dreamed of.', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=480&q=80', hasVideo: false },
    { name: 'Rahul M.', occasion: 'Birthday Surprise 🎂', stars: 5, text: 'My girlfriend had no idea. She walked in to her favourite song on the big screen. She cried happy tears!', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&q=80', hasVideo: true },
    { name: 'Kavitha S.', occasion: 'Friendship Day 🎊', stars: 5, text: 'Booked Delight for a surprise for my best friend. The staff helped set everything up perfectly. 10/10!', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=480&q=80', hasVideo: false },
  ],
  heavens: [
    { name: 'Divya & Group', occasion: 'Bachelorette 🥂', stars: 5, text: 'We were 6 girls and Heavens was perfect. Great vibes, the screen is huge and staff handled everything so smoothly.', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=480&q=80', hasVideo: false },
    { name: 'Kartik & Friends', occasion: 'Reunion Night 🎉', stars: 5, text: 'Old college gang back together after 5 years. We screened our trip photos and it was so emotional.', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=480&q=80', hasVideo: true },
    { name: 'Meena Family', occasion: 'Family Movie Night 🍿', stars: 5, text: 'Everyone from grandparents to kids had a blast. Clean, comfortable and the sound was amazing.', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=480&q=80', hasVideo: false },
    { name: 'Rohit & Swathi', occasion: 'Date Night 💕', stars: 5, text: 'Surprise date for my wife at Heavens. She loved the whole setup. Already planning a second visit!', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&q=80', hasVideo: true },
  ],
  filmdom: [
    { name: 'Suresh & 10 Friends', occasion: 'Birthday Bash 🎊', stars: 5, text: 'Big group, big screen, big fun! Filmdom lived up to its cinematic name. Stunning picture quality.', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&q=80', hasVideo: true },
    { name: 'Ananya K.', occasion: 'Farewell Party 🌟', stars: 5, text: 'The personal video reel on that giant screen had the whole room in tears. Unforgettable evening.', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=480&q=80', hasVideo: false },
    { name: 'Vignesh B.', occasion: 'Team Outing 🎬', stars: 5, text: 'Used Filmdom for a team outing. Much better than a multiplex — private, premium and everyone gets the best seat.', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=480&q=80', hasVideo: true },
    { name: 'Nisha & Crew', occasion: 'Girls Trip 🛫', stars: 5, text: 'Started the trip with a movie at Filmdom. What a way to kick off the vacation! Absolutely stunning setup.', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=480&q=80', hasVideo: false },
  ],
  cosmos: [
    { name: 'Harsha Family', occasion: 'Grand Anniversary 👑', stars: 5, text: 'Parents\' 25th anniversary in Cosmos was unforgettable. The sheer grandeur made them feel like royalty.', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=480&q=80', hasVideo: true },
    { name: 'Reena & 15 Guests', occasion: 'Baby Shower 🌸', stars: 5, text: 'Cosmos is so spacious and elegant. We had 15 guests and it still felt luxurious. Screen quality blew everyone away.', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&q=80', hasVideo: false },
    { name: 'Nikhil S.', occasion: 'Proposal 💍', stars: 5, text: 'Cosmos was the most dramatic and beautiful setting. She said yes immediately when she saw the screen message!', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=480&q=80', hasVideo: true },
    { name: 'Preethi M.', occasion: 'Mom\'s Birthday 🎂', stars: 5, text: 'Booked Cosmos to celebrate my mom\'s 60th. She felt like a celebrity! The staff made it extra special.', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=480&q=80', hasVideo: false },
  ],
  'vibe-hall': [
    { name: 'Rohit & 30 Friends', occasion: 'IPL Watch Party 🏏', stars: 5, text: 'Rented Vibe Hall for the IPL final. 30 of us watching on that massive screen — better than the stadium!', avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=480&q=80', hasVideo: true },
    { name: 'TechCorp HR Team', occasion: 'Team Outing 💼', stars: 5, text: 'Used it for a team-building session and movie. Great sound, comfortable seating — everyone loved it.', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=480&q=80', hasVideo: false },
    { name: 'Swathi\'s Birthday Crew', occasion: 'Big Birthday Party 🎈', stars: 5, text: '40 people, one epic party. Vibe Hall delivered on every front. Everyone kept asking where we booked!', avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=480&q=80', hasVideo: true },
    { name: 'Arun & Squad', occasion: 'New Year Bash 🎆', stars: 5, text: 'New Year party at Vibe Hall was a dream. The screen, the sound, the whole vibe — absolutely electric!', avatar: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=100&q=70', thumb: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=480&q=80', hasVideo: false },
  ],
}

export default function TheatreDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [activeImg, setActiveImg] = useState(0)
  const [videoReview, setVideoReview] = useState<{ name: string; occasion: string; thumb: string } | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'))

  const { data: theatre, isLoading, isError, refetch } = useTheatre(slug)

  const { data: slots, isLoading: slotsLoading } = useSlots(theatre?.id ?? null, selectedDate)
  const { data: calendar } = useCalendar(theatre?.id ?? null, currentMonth)

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
        description={`Book ${theatre.name} at BOB Talkies. ${theatre.screenSize} screen, ${theatre.soundSystem}. Starting from ${formatINR(theatre.startingPricePaise)}.`}
        canonical={`/theatres/${slug}`}
        ogImage={theatre.images[0]}
      />

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 hidden md:block backdrop-blur-md border-t border-white/15 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]" style={{ background: 'rgba(67,9,72,0.92)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-display text-lg font-bold text-white">{theatre.name}</span>
            <span className="h-4 w-px bg-white/20" />
            <span className="text-sm text-white/60">{guestRangeText(theatre, 'guests')}</span>
          </div>
          <div className="flex items-center gap-5">
            <PriceTag paise={theatre.startingPricePaise} dark />
            <Link to={`/book?theatre=${theatre.id}`} className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#5c1535,#8b1a3a)] text-white text-sm font-bold px-6 py-2.5 hover:opacity-90 transition-opacity shadow-[0_4px_16px_rgba(50,16,95,0.4)]">
              Book Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#430948',
          backgroundImage: [
            'radial-gradient(ellipse 48% 18% at 78% 20%, rgba(150,14,128,0.62), rgba(150,14,128,0) 100%)',
            'radial-gradient(ellipse 42% 20% at 16% 50%, rgba(122,10,112,0.55), rgba(122,10,112,0) 100%)',
            'radial-gradient(ellipse 50% 14% at 68% 84%, rgba(140,12,120,0.55), rgba(140,12,120,0) 100%)',
            'radial-gradient(ellipse 36% 8% at 14% 8%, rgba(96,8,92,0.5), rgba(96,8,92,0) 100%)',
            'linear-gradient(180deg, #2a0430 0%, #430948 100%)',
          ].join(','),
          backgroundSize: '100% 1600px, 100% 1600px, 100% 1600px, 100% 1600px, 100% 600px',
          backgroundRepeat: 'repeat-y, repeat-y, repeat-y, repeat-y, no-repeat',
        }}
      >
      <PageShell fullWidth className="pb-24 bg-transparent">

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
                <span className="text-white/60 text-sm">{guestRangeText(theatre, 'guests')}</span>
              </motion.div>
            </motion.div>
          </div>

          {/* Thumbnail strip */}
          <div className="border-b border-white/10 px-4 md:px-12 py-2.5 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ background: 'rgba(26,5,48,0.75)', backdropFilter: 'blur(10px)', scrollbarWidth: 'none' }}>
            {theatre.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-[#c9a84c] shadow-[0_0_8px_rgba(201,168,76,0.35)]' : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#e8d5a3]'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick stats bar ── */}
        <div className="border-b border-white/10" style={{ background: 'rgba(26,5,48,0.6)', backdropFilter: 'blur(8px)' }}>
          <motion.div
            className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-wrap gap-6 md:gap-10"
            initial="hidden" animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } } }}
          >
            {[
              { icon: <Users size={15} />, label: guestRangeText(theatre) },
              { icon: <Monitor size={15} />, label: theatre.screenSize },
              { icon: <Monitor size={15} />, label: theatre.resolution },
              { icon: <Volume2 size={15} />, label: theatre.soundSystem },
              { icon: <MapPin size={15} />, label: 'Kukatpally, Hyderabad' },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} transition={{ duration: 0.4 }}
                className="flex items-center gap-2 text-sm">
                <span className="text-[#c9a84c]">{s.icon}</span>
                <span className="text-white/85 font-medium">{s.label}</span>
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
                <p className="text-white/70 leading-relaxed text-base">
                  {theatre.description || `${theatreSpec(theatre)}. ${theatre.tagline}.`}
                </p>
              </RevealSection>

              {/* Facilities */}
              <RevealSection>
                <SectionTitle>Facilities Included</SectionTitle>
                <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {theatreFacts(theatre).map((f) => (
                    <motion.li key={f} variants={fadeUp} transition={{ duration: 0.35 }}
                      whileHover={{ y: -3, boxShadow: '0 6px 20px rgba(201,168,76,0.15)' }}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-3 border border-white/15 text-sm text-white/90 font-medium list-none cursor-default" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c9a84c]/15 border border-[#c9a84c]/30">
                        <Check size={11} className="text-[#c9a84c]" />
                      </span>
                      {f}
                    </motion.li>
                  ))}
                </StaggerGrid>
              </RevealSection>

              {/* What's included in my booking */}
              <RevealSection>
                <SectionTitle>What's Included in My Booking</SectionTitle>
                <BookingInclusions theatre={theatre} dark />
              </RevealSection>

              {/* Suitable for */}
              <RevealSection>
                <SectionTitle>Perfect For</SectionTitle>
                <StaggerGrid className="flex flex-wrap gap-2">
                  {theatre.suitableFor.map((s) => (
                    <motion.span key={s} variants={fadeUp} transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.06 }}
                      className="capitalize text-sm font-semibold text-[#f5c76a] border border-[#c9a84c]/40 bg-[#c9a84c]/15 rounded-full px-4 py-1.5 hover:bg-[#c9a84c]/25 transition-colors cursor-default">
                      {s.replace(/-/g, ' ')}
                    </motion.span>
                  ))}
                </StaggerGrid>
              </RevealSection>

              {/* Reviews */}
              {(() => {
                const reviews = DETAIL_REVIEWS[slug ?? ''] ?? []
                if (!reviews.length) return null
                return (
                  <RevealSection>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-display text-xl font-bold text-white whitespace-nowrap">Guest Reviews</h2>
                      <div className="flex-1 h-px bg-gradient-to-r from-[#c9a84c]/60 to-transparent" />
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="#c9a84c" stroke="none" />)}
                      <span className="text-sm font-black text-white">5.0</span>
                      <span className="text-xs text-white/40 ml-1">· Verified guests</span>
                    </div>
                    <StaggerGrid className="grid sm:grid-cols-2 gap-5">
                      {reviews.map((r, i) => (
                        <motion.div key={i} variants={fadeUp} transition={{ duration: 0.4 }}
                          whileHover={{ y: -4, boxShadow: '0 12px 36px rgba(201,168,76,0.14)' }}
                          className="group rounded-2xl border border-white/10 hover:border-[#c9a84c]/60 transition-all overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(135,0,79,0.20) 50%, rgba(59,0,42,0.32) 100%)', backdropFilter: 'blur(14px)' }}>
                          {/* Thumb */}
                          <div
                            className="relative h-36 overflow-hidden cursor-pointer"
                            onClick={() => r.hasVideo && setVideoReview(r)}
                          >
                            <img src={r.thumb} alt={r.occasion} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                            <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider rounded-full px-2.5 py-1 text-white bg-[#c9a84c]">{r.occasion}</span>
                            {r.hasVideo && (
                              <>
                                <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1">
                                  <Play size={9} className="text-white" fill="white" />
                                  <span className="text-[9px] font-bold text-white">Watch Reel</span>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 bg-white/20 backdrop-blur-sm">
                                    <Play size={13} className="text-white ml-0.5" fill="white" />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          {/* Body */}
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <img src={r.avatar} alt={r.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-[#c9a84c]/30" />
                              <div>
                                <p className="font-black text-white text-sm">{r.name}</p>
                                <div className="flex gap-0.5 mt-0.5">{[1,2,3,4,5].map(s => <Star key={s} size={9} fill="#f59e0b" stroke="none" />)}</div>
                              </div>
                            </div>
                            <p className="text-white/75 text-sm leading-relaxed">
                              <span className="text-lg font-serif leading-none mr-0.5 text-[#c9a84c]">"</span>
                              {r.text}
                              <span className="text-lg font-serif leading-none ml-0.5 text-[#c9a84c]">"</span>
                            </p>
                          </div>
                          <div className="h-[3px] bg-gradient-to-r from-[#c9a84c] to-[#c9a84c]/30" />
                        </motion.div>
                      ))}
                    </StaggerGrid>
                  </RevealSection>
                )
              })()}

              {/* Video overlay */}
              <AnimatePresence>
                {videoReview && (
                  <motion.div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setVideoReview(null)}
                  >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <motion.div
                      className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden"
                      initial={{ scale: 0.88, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 40 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      onClick={e => e.stopPropagation()}
                      style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 2px #c9a84c' }}
                    >
                      <div className="relative bg-[#0d0618]" style={{ aspectRatio: '16/9' }}>
                        <img src={videoReview.thumb} alt="" className="w-full h-full object-cover opacity-70" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <motion.div
                            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-md"
                            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
                          >
                            <Play size={24} className="text-white ml-1" fill="white" />
                          </motion.div>
                          <div className="rounded-full bg-black/50 backdrop-blur-sm px-5 py-2 text-center">
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-0.5">Guest Reel · Coming Soon</p>
                            <p className="text-white font-black text-sm">{videoReview.name} · {videoReview.occasion}</p>
                          </div>
                        </div>
                        <div className="absolute top-0 inset-x-0 h-1 bg-[#c9a84c]" />
                      </div>
                    </motion.div>
                    <button
                      className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                      onClick={() => setVideoReview(null)}
                    >✕</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Sidebar ── */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}>
              <div className="sticky top-24 rounded-2xl border border-white/15 overflow-hidden" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.11) 0%, rgba(135,0,79,0.26) 50%, rgba(59,0,42,0.40) 100%)', backdropFilter: 'blur(16px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.18)' }}>
                {/* Header */}
                <div className="bg-[#5c1535] px-5 py-4">
                  <h3 className="font-display text-lg font-bold text-white">Check Availability</h3>
                  <p className="text-white/60 text-xs mt-0.5">Pick a date to see open slots</p>
                </div>

                <div className="p-5 space-y-5">
                  {/* Mini calendar */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <button onClick={() => setCurrentMonth(format(addMonths(parseISO(`${currentMonth}-01`), -1), 'yyyy-MM'))}
                        className="p-1.5 rounded-lg text-white/50 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors"
                        aria-label="Previous month"><ChevronLeft size={16} /></button>
                      <span className="text-sm font-bold text-white">{format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}</span>
                      <button onClick={() => setCurrentMonth(format(addMonths(parseISO(`${currentMonth}-01`), 1), 'yyyy-MM'))}
                        className="p-1.5 rounded-lg text-white/50 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-colors"
                        aria-label="Next month"><ChevronRight size={16} /></button>
                    </div>
                    <div className="grid grid-cols-7 text-center mb-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <span key={i} className="text-[9px] text-white/35 py-1 font-bold uppercase tracking-widest">{d}</span>
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
                                ? 'text-white/20 cursor-not-allowed'
                                : day.status === 'high_demand'
                                ? 'text-orange-400 hover:bg-orange-500/15'
                                : day.status === 'offer_date'
                                ? 'text-[#c9a84c] hover:bg-[#c9a84c]/15'
                                : 'text-white/70 hover:bg-[#c9a84c]/15 hover:text-white'
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
                      <span className="text-sm font-bold text-white">{format(parseISO(selectedDate), 'dd MMM yyyy')}</span>
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
                                ? 'border-white/8 text-white/25 cursor-not-allowed pointer-events-none bg-white/4'
                                : slot.status === 'high_demand'
                                ? 'border-orange-400/40 bg-orange-500/10 text-white hover:bg-orange-500/20'
                                : 'border-white/15 hover:border-[#c9a84c]/60 hover:bg-[#c9a84c]/10 text-white/90'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Clock size={12} className="text-[#c9a84c]/70" />
                              {formatTime(slot.start)} – {formatTime(slot.end)}
                              {slot.status === 'high_demand' && (
                                <span className="text-[9px] font-black uppercase text-orange-500 border border-orange-200 bg-orange-50 rounded-full px-1.5 py-0.5 tracking-wide">Hot</span>
                              )}
                            </span>
                            <span className="text-right text-sm">
                              {slot.originalPricePaise != null && slot.originalPricePaise > slot.pricePaise && (
                                <>
                                  <span className="block text-[9px] font-black uppercase tracking-wide text-[#f5a0bc]">{slot.offerLabel}</span>
                                  <s className="mr-1 text-xs text-white/35">{formatINR(slot.originalPricePaise)}</s>
                                </>
                              )}
                              <span className="font-bold text-[#f5c76a]">{formatINR(slot.pricePaise)}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Book CTA */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-white/45">Starting from</span>
                      <PriceTag paise={theatre.startingPricePaise} prefix="" dark />
                    </div>
                    <Link
                      to={`/book?theatre=${theatre.id}&date=${selectedDate}`}
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-[linear-gradient(135deg,#5c1535,#8b1a3a)] text-white text-sm font-bold py-3 hover:opacity-90 transition-opacity shadow-[0_4px_20px_rgba(50,16,95,0.5)]"
                    >
                      Book Now <ArrowRight size={14} />
                    </Link>
                    <p className="text-center text-[10px] text-white/35 mt-2">No advance payment required</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </PageShell>
      </div>
    </>
  )
}

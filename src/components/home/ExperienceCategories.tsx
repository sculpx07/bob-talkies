import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, Tv, Trophy, Users, Briefcase, ChevronRight, ArrowRight } from 'lucide-react'

const CATEGORIES = [
  {
    id: 'celebrations',
    label: 'Celebrations',
    icon: Heart,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.12)',
    img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=900&q=80',
    tagline: 'Make every moment unforgettable',
    items: [
      { label: 'Birthday Celebrations',       slug: 'birthday',    emoji: '🎂' },
      { label: 'Anniversaries',               slug: 'anniversary', emoji: '💍' },
      { label: 'Romantic Date Nights',        slug: 'date-night',  emoji: '🕯️' },
      { label: 'Marriage Proposals',          slug: 'proposal',    emoji: '💍' },
      { label: 'Bride-to-Be Celebrations',    slug: 'birthday',    emoji: '👰' },
      { label: 'Baby Showers',                slug: 'family',      emoji: '🍼' },
      { label: 'Family Celebrations',         slug: 'family',      emoji: '👨‍👩‍👧‍👦' },
      { label: 'Surprise Parties',            slug: 'birthday',    emoji: '🎉' },
    ],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Tv,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
    img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900&q=80',
    tagline: 'Your screen, your content, your rules',
    items: [
      { label: 'Private Movie Screenings',    slug: 'movie-night',      emoji: '🎬' },
      { label: 'OTT Movie Nights',            slug: 'movie-night',      emoji: '📺' },
      { label: 'Movie Marathons',             slug: 'movie-night',      emoji: '🍿' },
      { label: 'Anime Screenings',            slug: 'movie-night',      emoji: '🎌' },
      { label: 'Family Movie Nights',         slug: 'family',           emoji: '👨‍👩‍👧' },
      { label: 'Special Video Screenings',    slug: 'movie-night',      emoji: '🎞️' },
      { label: 'Music & Entertainment',       slug: 'movie-night',      emoji: '🎵' },
    ],
  },
  {
    id: 'sports',
    label: 'Sports & Fans',
    icon: Trophy,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    img: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&q=80',
    tagline: 'Big matches deserve a bigger screen',
    items: [
      { label: 'Live Cricket Screenings',     slug: 'sports-screening', emoji: '🏏' },
      { label: 'Football Match Nights',       slug: 'sports-screening', emoji: '⚽' },
      { label: 'IPL Screening Parties',       slug: 'sports-screening', emoji: '🏆' },
      { label: 'World Cup Watch Parties',     slug: 'sports-screening', emoji: '🌍' },
      { label: 'Fan Gatherings',              slug: 'sports-screening', emoji: '📣' },
      { label: 'Team Celebration Screenings', slug: 'sports-screening', emoji: '🎊' },
      { label: 'Movie Fan Screenings',        slug: 'movie-night',      emoji: '🎥' },
      { label: 'Teaser & Trailer Launches',   slug: 'movie-night',      emoji: '🎞️' },
    ],
  },
  {
    id: 'social',
    label: 'Social & Groups',
    icon: Users,
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=80',
    tagline: 'Reconnect and celebrate together',
    items: [
      { label: "Friends' Reunions",           slug: 'friends',     emoji: '🤝' },
      { label: 'Farewell Parties',            slug: 'friends',     emoji: '👋' },
      { label: 'College Gatherings',          slug: 'friends',     emoji: '🎓' },
      { label: 'Family Get-Togethers',        slug: 'family',      emoji: '🏠' },
      { label: 'Gaming Nights',               slug: 'friends',     emoji: '🎮' },
      { label: 'Karaoke Sessions',            slug: 'friends',     emoji: '🎤' },
      { label: 'Group Movie Nights',          slug: 'movie-night', emoji: '🎬' },
    ],
  },
  {
    id: 'corporate',
    label: 'Corporate',
    icon: Briefcase,
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.12)',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
    tagline: 'Professional moments in a premium space',
    items: [
      { label: 'Corporate Team Gatherings',   slug: 'corporate', emoji: '👥' },
      { label: 'Office Celebrations',         slug: 'corporate', emoji: '🥂' },
      { label: 'Private Presentations',       slug: 'corporate', emoji: '📊' },
      { label: 'Team Entertainment Sessions', slug: 'corporate', emoji: '🎯' },
      { label: 'Private Group Events',        slug: 'corporate', emoji: '🎪' },
    ],
  },
] as const

type CategoryId = typeof CATEGORIES[number]['id']

export function ExperienceCategories() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [active, setActive] = useState<CategoryId>('celebrations')
  const cat = CATEGORIES.find(c => c.id === active)!
  const Icon = cat.icon

  return (
    <section
      ref={ref}
      className="py-10 md:py-14"
      style={{ background: 'linear-gradient(180deg,#fffaf4 0%,#fdf5e8 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="font-cursive text-2xl md:text-3xl text-[#c9933a] mb-1">Every Experience</p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#2a0e4f] leading-tight mb-2">
            One Theatre. Endless Possibilities.
          </h2>
          <motion.div
            className="mx-auto h-[3px] rounded-full bg-[#d4a94a]"
            initial={{ width: 0 }}
            animate={inView ? { width: 40 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <p className="mt-3 text-[#5b4578] text-sm max-w-lg mx-auto">
            Not just a place to watch movies. A space to celebrate, cheer, connect and create unforgettable experiences.
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          {CATEGORIES.map(c => {
            const CIcon = c.icon
            const isActive = c.id === active
            return (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all"
                style={
                  isActive
                    ? { background: 'linear-gradient(135deg,#2a0e4f,#4a1a8a)', color: '#fff', boxShadow: '0 4px 14px rgba(42,14,79,0.25)' }
                    : { background: 'rgba(42,14,79,0.07)', color: '#5b4578', border: '1px solid #f0e6cc' }
                }
              >
                <CIcon size={14} />
                {c.label}
              </button>
            )
          })}
        </motion.div>

        {/* Category panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-5 items-stretch"
          >
            {/* Feature image card */}
            <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: 340 }}>
              <img
                src={cat.img}
                alt={cat.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2a0e4f]/85 via-[#2a0e4f]/30 to-transparent" />
              <div className="absolute inset-0 p-7 flex flex-col justify-end">
                <div
                  className="inline-flex self-start items-center gap-2 rounded-full px-3 py-1.5 mb-4"
                  style={{ background: cat.bg, border: `1px solid ${cat.color}40` }}
                >
                  <Icon size={15} style={{ color: cat.color }} />
                  <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.label}</span>
                </div>
                <h3 className="font-black text-white text-2xl md:text-3xl leading-tight mb-2">
                  {cat.tagline}
                </h3>
                <Link
                  to="/book"
                  className="mt-4 self-start inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black text-[#2a0e4f] transition-all hover:brightness-110 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#c9a84c,#eed98a 50%,#c9a84c)' }}
                >
                  Book Now <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Sub-items grid */}
            <div className="grid grid-cols-2 gap-3 content-start">
              {cat.items.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <Link
                    to={`/book?occasion=${item.slug}`}
                    className="group flex items-center gap-3 rounded-2xl border border-[#f0e6cc] bg-white/70 p-4 transition-all hover:-translate-y-1 hover:border-[#c9a84c]/40 hover:shadow-md"
                    style={{ boxShadow: '0 2px 8px rgba(42,14,79,0.04)' }}
                  >
                    <span className="text-xl shrink-0">{item.emoji}</span>
                    <span className="text-sm font-semibold text-[#2a0e4f] leading-snug flex-1">{item.label}</span>
                    <ChevronRight size={13} className="shrink-0 text-[#c9a84c] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Seo } from '@/components/seo/Seo'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { ArrowRight, ArrowUpRight, Calendar, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  coverImage: string
  category: string
  author: string
  publishedAt: string
  readingTime: number
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-plan-perfect-birthday-surprise-private-theatre',
    title: 'How to Plan the Perfect Birthday Surprise in a Private Theatre',
    excerpt: 'Step-by-step guide to orchestrating a birthday surprise that will leave your loved one speechless — from secret coordination to decoration choices.',
    coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    category: 'Birthday',
    author: 'Team BOB Talkies',
    publishedAt: '2025-01-10',
    readingTime: 6,
  },
  {
    slug: 'best-anniversary-ideas-hyderabad-2025',
    title: '10 Romantic Anniversary Ideas in Hyderabad for 2025',
    excerpt: 'From candlelit dinners to private cinema experiences, here are the most memorable ways to celebrate your anniversary in the City of Pearls.',
    coverImage: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800',
    category: 'Anniversary',
    author: 'Team BOB Talkies',
    publishedAt: '2025-01-05',
    readingTime: 8,
  },
  {
    slug: 'private-theatre-vs-multiplex-which-is-better',
    title: 'Private Theatre vs Multiplex: Which Is Better for a Date Night?',
    excerpt: 'We break down the pros and cons of a private theatre experience versus a traditional multiplex date night — and why more couples are choosing privacy.',
    coverImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800',
    category: 'Guides',
    author: 'Team BOB Talkies',
    publishedAt: '2024-12-28',
    readingTime: 5,
  },
  {
    slug: 'proposal-ideas-hyderabad-say-yes',
    title: 'She Said Yes! 7 Unforgettable Proposal Ideas in Hyderabad',
    excerpt: 'Real proposal stories and ideas from couples who chose BOB Talkies for their big moment. Inspiration for your most important question ever.',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    category: 'Proposal',
    author: 'Team BOB Talkies',
    publishedAt: '2024-12-20',
    readingTime: 7,
  },
  {
    slug: 'what-to-expect-private-theatre-first-time',
    title: 'First Time at a Private Theatre? Here\'s Everything You Need to Know',
    excerpt: 'A complete beginner\'s guide to booking and enjoying a private theatre — what\'s included, how to customise, what to bring, and how to make the most of it.',
    coverImage: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=800',
    category: 'Guides',
    author: 'Team BOB Talkies',
    publishedAt: '2024-12-15',
    readingTime: 9,
  },
  {
    slug: 'corporate-team-outing-ideas-hyderabad',
    title: 'Beyond the Usual: Corporate Team Outing Ideas in Hyderabad',
    excerpt: 'Why forward-thinking HR teams are replacing tired team dinners with private theatre screenings — and how to plan one for your team.',
    coverImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
    category: 'Corporate',
    author: 'Team BOB Talkies',
    publishedAt: '2024-12-08',
    readingTime: 6,
  },
]

const ALL_CATEGORIES = ['All', ...Array.from(new Set(BLOG_POSTS.map((p) => p.category)))]

const EASE = [0.22, 1, 0.36, 1] as const
const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function BlogPage() {
  const [category, setCategory] = useState('All')
  const featured = BLOG_POSTS[0]
  const rest = BLOG_POSTS.slice(1).filter((p) => category === 'All' || p.category === category)

  return (
    <>
      <Seo
        title="Blog | BOB Talkies — Private Theatre Tips & Celebration Ideas"
        description="Celebration ideas, planning guides and inspiration for birthdays, anniversaries, proposals and more from the BOB Talkies blog."
        canonical="/blog"
      />
      <PageShell>
        <SectionHeader
          eyebrow="The BOB Blog"
          title="Celebration Ideas & Guides"
          subtitle="Inspiration, tips and real stories from thousands of celebrations at BOB Talkies."
          centered
        />

        {/* Featured post: photo + plum panel */}
        <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <Link
            to={`/blog/${featured.slug}`}
            className="group mb-12 grid overflow-hidden rounded-[2rem] bg-[#1b0b3a] shadow-[0_30px_70px_rgba(42,14,79,0.3)] ring-1 ring-white/10 lg:grid-cols-[1.15fr_1fr]"
          >
            <div className="relative h-64 overflow-hidden sm:h-80 lg:h-auto lg:min-h-[420px]">
              <img src={featured.coverImage} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#1b0b3a]/50 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#1b0b3a]/40" />
              <span className="absolute left-5 top-5 rounded-full bg-[#f5d7a1] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4a2a00]">Featured</span>
            </div>
            <div className="relative flex flex-col justify-center p-7 text-white sm:p-10">
              <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#d946ef]/25 blur-3xl" aria-hidden="true" />
              <p className="relative text-[11px] font-bold uppercase tracking-[0.28em] text-[#f5d7a1]">{featured.category}</p>
              <h2 className="relative mt-3 font-display text-2xl font-semibold leading-tight !text-white sm:text-3xl lg:text-4xl">{featured.title}</h2>
              <p className="relative mt-4 line-clamp-3 text-sm leading-relaxed text-white/70 sm:text-base">{featured.excerpt}</p>
              <div className="relative mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
                <span className="flex items-center gap-1.5"><Calendar size={13} />{fmt(featured.publishedAt)}</span>
                <span className="flex items-center gap-1.5"><Clock size={13} />{featured.readingTime} min read</span>
              </div>
              <span className="relative mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[linear-gradient(135deg,#6b2398,#d946ef)] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(217,70,239,0.35)] transition-transform group-hover:translate-x-1">
                Read article <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter articles by category">
          {ALL_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition-all',
                category === c
                  ? 'bg-[linear-gradient(135deg,#32105f,#6b2398)] text-white shadow-[0_8px_20px_rgba(50,16,95,0.3)]'
                  : 'bg-white/70 text-[#5b4578] ring-1 ring-[#ecd9ec] hover:bg-white hover:text-[#32105f]',
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {rest.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#ddd0f5] px-4 py-12 text-center text-sm text-[#7d7094]">No more articles in this category yet.</p>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -40px 0px' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: EASE }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-[1.75rem] border border-[#ecd9ec] bg-white/80 p-2 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(107,35,152,0.16)]"
                >
                  {/* photo set inside the card with its own rounded corners */}
                  <div className="aspect-[4/3] overflow-hidden rounded-3xl">
                    <img src={post.coverImage} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col px-3 pb-5 pt-6">
                    <div className="flex items-center gap-6 text-[15px] text-[#6a5f7d]">
                      <span className="flex items-center gap-2"><Calendar size={16} className="text-[#8e39c7]" />{fmt(post.publishedAt)}</span>
                      <span className="flex items-center gap-2"><Clock size={16} className="text-[#8e39c7]" />{post.readingTime} min read</span>
                    </div>
                    <hr className="my-4 border-[#f1e2f0]" />
                    <h3 className="line-clamp-2 font-display text-2xl font-normal leading-snug text-[#2a0e4f]">{post.title}</h3>
                    <p className="mt-3 line-clamp-3 flex-1 text-base leading-8 text-[#5b4578]">{post.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#2a0e4f]">
                      Read more <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </PageShell>
    </>
  )
}

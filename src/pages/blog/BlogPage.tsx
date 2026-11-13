import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Clock } from 'lucide-react'

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

export default function BlogPage() {
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

        {/* Featured post */}
        <Link to={`/blog/${BLOG_POSTS[0].slug}`} className="block mb-14 group">
          <div className="relative rounded-card overflow-hidden h-72 md:h-96">
            <img
              src={BLOG_POSTS[0].coverImage}
              alt={BLOG_POSTS[0].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 md:p-8 max-w-2xl">
              <Badge variant="gold" className="mb-3">{BLOG_POSTS[0].category}</Badge>
              <h2 className="font-display text-2xl md:text-3xl text-text-primary mb-2 group-hover:text-gold-400 transition-colors">
                {BLOG_POSTS[0].title}
              </h2>
              <p className="text-text-secondary text-sm line-clamp-2 hidden md:block">{BLOG_POSTS[0].excerpt}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Calendar size={11} />{new Date(BLOG_POSTS[0].publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{BLOG_POSTS[0].readingTime} min read</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {BLOG_POSTS.slice(1).map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="group flex flex-col bg-bg-surface border border-border-subtle rounded-card overflow-hidden hover:border-gold-500/40 transition-all">
              <div className="h-48 overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 flex flex-col p-5">
                <Badge variant="muted" className="self-start mb-3">{post.category}</Badge>
                <h3 className="font-display text-lg text-text-primary mb-2 group-hover:text-gold-400 transition-colors line-clamp-2 flex-1">
                  {post.title}
                </h3>
                <p className="text-text-secondary text-sm line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1"><Calendar size={10} />{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{post.readingTime} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </PageShell>
    </>
  )
}

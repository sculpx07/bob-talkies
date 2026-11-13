import { useParams, Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { PageShell } from '@/components/layout/PageShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { BLOG_POSTS } from '@/pages/blog/BlogPage'
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react'

const POST_CONTENT: Record<string, string> = {
  'how-to-plan-perfect-birthday-surprise-private-theatre': `
Planning a birthday surprise for someone you love is both exciting and nerve-wracking. A private theatre experience adds a cinematic touch that transforms a simple birthday into an unforgettable memory.

## Step 1: Book the Right Theatre

Start by choosing a theatre that fits your group size. BOB Talkies offers 5 theatres ranging from intimate 2-person setups to grand halls for 40 guests. For a small surprise, the Delight or Heavens theatre works perfectly. For a bigger celebration, consider Filmdom or Cosmos.

**Pro tip:** Book at least a week in advance for weekend slots — they fill up fast.

## Step 2: Coordinate the Surprise

The hardest part is getting the birthday person to arrive without suspecting a thing. Here are strategies that work:

- **The fake plan:** Tell them you're taking them out for dinner, then "accidentally" stop at BOB Talkies first.
- **The errand cover:** Ask a mutual friend to bring them in under the pretense of picking something up.
- **The direct lie:** Some secrets are worth keeping — tell them you're going to watch a movie together.

## Step 3: Choose Your Decorations

BOB Talkies offers a range of decoration packages. The basic setup includes balloon bouquets and a "Happy Birthday" backdrop. The premium package adds rose petals, fairy lights, a custom photo banner, and a cake setup area.

For the most impact, go for the platinum decoration package — it's worth every rupee when you see their face light up.

## Step 4: Order the Cake

You can either bring your own cake or order through us. We partner with local premium bakeries and can arrange custom cakes with 48 hours notice. Photo cakes are a crowd favourite.

## Step 5: Plan the Screening

What movie will you watch? A few approaches:
- Their all-time favourite film (always a winner)
- A compilation of family/friend videos and photos (gets everyone emotional in the best way)
- A new release they've been excited about

## Step 6: The Reveal Moment

Coordinate with our team to have everything ready before the guest of honour arrives. When they walk in to a decorated theatre, surprise music playing, and their loved ones yelling "SURPRISE!" — it's pure magic.

---

Ready to plan the surprise? [Book a theatre now](/book) and our team will help you with every detail over WhatsApp.
  `,
}

const DEFAULT_CONTENT = `This article is coming soon. Check back later for the full post.`

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    return (
      <>
        <Seo title="Post Not Found | BOB Talkies Blog" description="This blog post could not be found." noindex />
        <PageShell>
          <div className="max-w-2xl mx-auto text-center py-24">
            <p className="text-text-muted mb-6">This post doesn't exist or may have been moved.</p>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </PageShell>
      </>
    )
  }

  const content = POST_CONTENT[post.slug] ?? DEFAULT_CONTENT

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: post!.title, url: window.location.href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {})
    }
  }

  const related = BLOG_POSTS.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 2)

  return (
    <>
      <Seo
        title={`${post.title} | BOB Talkies Blog`}
        description={post.excerpt}
        canonical={`/blog/${post.slug}`}
        ogImage={post.coverImage}
      />
      <PageShell>
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-text-muted hover:text-gold-400 text-sm mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          {/* Header */}
          <Badge variant="gold" className="mb-4">{post.category}</Badge>
          <h1 className="font-display text-3xl md:text-4xl text-text-primary leading-tight mb-4">{post.title}</h1>
          <p className="text-text-secondary text-lg mb-6">{post.excerpt}</p>

          <div className="flex items-center justify-between mb-8 pb-6 border-b border-border-subtle">
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <span className="flex items-center gap-1.5"><Calendar size={13} />
                {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5"><Clock size={13} />{post.readingTime} min read</span>
              <span>By {post.author}</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-text-muted hover:text-gold-400 transition-colors text-sm"
              aria-label="Share this article"
            >
              <Share2 size={14} /> Share
            </button>
          </div>

          {/* Cover image */}
          <img
            src={post.coverImage.replace('w=800', 'w=1200')}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-card mb-10"
          />

          {/* Content */}
          <div className="prose prose-invert prose-sm max-w-none text-text-secondary leading-relaxed space-y-5">
            {content.split('\n\n').map((block, i) => {
              if (block.startsWith('## ')) {
                return <h2 key={i} className="font-display text-xl text-text-primary mt-10 mb-4">{block.slice(3)}</h2>
              }
              if (block.startsWith('**') && block.endsWith('**')) {
                return <p key={i} className="font-semibold text-text-primary">{block.slice(2, -2)}</p>
              }
              if (block.startsWith('- ')) {
                const items = block.split('\n').filter((l) => l.startsWith('- '))
                return (
                  <ul key={i} className="list-disc list-inside space-y-1.5">
                    {items.map((item, j) => <li key={j}>{item.slice(2)}</li>)}
                  </ul>
                )
              }
              if (block.startsWith('---')) {
                return <hr key={i} className="border-border-subtle my-8" />
              }
              // Handle inline links: [text](/path)
              const withLinks = block.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-gold-400 hover:underline">$1</a>')
              return <p key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: withLinks }} />
            })}
          </div>

          {/* CTA */}
          <div className="mt-14 p-8 bg-bg-surface border border-gold-500/30 rounded-card text-center">
            <h3 className="font-display text-xl text-text-primary mb-2">Ready to Create Your Own Memory?</h3>
            <p className="text-text-secondary text-sm mb-5">Book a private theatre and let our team handle every detail.</p>
            <Button asChild size="lg">
              <Link to="/book">Book a Theatre</Link>
            </Button>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="mt-16">
              <h3 className="font-display text-xl text-text-primary mb-6">More {post.category} Ideas</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {related.map((p) => (
                  <Link key={p.slug} to={`/blog/${p.slug}`} className="group flex gap-4 bg-bg-surface border border-border-subtle rounded-card p-4 hover:border-gold-500/40 transition-all">
                    <img src={p.coverImage} alt={p.title} className="w-20 h-20 object-cover rounded-lg shrink-0" loading="lazy" />
                    <div>
                      <h4 className="text-sm font-medium text-text-primary group-hover:text-gold-400 transition-colors line-clamp-2 mb-1">{p.title}</h4>
                      <span className="text-xs text-text-muted">{p.readingTime} min read</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </PageShell>
    </>
  )
}

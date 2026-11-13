import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'

const CATEGORIES = ['All', 'Birthday', 'Anniversary', 'Couple', 'Proposal', 'Friends', 'Family', 'Decoration', 'Cake Cutting']

const GALLERY_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', alt: 'Birthday celebration with decorations', category: 'Birthday' },
  { src: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600', alt: 'Romantic anniversary setup', category: 'Anniversary' },
  { src: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600', alt: 'Couple enjoying private cinema', category: 'Couple' },
  { src: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?w=600', alt: 'Friends watching movie in private theatre', category: 'Friends' },
  { src: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600', alt: 'Premium theatre decoration setup', category: 'Decoration' },
  { src: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600', alt: 'Birthday cake cutting in theatre', category: 'Cake Cutting' },
  { src: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600', alt: 'Private theatre interior view', category: 'Anniversary' },
  { src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', alt: 'Proposal moment in cinema', category: 'Proposal' },
  { src: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=600', alt: 'Birthday decoration with LED lights', category: 'Birthday' },
  { src: 'https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600', alt: 'Group of friends celebrating', category: 'Friends' },
  { src: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600', alt: 'Family celebration in private hall', category: 'Family' },
  { src: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600', alt: 'Grand decoration setup', category: 'Decoration' },
]

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState('')

  const filtered = activeCategory === 'All' ? GALLERY_IMAGES : GALLERY_IMAGES.filter((i) => i.category === activeCategory)

  return (
    <>
      <Seo
        title="Gallery | BOB Talkies Private Theatre"
        description="See photos and videos from real celebrations at BOB Talkies — birthdays, anniversaries, proposals and more."
        canonical="/gallery"
      />
      <PageShell>
        <SectionHeader
          eyebrow="Gallery"
          title="Memories Made at BOB Talkies"
          subtitle="A glimpse into real celebrations. Every photo tells a story of joy, love and unforgettable moments."
          centered
        />

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-colors',
                activeCategory === cat ? 'bg-gold-gradient text-bg-base' : 'border border-border-subtle text-text-secondary hover:text-gold-400',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.map((img, i) => (
            <button
              key={i}
              className="w-full block break-inside-avoid rounded-card overflow-hidden hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-gold-500"
              onClick={() => { setLightboxSrc(img.src); setLightboxAlt(img.alt) }}
              aria-label={`View ${img.alt}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {lightboxSrc && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxSrc(null)}
            role="dialog"
            aria-label="Image lightbox"
            aria-modal="true"
          >
            <button className="absolute top-4 right-4 text-white hover:text-gold-400 text-2xl" onClick={() => setLightboxSrc(null)} aria-label="Close lightbox">✕</button>
            <img
              src={lightboxSrc.replace('w=600', 'w=1200')}
              alt={lightboxAlt}
              className="max-w-full max-h-[90vh] rounded-card object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        <div className="mt-16 text-center">
          <Button asChild size="xl">
            <Link to="/book">Book This Experience</Link>
          </Button>
        </div>
      </PageShell>
    </>
  )
}

import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Seo } from '@/components/seo/Seo'
import { PageShell, SectionHeader } from '@/components/layout/PageShell'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { FAQS, FAQ_CATEGORIES, type FaqCategory } from '@/content/faqs'
import { cn } from '@/lib/utils/cn'

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<FaqCategory | 'all'>('all')
  const categories = Object.entries(FAQ_CATEGORIES) as [FaqCategory, string][]
  const filtered = activeCategory === 'all' ? FAQS : FAQS.filter((f) => f.category === activeCategory)

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(JSON_LD)}</script>
      </Helmet>
      <Seo
        title="Frequently Asked Questions | BOB Talkies"
        description="Got questions about booking a private theatre at BOB Talkies? Find answers to all your questions about booking, payment, cancellation, food, decorations and more."
        canonical="/faq"
      />
      <PageShell>
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about booking a private theatre at BOB Talkies."
          centered
        />

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn('px-4 py-2 rounded-pill text-sm font-medium transition-colors', activeCategory === 'all' ? 'bg-gold-gradient text-bg-base' : 'border border-border-subtle text-text-secondary hover:text-gold-400')}
          >
            All
          </button>
          {categories.map(([slug, label]) => (
            <button
              key={slug}
              onClick={() => setActiveCategory(slug)}
              className={cn('px-4 py-2 rounded-pill text-sm font-medium transition-colors', activeCategory === slug ? 'bg-gold-gradient text-bg-base' : 'border border-border-subtle text-text-secondary hover:text-gold-400')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion
            items={filtered.map((f) => ({
              id: f.id,
              question: f.question,
              answer: f.answer,
            }))}
          />
        </div>

        <div className="mt-16 text-center bg-bg-elevated border border-border-subtle rounded-card p-8 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl text-text-primary mb-2">Still have questions?</h2>
          <p className="text-text-secondary mb-6">Our team is happy to help you plan the perfect celebration.</p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="secondary">
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button asChild variant="whatsapp">
              <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER ?? '919876543210'}`} target="_blank" rel="noopener noreferrer">
                Chat on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </PageShell>
    </>
  )
}

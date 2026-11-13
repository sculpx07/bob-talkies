import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { PageShell, Section, SectionHeader } from '@/components/layout/PageShell'
import { Heart, Star, Shield, Zap } from 'lucide-react'

const VALUES = [
  { icon: <Heart size={28} />, title: 'Guest First', desc: 'Every decision we make starts with one question: will this make our guests\' experience better?' },
  { icon: <Star size={28} />, title: 'Premium Always', desc: 'We obsess over every detail — from the quality of recliners to the precision of Dolby Atmos tuning.' },
  { icon: <Shield size={28} />, title: 'Complete Privacy', desc: 'Your theatre, your time. We ensure complete privacy for every group, every booking, every time.' },
  { icon: <Zap size={28} />, title: 'Personalised Joy', desc: 'No two celebrations are the same. We tailor every experience to make it uniquely yours.' },
]

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About BOB Talkies | Hyderabad's Premium Private Theatre"
        description="Learn about BOB Talkies — Hyderabad's most loved private theatre experience for birthdays, anniversaries, proposals and celebrations."
        canonical="/about"
      />
      <PageShell>
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            eyebrow="Our Story"
            title="Born From a Belief in Better Celebrations"
            subtitle="We started BOB Talkies because we believed that every celebration deserves more than a noisy restaurant or a crowded multiplex."
          />

          <div className="prose prose-invert max-w-none mb-16">
            <p className="text-text-secondary text-lg leading-relaxed mb-4">
              BOB Talkies was founded in Hyderabad with a simple mission: make every celebration unforgettable. We've built Hyderabad's most loved private theatre experience — where you get the whole theatre to yourself, with 4K projection, Dolby Atmos sound, premium recliners and personalised decoration.
            </p>
            <p className="text-text-secondary leading-relaxed mb-4">
              Whether you're celebrating a birthday for two, proposing to the love of your life, or throwing a party for 40 friends — we have a space and a package designed for you. Our team handles every detail, so you can focus entirely on the people you're celebrating with.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Located in Kukatpally, Hyderabad, we've hosted thousands of celebrations since we opened. From tearful proposals to raucous birthday parties, every booking is treated with the same care, creativity and commitment to making it truly special.
            </p>
          </div>

          {/* Values */}
          <div className="grid sm:grid-cols-2 gap-6 mb-16">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-bg-surface border border-border-subtle rounded-card p-6">
                <span className="text-gold-400 mb-3 block">{v.icon}</span>
                <h3 className="font-display text-lg font-semibold text-text-primary mb-2">{v.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-bg-navy border border-border-subtle rounded-card p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-16">
            {[
              { num: '5', label: 'Private Theatres' },
              { num: '10,000+', label: 'Happy Celebrations' },
              { num: '4.9★', label: 'Google Rating' },
              { num: '100%', label: 'Private Every Time' },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl text-gold-400 font-bold mb-1">{s.num}</p>
                <p className="text-text-muted text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="font-display text-2xl text-text-primary mb-4">Ready to create a memory?</h2>
            <Button asChild size="xl">
              <Link to="/book">Book Your Private Theatre</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    </>
  )
}

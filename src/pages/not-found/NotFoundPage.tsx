import { Link } from 'react-router-dom'
import { Film, Home, Search, ArrowLeft } from 'lucide-react'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page Not Found | BOB Talkies"
        description="The page you are looking for doesn't exist."
        noindex
      />
      <main className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-8">
            <Film size={80} className="text-gold-500 opacity-20 mx-auto" />
            <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-6xl text-gold-400">
              404
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-text-primary mb-3">
            Scene Not Found
          </h1>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Looks like this reel got lost in the projection booth. The page you're looking for doesn't exist or has moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <Home size={18} />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/theatres">
                <Search size={18} />
                Browse Theatres
              </Link>
            </Button>
          </div>
          <div className="mt-8 pt-8 border-t border-border-subtle">
            <p className="text-text-muted text-sm mb-4">Looking for something specific?</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { label: 'Packages', to: '/packages' },
                { label: 'Offers', to: '/offers' },
                { label: 'Book Now', to: '/book' },
                { label: 'FAQ', to: '/faq' },
                { label: 'Contact', to: '/contact' },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm text-gold-400 hover:text-gold-500 underline underline-offset-2"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

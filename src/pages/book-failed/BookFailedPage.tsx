import { useParams, Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { XCircle, RefreshCw, MessageCircle } from 'lucide-react'
import { config } from '@/lib/config'

export default function BookFailedPage() {
  const { bookingId } = useParams()
  const waLink = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(`Hi! My payment for booking ${bookingId} failed. Can you help?`)}`

  return (
    <>
      <Seo title="Payment Failed" description="Your payment could not be processed." noindex />
      <div className="min-h-screen bg-bg-base pt-16 md:pt-20 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 rounded-full bg-danger/15 border-2 border-danger flex items-center justify-center mx-auto mb-4">
            <XCircle size={36} className="text-danger" aria-hidden="true" />
          </div>
          <h1 className="font-display text-3xl text-text-primary mb-2">Payment Failed</h1>
          <p className="text-text-secondary mb-2">
            Your slot is still held for a few minutes. Please try again.
          </p>
          {bookingId && (
            <p className="text-xs text-text-muted mb-8">Reference: <span className="font-mono text-gold-400">{bookingId}</span></p>
          )}
          <div className="space-y-3">
            <Button asChild fullWidth size="lg">
              <Link to="/book">
                <RefreshCw size={16} aria-hidden="true" /> Retry Payment
              </Link>
            </Button>
            <Button asChild variant="whatsapp" fullWidth size="lg">
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} /> Get Help on WhatsApp
              </a>
            </Button>
            <Button asChild variant="ghost" fullWidth size="md">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
          <p className="text-xs text-text-muted mt-6">
            Your slot was NOT confirmed. No amount has been deducted.
          </p>
        </div>
      </div>
    </>
  )
}

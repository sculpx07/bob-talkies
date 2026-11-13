import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { Seo } from '@/components/seo/Seo'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/EmptyState'
import { formatDate, formatTime } from '@/lib/utils/date'
import { formatINR } from '@/lib/utils/currency'
import { Calendar, MapPin, Users, CheckCircle } from 'lucide-react'

interface PassData {
  id: string; theatreName: string; date: string; slotStart: string; slotEnd: string;
  guests: number; customerName: string; packageName: string; totalPaise: number;
  balancePaise: number; status: string; qrCode: string;
}

export default function PassPage() {
  const { token } = useParams()
  const { data: pass, isLoading, isError, refetch } = useQuery({
    queryKey: ['pass', token],
    queryFn: () => api.get<PassData>(`/passes/${token}`),
    enabled: Boolean(token),
  })

  return (
    <>
      <Seo title="Your Booking Pass" description="Digital pass for your BOB Talkies booking." noindex />
      <div className="min-h-screen pt-16 md:pt-20 flex items-center justify-center px-4 py-8">
        {isLoading ? (
          <div className="max-w-sm w-full space-y-4">
            <Skeleton className="h-56 w-full" rounded="lg" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        ) : isError ? (
          <ErrorState title="Pass not found" description="This pass may have expired or is invalid." retry={refetch} />
        ) : pass ? (
          <div className="max-w-sm w-full">
            <div className="bg-bg-elevated border-2 border-gold-500 rounded-card overflow-hidden shadow-gold-glow">
              {/* Header */}
              <div className="bg-gold-gradient px-5 py-6 text-bg-base text-center">
                <p className="text-xs font-bold tracking-widest uppercase mb-1">BOB Talkies</p>
                <h1 className="font-display text-2xl font-bold">Booking Pass</h1>
                <p className="text-sm mt-1 opacity-80">Private Theatre Experience</p>
              </div>

              {/* Details */}
              <div className="p-5 space-y-4">
                <div className="text-center">
                  <p className="text-text-muted text-xs mb-1">Guest Name</p>
                  <p className="font-display text-xl text-text-primary font-semibold">{pass.customerName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-text-muted text-xs flex items-center justify-center gap-1 mb-1">
                      <Calendar size={10} /> Date
                    </p>
                    <p className="text-text-primary text-sm font-semibold">{formatDate(pass.date)}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs mb-1">Time</p>
                    <p className="text-text-primary text-sm font-semibold">
                      {formatTime(pass.slotStart)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs flex items-center justify-center gap-1 mb-1">
                      <MapPin size={10} /> Theatre
                    </p>
                    <p className="text-text-primary text-sm font-semibold">{pass.theatreName}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs flex items-center justify-center gap-1 mb-1">
                      <Users size={10} /> Guests
                    </p>
                    <p className="text-text-primary text-sm font-semibold">{pass.guests}</p>
                  </div>
                </div>

                <div className="border-t border-border-subtle pt-4 flex justify-between text-sm">
                  <div>
                    <p className="text-text-muted text-xs">Package</p>
                    <p className="text-text-primary font-medium">{pass.packageName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-muted text-xs">Balance Due</p>
                    <p className="text-gold-400 font-bold">{formatINR(pass.balancePaise)}</p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-2 pt-2">
                  <img
                    src={pass.qrCode}
                    alt={`QR code for booking ${pass.id}`}
                    className="w-32 h-32 rounded-lg"
                  />
                  <p className="font-mono text-xs text-text-muted">{pass.id}</p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-success">
                  <CheckCircle size={14} /> Booking Confirmed
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-text-muted mt-4">
              Show this pass at the venue. Present a photo ID if requested.
            </p>
          </div>
        ) : null}
      </div>
    </>
  )
}

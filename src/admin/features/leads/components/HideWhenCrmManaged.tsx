import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { EmptyState, LoadingBlock } from '@/admin/components/ui'
import { useLeadCrmState } from '../api'

/**
 * The Leads pages, unless leads are worked on in Sculpx CRM (Settings → CRM, sync on).
 * Then they are hidden; turning the sync off brings them back.
 */
export function HideWhenCrmManaged({ children }: { children: ReactNode }) {
  const crm = useLeadCrmState()
  if (crm.isLoading) return <LoadingBlock />
  if (crm.data) {
    return (
      <EmptyState
        icon={<Inbox className="h-5 w-5" />}
        title="Leads are handled in Sculpx CRM"
        description="Website enquiries and unfinished bookings go to the CRM automatically. Follow them up there."
        className="py-24"
      />
    )
  }
  return <>{children}</>
}

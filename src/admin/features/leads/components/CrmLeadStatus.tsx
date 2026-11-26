import { ExternalLink } from 'lucide-react'
import { Button, Card, CardBody, CardHeader } from '@/admin/components/ui'
import { formatDateTime, timeAgo } from '@/admin/lib/utils/date'
import type { LeadCrm } from '../types'

/** The CRM's own status (its name and colour come from the CRM). */
export function CrmStatusBadge({ crm }: { crm: LeadCrm | null | undefined }) {
  if (!crm?.status) return <span className="text-xs text-slate-400">Waiting for CRM</span>
  const color = crm.status.color || '#64748b'
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset" style={{ color, backgroundColor: `${color}14`, boxShadow: `inset 0 0 0 1px ${color}40` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
      {crm.status.name || crm.status.code}
    </span>
  )
}

/** Lead page side card: what Sculpx CRM says, and a link to work on it there. */
export function CrmLeadCard({ crm }: { crm: LeadCrm | null | undefined }) {
  return (
    <Card>
      <CardHeader title="Sculpx CRM" description="Status, owner, follow-ups and notes are handled in the CRM." />
      <CardBody className="space-y-3 text-sm">
        {!crm ? (
          <p className="text-slate-500">Not in the CRM yet. It is sent within a minute.</p>
        ) : (
          <dl className="space-y-1.5">
            <div className="flex items-center justify-between gap-3"><dt className="text-slate-500">Status</dt><dd><CrmStatusBadge crm={crm} /></dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-slate-500">Owner</dt><dd>{crm.owner?.name || <span className="text-slate-400">Not assigned</span>}</dd></div>
            {crm.priority && <div className="flex items-center justify-between gap-3"><dt className="text-slate-500">Priority</dt><dd>{crm.priority.charAt(0) + crm.priority.slice(1).toLowerCase()}</dd></div>}
            <div className="flex items-center justify-between gap-3"><dt className="text-slate-500">Follow up</dt><dd>{crm.followUpAt ? formatDateTime(crm.followUpAt) : '—'}</dd></div>
            {crm.updatedAt && <p className="pt-1 text-xs text-slate-400">Updated {timeAgo(crm.updatedAt)}</p>}
          </dl>
        )}
        {crm?.url && (
          <a href={crm.url} target="_blank" rel="noreferrer">
            <Button size="sm" variant="secondary" leftIcon={<ExternalLink className="h-4 w-4" />}>Open in CRM</Button>
          </a>
        )}
      </CardBody>
    </Card>
  )
}

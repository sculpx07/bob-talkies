import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRightLeft, CalendarPlus, Link2, MessageCircle, MoreHorizontal, Pencil, Phone, Trash2 } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import {
  Badge, Button, Card, CardBody, CardHeader, ConfirmDialog, ErrorState, IconButton, LoadingBlock, Menu, SegmentedControl, Select, StatusBadge, Textarea, useToast, type MenuItem,
} from '@/admin/components/ui'
import { useAuth } from '@/admin/auth/AuthProvider'
import { PERMISSIONS } from '@/admin/types/permissions'
import { occasionLabel } from '@/admin/constants/catalog'
import { BOOKING_STATUS_BADGE } from '@/admin/features/bookings/constants'
import { whatsappLink } from '@/admin/features/bookings/utils'
import { useStaffOptions } from '@/admin/features/users/api'
import { useDisclosure } from '@/admin/hooks/useDisclosure'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDate, formatDateTime, formatTime, timeAgo } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { cn } from '@/admin/lib/utils/cn'
import { useAddLeadActivity, useAssignLead, useDeleteLead, useLead, useLeadCrmState } from '../api'
import { CrmLeadCard, CrmStatusBadge } from '../components/CrmLeadStatus'
import { ACTIVITY_LABELS, LEAD_SOURCE_LABELS, LEAD_STATUS_BADGE, LEAD_TRANSITIONS, MANUAL_ACTIVITY_TYPES, OPEN_LEAD_STATUSES, PRIORITY_BADGE } from '../constants'
import { LeadFormModal, LeadStatusModal, LinkBookingModal } from '../components/LeadModals'
import type { Lead } from '../types'

const ACTIVITY_OPTIONS = MANUAL_ACTIVITY_TYPES.map((t) => ({ value: t, label: ACTIVITY_LABELS[t] }))

function ActivityComposer({ lead }: { lead: Lead }) {
  const toast = useToast()
  const add = useAddLeadActivity()
  const [type, setType] = useState<(typeof MANUAL_ACTIVITY_TYPES)[number]>('call')
  const [text, setText] = useState('')
  const save = () => {
    if (!text.trim()) return
    add.mutate({ id: lead.id, type, text: text.trim() }, {
      onSuccess: (l) => { setText(''); toast.success(`${ACTIVITY_LABELS[type]} logged`, l.status !== lead.status ? `Lead is now ${LEAD_STATUS_BADGE[l.status].label}` : undefined) },
      onError: (err) => toast.error('Could not save', errorMessage(err)),
    })
  }
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 p-3">
      <SegmentedControl label="Activity type" value={type} onChange={setType} options={ACTIVITY_OPTIONS} />
      <Textarea aria-label="Activity" rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder={type === 'note' ? 'Add a note' : `What happened on the ${ACTIVITY_LABELS[type].toLowerCase()}?`} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">{lead.status === 'new' && type !== 'note' ? 'Logging contact marks the lead as contacted.' : ''}</p>
        <Button size="sm" onClick={save} loading={add.isPending} disabled={!text.trim()}>Log {ACTIVITY_LABELS[type].toLowerCase()}</Button>
      </div>
    </div>
  )
}

export default function LeadDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { can } = useAuth()
  const query = useLead(id)
  // while the CRM manages leads: status, owner and notes are changed there
  const crmManaged = useLeadCrmState().data ?? false
  const staff = useStaffOptions()
  const assign = useAssignLead()
  const remove = useDeleteLead()
  const edit = useDisclosure()
  const statusModal = useDisclosure()
  const link = useDisclosure()
  const confirmDelete = useDisclosure()

  const detail = query.data
  if (query.isLoading) return <LoadingBlock />
  if (query.error || !detail) return <ErrorState error={query.error} retry={() => query.refetch()} title="Could not load this lead" />
  const { lead, otherLeads, bookings } = detail
  const open = OPEN_LEAD_STATUSES.includes(lead.status)
  const canChangeStatus = !crmManaged && LEAD_TRANSITIONS[lead.status].length > 0
  const overdue = open && lead.followUpAt && new Date(lead.followUpAt) <= new Date()

  const moreItems: MenuItem[] = [
    { label: 'Edit lead', icon: <Pencil />, onSelect: edit.open },
    ...(open && bookings.length ? [{ label: 'Link existing booking', icon: <Link2 />, onSelect: link.open }] : []),
    ...(can(PERMISSIONS.LEADS_DELETE) ? [{ label: 'Delete lead', icon: <Trash2 />, danger: true, onSelect: confirmDelete.open }] : []),
  ]

  return (
    <>
      <PageHeader
        title={lead.name}
        back={{ to: '/leads', label: 'Leads' }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {crmManaged ? <CrmStatusBadge crm={lead.crm} /> : <StatusBadge status={lead.status} map={LEAD_STATUS_BADGE} />}
            {lead.priority !== 'normal' && <Badge tone={PRIORITY_BADGE[lead.priority].tone}>{PRIORITY_BADGE[lead.priority].label} priority</Badge>}
            <span>{LEAD_SOURCE_LABELS[lead.source]} · received {formatDateTime(lead.createdAt)}</span>
          </span>
        }
        actions={
          <>
            {open && (
              <Link to={`/bookings/new?lead=${lead.id}`}>
                <Button leftIcon={<CalendarPlus className="h-4 w-4" />}>Create booking</Button>
              </Link>
            )}
            {canChangeStatus && <Button variant="secondary" leftIcon={<ArrowRightLeft className="h-4 w-4" />} onClick={statusModal.open}>Change status</Button>}
            <Menu trigger={<IconButton label="More actions" variant="secondary"><MoreHorizontal className="h-4 w-4" /></IconButton>} items={moreItems} />
          </>
        }
      />

      {overdue && <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Follow-up was due {timeAgo(lead.followUpAt)} ({formatDateTime(lead.followUpAt)}).</div>}
      {lead.status === 'lost' && lead.lostReason && <div className="mb-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">Lost: {lead.lostReason}</div>}
      {lead.convertedBooking && (
        <Link to={`/bookings/${lead.convertedBooking.id}`} className="focus-ring mb-6 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 hover:bg-emerald-100">
          <span>Converted to booking <strong className="font-mono">{lead.convertedBooking.bookingNumber}</strong> · {formatDate(lead.convertedBooking.date)} {formatTime(lead.convertedBooking.slotStart)} · {lead.convertedBooking.theatreName}</span>
          <StatusBadge status={lead.convertedBooking.status} map={BOOKING_STATUS_BADGE} />
        </Link>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Enquiry" />
            <CardBody className="space-y-3 text-sm">
              <p className="whitespace-pre-line text-slate-800">{lead.message || <span className="text-slate-400">No message</span>}</p>
              <dl className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                <div className="flex justify-between gap-4 py-1"><dt className="text-slate-500">Occasion</dt><dd>{lead.occasion ? occasionLabel(lead.occasion) : '—'}</dd></div>
                <div className="flex justify-between gap-4 py-1"><dt className="text-slate-500">Follow up</dt><dd className={cn(overdue && 'font-semibold text-red-600')}>{lead.followUpAt ? formatDateTime(lead.followUpAt) : '—'}</dd></div>
                {lead.firstContactedAt && <div className="flex justify-between gap-4 py-1"><dt className="text-slate-500">First contacted</dt><dd>{timeAgo(lead.firstContactedAt)}</dd></div>}
                {lead.utm && Object.entries(lead.utm).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-1"><dt className="text-slate-500">{k === 'source' ? 'Ad / campaign source' : k}</dt><dd className="truncate">{v}</dd></div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Activity" description="Calls, messages, notes and every change." />
            <CardBody className="space-y-4">
              {crmManaged
                ? <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">Calls, notes and status changes are logged in Sculpx CRM; comments made there appear here.</p>
                : <ActivityComposer lead={lead} />}
              <ol className="space-y-3 border-l border-slate-200 pl-4">
                {[...lead.activity].reverse().map((a, i) => (
                  <li key={i} className="relative text-sm">
                    <span className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full bg-violet-500" />
                    <p className="font-medium text-slate-900">
                      {ACTIVITY_LABELS[a.type]}
                      {a.type === 'status_change' && a.to && <span className="font-normal text-slate-600"> {a.from ? `${LEAD_STATUS_BADGE[a.from].label} → ` : ''}{LEAD_STATUS_BADGE[a.to].label}</span>}
                    </p>
                    {a.text && <p className="whitespace-pre-line text-slate-600">{a.text}</p>}
                    <p className="text-xs text-slate-500">{formatDateTime(a.at)} · {a.by?.name ?? (a.via === 'crm' ? 'Sculpx CRM' : 'Customer')}</p>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Contact" />
            <CardBody className="space-y-2 text-sm">
              <p className="text-slate-700">{lead.mobile}{lead.email ? ` · ${lead.email}` : ''}</p>
              <div className="flex flex-wrap gap-2">
                <a href={`tel:+91${lead.mobile}`}><Button size="sm" variant="secondary" leftIcon={<Phone className="h-4 w-4" />}>Call</Button></a>
                <a href={whatsappLink(lead.mobile, `Hi ${lead.name}, thanks for contacting BOB Talkies!`)} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="secondary" leftIcon={<MessageCircle className="h-4 w-4" />}>WhatsApp</Button>
                </a>
              </div>
              <p className="text-xs text-slate-500">WhatsApp: {lead.consentWhatsapp ? 'OK to message' : 'not agreed'}</p>
            </CardBody>
          </Card>

          {crmManaged ? <CrmLeadCard crm={lead.crm} /> : <Card>
            <CardHeader title="Assigned to" />
            <CardBody>
              <Select
                aria-label="Assigned to"
                value={lead.assignedTo?.id ?? ''}
                disabled={assign.isPending}
                placeholder="Nobody"
                options={(staff.data ?? []).map((u) => ({ value: u.id, label: u.name }))}
                onChange={(e) => assign.mutate({ id: lead.id, assignedTo: e.target.value || null }, {
                  onSuccess: (l) => toast.success(l.assignedTo ? `Assigned to ${l.assignedTo.name}` : 'Unassigned'),
                  onError: (err) => toast.error('Could not assign', errorMessage(err)),
                })}
              />
            </CardBody>
          </Card>}

          <Card>
            <CardHeader title="Same customer" description={`Everything from ${lead.mobile}`} />
            <CardBody className="space-y-3 text-sm">
              {bookings.length === 0 && otherLeads.length === 0 && <p className="text-slate-500">No other enquiries or bookings.</p>}
              {bookings.map((b) => (
                <Link key={b.id} to={`/bookings/${b.id}`} className="focus-ring flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100">
                  <span><span className="font-mono text-xs font-semibold">{b.bookingNumber}</span><span className="block text-xs text-slate-500">{formatDate(b.date)} · {b.theatreName} · {formatPaise(b.totalPaise)}</span></span>
                  <StatusBadge status={b.status} map={BOOKING_STATUS_BADGE} />
                </Link>
              ))}
              {otherLeads.map((o) => (
                <Link key={o.id} to={`/leads/${o.id}`} className="focus-ring flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-slate-50">
                  <span className="text-xs text-slate-600">Enquiry · {LEAD_SOURCE_LABELS[o.source]} · {timeAgo(o.createdAt)}</span>
                  <StatusBadge status={o.status} map={LEAD_STATUS_BADGE} />
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <LeadFormModal open={edit.isOpen} onOpenChange={edit.setOpen} lead={lead} />
      {canChangeStatus && <LeadStatusModal lead={lead} open={statusModal.isOpen} onOpenChange={statusModal.setOpen} />}
      <LinkBookingModal detail={detail} open={link.isOpen} onOpenChange={link.setOpen} />
      <ConfirmDialog
        open={confirmDelete.isOpen}
        onOpenChange={confirmDelete.setOpen}
        title={`Delete ${lead.name}'s lead?`}
        description="For spam or test entries. This cannot be undone."
        confirmLabel="Delete lead"
        tone="danger"
        loading={remove.isPending}
        onConfirm={() => remove.mutate(lead.id, {
          onSuccess: () => { toast.success('Lead deleted'); navigate('/leads', { replace: true }) },
          onError: (err) => { confirmDelete.close(); toast.error('Could not delete', errorMessage(err)) },
        })}
      />
    </>
  )
}

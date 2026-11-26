import { useEffect, useState } from 'react'
import { AlertTriangle, Check, CheckCircle2, CloudUpload, Copy, Inbox, Lock, PlugZap, RotateCcw, Send, XCircle } from 'lucide-react'
import {
  Badge, Button, Card, CardBody, CardHeader, ConfirmDialog, ErrorState, FormField, Input, LoadingBlock, Select, StatCard, Switch, useToast,
} from '@/admin/components/ui'
import { ApiError, errorMessage } from '@/admin/lib/api/errors'
import { formatDateTime, timeAgo } from '@/admin/lib/utils/date'
import { useBackfillCrmLeads, useCrmSettings, useCrmSyncStatus, useRetryFailedCrmEvents, useTestCrmConnection, useUpdateCrmSettings } from './api'
import type { CrmSettings } from './types'

const BACKFILL_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
]

/** "lead:abc" -> "Enquiry", "draft:xyz" -> "Unfinished booking" */
const RECORD_LABELS: Record<string, string> = { draft: 'Unfinished booking', lead: 'Enquiry', booking: 'Booking', payment: 'Payment' }
const recordLabel = (record: string) => RECORD_LABELS[record.split(':')[0]] ?? record

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 ring-1 ring-slate-200">{value}</code>
      <Button size="sm" variant="secondary" aria-label={`Copy ${label}`} leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* selectable anyway */ } }}>
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )
}

/** Events URL + secret from the CRM, test, on/off. */
function ConnectionCard({ s, canEdit }: { s: CrmSettings; canEdit: boolean }) {
  const toast = useToast()
  const update = useUpdateCrmSettings()
  const test = useTestCrmConnection()
  const [eventsUrl, setEventsUrl] = useState(s.eventsUrl)
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  useEffect(() => setEventsUrl(s.eventsUrl), [s.eventsUrl])

  const dirty = eventsUrl.trim() !== s.eventsUrl || secret.trim() !== ''

  const save = () => {
    setError('')
    update.mutate({ eventsUrl: eventsUrl.trim(), ...(secret.trim() && { secret: secret.trim() }) }, {
      onSuccess: () => { setSecret(''); toast.success('CRM connection saved', 'Use "Test connection" to check it.') },
      // field problems ("Secret: No spaces") are more useful than the generic message
      onError: (err) => setError(err instanceof ApiError && Object.keys(err.fieldErrors).length
        ? Object.entries(err.fieldErrors).map(([k, v]) => `${k === 'eventsUrl' ? 'Events URL' : k === 'secret' ? 'Secret' : k}: ${v}`).join(' · ')
        : errorMessage(err)),
    })
  }

  const toggle = (enabled: boolean) =>
    update.mutate({ enabled }, {
      onSuccess: () => toast.success(enabled ? 'Leads are now sent to the CRM' : 'Sending to the CRM is paused', enabled ? undefined : 'New leads wait here and are sent when you turn it back on.'),
      onError: (err) => toast.error('Could not change it', errorMessage(err)),
    })

  const runTest = () =>
    test.mutate(undefined, {
      onSuccess: (r) => (r.ok ? toast.success('Connected', r.message) : toast.error('Not connected', r.message)),
      onError: (err) => toast.error('Test failed', errorMessage(err)),
    })

  return (
    <Card>
      <CardHeader
        title="Sculpx CRM connection"
        description="Enquiries, unfinished bookings, bookings and payments are sent to the CRM, where the team works on them."
        actions={s.enabled ? <Badge tone="success" dot>Sending</Badge> : <Badge tone="neutral" dot>Off</Badge>}
      />
      <CardBody className="space-y-5">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>In the CRM open <strong>Lead Forms → Lead Sources → Connected apps</strong> and click <strong>Connect app</strong>.</li>
          <li>Copy the <strong>Events URL</strong> and <strong>Secret</strong> it shows into the fields below and save.</li>
          <li>Click <strong>Test connection</strong>, then turn on <strong>Send leads to the CRM</strong>.</li>
          <li>Back in the CRM, set the app’s <strong>Callback URL</strong> to the address below, so status, owner and notes changed there come back here.</li>
        </ol>
        <div>
          <p className="mb-1 text-xs font-medium text-slate-600">Callback URL for the CRM</p>
          <CopyValue value={s.callbackUrl} label="callback URL" />
          <p className="mt-1 text-xs text-slate-500">Must be reachable from the CRM server (set PUBLIC_BASE_URL on this server to its public address).</p>
        </div>

        {!s.canStoreSecrets && (
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> SETTINGS_ENCRYPTION_KEY is not set on the server, so the secret cannot be saved yet.
          </p>
        )}
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <div className="grid gap-4 lg:grid-cols-2">
          <FormField label="Events URL" hint="From the CRM; ends with /events">
            {(f) => <Input {...f} value={eventsUrl} onChange={(e) => setEventsUrl(e.target.value)} placeholder="https://crm.example.com/api/v1/webhooks/apps/…/events" disabled={!canEdit} spellCheck={false} />}
          </FormField>
          <FormField label="Secret" hint={s.hasSecret ? `Saved (${s.secretHint}). Leave empty to keep it.` : 'Shown once in the CRM when the app is connected'}>
            {(f) => <Input {...f} type="password" autoComplete="new-password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder={s.hasSecret ? s.secretHint : 'sk_…'} disabled={!canEdit || !s.canStoreSecrets} />}
          </FormField>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && <Button onClick={save} loading={update.isPending && !update.variables?.enabled} disabled={!dirty}>Save connection</Button>}
          <Button variant="secondary" leftIcon={<PlugZap className="h-4 w-4" />} onClick={runTest} loading={test.isPending} disabled={!s.eventsUrl || !s.hasSecret || dirty}>Test connection</Button>
          {s.lastCheck && (
            <span className={`flex items-center gap-1.5 text-sm ${s.lastCheck.ok ? 'text-emerald-700' : 'text-red-700'}`}>
              {s.lastCheck.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {s.lastCheck.message} <span className="text-xs text-slate-500">({timeAgo(s.lastCheck.at)})</span>
            </span>
          )}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <Switch
            id="crmEnabled"
            checked={s.enabled}
            onChange={toggle}
            disabled={!canEdit || update.isPending || (!s.enabled && (!s.eventsUrl || !s.hasSecret))}
            label="Send leads to the CRM"
            description="Off: new leads are kept in a queue here and sent once it is turned on."
          />
        </div>
        {!canEdit && <p className="flex items-center gap-1.5 text-xs text-slate-500"><Lock className="h-3.5 w-3.5" /> Your role can view this but not change it.</p>}
      </CardBody>
    </Card>
  )
}

/** What is waiting, what failed and the tools to fix it. */
function SyncCard({ canEdit }: { canEdit: boolean }) {
  const toast = useToast()
  const status = useCrmSyncStatus()
  const retry = useRetryFailedCrmEvents()
  const backfill = useBackfillCrmLeads()
  const [days, setDays] = useState('30')
  const [confirmBackfill, setConfirmBackfill] = useState(false)
  const s = status.data

  return (
    <Card>
      <CardHeader title="Sync status" description="Updates every 15 seconds. Sent events are kept for 30 days." />
      <CardBody className="space-y-5">
        {status.isLoading ? <LoadingBlock /> : status.error || !s ? <ErrorState error={status.error} retry={() => status.refetch()} /> : (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Waiting to send" value={s.pending} icon={<Inbox />} tone={s.pending ? 'warning' : 'neutral'} hint="Sent within a minute while the CRM is reachable" />
              <StatCard label="Failed" value={s.failed} icon={<AlertTriangle />} tone={s.failed ? 'danger' : 'neutral'} hint="Fix the cause, then retry" />
              <StatCard label="Sent (30 days)" value={s.sentRecently} icon={<Send />} tone="success" hint={s.lastSentAt ? `Last ${timeAgo(s.lastSentAt)}` : 'Nothing sent yet'} />
            </div>

            {s.problems.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-slate-800">Latest problems</p>
                <ul className="divide-y divide-slate-100 rounded-lg ring-1 ring-slate-200">
                  {s.problems.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-start justify-between gap-2 px-3 py-2 text-sm">
                      <span className="min-w-0">
                        <span className="font-medium text-slate-800">{recordLabel(p.record)}</span>
                        <span className="block text-xs text-red-700">{p.error}</span>
                      </span>
                      <span className="text-right text-xs text-slate-500">
                        <Badge tone={p.status === 'failed' ? 'danger' : 'warning'}>{p.status === 'failed' ? 'Failed' : `Retrying (try ${p.attempts})`}</Badge>
                        {p.nextAttemptAt && <span className="mt-0.5 block">Next try {formatDateTime(p.nextAttemptAt)}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {canEdit && (
              <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
                <Button
                  variant="secondary"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  disabled={!s.failed}
                  loading={retry.isPending}
                  onClick={() => retry.mutate(undefined, {
                    onSuccess: (r) => toast.success(`${r.requeued} event${r.requeued === 1 ? '' : 's'} sent again`),
                    onError: (err) => toast.error('Could not retry', errorMessage(err)),
                  })}
                >
                  Retry failed
                </Button>
                <div className="ml-auto flex items-end gap-2">
                  <div className="w-40"><Select aria-label="How far back" value={days} onChange={(e) => setDays(e.target.value)} options={BACKFILL_OPTIONS} /></div>
                  <Button variant="secondary" leftIcon={<CloudUpload className="h-4 w-4" />} onClick={() => setConfirmBackfill(true)}>Send existing data</Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardBody>
      <ConfirmDialog
        open={confirmBackfill}
        onOpenChange={setConfirmBackfill}
        title="Send existing leads and bookings to the CRM?"
        description={`Every enquiry and booking from the ${BACKFILL_OPTIONS.find((o) => o.value === days)?.label.toLowerCase()} is sent, with its payments. Records already in the CRM are updated, not duplicated.`}
        confirmLabel="Send"
        loading={backfill.isPending}
        onConfirm={() => backfill.mutate(Number(days), {
          onSuccess: (r) => { toast.success(`${r.leads} lead${r.leads === 1 ? '' : 's'} and ${r.bookings} booking${r.bookings === 1 ? '' : 's'} queued for the CRM`); setConfirmBackfill(false) },
          onError: (err) => { toast.error('Could not queue them', errorMessage(err)); setConfirmBackfill(false) },
        })}
      />
    </Card>
  )
}

/** Admin → Settings → CRM. Needs the "Integrations (CRM)" permission. */
export function CrmSettingsPanel({ canEdit }: { canEdit: boolean }) {
  const settings = useCrmSettings()
  if (settings.isLoading) return <LoadingBlock />
  if (settings.error || !settings.data) return <ErrorState error={settings.error} retry={() => settings.refetch()} />
  return (
    <div className="space-y-6">
      <ConnectionCard s={settings.data} canEdit={canEdit} />
      <SyncCard canEdit={canEdit} />
      <Card>
        <CardHeader title="What is sent" />
        <CardBody>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Every enquiry (contact form, Vibe Hall form, leads logged by staff), and again when its details are edited here.</li>
            <li>Booking forms left for 2 minutes with a full mobile number (marked converted in the CRM if they book later), with the date, theatre and guests they picked.</li>
            <li>Bookings as deals in the CRM’s “BOB Talkies bookings” pipeline (held → payment pending → confirmed → completed, or lost when cancelled, no-show or not paid), with date, time, theatre, guests and money paid. Website checkouts appear once they are confirmed.</li>
            <li>Every payment, on the booking’s timeline in the CRM.</li>
            <li>Each record is linked in the CRM, so changes update the same lead or deal instead of creating a new one.</li>
            <li>Back from the CRM (with the Callback URL set): each lead’s status, owner, follow-up and comments. While sending is on, leads are worked on in the CRM; the Leads screen here shows the CRM status and is read-only for status, owner and notes.</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { AlertTriangle, Check, Copy, KeyRound, Lock, PlugZap, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge, Button, Card, CardBody, CardHeader, ConfirmDialog, ErrorState, FormField, Input, LoadingBlock, useToast } from '@/admin/components/ui'
import { ApiError, errorMessage } from '@/admin/lib/api/errors'
import { formatDateTime } from '@/admin/lib/utils/date'
import { cn } from '@/admin/lib/utils/cn'
import { usePaymentSettings, useTestPaymentConnection, useUpdatePaymentSettings } from './api'
import type { PaymentProvider, PaymentSettings } from './types'

const KEY_ID_RE = /^rzp_(test|live)_[A-Za-z0-9]{6,}$/

/** 32 random bytes as hex (64 characters), made in the browser with the Web Crypto API. */
function randomSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

const PROVIDERS: { value: PaymentProvider; label: string; description: string }[] = [
  { value: 'razorpay', label: 'Razorpay', description: 'Customers pay by UPI, card or net banking. Real money.' },
  { value: 'dev', label: 'Test payment screen', description: 'No money moves: the customer picks "Payment successful" or "Payment failed". For testing only.' },
]

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 ring-1 ring-slate-200">{value}</code>
      <Button
        size="sm"
        variant="secondary"
        aria-label={`Copy ${label}`}
        leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        onClick={async () => {
          try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* selectable anyway */ }
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  )
}

/** Which gateway takes website payments. */
function ProviderCard({ s, canEdit }: { s: PaymentSettings; canEdit: boolean }) {
  const toast = useToast()
  const update = useUpdatePaymentSettings()
  const [choice, setChoice] = useState<PaymentProvider>(s.provider)
  const [confirmLive, setConfirmLive] = useState(false)
  useEffect(() => setChoice(s.provider), [s.provider])

  const disabledReason = (p: PaymentProvider) =>
    p === 'razorpay' && !s.razorpay.ready ? 'Save the Key ID and Key Secret below first'
      : p === 'dev' && !s.testPaymentsAllowed ? 'Not allowed on the live server'
        : ''

  const save = () =>
    update.mutate({ provider: choice }, {
      onSuccess: () => { toast.success(choice === 'razorpay' ? 'Website payments now go through Razorpay' : 'Website payments now use the test screen'); setConfirmLive(false) },
      onError: (err) => { toast.error('Could not change it', errorMessage(err)); setConfirmLive(false) },
    })

  const goingLive = choice === 'razorpay' && s.razorpay.mode === 'live'

  return (
    <Card>
      <CardHeader title="Payment provider" description="Takes the advance (or full amount) when a customer books on the website." />
      <CardBody className="space-y-4">
        <div role="radiogroup" aria-label="Payment provider" className="grid gap-3 sm:grid-cols-2">
          {PROVIDERS.map((p) => {
            const reason = disabledReason(p.value)
            const active = choice === p.value
            return (
              <label key={p.value} className={cn(
                'flex gap-3 rounded-xl border p-4 text-sm',
                reason ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                active ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-500' : 'border-slate-200 hover:border-slate-300',
              )}>
                <input type="radio" name="provider" className="mt-0.5 accent-violet-600" value={p.value} checked={active}
                  disabled={!canEdit || Boolean(reason)} onChange={() => setChoice(p.value)} />
                <span>
                  <span className="flex items-center gap-2 font-medium text-slate-900">
                    {p.label}
                    {s.provider === p.value && <Badge tone="success" dot>In use</Badge>}
                    {p.value === 'razorpay' && s.razorpay.mode && <Badge tone={s.razorpay.mode === 'live' ? 'danger' : 'warning'}>{s.razorpay.mode === 'live' ? 'Live keys' : 'Test keys'}</Badge>}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">{reason || p.description}</span>
                </span>
              </label>
            )
          })}
        </div>
        {canEdit && (
          <div className="flex justify-end">
            <Button disabled={choice === s.provider} loading={update.isPending} onClick={() => (goingLive ? setConfirmLive(true) : save())}>
              Save provider
            </Button>
          </div>
        )}
      </CardBody>
      <ConfirmDialog
        open={confirmLive}
        onOpenChange={setConfirmLive}
        title="Take real payments?"
        description="With live Razorpay keys, customers are charged for real from now on."
        confirmLabel="Switch to Razorpay"
        loading={update.isPending}
        onConfirm={save}
      />
    </Card>
  )
}

/** Razorpay keys. Secrets are write-only: the saved value is never shown, only its last 4 characters. */
function RazorpayKeysCard({ s, canEdit }: { s: PaymentSettings; canEdit: boolean }) {
  const toast = useToast()
  const update = useUpdatePaymentSettings()
  const test = useTestPaymentConnection()
  const rp = s.razorpay
  const [keyId, setKeyId] = useState(rp.keyId)
  const [keySecret, setKeySecret] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  /** a secret made by "Generate", shown once so it can be copied into Razorpay */
  const [generated, setGenerated] = useState('')

  const generateWebhookSecret = () => {
    const value = randomSecret()
    setWebhookSecret(value)
    setGenerated(value)
  }
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [removing, setRemoving] = useState<'webhookSecret' | null>(null)
  useEffect(() => setKeyId(rp.keyId), [rp.keyId])

  const dirty = keyId.trim() !== rp.keyId || keySecret.trim() !== '' || webhookSecret.trim() !== ''

  const save = () => {
    const next: Record<string, string> = {}
    if (keyId.trim() && !KEY_ID_RE.test(keyId.trim())) next.keyId = 'Starts with rzp_test_ or rzp_live_'
    if (keySecret.trim() && keySecret.trim().length < 8) next.keySecret = 'Looks too short'
    if (webhookSecret.trim() && webhookSecret.trim().length < 8) next.webhookSecret = 'Looks too short'
    setErrors(next)
    if (Object.keys(next).length) return
    update.mutate({
      razorpay: {
        ...(keyId.trim() !== rp.keyId && { keyId: keyId.trim() }),
        ...(keySecret.trim() && { keySecret: keySecret.trim() }),
        ...(webhookSecret.trim() && { webhookSecret: webhookSecret.trim() }),
      },
    }, {
      onSuccess: () => { toast.success('Razorpay keys saved'); setKeySecret(''); setWebhookSecret(''); setGenerated('') },
      onError: (err) => {
        if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
          setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k.replace(/^razorpay\./, ''), v])))
        }
        toast.error('Could not save the keys', errorMessage(err))
      },
    })
  }

  const runTest = () =>
    test.mutate(undefined, {
      onSuccess: (r) => (r.ok ? toast.success(r.message) : toast.error('Connection failed', r.message)),
      onError: (err) => toast.error('Could not test', errorMessage(err)),
    })

  const removeWebhookSecret = () =>
    update.mutate({ razorpay: { webhookSecret: null } }, {
      onSuccess: () => { toast.success('Webhook secret removed'); setRemoving(null) },
      onError: (err) => { toast.error('Could not remove it', errorMessage(err)); setRemoving(null) },
    })

  const secretHint = (set: boolean, hint: string) => (set ? `Saved (${hint}). Leave empty to keep it.` : 'Not set')

  return (
    <Card>
      <CardHeader
        title="Razorpay keys"
        description={<>From the Razorpay Dashboard → Account &amp; Settings → API Keys. Use <strong>test</strong> keys until you are ready to take real payments.</>}
        actions={rp.mode && <Badge tone={rp.mode === 'live' ? 'danger' : 'warning'}>{rp.mode === 'live' ? 'Live mode' : 'Test mode'}</Badge>}
      />
      <CardBody className="space-y-4">
        {!s.canStoreSecrets && (
          <p role="alert" className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> The server cannot store secrets yet: SETTINGS_ENCRYPTION_KEY is not set on it.
          </p>
        )}
        <fieldset disabled={!canEdit} className="space-y-4">
          <FormField label="Key ID" hint="Public; safe to share. e.g. rzp_test_AbC123…" error={errors.keyId}>
            {(f) => <Input {...f} value={keyId} onChange={(e) => setKeyId(e.target.value)} placeholder="rzp_test_…" autoComplete="off" spellCheck={false} />}
          </FormField>
          <FormField label="Key Secret" hint={secretHint(rp.keySecretSet, rp.keySecretHint)} error={errors.keySecret}>
            {(f) => <Input {...f} type="password" value={keySecret} onChange={(e) => setKeySecret(e.target.value)} placeholder={rp.keySecretSet ? '••••••••••••' : 'Paste the key secret'} autoComplete="new-password" leading={<Lock className="h-4 w-4" />} />}
          </FormField>
          <FormField label="Webhook Secret" hint={secretHint(rp.webhookSecretSet, rp.webhookSecretHint)} error={errors.webhookSecret}>
            {(f) => (
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <Input {...f} type="password" value={webhookSecret} onChange={(e) => { setWebhookSecret(e.target.value); setGenerated('') }}
                    placeholder={rp.webhookSecretSet ? '••••••••••••' : 'Generate one, or paste your own'} autoComplete="new-password" leading={<KeyRound className="h-4 w-4" />} />
                </div>
                <Button variant="secondary" leftIcon={<Sparkles className="h-4 w-4" />} onClick={generateWebhookSecret}>Generate</Button>
              </div>
            )}
          </FormField>
        </fieldset>

        {generated && (
          <div className="space-y-2 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm">
            <p className="font-medium text-violet-900">New webhook secret: copy it into Razorpay now</p>
            <CopyField value={generated} label="webhook secret" />
            <ol className="list-decimal space-y-0.5 pl-5 text-xs text-violet-900/80">
              <li>Razorpay Dashboard → Account &amp; Settings → Webhooks: paste it as the webhook <strong>Secret</strong> (use the URL in the card below).</li>
              <li>Come back here and press <strong>Save keys</strong>. After that it is hidden; only its last 4 characters are shown.</li>
            </ol>
          </div>
        )}

        {rp.lastCheck && (
          <p className={cn('flex items-center gap-2 text-sm', rp.lastCheck.ok ? 'text-emerald-700' : 'text-red-600')}>
            {rp.lastCheck.ok ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            {rp.lastCheck.message} <span className="text-xs text-slate-500">· {formatDateTime(rp.lastCheck.at)}</span>
          </p>
        )}

        {canEdit && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {rp.webhookSecretSet && <Button variant="ghost" size="sm" onClick={() => setRemoving('webhookSecret')}>Remove webhook secret</Button>}
            <Button variant="secondary" leftIcon={<PlugZap className="h-4 w-4" />} disabled={!rp.ready || dirty} loading={test.isPending} onClick={runTest}
              title={dirty ? 'Save the keys first' : undefined}>
              Test connection
            </Button>
            <Button disabled={!dirty || !s.canStoreSecrets} loading={update.isPending} onClick={save}>Save keys</Button>
          </div>
        )}
      </CardBody>
      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        title="Remove the webhook secret?"
        description="Razorpay webhooks will be refused until a new secret is saved. Payments still confirm through the checkout."
        confirmLabel="Remove"
        tone="danger"
        loading={update.isPending}
        onConfirm={removeWebhookSecret}
      />
    </Card>
  )
}

/** Where Razorpay should send payment events. */
function WebhookCard({ s }: { s: PaymentSettings }) {
  return (
    <Card>
      <CardHeader title="Razorpay webhook" description="Confirms a booking even if the customer closes the page right after paying." />
      <CardBody className="space-y-3 text-sm text-slate-600">
        <ol className="list-decimal space-y-1 pl-5">
          <li>Razorpay Dashboard → Account &amp; Settings → Webhooks → <strong>Add new webhook</strong>.</li>
          <li>Webhook URL:</li>
        </ol>
        <CopyField value={s.razorpay.webhookUrl} label="webhook URL" />
        <ol start={3} className="list-decimal space-y-1 pl-5">
          <li>Secret: press <strong>Generate</strong> next to Webhook Secret above, copy it here, then <strong>Save keys</strong>. Both must be exactly the same.</li>
          <li>Active events: <code className="text-xs">payment.captured</code>, <code className="text-xs">order.paid</code>, <code className="text-xs">payment.failed</code>.</li>
        </ol>
        <p className="text-xs text-slate-500">Razorpay must be able to reach this address, so it only works once the server is online (not on localhost).</p>
      </CardBody>
    </Card>
  )
}

/** Admin → Settings → Payments. "View settings" reads it; "Payment gateway" changes it. */
export function PaymentSettingsPanel({ canEdit }: { canEdit: boolean }) {
  const query = usePaymentSettings()
  if (query.isLoading) return <LoadingBlock />
  if (query.error || !query.data) return <ErrorState error={query.error} retry={() => query.refetch()} />
  const s = query.data
  return (
    <div className="space-y-6">
      {!canEdit && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <Lock className="h-4 w-4 shrink-0" /> Your role can view payment settings but not change them.
        </div>
      )}
      <ProviderCard s={s} canEdit={canEdit} />
      <RazorpayKeysCard s={s} canEdit={canEdit} />
      <WebhookCard s={s} />
      {s.updatedAt && (
        <p className="text-xs text-slate-500">Last changed {formatDateTime(s.updatedAt)}{s.updatedBy ? ` by ${s.updatedBy.name}` : ''}. Changes appear in Change history.</p>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import { Button, ConfirmDialog, FormField, FormSection, FullWidth, Input, MoneyInput, Select, Switch, Textarea, useToast } from '@/admin/components/ui'
import { applyServerErrors } from '@/admin/lib/forms'
import { formatPaise, rupeesToPaise } from '@/admin/lib/utils/money'
import { useUpdateSettings } from '../api'
import { formatSettingValue, settingLabel } from '../labels'
import { SETTINGS_SECTIONS, diffSettings, settingsFormSchema, settingsToForm, type SettingsFormValues } from '../schema'
import type { SettingChange, Settings } from '../types'

const num = { valueAsNumber: true } as const
const EXAMPLE_PAISE = 100_000 // ₹1,000 booking for the worked example

/** What a ₹1,000 booking would cost with the values on screen (same maths as the backend). */
function PricingExample({ gst, included, advance }: { gst: number; included: boolean; advance: number }) {
  if (![gst, advance].every(Number.isFinite)) return null
  const total = included ? EXAMPLE_PAISE : Math.round(EXAMPLE_PAISE * (1 + gst / 100))
  const gstPaise = included ? total - Math.round((total * 100) / (100 + gst)) : total - EXAMPLE_PAISE
  const advancePaise = Math.round((total * advance) / 100)
  return (
    <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
      Example: a {formatPaise(EXAMPLE_PAISE)} booking → GST {formatPaise(gstPaise)}{included ? ' (inside the price)' : ''}, total{' '}
      <strong className="text-slate-900">{formatPaise(total)}</strong>, advance online <strong className="text-slate-900">{formatPaise(advancePaise)}</strong>,
      balance at the venue {formatPaise(total - advancePaise)}.
    </p>
  )
}

/** Business settings. Everyone with "View settings" reads them; "Edit settings" saves. */
export function SettingsForm({ settings, canEdit }: { settings: Settings; canEdit: boolean }) {
  const toast = useToast()
  const update = useUpdateSettings()
  const [pending, setPending] = useState<{ values: SettingsFormValues; changes: SettingChange[] } | null>(null)
  const [formErrors, setFormErrors] = useState<string[]>([])

  const { register, control, handleSubmit, reset, setError, watch, formState: { errors, isDirty } } =
    useForm<SettingsFormValues>({ resolver: zodResolver(settingsFormSchema), defaultValues: settingsToForm(settings) })

  useEffect(() => { reset(settingsToForm(settings)) }, [settings, reset])

  const [gst, included, advance, decoration] = watch(['pricing.gstPercent', 'pricing.pricesIncludeGst', 'pricing.advancePercent', 'pricing.decorationPrice'])
  const [loyaltyOn, loyaltyType, loyaltyValue, loyaltyMin, loyaltyLabel, loyaltyCap, loyaltyReward] = watch(['loyalty.enabled', 'loyalty.discountType', 'loyalty.discountValue', 'loyalty.minCompletedBookings', 'loyalty.label', 'loyalty.maxDiscount', 'loyalty.rewardType'])
  const [rewardsOn, pointValue, perBooking, maxRedeem] = watch(['rewards.enabled', 'rewards.pointValue', 'rewards.pointsPerBooking', 'rewards.maxRedeemPercent'])

  // review the exact changes before saving: these settings move money
  const review = handleSubmit((values) => {
    const { changes } = diffSettings(settings, values)
    if (!changes.length) { toast.info('Nothing changed'); return }
    setPending({ values, changes })
  })

  const save = async () => {
    if (!pending) return
    setFormErrors([])
    try {
      const { patch } = diffSettings(settings, pending.values)
      const { changes } = await update.mutateAsync(patch)
      toast.success(`${changes.length} setting(s) saved`)
      setPending(null)
    } catch (err) {
      setPending(null)
      setFormErrors(applyServerErrors(err, setError, SETTINGS_SECTIONS, (f) => f.replace(/decorationPricePaise$/, 'decorationPrice').replace(/maxDiscountPaise$/, 'maxDiscount').replace(/pointValuePaise$/, 'pointValue')))
    }
  }

  const e = errors

  return (
    <form onSubmit={review} noValidate className="space-y-6">
      {!canEdit && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <Lock className="h-4 w-4 shrink-0" /> Your role can view these settings but not change them.
        </div>
      )}
      {formErrors.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formErrors.map((m) => <p key={m}>{m}</p>)}
        </div>
      )}

      <fieldset disabled={!canEdit} className="space-y-6">
        <FormSection title="Pricing" description="Applies to new quotes and bookings. Existing bookings keep the prices they were made with.">
          <FormField label="GST %" required error={e.pricing?.gstPercent?.message}>
            {(f) => <Input {...f} type="number" step="0.01" min={0} max={100} trailing="%" {...register('pricing.gstPercent', num)} />}
          </FormField>
          <FormField label="Advance paid online" required hint="Share of the total paid to confirm a booking" error={e.pricing?.advancePercent?.message}>
            {(f) => <Input {...f} type="number" min={1} max={100} trailing="%" {...register('pricing.advancePercent', num)} />}
          </FormField>
          <FormField label="Decoration price" required hint={Number.isFinite(decoration) ? `Charged as ${formatPaise(rupeesToPaise(decoration))}` : undefined} error={e.pricing?.decorationPrice?.message}>
            {(f) => <MoneyInput {...f} {...register('pricing.decorationPrice', num)} />}
          </FormField>
          <div />
          <FullWidth>
            <Controller control={control} name="pricing.pricesIncludeGst" render={({ field }) => (
              <Switch id="pricesIncludeGst" checked={field.value} onChange={field.onChange} disabled={!canEdit} label="Listed prices already include GST" description="Off: GST is added on top of the price." />
            )} />
          </FullWidth>
          <FullWidth>
            <Controller control={control} name="pricing.allowFullPayment" render={({ field }) => (
              <Switch id="allowFullPayment" checked={field.value} onChange={field.onChange} disabled={!canEdit} label="Customers may pay the full amount online" description="Off: only the advance can be paid online." />
            )} />
          </FullWidth>
          <FullWidth><PricingExample gst={gst} included={included} advance={advance} /></FullWidth>
        </FormSection>

        <FormSection title="Booking rules">
          <FormField label="Slot hold" required hint="How long a slot stays reserved while the customer pays" error={e.booking?.slotHoldMinutes?.message}>
            {(f) => <Input {...f} type="number" min={1} max={60} trailing="min" {...register('booking.slotHoldMinutes', num)} />}
          </FormField>
          <FormField label="Minimum notice" required hint="Bookings close this long before a slot" error={e.booking?.minLeadHours?.message}>
            {(f) => <Input {...f} type="number" min={0} max={168} trailing="h" {...register('booking.minLeadHours', num)} />}
          </FormField>
          <FormField label="Booking window" required hint="How far ahead the calendar opens" error={e.booking?.maxAdvanceDays?.message}>
            {(f) => <Input {...f} type="number" min={1} max={365} trailing="days" {...register('booking.maxAdvanceDays', num)} />}
          </FormField>
          <FormField label="Refund cut-off" required hint="Cancelling at least this long before the slot is refundable" error={e.booking?.refundCutoffHours?.message}>
            {(f) => <Input {...f} type="number" min={0} max={720} trailing="h" {...register('booking.refundCutoffHours', num)} />}
          </FormField>
        </FormSection>

        <FormSection title="Contact" description="Shown to customers on the website and in messages.">
          <FormField label="WhatsApp number" required hint="Digits only, with country code" error={e.contact?.whatsappNumber?.message}>
            {(f) => <Input {...f} inputMode="numeric" placeholder="919876543210" {...register('contact.whatsappNumber')} />}
          </FormField>
          <FormField label="Phone" required error={e.contact?.phone?.message}>
            {(f) => <Input {...f} {...register('contact.phone')} />}
          </FormField>
          <FullWidth>
            <FormField label="Email" required error={e.contact?.email?.message}>
              {(f) => <Input {...f} type="email" {...register('contact.email')} />}
            </FormField>
          </FullWidth>
          <FullWidth>
            <FormField label="Address" required error={e.contact?.address?.message}>
              {(f) => <Textarea {...f} rows={2} {...register('contact.address')} />}
            </FormField>
          </FullWidth>
        </FormSection>

        <FormSection title="Regular customers" description="Rewards for customers who have celebrated with you before, counted by completed bookings on their mobile number. Staff bookings use the number typed in; on the website it applies once the customer signs in with OTP.">
          <FullWidth>
            <Controller control={control} name="loyalty.enabled" render={({ field }) => (
              <Switch id="loyaltyEnabled" checked={field.value} onChange={field.onChange} disabled={!canEdit} label="Reward regular customers" description="Automatically, without a coupon code." />
            )} />
          </FullWidth>
          <FormField label="Regular after" required hint="Completed bookings with the same mobile number" error={e.loyalty?.minCompletedBookings?.message}>
            {(f) => <Input {...f} type="number" min={1} max={100} trailing="bookings" {...register('loyalty.minCompletedBookings', num)} />}
          </FormField>
          <FormField label="They get" required hint="Bonus points need BOB Points switched on (below)">
            {(f) => <Select {...f} options={[{ value: 'discount', label: 'A discount on the bill' }, { value: 'points', label: 'Bonus BOB Points' }, { value: 'both', label: 'Discount + bonus points' }]} {...register('loyalty.rewardType')} />}
          </FormField>
          {loyaltyReward !== 'discount' && (
            <FormField label="Bonus points" required hint="Extra points each time a regular's booking is completed" error={e.loyalty?.bonusPoints?.message}>
              {(f) => <Input {...f} type="number" min={0} trailing="pts" {...register('loyalty.bonusPoints', num)} />}
            </FormField>
          )}
          {loyaltyReward !== 'points' && (<>
          <FormField label="Name on the bill" required error={e.loyalty?.label?.message}>
            {(f) => <Input {...f} maxLength={40} placeholder="Regular customer" {...register('loyalty.label')} />}
          </FormField>
          <FormField label="Discount type" required>
            {(f) => <Select {...f} options={[{ value: 'percent', label: 'Percent of the price' }, { value: 'flat', label: 'Flat amount' }]} {...register('loyalty.discountType')} />}
          </FormField>
          {loyaltyType === 'flat' ? (
            <FormField label="Discount" required error={e.loyalty?.discountValue?.message}>
              {(f) => <MoneyInput {...f} {...register('loyalty.discountValue', num)} />}
            </FormField>
          ) : (
            <FormField label="Discount" required hint="1 to 50" error={e.loyalty?.discountValue?.message}>
              {(f) => <Input {...f} type="number" min={1} max={50} trailing="%" {...register('loyalty.discountValue', num)} />}
            </FormField>
          )}
          {loyaltyType === 'percent' && (
            <FormField label="Maximum discount" hint="Optional cap per booking" error={e.loyalty?.maxDiscount?.message}>
              {(f) => <MoneyInput {...f} {...register('loyalty.maxDiscount', { setValueAs: (v) => (v === '' || v === null || Number.isNaN(Number(v)) ? undefined : Number(v)) })} />}
            </FormField>
          )}
          <FullWidth>
            <Controller control={control} name="loyalty.stackWithCoupons" render={({ field }) => (
              <Switch id="loyaltyStack" checked={field.value} onChange={field.onChange} disabled={!canEdit} label="Combine with coupon codes" description="Off: a regular customer using a coupon gets the coupon instead of the discount (bonus points are still given)." />
            )} />
          </FullWidth>
          </>)}
          {loyaltyOn && loyaltyReward !== 'points' && Number.isFinite(loyaltyValue) && (
            <FullWidth>
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                After {Number.isFinite(loyaltyMin) ? loyaltyMin : '–'} completed booking(s), customers see “{(loyaltyLabel || 'Regular customer').trim()} discount ({loyaltyType === 'flat' ? formatPaise(rupeesToPaise(loyaltyValue)) : `${loyaltyValue}%`})”
                {loyaltyType === 'percent' ? <> — {formatPaise(Math.min(Math.round((EXAMPLE_PAISE * loyaltyValue) / 100), loyaltyCap ? rupeesToPaise(loyaltyCap) ?? Infinity : Infinity))} off a {formatPaise(EXAMPLE_PAISE)} booking.</> : '.'}
              </p>
            </FullWidth>
          )}
        </FormSection>

        <FormSection title="BOB Points" description="One balance per customer (by mobile number). Earned when a booking is completed and through referrals; spent at checkout as a discount before GST. Website customers see and use them after signing in with OTP.">
          <FullWidth>
            <Controller control={control} name="rewards.enabled" render={({ field }) => (
              <Switch id="rewardsEnabled" checked={field.value} onChange={field.onChange} disabled={!canEdit} label="BOB Points are on" description="Off: no points are earned or spent, and the website hides points." />
            )} />
          </FullWidth>
          <FormField label="Value of 1 point" required hint="What a point takes off the bill" error={e.rewards?.pointValue?.message}>
            {(f) => <MoneyInput {...f} step="0.01" {...register('rewards.pointValue', num)} />}
          </FormField>
          <FormField label="Points per completed booking" required error={e.rewards?.pointsPerBooking?.message}>
            {(f) => <Input {...f} type="number" min={0} trailing="pts" {...register('rewards.pointsPerBooking', num)} />}
          </FormField>
          <FormField label="Referrer gets" required hint="When a friend they referred completes their first booking" error={e.rewards?.referrerPoints?.message}>
            {(f) => <Input {...f} type="number" min={0} trailing="pts" {...register('rewards.referrerPoints', num)} />}
          </FormField>
          <FormField label="Referred friend gets" required hint="On their first completed booking" error={e.rewards?.friendPoints?.message}>
            {(f) => <Input {...f} type="number" min={0} trailing="pts" {...register('rewards.friendPoints', num)} />}
          </FormField>
          <FormField label="Points can pay up to" required hint="Share of a booking, before GST (1 to 90)" error={e.rewards?.maxRedeemPercent?.message}>
            {(f) => <Input {...f} type="number" min={1} max={90} trailing="%" {...register('rewards.maxRedeemPercent', num)} />}
          </FormField>
          <FormField label="Fewest points per use" required hint="0 = any amount" error={e.rewards?.minRedeemPoints?.message}>
            {(f) => <Input {...f} type="number" min={0} trailing="pts" {...register('rewards.minRedeemPoints', num)} />}
          </FormField>
          <FormField label="Referral rewards per person" required hint="Per calendar month; more referrals are not rewarded" error={e.rewards?.monthlyReferralCap?.message}>
            {(f) => <Input {...f} type="number" min={1} max={1000} trailing="/ month" {...register('rewards.monthlyReferralCap', num)} />}
          </FormField>
          {rewardsOn && Number.isFinite(pointValue) && Number.isFinite(perBooking) && (
            <FullWidth>
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                A completed booking earns {perBooking} pts, worth {formatPaise(Math.round(perBooking * (rupeesToPaise(pointValue) ?? 0)))} off a later booking.
                {Number.isFinite(maxRedeem) && <> On a {formatPaise(EXAMPLE_PAISE)} booking, points can take off up to {formatPaise(Math.round((EXAMPLE_PAISE * maxRedeem) / 100))}.</>}
              </p>
            </FullWidth>
          )}
        </FormSection>

        <FormSection title="Reviews" description="The overall rating on the website's Reviews page, e.g. “4.9 · 847 reviews on Google”. Copy it from your Google Business profile.">
          <FormField label="Google rating" required hint="0 to 5, one decimal" error={e.reviews?.googleRating?.message}>
            {(f) => <Input {...f} type="number" min={0} max={5} step="0.1" trailing="★" {...register('reviews.googleRating', num)} />}
          </FormField>
          <FormField label="Number of Google reviews" required error={e.reviews?.googleReviewCount?.message}>
            {(f) => <Input {...f} type="number" min={0} {...register('reviews.googleReviewCount', num)} />}
          </FormField>
        </FormSection>
      </fieldset>

      {canEdit && (
        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <Button variant="secondary" disabled={!isDirty} onClick={() => reset(settingsToForm(settings))}>Discard changes</Button>
          <Button type="submit" disabled={!isDirty}>Review & save</Button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(o) => !o && setPending(null)}
        title="Save these changes?"
        description="New quotes and bookings use them straight away."
        confirmLabel="Save settings"
        loading={update.isPending}
        onConfirm={save}
      >
        <ul className="divide-y divide-slate-100 text-sm">
          {pending?.changes.map((c) => (
            <li key={c.path} className="flex items-center justify-between gap-3 py-2">
              <span className="text-slate-600">{settingLabel(c.path)}</span>
              <span className="text-right">
                <span className="text-slate-400 line-through">{formatSettingValue(c.path, c.from)}</span>{' '}
                <span className="font-medium text-slate-900">{formatSettingValue(c.path, c.to)}</span>
              </span>
            </li>
          ))}
        </ul>
      </ConfirmDialog>
    </form>
  )
}

import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, FormField, FormSection, FullWidth, Input, MoneyInput, Select, Switch, TagInput, Textarea } from '@/admin/components/ui'
import { FACILITY_SUGGESTIONS, LOCATIONS, OCCASIONS, occasionLabel } from '@/admin/constants/catalog'
import { useOfferOptions } from '@/admin/features/offers/api'
import { applyServerErrors } from '@/admin/lib/forms'
import { slugify } from '@/admin/lib/utils/slugify'
import { THEATRE_FIELD_MAP, THEATRE_FORM_FIELDS, theatreFormSchema, type TheatreFormValues } from '../schema'

interface TheatreFormProps {
  defaultValues: TheatreFormValues
  submitLabel: string
  /** throw to show errors; resolve to mark the form saved */
  onSubmit: (values: TheatreFormValues) => Promise<void>
  onCancel?: () => void
}

/** Create / edit form for a theatre. */
export function TheatreForm({ defaultValues, submitLabel, onSubmit, onCancel }: TheatreFormProps) {
  const [formErrors, setFormErrors] = useState<string[]>([])
  const offers = useOfferOptions()

  const { register, control, handleSubmit, setError, reset, watch, formState: { errors, isSubmitting, isDirty } } =
    useForm<TheatreFormValues>({ resolver: zodResolver(theatreFormSchema), defaultValues })

  // keep the form in sync when the saved theatre changes (e.g. after saving)
  useEffect(() => { reset(defaultValues) }, [defaultValues, reset])

  const submit = handleSubmit(async (values) => {
    setFormErrors([])
    try {
      await onSubmit(values)
    } catch (err) {
      setFormErrors(applyServerErrors(err, setError, THEATRE_FORM_FIELDS, THEATRE_FIELD_MAP))
    }
  })

  const name = watch('name')
  const num = { valueAsNumber: true } as const

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {formErrors.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formErrors.map((m) => <p key={m}>{m}</p>)}
        </div>
      )}

      <FormSection title="Basics" description="How the theatre appears on the website.">
        <FormField label="Name" required error={errors.name?.message}>
          {(f) => <Input {...f} placeholder="e.g. Delight" {...register('name')} />}
        </FormField>
        <FormField label="URL slug" hint={`Website address: /theatres/${watch('slug') || slugify(name || '') || '…'}`} error={errors.slug?.message}>
          {(f) => <Input {...f} placeholder={slugify(name || '') || 'made from the name'} {...register('slug')} />}
        </FormField>
        <FullWidth>
          <FormField label="Tagline" error={errors.tagline?.message}>
            {(f) => <Input {...f} placeholder="e.g. Intimate magic for two" {...register('tagline')} />}
          </FormField>
        </FullWidth>
        <FullWidth>
          <FormField label="Description" error={errors.description?.message}>
            {(f) => <Textarea {...f} rows={4} {...register('description')} />}
          </FormField>
        </FullWidth>
      </FormSection>

      <FormSection title="Capacity" description="Included guests are covered by the base price; each extra guest pays the extra guest price.">
        {/* the three capacity fields are checked against each other, so changing one re-checks the others */}
        <FormField label="Minimum guests" required error={errors.capacityMin?.message}>
          {(f) => <Input {...f} type="number" min={1} {...register('capacityMin', { ...num, deps: ['capacityMax', 'includedGuests'] })} />}
        </FormField>
        <FormField label="Maximum guests" required error={errors.capacityMax?.message}>
          {(f) => <Input {...f} type="number" min={1} {...register('capacityMax', { ...num, deps: ['capacityMin', 'includedGuests'] })} />}
        </FormField>
        <FormField label="Guests included in price" required error={errors.includedGuests?.message}>
          {(f) => <Input {...f} type="number" min={1} {...register('includedGuests', { ...num, deps: ['capacityMin', 'capacityMax'] })} />}
        </FormField>
      </FormSection>

      <FormSection title="Pricing" description="Per slot. Saturday and Sunday use the weekend price. A slot can override these.">
        <FormField label="Weekday price" required error={errors.weekdayPrice?.message}>
          {(f) => <MoneyInput {...f} placeholder="1199" {...register('weekdayPrice', num)} />}
        </FormField>
        <FormField label="Weekend price" required error={errors.weekendPrice?.message}>
          {(f) => <MoneyInput {...f} placeholder="1499" {...register('weekendPrice', num)} />}
        </FormField>
        <FormField label="Extra guest price" required hint="Per guest above the included guests" error={errors.extraGuestPrice?.message}>
          {(f) => <MoneyInput {...f} {...register('extraGuestPrice', num)} />}
        </FormField>
        <FormField label="Duration note" hint='Shown next to the price, e.g. "3 hr package"' error={errors.durationNote?.message}>
          {(f) => <Input {...f} {...register('durationNote')} />}
        </FormField>
        <FormField label="Highlighted offer" error={errors.currentOffer?.message}>
          {(f) => (
            <Select
              {...f}
              placeholder="None"
              disabled={offers.isLoading}
              options={(offers.data ?? []).map((o) => ({ value: o.code, label: `${o.code} — ${o.title}${o.status !== 'active' ? ` (${o.status})` : ''}` }))}
              {...register('currentOffer')}
            />
          )}
        </FormField>
      </FormSection>

      <FormSection title="Screen & sound">
        <FormField label="Screen size" error={errors.screenSize?.message}>
          {(f) => <Input {...f} placeholder="e.g. 133 inches" {...register('screenSize')} />}
        </FormField>
        <FormField label="Resolution" error={errors.resolution?.message}>
          {(f) => <Input {...f} placeholder="e.g. 4K" {...register('resolution')} />}
        </FormField>
        <FormField label="Sound system" error={errors.soundSystem?.message}>
          {(f) => <Input {...f} placeholder="e.g. 1000W Dolby Atmos" {...register('soundSystem')} />}
        </FormField>
        <FormField label="Seating" error={errors.seatingType?.message}>
          {(f) => <Input {...f} placeholder="e.g. Theatre Recliners + Sofa" {...register('seatingType')} />}
        </FormField>
        <FullWidth>
          <FormField label="Video URL" hint="Optional walkthrough video" error={errors.videoUrl?.message}>
            {(f) => <Input {...f} type="url" placeholder="https://" {...register('videoUrl')} />}
          </FormField>
        </FullWidth>
      </FormSection>

      <FormSection title="Features" description="Facilities and the occasions this theatre suits.">
        <FullWidth>
          <FormField label="Facilities" error={errors.facilities?.message}>
            {(f) => (
              <Controller control={control} name="facilities" render={({ field }) => (
                <TagInput {...f} value={field.value} onChange={field.onChange} suggestions={FACILITY_SUGGESTIONS} placeholder="Type a facility and press Enter" />
              )} />
            )}
          </FormField>
        </FullWidth>
        <FullWidth>
          <FormField label="Suitable for" error={errors.suitableFor?.message}>
            {(f) => (
              <Controller control={control} name="suitableFor" render={({ field }) => (
                <TagInput
                  {...f}
                  value={field.value}
                  onChange={field.onChange}
                  suggestions={OCCASIONS.map((o) => o.label)}
                  normalize={slugify}
                  formatTag={occasionLabel}
                  placeholder="Type an occasion and press Enter"
                />
              )} />
            )}
          </FormField>
        </FullWidth>
      </FormSection>

      <FormSection title="Display" description="Where and whether it is listed.">
        <FormField label="Branch" error={errors.locationId?.message}>
          {(f) => <Select {...f} options={LOCATIONS.map((l) => ({ value: l.id, label: l.name }))} {...register('locationId')} />}
        </FormField>
        <FormField label="Display order" hint="Lower numbers are listed first" error={errors.sortOrder?.message}>
          {(f) => <Input {...f} type="number" min={0} {...register('sortOrder', num)} />}
        </FormField>
        <FullWidth>
          <Controller control={control} name="isActive" render={({ field }) => (
            <Switch id="isActive" checked={field.value} onChange={field.onChange} label="Active" description="Inactive theatres are hidden from the website and cannot be booked." />
          )} />
        </FullWidth>
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {onCancel && <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
        <Button type="submit" loading={isSubmitting} disabled={!isDirty && !isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  )
}

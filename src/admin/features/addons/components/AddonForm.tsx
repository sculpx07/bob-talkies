import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import {
  Button, ChipGroup, FormField, FormSection, FullWidth, IconButton, Input, MoneyInput, SegmentedControl, Select, Switch, Textarea,
} from '@/admin/components/ui'
import { useTheatreOptions } from '@/admin/features/theatres/api'
import { applyServerErrors } from '@/admin/lib/forms'
import { useAddonCategories } from '../api'
import { ADDON_FORM_FIELDS, addonFieldMap, addonFormSchema, emptyVariant, type AddonFormValues } from '../schema'

const num = { valueAsNumber: true } as const

/** Editable list of sizes (e.g. Half kg / 1 kg), each with its own price and stock. */
function SizesEditor({ control, register, errors }: {
  control: Control<AddonFormValues>
  register: UseFormRegister<AddonFormValues>
  errors: FieldErrors<AddonFormValues>
}) {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'variants' })

  return (
    <div className="space-y-3">
      {fields.length > 0 && (
        <div className="hidden grid-cols-[1fr_7rem_7rem_6rem_6rem] gap-2 px-1 text-xs font-medium text-slate-500 sm:grid">
          <span>Size</span><span>Price</span><span>Was</span><span>In stock</span><span />
        </div>
      )}
      {fields.map((field, i) => {
        const e = errors.variants?.[i]
        return (
          <div key={field.id} className="grid gap-2 rounded-lg border border-slate-200 p-2 sm:grid-cols-[1fr_7rem_7rem_6rem_6rem] sm:items-start sm:border-0 sm:p-0">
            <FormField error={e?.label?.message}>
              {(f) => <Input {...f} aria-label={`Size ${i + 1} name`} placeholder="e.g. Half kg" {...register(`variants.${i}.label`)} />}
            </FormField>
            <FormField error={e?.price?.message}>
              {(f) => <MoneyInput {...f} aria-label={`Size ${i + 1} price`} {...register(`variants.${i}.price`, num)} />}
            </FormField>
            <FormField error={e?.originalPrice?.message}>
              {(f) => <MoneyInput {...f} aria-label={`Size ${i + 1} struck-through price`} placeholder="optional" {...register(`variants.${i}.originalPrice`, num)} />}
            </FormField>
            <div className="flex h-9 items-center">
              <Controller control={control} name={`variants.${i}.isOutOfStock`} render={({ field: f }) => (
                <Switch checked={!f.value} onChange={(inStock) => f.onChange(!inStock)} />
              )} />
            </div>
            <div className="flex h-9 items-center justify-end gap-0.5">
              <IconButton size="sm" label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}><ArrowUp className="h-4 w-4" /></IconButton>
              <IconButton size="sm" label="Move down" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)}><ArrowDown className="h-4 w-4" /></IconButton>
              <IconButton size="sm" label={`Remove size ${i + 1}`} onClick={() => remove(i)}><Trash2 className="h-4 w-4" /></IconButton>
            </div>
          </div>
        )
      })}
      {errors.variants?.message && <p role="alert" className="text-xs text-red-600">{errors.variants.message}</p>}
      {errors.variants?.root?.message && <p role="alert" className="text-xs text-red-600">{errors.variants.root.message}</p>}
      <Button variant="secondary" size="sm" leftIcon={<Plus className="h-4 w-4" />} disabled={fields.length >= 10} onClick={() => append(emptyVariant())}>
        Add size
      </Button>
    </div>
  )
}

/** Create / edit form for an add-on or cake. */
export function AddonForm({ defaultValues, submitLabel, onSubmit, onCancel }: {
  defaultValues: AddonFormValues
  submitLabel: string
  onSubmit: (values: AddonFormValues) => Promise<void>
  onCancel?: () => void
}) {
  const [formErrors, setFormErrors] = useState<string[]>([])
  const categories = useAddonCategories()
  const theatres = useTheatreOptions()

  const { register, control, handleSubmit, reset, setError, watch, setValue, formState: { errors, isSubmitting, isDirty } } =
    useForm<AddonFormValues>({ resolver: zodResolver(addonFormSchema), defaultValues })

  useEffect(() => { reset(defaultValues) }, [defaultValues, reset])

  const [mode, allTheatres] = watch(['mode', 'allTheatres'])

  const submit = handleSubmit(async (values) => {
    setFormErrors([])
    try {
      await onSubmit(values)
    } catch (err) {
      setFormErrors(applyServerErrors(err, setError, ADDON_FORM_FIELDS, addonFieldMap))
    }
  })

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {formErrors.length > 0 && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formErrors.map((m) => <p key={m}>{m}</p>)}
        </div>
      )}

      <FormSection title="Basics" description="What customers see when picking extras.">
        <FormField label="Name" required error={errors.name?.message}>
          {(f) => <Input {...f} placeholder="e.g. Chocolate Truffle Cake" {...register('name')} />}
        </FormField>
        <FormField label="Category" required error={errors.category?.message}>
          {(f) => (
            <Select
              {...f}
              placeholder="Pick a category"
              disabled={categories.isLoading}
              options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.isActive ? c.name : `${c.name} (inactive)` }))}
              {...register('category')}
            />
          )}
        </FormField>
        <FullWidth>
          <FormField label="Description" error={errors.description?.message}>
            {(f) => <Textarea {...f} rows={3} {...register('description')} />}
          </FormField>
        </FullWidth>
      </FormSection>

      <FormSection title="Pricing" description="One price, or sizes with their own prices (e.g. a cake in Half kg and 1 kg). A struck-through price shows it is on offer.">
        <FullWidth>
          <Controller control={control} name="mode" render={({ field }) => (
            <SegmentedControl
              label="Pricing type"
              value={field.value}
              onChange={(m) => {
                field.onChange(m)
                if (m === 'sizes' && !watch('variants').length) setValue('variants', [emptyVariant()])
              }}
              options={[{ value: 'single', label: 'One price' }, { value: 'sizes', label: 'Sizes' }]}
            />
          )} />
        </FullWidth>
        {mode === 'single' ? (
          <>
            <FormField label="Price" required error={errors.price?.message}>
              {(f) => <MoneyInput {...f} placeholder="499" {...register('price', num)} />}
            </FormField>
            <FormField label="Struck-through price" hint="Optional; must be higher" error={errors.originalPrice?.message}>
              {(f) => <MoneyInput {...f} placeholder="599" {...register('originalPrice', num)} />}
            </FormField>
          </>
        ) : (
          <FullWidth>
            <SizesEditor control={control} register={register} errors={errors} />
          </FullWidth>
        )}
      </FormSection>

      <FormSection title="Availability" description="Where and when it can be added to a booking.">
        <FullWidth>
          <Controller control={control} name="allTheatres" render={({ field }) => (
            <Switch id="allTheatres" checked={field.value} onChange={field.onChange} label="Offered at every theatre" description="Turn off to pick specific theatres." />
          )} />
        </FullWidth>
        {!allTheatres && (
          <FullWidth>
            <FormField label="Theatres" required error={errors.theatres?.message}>
              {() => (
                <Controller control={control} name="theatres" render={({ field }) => (
                  <ChipGroup
                    label="Theatres"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(errors.theatres)}
                    options={(theatres.data ?? []).map((t) => ({ value: t.id, label: t.name }))}
                  />
                )} />
              )}
            </FormField>
          </FullWidth>
        )}
        <FormField label="Notice needed (hours)" hint="0 = can be added any time before the slot" error={errors.leadTimeHours?.message}>
          {(f) => <Input {...f} type="number" min={0} max={336} {...register('leadTimeHours', num)} />}
        </FormField>
        <FormField label="Display order" hint="Lower numbers are listed first" error={errors.sortOrder?.message}>
          {(f) => <Input {...f} type="number" min={0} {...register('sortOrder', num)} />}
        </FormField>
        <FullWidth>
          <Controller control={control} name="isAvailable" render={({ field }) => (
            <Switch id="isAvailable" checked={field.value} onChange={field.onChange} label="Listed on the website" description="Off hides it from customers." />
          )} />
        </FullWidth>
        <FullWidth>
          <Controller control={control} name="isOutOfStock" render={({ field }) => (
            <Switch id="isOutOfStock" checked={field.value} onChange={field.onChange} label="Out of stock" description="Still listed, but cannot be picked. For one size only, use its switch above." />
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

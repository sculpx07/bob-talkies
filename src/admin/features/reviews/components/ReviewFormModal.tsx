import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, FormField, Input, Modal, Select, StarPicker, Switch, Textarea, useToast } from '@/admin/components/ui'
import { OCCASIONS } from '@/admin/constants/catalog'
import { TheatreSelect } from '@/admin/features/theatres/components/TheatreSelect'
import { applyServerErrors } from '@/admin/lib/forms'
import { todayISO } from '@/admin/lib/utils/date'
import { useCreateReview, useUpdateReview } from '../api'
import { SOURCE_OPTIONS } from '../constants'
import { REVIEW_FORM_FIELDS, formToReview, reviewFormSchema, reviewToForm, type ReviewFormValues } from '../schema'
import type { Review } from '../types'

const num = { valueAsNumber: true } as const

/** Add or edit a testimonial. */
export function ReviewFormModal({ open, onOpenChange, review }: {
  open: boolean
  onOpenChange: (o: boolean) => void
  /** given = edit */
  review?: Review
}) {
  const toast = useToast()
  const create = useCreateReview()
  const update = useUpdateReview()
  const [formError, setFormError] = useState('')

  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: reviewToForm(review),
  })
  useEffect(() => { if (open) { reset(reviewToForm(review)); setFormError('') } }, [open, review, reset])

  const submit = handleSubmit(async (v) => {
    setFormError('')
    try {
      const input = formToReview(v)
      if (review) await update.mutateAsync({ id: review.id, ...input })
      else await create.mutateAsync(input)
      toast.success(review ? 'Review updated' : 'Review added')
      onOpenChange(false)
    } catch (err) {
      setFormError(applyServerErrors(err, setError, REVIEW_FORM_FIELDS).join(' '))
    }
  })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={review ? 'Edit review' : 'Add review'}
      description="Published reviews appear on the website's Reviews page."
      footer={<><Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={submit} loading={isSubmitting}>{review ? 'Save' : 'Add review'}</Button></>}
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Customer name" required hint="As shown, e.g. Priya R." error={errors.name?.message}>{(f) => <Input {...f} maxLength={60} {...register('name')} />}</FormField>
          <FormField label="Rating" required error={errors.rating?.message}>
            {(f) => (
              <Controller control={control} name="rating" render={({ field }) => (
                <div className="pt-1"><StarPicker value={field.value} onChange={field.onChange} invalid={f.invalid} /></div>
              )} />
            )}
          </FormField>
        </div>
        <FormField label="Review" required error={errors.text?.message}>{(f) => <Textarea {...f} rows={4} maxLength={1500} {...register('text')} />}</FormField>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Occasion" hint="Shown on the card" error={errors.occasion?.message}>
            {(f) => <Select {...f} placeholder="Not shown" options={OCCASIONS.map((o) => ({ value: o.label, label: o.label }))} {...register('occasion')} />}
          </FormField>
          <FormField label="Theatre" error={errors.theatre?.message}>
            {(f) => (
              <Controller control={control} name="theatre" render={({ field }) => (
                <TheatreSelect id={f.id} invalid={f.invalid} value={field.value} onChange={field.onChange} allLabel="Not shown" />
              )} />
            )}
          </FormField>
          <FormField label="Date" required error={errors.date?.message}>{(f) => <Input {...f} type="date" max={todayISO()} {...register('date')} />}</FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Source" error={errors.source?.message}>{(f) => <Select {...f} options={SOURCE_OPTIONS} {...register('source')} />}</FormField>
          <FormField label="Display order" hint="Lower shows first" error={errors.sortOrder?.message}>{(f) => <Input {...f} type="number" min={0} {...register('sortOrder', num)} />}</FormField>
          <div className="flex items-end pb-2">
            <Controller control={control} name="isPublished" render={({ field }) => (
              <Switch checked={field.value} onChange={field.onChange} label="Published" />
            )} />
          </div>
        </div>
      </form>
    </Modal>
  )
}

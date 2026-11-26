import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MoreHorizontal, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import {
  Badge, Button, Card, CardHeader, ConfirmDialog, DataTable, EmptyState, FormField, IconButton, Input, Menu, Modal, Select, StatusBadge, useToast, type Column,
} from '@/admin/components/ui'
import { useDisclosure, useDisclosureWith } from '@/admin/hooks/useDisclosure'
import { errorMessage } from '@/admin/lib/api/errors'
import { applyServerErrors } from '@/admin/lib/forms'
import { formatDate, todayISO } from '@/admin/lib/utils/date'
import { useDeleteSpecialDate, useSaveSpecialDate, useSpecialDates } from '../api'
import type { SpecialDate, TheatreRef } from '../types'
import { SPECIAL_DATE_BADGE } from '../utils'
import { Can } from '@/admin/auth/guards'
import { PERMISSIONS } from '@/admin/types/permissions'

const TYPE_OPTIONS = [
  { value: 'high_demand', label: 'High demand' },
  { value: 'offer_date', label: 'Offer date' },
]

const schema = z.object({
  scope: z.enum(['all', 'theatre']),
  date: z.string().min(1, 'Pick a date'),
  type: z.enum(['high_demand', 'offer_date']),
  note: z.string().trim().max(200),
})
type FormValues = z.infer<typeof schema>

/** Create (any field) or edit (type and note only) a calendar marker. */
function SpecialDateModal({ open, onOpenChange, theatre, entry }: { open: boolean; onOpenChange: (o: boolean) => void; theatre: TheatreRef; entry?: SpecialDate }) {
  const toast = useToast()
  const save = useSaveSpecialDate()
  const [formError, setFormError] = useState('')
  const defaults = (): FormValues => ({
    scope: entry && !entry.theatre ? 'all' : 'theatre',
    date: entry?.date ?? todayISO(),
    type: entry?.type ?? 'high_demand',
    note: entry?.note ?? '',
  })
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults() })

  useEffect(() => { if (open) { reset(defaults()); setFormError('') } }, [open, entry]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = handleSubmit(async (v) => {
    setFormError('')
    try {
      await save.mutateAsync(entry
        ? { id: entry.id, type: v.type, note: v.note }
        : { theatre: v.scope === 'all' ? null : theatre.id, date: v.date, type: v.type, note: v.note })
      toast.success(entry ? 'Special date updated' : 'Special date added')
      onOpenChange(false)
    } catch (err) {
      setFormError(applyServerErrors(err, setError, ['date', 'type', 'note'] as const).join(' '))
    }
  })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={entry ? 'Edit special date' : 'Mark a special date'}
      description="Shown on the customer calendar."
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={submit} loading={isSubmitting}>{entry ? 'Save' : 'Add'}</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Applies to">
            {(f) => <Select {...f} disabled={Boolean(entry)} options={[{ value: 'theatre', label: theatre.name }, { value: 'all', label: 'All theatres' }]} {...register('scope')} />}
          </FormField>
          <FormField label="Date" required error={errors.date?.message}>
            {(f) => <Input {...f} type="date" disabled={Boolean(entry)} {...register('date')} />}
          </FormField>
        </div>
        <FormField label="Type" required error={errors.type?.message}>
          {(f) => <Select {...f} options={TYPE_OPTIONS} {...register('type')} />}
        </FormField>
        <FormField label="Note" hint="Optional, e.g. Diwali weekend" error={errors.note?.message}>
          {(f) => <Input {...f} {...register('note')} />}
        </FormField>
      </form>
    </Modal>
  )
}

/** High-demand and offer dates for a theatre (and all theatres). */
export function SpecialDatesTab({ theatre }: { theatre: TheatreRef }) {
  const toast = useToast()
  const [range, setRange] = useState<'upcoming' | 'all'>('upcoming')
  const list = useSpecialDates({ theatre: theatre.id, from: range === 'upcoming' ? todayISO() : undefined })
  const remove = useDeleteSpecialDate()
  const add = useDisclosure()
  const edit = useDisclosureWith<SpecialDate>()
  const confirmDelete = useDisclosureWith<SpecialDate>()

  const doDelete = () => {
    if (!confirmDelete.item) return
    remove.mutate(confirmDelete.item.id, {
      onSuccess: () => { toast.success('Special date removed'); confirmDelete.close() },
      onError: (err) => toast.error('Could not remove it', errorMessage(err)),
    })
  }

  const columns: Column<SpecialDate>[] = [
    { key: 'date', header: 'Date', cell: (s) => <span className="font-medium text-slate-900">{formatDate(s.date)}</span> },
    { key: 'scope', header: 'Applies to', cell: (s) => (s.theatre ? s.theatre.name : <Badge tone="warning">All theatres</Badge>) },
    { key: 'type', header: 'Type', cell: (s) => <StatusBadge status={s.type} map={SPECIAL_DATE_BADGE} /> },
    { key: 'note', header: 'Note', hideOnMobile: true, cell: (s) => s.note || <span className="text-slate-400">—</span> },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-12',
      cell: (s) => (
        <Menu
          trigger={<IconButton label="Actions"><MoreHorizontal className="h-4 w-4" /></IconButton>}
          items={[
            { label: 'Edit', icon: <Pencil />, onSelect: () => edit.open(s) },
            { label: 'Remove', icon: <Trash2 />, danger: true, onSelect: () => confirmDelete.open(s) },
          ]}
        />
      ),
    },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Special dates"
        description="Highlighted on the customer calendar. A theatre's own marker wins over an all-theatres one."
        actions={
          <>
            <div className="w-36">
              <Select aria-label="Which dates" value={range} onChange={(e) => setRange(e.target.value as 'upcoming' | 'all')} options={[{ value: 'upcoming', label: 'Upcoming' }, { value: 'all', label: 'All, incl. past' }]} />
            </div>
            <Can permission={PERMISSIONS.SLOTS_EDIT}><Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={add.open}>Mark date</Button></Can>
          </>
        }
      />
      <DataTable
        columns={columns}
        rows={list.data?.specialDates}
        rowKey={(s) => s.id}
        loading={list.isLoading}
        error={list.error}
        onRetry={() => list.refetch()}
        empty={<EmptyState icon={<Sparkles className="h-5 w-5" />} title="No special dates" description="Mark busy days or offer days to highlight them for customers." />}
      />

      <SpecialDateModal open={add.isOpen} onOpenChange={add.setOpen} theatre={theatre} />
      <SpecialDateModal open={edit.isOpen} onOpenChange={(o) => !o && edit.close()} theatre={theatre} entry={edit.item ?? undefined} />
      <ConfirmDialog
        open={confirmDelete.isOpen}
        onOpenChange={(o) => !o && confirmDelete.close()}
        title="Remove this special date?"
        confirmLabel="Remove"
        tone="danger"
        loading={remove.isPending}
        onConfirm={doDelete}
      />
    </Card>
  )
}

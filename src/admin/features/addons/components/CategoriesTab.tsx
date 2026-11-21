import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FolderTree, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/admin/auth/AuthProvider'
import {
  Button, Card, CardHeader, ConfirmDialog, DataTable, EmptyState, FormField, IconButton, Input, Menu, Modal, Switch, Textarea, useToast,
  type Column, type MenuItem,
} from '@/admin/components/ui'
import { useDisclosure, useDisclosureWith } from '@/admin/hooks/useDisclosure'
import { errorMessage } from '@/admin/lib/api/errors'
import { applyServerErrors } from '@/admin/lib/forms'
import { slugify } from '@/admin/lib/utils/slugify'
import { ROLES } from '@/admin/types/auth'
import { useAddonCategories, useDeleteCategory, useSaveCategory } from '../api'
import type { AddonCategory } from '../types'

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  slug: z.string().trim().toLowerCase().refine((v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), 'Use a-z, 0-9 and single dashes'),
  description: z.string().trim().max(300),
  sortOrder: z.number({ error: 'Enter a number' }).int().min(0).max(10000),
  isActive: z.boolean(),
})
type FormValues = z.infer<typeof schema>

function CategoryModal({ open, onOpenChange, category }: { open: boolean; onOpenChange: (o: boolean) => void; category?: AddonCategory }) {
  const toast = useToast()
  const save = useSaveCategory()
  const [formError, setFormError] = useState('')
  const defaults = (): FormValues => ({
    name: category?.name ?? '', slug: category?.slug ?? '', description: category?.description ?? '',
    sortOrder: category?.sortOrder ?? 0, isActive: category?.isActive ?? true,
  })
  const { register, control, handleSubmit, reset, setError, watch, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults() })

  useEffect(() => { if (open) { reset(defaults()); setFormError('') } }, [open, category]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = handleSubmit(async ({ slug, ...v }) => {
    setFormError('')
    try {
      await save.mutateAsync({ id: category?.id, ...v, ...(slug && { slug }) })
      toast.success(category ? 'Category saved' : 'Category added')
      onOpenChange(false)
    } catch (err) {
      setFormError(applyServerErrors(err, setError, Object.keys(schema.shape)).join(' '))
    }
  })

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={category ? 'Edit category' : 'Add category'}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={submit} loading={isSubmitting}>{category ? 'Save' : 'Add category'}</Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        <FormField label="Name" required error={errors.name?.message}>
          {(f) => <Input {...f} placeholder="e.g. Balloons" {...register('name')} />}
        </FormField>
        <FormField label="Key" hint="Used by the website; changing it can hide the category there until the site is updated." error={errors.slug?.message}>
          {(f) => <Input {...f} placeholder={slugify(watch('name') || '') || 'made from the name'} {...register('slug')} />}
        </FormField>
        <FormField label="Description" error={errors.description?.message}>
          {(f) => <Textarea {...f} rows={2} {...register('description')} />}
        </FormField>
        <FormField label="Display order" error={errors.sortOrder?.message}>
          {(f) => <Input {...f} type="number" min={0} {...register('sortOrder', { valueAsNumber: true })} />}
        </FormField>
        <Controller control={control} name="isActive" render={({ field }) => (
          <Switch id="categoryActive" checked={field.value} onChange={field.onChange} label="Active" description="Inactive categories are hidden on the website." />
        )} />
      </form>
    </Modal>
  )
}

/** Add-on categories (Cakes, Effects, Decor Items, ...). */
export function CategoriesTab() {
  const toast = useToast()
  const { hasRole } = useAuth()
  const categories = useAddonCategories()
  const save = useSaveCategory()
  const remove = useDeleteCategory()
  const add = useDisclosure()
  const edit = useDisclosureWith<AddonCategory>()
  const confirmDelete = useDisclosureWith<AddonCategory>()

  const columns: Column<AddonCategory>[] = [
    {
      key: 'name',
      header: 'Category',
      cell: (c) => (
        <div>
          <p className="font-medium text-slate-900">{c.name}</p>
          <p className="text-xs text-slate-500">{c.slug}</p>
        </div>
      ),
    },
    { key: 'count', header: 'Add-ons', align: 'right', cell: (c) => c.addonCount },
    { key: 'order', header: 'Order', align: 'right', hideOnMobile: true, cell: (c) => c.sortOrder },
    {
      key: 'active',
      header: 'Active',
      cell: (c) => (
        <Switch
          checked={c.isActive}
          disabled={save.isPending && save.variables?.id === c.id}
          onChange={(isActive) => save.mutate({ id: c.id, isActive }, {
            onSuccess: (s) => toast.success(`${s.name} ${s.isActive ? 'shown' : 'hidden'}`),
            onError: (err) => toast.error('Could not change it', errorMessage(err)),
          })}
        />
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      className: 'w-12',
      cell: (c) => {
        const items: MenuItem[] = [{ label: 'Edit', icon: <Pencil />, onSelect: () => edit.open(c) }]
        if (hasRole(ROLES.SUPER_ADMIN)) {
          items.push({ label: c.addonCount ? `Delete (has ${c.addonCount} add-ons)` : 'Delete', icon: <Trash2 />, danger: true, disabled: c.addonCount > 0, onSelect: () => confirmDelete.open(c) })
        }
        return <Menu trigger={<IconButton label={`Actions for ${c.name}`}><MoreHorizontal className="h-4 w-4" /></IconButton>} items={items} />
      },
    },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Categories"
        description="Group add-ons on the website. Only empty categories can be deleted; deactivate the rest."
        actions={<Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={add.open}>Add category</Button>}
      />
      <DataTable
        columns={columns}
        rows={categories.data}
        rowKey={(c) => c.id}
        loading={categories.isLoading}
        error={categories.error}
        onRetry={() => categories.refetch()}
        onRowClick={(c) => edit.open(c)}
        empty={<EmptyState icon={<FolderTree className="h-5 w-5" />} title="No categories yet" action={<Button onClick={add.open}>Add category</Button>} />}
      />
      <CategoryModal open={add.isOpen} onOpenChange={add.setOpen} />
      <CategoryModal open={edit.isOpen} onOpenChange={(o) => !o && edit.close()} category={edit.item ?? undefined} />
      <ConfirmDialog
        open={confirmDelete.isOpen}
        onOpenChange={(o) => !o && confirmDelete.close()}
        title={`Delete ${confirmDelete.item?.name}?`}
        confirmLabel="Delete"
        tone="danger"
        loading={remove.isPending}
        onConfirm={() => confirmDelete.item && remove.mutate(confirmDelete.item.id, {
          onSuccess: () => { toast.success('Category deleted'); confirmDelete.close() },
          onError: (err) => { confirmDelete.close(); toast.error('Could not delete', errorMessage(err)) },
        })}
      />
    </Card>
  )
}

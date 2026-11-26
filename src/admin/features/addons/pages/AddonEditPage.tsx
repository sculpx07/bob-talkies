import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { Badge, ConfirmDialog, ErrorState, IconButton, LoadingBlock, Menu, useToast } from '@/admin/components/ui'
import { Can } from '@/admin/auth/guards'
import { PERMISSIONS } from '@/admin/types/permissions'
import { useDisclosure } from '@/admin/hooks/useDisclosure'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDateTime } from '@/admin/lib/utils/date'
import { formatPaise } from '@/admin/lib/utils/money'
import { useAddon, useDeleteAddon, useUpdateAddon } from '../api'
import { AddonForm } from '../components/AddonForm'
import { AddonImage } from '../components/AddonImage'
import { addonToForm, formToAddonInput } from '../schema'

export default function AddonEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const query = useAddon(id)
  const update = useUpdateAddon(id)
  const remove = useDeleteAddon()
  const confirmDelete = useDisclosure()

  const addon = query.data
  const defaults = useMemo(() => (addon ? addonToForm(addon) : null), [addon])

  if (query.isLoading) return <LoadingBlock />
  if (query.error || !addon || !defaults) return <ErrorState error={query.error} retry={() => query.refetch()} title="Could not load this add-on" />

  return (
    <>
      <PageHeader
        title={addon.name}
        back={{ to: '/addons', label: 'Add-ons & cakes' }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={addon.isAvailable ? 'success' : 'neutral'} dot>{addon.isAvailable ? 'Listed' : 'Hidden'}</Badge>
            {addon.isOutOfStock && <Badge tone="danger">Out of stock</Badge>}
            <span>{addon.category.name}</span>
            <span className="text-slate-300">·</span>
            <span>{addon.hasVariants ? `From ${formatPaise(addon.startingPricePaise)}` : formatPaise(addon.pricePaise)}</span>
            <span className="text-slate-300">·</span>
            <span>Updated {formatDateTime(addon.updatedAt)}</span>
          </span>
        }
        actions={
          <Can permission={PERMISSIONS.ADDONS_DELETE}>
            <Menu
              trigger={<IconButton label="More actions" variant="secondary"><MoreHorizontal className="h-4 w-4" /></IconButton>}
              items={[{ label: 'Delete add-on', icon: <Trash2 />, danger: true, onSelect: confirmDelete.open }]}
            />
          </Can>
        }
      />

      <div className="space-y-6">
        <AddonImage addon={addon} />
        <AddonForm
          defaultValues={defaults}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            await update.mutateAsync(formToAddonInput(values))
            toast.success('Changes saved')
          }}
        />
      </div>

      <ConfirmDialog
        open={confirmDelete.isOpen}
        onOpenChange={confirmDelete.setOpen}
        title={`Delete ${addon.name}?`}
        description="It disappears from the admin panel and the website. Past bookings keep it on their bill."
        confirmLabel="Delete add-on"
        tone="danger"
        loading={remove.isPending}
        onConfirm={() => remove.mutate(id, {
          onSuccess: () => { toast.success(`${addon.name} deleted`); navigate('/addons', { replace: true }) },
          onError: (err) => { confirmDelete.close(); toast.error('Could not delete', errorMessage(err)) },
        })}
      />
    </>
  )
}

import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FlaskConical, MoreHorizontal, Trash2 } from 'lucide-react'
import { PageHeader } from '@/admin/components/layout/PageHeader'
import { Button, ConfirmDialog, ErrorState, IconButton, LoadingBlock, Menu, SingleImageCard, StatusBadge, useToast } from '@/admin/components/ui'
import { Can } from '@/admin/auth/guards'
import { ROLES } from '@/admin/types/auth'
import { useDisclosure } from '@/admin/hooks/useDisclosure'
import { errorMessage } from '@/admin/lib/api/errors'
import { formatDateTime } from '@/admin/lib/utils/date'
import { useDeleteOffer, useOffer, useRemoveOfferImage, useUpdateOffer, useUploadOfferImage } from '../api'
import { OfferForm } from '../components/OfferForm'
import { OfferPreviewModal } from '../components/OfferPreviewModal'
import { formToOfferInput, offerToForm } from '../schema'
import { OFFER_STATUS_BADGE, formatDiscount, formatUsage } from '../utils'

export default function OfferEditPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const query = useOffer(id)
  const update = useUpdateOffer(id)
  const remove = useDeleteOffer()
  const upload = useUploadOfferImage(id)
  const removeImage = useRemoveOfferImage(id)
  const confirmDelete = useDisclosure()
  const preview = useDisclosure()

  const offer = query.data
  const defaults = useMemo(() => (offer ? offerToForm(offer) : null), [offer])

  if (query.isLoading) return <LoadingBlock />
  if (query.error || !offer || !defaults) return <ErrorState error={query.error} retry={() => query.refetch()} title="Could not load this offer" />

  return (
    <>
      <PageHeader
        title={offer.code}
        back={{ to: '/offers', label: 'Offers' }}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={offer.status} map={OFFER_STATUS_BADGE} />
            <span>{formatDiscount(offer)}</span>
            <span className="text-slate-300">·</span>
            <span>{formatUsage(offer)}</span>
            <span className="text-slate-300">·</span>
            <span>Updated {formatDateTime(offer.updatedAt)}</span>
          </span>
        }
        actions={
          <>
            <Button variant="secondary" leftIcon={<FlaskConical className="h-4 w-4" />} onClick={preview.open}>Try this code</Button>
            <Can roles={[ROLES.SUPER_ADMIN]}>
              <Menu
                trigger={<IconButton label="More actions" variant="secondary"><MoreHorizontal className="h-4 w-4" /></IconButton>}
                items={[{ label: 'Delete offer', icon: <Trash2 />, danger: true, onSelect: confirmDelete.open }]}
              />
            </Can>
          </>
        }
      />

      <div className="space-y-6">
        <SingleImageCard
          title="Image"
          description="Optional banner on the offers page."
          image={offer.image}
          alt={offer.title}
          aspect="16 / 9"
          uploading={upload.isPending}
          removing={removeImage.isPending}
          onUpload={(file) => upload.mutate(file, {
            onSuccess: () => toast.success('Image saved'),
            onError: (err) => toast.error('Upload failed', errorMessage(err)),
          })}
          onRemove={() => removeImage.mutate(undefined, {
            onSuccess: () => toast.success('Image removed'),
            onError: (err) => toast.error('Could not remove the image', errorMessage(err)),
          })}
          onReject={(msg) => toast.info('File skipped', msg)}
        />
        <OfferForm
          defaultValues={defaults}
          submitLabel="Save changes"
          codeLocked={offer.usedCount > 0}
          onSubmit={async (values) => {
            const input = formToOfferInput(values)
            // a used code cannot be renamed; leave it out so the rest still saves
            if (offer.usedCount > 0) delete (input as Partial<typeof input>).code
            await update.mutateAsync(input)
            toast.success('Changes saved')
          }}
        />
      </div>

      <OfferPreviewModal open={preview.isOpen} onOpenChange={preview.setOpen} initialCode={offer.code} />
      <ConfirmDialog
        open={confirmDelete.isOpen}
        onOpenChange={confirmDelete.setOpen}
        title={`Delete ${offer.code}?`}
        description="The code stops working. Bookings that used it keep their discount."
        confirmLabel="Delete offer"
        tone="danger"
        loading={remove.isPending}
        onConfirm={() => remove.mutate(id, {
          onSuccess: () => { toast.success(`${offer.code} deleted`); navigate('/offers', { replace: true }) },
          onError: (err) => { confirmDelete.close(); toast.error('Could not delete', errorMessage(err)) },
        })}
      />
    </>
  )
}

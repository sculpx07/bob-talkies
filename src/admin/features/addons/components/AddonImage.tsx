import { SingleImageCard, useToast } from '@/admin/components/ui'
import { errorMessage } from '@/admin/lib/api/errors'
import { useRemoveAddonImage, useUploadAddonImage } from '../api'
import type { Addon } from '../types'

/** The add-on's single photo. */
export function AddonImage({ addon }: { addon: Addon }) {
  const toast = useToast()
  const upload = useUploadAddonImage(addon.id)
  const remove = useRemoveAddonImage(addon.id)

  return (
    <SingleImageCard
      title="Photo"
      description="Shown on the add-on card. Square photos look best."
      image={addon.image}
      alt={addon.name}
      uploading={upload.isPending}
      removing={remove.isPending}
      onUpload={(file) => upload.mutate(file, {
        onSuccess: () => toast.success(addon.image ? 'Photo replaced' : 'Photo added'),
        onError: (err) => toast.error('Upload failed', errorMessage(err)),
      })}
      onRemove={() => remove.mutate(undefined, {
        onSuccess: () => toast.success('Photo removed'),
        onError: (err) => toast.error('Could not remove the photo', errorMessage(err)),
      })}
      onReject={(msg) => toast.info('File skipped', msg)}
    />
  )
}

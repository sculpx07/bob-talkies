import { useState } from 'react'
import { ArrowLeft, ArrowRight, Star, Trash2 } from 'lucide-react'
import { Badge, Card, CardBody, CardHeader, ConfirmDialog, IconButton, ImageDropzone, useToast } from '@/admin/components/ui'
import { IMAGE_UPLOAD } from '@/admin/constants/catalog'
import { useDisclosureWith } from '@/admin/hooks/useDisclosure'
import { errorMessage } from '@/admin/lib/api/errors'
import { cn } from '@/admin/lib/utils/cn'
import { useRemoveTheatreImage, useUpdateTheatre, useUploadTheatreImages } from '../api'
import type { Theatre } from '../types'

/** Photo manager: upload, set cover (first image), reorder and remove. */
export function TheatreImages({ theatre }: { theatre: Theatre }) {
  const toast = useToast()
  const upload = useUploadTheatreImages(theatre.id)
  const reorder = useUpdateTheatre(theatre.id)
  const remove = useRemoveTheatreImage(theatre.id)
  const confirmRemove = useDisclosureWith<string>()
  const [broken, setBroken] = useState<Set<string>>(new Set())

  const images = theatre.images
  const remaining = IMAGE_UPLOAD.maxPerTheatre - images.length
  const busy = upload.isPending || reorder.isPending || remove.isPending

  const onFiles = (files: File[]) => {
    const batch = files.slice(0, IMAGE_UPLOAD.maxPerRequest)
    upload.mutate(batch, {
      onSuccess: () => toast.success(`${batch.length} image(s) uploaded`),
      onError: (err) => toast.error('Upload failed', errorMessage(err)),
    })
  }

  const move = (from: number, to: number) => {
    const next = [...images]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    reorder.mutate({ images: next }, { onError: (err) => toast.error('Could not reorder', errorMessage(err)) })
  }

  const doRemove = () => {
    if (!confirmRemove.item) return
    remove.mutate(confirmRemove.item, {
      onSuccess: () => { toast.success('Image removed'); confirmRemove.close() },
      onError: (err) => toast.error('Could not remove the image', errorMessage(err)),
    })
  }

  return (
    <Card>
      <CardHeader
        title="Photos"
        description={`The first photo is the cover on the website. ${images.length} of ${IMAGE_UPLOAD.maxPerTheatre} used.`}
      />
      <CardBody className="space-y-4">
        {images.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((url, i) => (
              <li key={url} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                {broken.has(url) ? (
                  <div className="flex aspect-[4/3] items-center justify-center px-2 text-center text-xs text-slate-400">Image could not load</div>
                ) : (
                  <img
                    src={url}
                    alt={`${theatre.name} photo ${i + 1}`}
                    loading="lazy"
                    onError={() => setBroken((s) => new Set(s).add(url))}
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}
                {i === 0 && <Badge tone="brand" className="absolute left-2 top-2 shadow-sm">Cover</Badge>}
                <div className={cn(
                  'absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-slate-900/70 to-transparent p-1.5',
                  'opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100',
                )}>
                  <div className="flex gap-1">
                    <IconButton size="sm" variant="secondary" label="Move left" disabled={busy || i === 0} onClick={() => move(i, i - 1)}>
                      <ArrowLeft className="h-4 w-4" />
                    </IconButton>
                    <IconButton size="sm" variant="secondary" label="Move right" disabled={busy || i === images.length - 1} onClick={() => move(i, i + 1)}>
                      <ArrowRight className="h-4 w-4" />
                    </IconButton>
                    {i !== 0 && (
                      <IconButton size="sm" variant="secondary" label="Make cover" disabled={busy} onClick={() => move(i, 0)}>
                        <Star className="h-4 w-4" />
                      </IconButton>
                    )}
                  </div>
                  <IconButton size="sm" variant="danger" label="Remove photo" disabled={busy} onClick={() => confirmRemove.open(url)}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}

        <ImageDropzone
          accept={IMAGE_UPLOAD.accept}
          maxFileMb={IMAGE_UPLOAD.maxFileMb}
          remaining={Math.min(remaining, IMAGE_UPLOAD.maxPerRequest)}
          uploading={upload.isPending}
          onFiles={onFiles}
          onReject={(msg) => toast.info('Some files were skipped', msg)}
        />
      </CardBody>

      <ConfirmDialog
        open={confirmRemove.isOpen}
        onOpenChange={(open) => !open && confirmRemove.close()}
        title="Remove this photo?"
        description="It will be removed from the theatre. Uploaded files are deleted from the server."
        confirmLabel="Remove"
        tone="danger"
        loading={remove.isPending}
        onConfirm={doRemove}
      />
    </Card>
  )
}

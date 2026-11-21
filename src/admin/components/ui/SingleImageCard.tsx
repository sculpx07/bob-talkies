import { useEffect, useState } from 'react'
import { ImageOff, Trash2 } from 'lucide-react'
import { IMAGE_UPLOAD } from '@/admin/constants/catalog'
import { useDisclosure } from '@/admin/hooks/useDisclosure'
import { Button } from './Button'
import { Card, CardBody, CardHeader } from './Card'
import { ImageDropzone } from './ImageDropzone'
import { ConfirmDialog } from './Modal'

interface SingleImageCardProps {
  title: string
  description?: string
  /** current image URL ('' = none) */
  image: string
  alt: string
  uploading: boolean
  removing: boolean
  onUpload: (file: File) => void
  onRemove: () => void
  /** called when a file is rejected before upload */
  onReject?: (message: string) => void
  /** CSS aspect ratio of the preview, e.g. "1 / 1" or "16 / 9" */
  aspect?: string
}

/** One photo with upload / replace / remove (add-ons, offers, ...). */
export function SingleImageCard({ title, description, image, alt, uploading, removing, onUpload, onRemove, onReject, aspect = '1 / 1' }: SingleImageCardProps) {
  const confirm = useDisclosure()
  const [broken, setBroken] = useState(false)
  useEffect(() => { setBroken(false) }, [image])
  useEffect(() => { if (!removing && !image) confirm.close() }, [removing, image]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody className="grid gap-4 sm:grid-cols-[12rem_1fr] sm:items-start">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100" style={{ aspectRatio: aspect }}>
          {image && !broken ? (
            <img src={image} alt={alt} onError={() => setBroken(true)} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-slate-400">
              <ImageOff className="h-6 w-6" /> {image ? 'Could not load' : 'No photo'}
            </div>
          )}
        </div>
        <div className="space-y-3">
          <ImageDropzone
            accept={IMAGE_UPLOAD.accept}
            maxFileMb={IMAGE_UPLOAD.maxFileMb}
            remaining={1}
            multiple={false}
            uploading={uploading}
            onFiles={([file]) => onUpload(file)}
            onReject={onReject}
          />
          {image && <Button variant="danger-outline" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={confirm.open}>Remove photo</Button>}
        </div>
      </CardBody>
      <ConfirmDialog
        open={confirm.isOpen}
        onOpenChange={confirm.setOpen}
        title="Remove the photo?"
        confirmLabel="Remove"
        tone="danger"
        loading={removing}
        onConfirm={onRemove}
      />
    </Card>
  )
}

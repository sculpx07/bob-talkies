import { useRef, useState, type DragEvent } from 'react'
import { ImagePlus } from 'lucide-react'
import { cn } from '@/admin/lib/utils/cn'
import { Spinner } from './Spinner'

interface ImageDropzoneProps {
  onFiles: (files: File[]) => void
  /** allowed mime types */
  accept: readonly string[]
  maxFileMb: number
  /** how many more files may be added; 0 disables the zone */
  remaining: number
  multiple?: boolean
  uploading?: boolean
  /** called with a message when files are rejected before upload */
  onReject?: (message: string) => void
  className?: string
}

/** Click or drag-and-drop image picker that checks type, size and count before uploading. */
export function ImageDropzone({ onFiles, accept, maxFileMb, remaining, multiple = true, uploading, onReject, className }: ImageDropzoneProps) {
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const disabled = uploading || remaining <= 0

  const pick = (list: FileList | null) => {
    if (!list?.length) return
    const files = Array.from(list)
    const wrongType = files.filter((f) => !accept.includes(f.type))
    const tooBig = files.filter((f) => f.size > maxFileMb * 1024 * 1024)
    const ok = files.filter((f) => !wrongType.includes(f) && !tooBig.includes(f)).slice(0, remaining)

    const problems = [
      wrongType.length && `${wrongType.length} file(s) are not JPG, PNG, WebP, AVIF or GIF`,
      tooBig.length && `${tooBig.length} file(s) are over ${maxFileMb} MB`,
      files.length - wrongType.length - tooBig.length > remaining && `only ${remaining} more image(s) allowed`,
    ].filter(Boolean)
    if (problems.length) onReject?.(`Skipped: ${problems.join('; ')}`)
    if (ok.length) onFiles(ok)
    if (input.current) input.current.value = ''
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (!disabled) pick(e.dataTransfer.files)
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => input.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        'focus-ring flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors',
        dragging ? 'border-violet-500 bg-violet-50' : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50',
        disabled && 'cursor-not-allowed opacity-60 hover:border-slate-300 hover:bg-transparent',
        className,
      )}
    >
      {uploading ? <Spinner className="h-6 w-6 text-violet-600" /> : <ImagePlus className="h-6 w-6 text-slate-400" />}
      <span className="text-sm font-medium text-slate-700">
        {uploading ? 'Uploading…' : remaining <= 0 ? 'Image limit reached' : 'Click or drop images here'}
      </span>
      <span className="text-xs text-slate-500">JPG, PNG, WebP, AVIF or GIF · up to {maxFileMb} MB each</span>
      <input
        ref={input}
        type="file"
        hidden
        accept={accept.join(',')}
        multiple={multiple}
        onChange={(e) => pick(e.target.files)}
      />
    </button>
  )
}

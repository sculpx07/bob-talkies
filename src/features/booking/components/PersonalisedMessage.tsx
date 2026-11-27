import { useState, useRef, useEffect } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Pencil, Sparkles, Info, X, MessageCircle, Video, Heart, ImagePlus, Film, Trash2 } from 'lucide-react'
import { useBooking } from '../state/booking.context'
import { mediaStore } from '../mediaStore'

export const PERSONAL_MESSAGE_MAX = 250

interface Props {
  /** react-hook-form registration for the `personalMessage` field (drives validation) */
  registration: UseFormRegisterReturn
  /** live value, for the character counter */
  value: string
  error?: string
}

/** Right-hand summary preview of the message, with an Edit shortcut. Renders nothing when empty. */
export function PersonalisedMessageSummary() {
  const { state, dispatch } = useBooking()
  const message = (state.personalMessage ?? '').trim()
  if (!message) return null

  function edit() {
    // the textarea only exists on the Booking Details step: go back there first if needed
    if (!document.getElementById('personal-message')) dispatch({ type: 'GO_STEP', step: 4 })
    const started = performance.now()
    const tryFocus = () => {
      const el = document.getElementById('personal-message') as HTMLTextAreaElement | null
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus({ preventScroll: true })
        el.setSelectionRange(el.value.length, el.value.length)
      } else if (performance.now() - started < 2000) {
        setTimeout(tryFocus, 80)
      }
    }
    setTimeout(tryFocus, 120)
  }

  return (
    <div className="mx-4 mb-4 rounded-2xl bg-[#fce8f0] p-4 ring-1 ring-[#f5d5e0]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#7d4555]">Personalised Message</p>
        <button type="button" onClick={edit} aria-label="Edit personalised message" className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-[#8b1a3a] transition-colors hover:bg-white">
          <Pencil size={12} /> Edit
        </button>
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[#3d0a24] [overflow-wrap:anywhere]">{message}</p>
    </div>
  )
}

/** Info popup explaining what personalised surprises and videos are. */
function PersonaliseInfoPopup({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="personalise-info-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#7d4555] hover:bg-[#fce8f0] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fce8f0]">
            <Sparkles size={20} className="text-[#c0125a]" />
          </div>
          <h3 id="personalise-info-title" className="font-display text-lg font-bold text-[#3d0a24]">
            What's a Personalised Surprise?
          </h3>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-[#5a2035]">
          We turn your celebration into an unforgettable cinematic moment — just for you and your loved ones.
        </p>

        <ul className="mb-5 space-y-3">
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fce8f0]">
              <Video size={14} className="text-[#c0125a]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3d0a24]">Personalised Videos on Screen</p>
              <p className="text-xs leading-relaxed text-[#7d4555]">We play your custom video — birthday wishes, proposal reveals, memory reels — on the big theatre screen for a magical surprise moment.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8f5e9]">
              <MessageCircle size={14} className="text-[#2e7d32]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3d0a24]">Delivered via WhatsApp</p>
              <p className="text-xs leading-relaxed text-[#7d4555]">After booking, our team will reach out on WhatsApp to collect your photos, videos, and messages — so the whole process is easy and personal.</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fce8f0]">
              <Heart size={14} className="text-[#c0125a]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3d0a24]">Your Message, Your Way</p>
              <p className="text-xs leading-relaxed text-[#7d4555]">Use the box below to tell us the occasion, the names, and anything special — we'll craft the perfect experience around it.</p>
            </div>
          </li>
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl bg-[#c0125a] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#a01049]"
        >
          Got it, let's personalise!
        </button>
      </div>
    </div>
  )
}

const MAX_FILES = 10
const ACCEPTED = 'image/*,video/*'

/** Mandatory "Personalise Your Experience" block, shared by every booking type. */
export function PersonalisedMessage({ registration, value, error }: Props) {
  const { dispatch } = useBooking()
  const [showInfo, setShowInfo] = useState(false)

  // Media files for the personalised surprise upload
  const [mediaFiles, setMediaFiles] = useState<File[]>(() => mediaStore.get())
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Keep preview URLs in sync with files
  useEffect(() => {
    const urls = mediaFiles.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    mediaStore.set(mediaFiles)
    return () => urls.forEach(URL.revokeObjectURL)
  }, [mediaFiles])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? [])
    setMediaFiles((prev) => {
      const combined = [...prev, ...incoming]
      return combined.slice(0, MAX_FILES)
    })
    // reset input so the same file can be re-added after removal
    e.target.value = ''
  }

  function removeFile(index: number) {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      {showInfo && <PersonaliseInfoPopup onClose={() => setShowInfo(false)} />}

      <section aria-labelledby="personalise-heading" className="rounded-3xl bg-[#fce8f0] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 id="personalise-heading" className="flex items-center gap-2 font-display text-xl font-bold text-[#3d0a24]">
            Personalise Your Experience
          </h4>
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#f5d5e0] bg-white px-2.5 py-1 text-xs font-semibold text-[#c0125a] shadow-sm transition-colors hover:bg-[#fce8f0]"
            aria-label="Learn what a personalised surprise is"
          >
            <Info size={12} />
            What's this?
          </button>
        </div>

        {/* WhatsApp nudge */}
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-white/70 px-3 py-2.5 ring-1 ring-[#f5d5e0]">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f5e9]">
            <MessageCircle size={13} className="text-[#2e7d32]" />
          </div>
          <p className="text-xs leading-relaxed text-[#5a2035]">
            <span className="font-semibold text-[#3d0a24]">Your personalised videos &amp; photos go on the big screen — </span>
            upload them below and we'll send everything to our team via WhatsApp as soon as your booking is confirmed!
          </p>
        </div>

        {/* Message textarea */}
        <label htmlFor="personal-message" className="mb-1.5 block text-sm font-semibold text-[#3d0a24]">
          Personalised Message <span className="text-[#c2255c]" aria-hidden="true">*</span>
        </label>
        <textarea
          id="personal-message"
          rows={3}
          maxLength={PERSONAL_MESSAGE_MAX}
          placeholder="E.g. It's Sarah's 25th birthday — surprise her with our favourite memories together!"
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby="personal-message-help"
          {...registration}
          onChange={(e) => {
            registration.onChange(e)
            dispatch({ type: 'SET_PERSONAL_MESSAGE', text: e.target.value.slice(0, PERSONAL_MESSAGE_MAX) })
          }}
          className={`w-full resize-none rounded-2xl border bg-white px-4 py-3 text-[15px] text-[#3d0a24] outline-none placeholder:text-[#b0a0c8] focus:ring-2 ${error ? 'border-[#c2255c] focus:border-[#c2255c] focus:ring-[#c2255c]/20' : 'border-[#f5d5e0] hover:border-[#c58be6] focus:border-[#c0125a] focus:ring-[#c0125a]/25'}`}
        />
        {error && <p role="alert" className="mt-1.5 text-xs text-[#c2255c]">{error}</p>}
        <div className="mt-1 flex items-start justify-between gap-3 text-xs text-[#7d4555]">
          <p id="personal-message-help">Tell us the occasion, names, and anything special.</p>
          <span className="shrink-0 tabular-nums" aria-live="polite">{value.length}/{PERSONAL_MESSAGE_MAX}</span>
        </div>

        {/* ── Photo / Video upload ── */}
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-[#3d0a24]">
            Upload Photos &amp; Videos{' '}
            <span className="font-normal text-[#7d4555]">(optional, up to {MAX_FILES} files)</span>
          </p>

          {/* Thumbnails grid */}
          {previews.length > 0 && (
            <div className="mb-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {previews.map((src, i) => {
                const isVideo = mediaFiles[i]?.type.startsWith('video/')
                return (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-[#3d0a24]/10">
                    {isVideo ? (
                      <div className="flex h-full w-full items-center justify-center bg-[#3d0a24]/20">
                        <Film size={22} className="text-[#c0125a]" />
                        <span className="absolute bottom-1 left-1 right-1 truncate text-center text-[9px] text-white/80">{mediaFiles[i].name}</span>
                      </div>
                    ) : (
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${mediaFiles[i].name}`}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Upload button */}
          {mediaFiles.length < MAX_FILES && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                multiple
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Upload photos and videos"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#e0b8cc] bg-white/60 py-3 text-sm font-semibold text-[#c0125a] transition-colors hover:bg-white"
              >
                <ImagePlus size={16} />
                {mediaFiles.length === 0 ? 'Add photos & videos' : `Add more (${mediaFiles.length}/${MAX_FILES})`}
              </button>
            </>
          )}

          {mediaFiles.length > 0 && (
            <button
              type="button"
              onClick={() => setMediaFiles([])}
              className="mt-2 flex items-center gap-1 text-xs text-[#7d4555] underline underline-offset-2 hover:text-[#c0125a]"
            >
              <Trash2 size={11} /> Remove all
            </button>
          )}

          <p className="mt-2 text-[11px] leading-relaxed text-[#7d4555]">
            These will be sent to our team on WhatsApp after your booking is confirmed and played on the big screen as your surprise! 🎬
          </p>
        </div>
      </section>
    </>
  )
}

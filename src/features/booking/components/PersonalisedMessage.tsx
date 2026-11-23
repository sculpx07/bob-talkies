import type { UseFormRegisterReturn } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { Sparkles } from 'lucide-react'
import { useBooking } from '../state/booking.context'

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

/** Mandatory "Personalise Your Experience" block, shared by every booking type. */
export function PersonalisedMessage({ registration, value, error }: Props) {
  const { dispatch } = useBooking()

  return (
    <section aria-labelledby="personalise-heading" className="rounded-3xl bg-[#fce8f0] p-4 sm:p-5">
      <h4 id="personalise-heading" className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-[#3d0a24]">
       Personalise Your Experience
      </h4>
      <label htmlFor="personal-message" className="mb-1.5 block text-sm font-semibold text-[#3d0a24]">
        Personalised Message <span className="text-[#c2255c]" aria-hidden="true">*</span>
      </label>
      <textarea
        id="personal-message"
        rows={4}
        maxLength={PERSONAL_MESSAGE_MAX}
        placeholder="Enter your special message here..."
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby="personal-message-help"
        {...registration}
        onChange={(e) => {
          registration.onChange(e)
          // keep the booking state in sync so the message survives step changes
          dispatch({ type: 'SET_PERSONAL_MESSAGE', text: e.target.value.slice(0, PERSONAL_MESSAGE_MAX) })
        }}
        className={`w-full resize-none rounded-2xl border bg-white px-4 py-3 text-[15px] text-[#3d0a24] outline-none placeholder:text-[#b0a0c8] focus:ring-2 ${error ? 'border-[#c2255c] focus:border-[#c2255c] focus:ring-[#c2255c]/20' : 'border-[#f5d5e0] hover:border-[#c58be6] focus:border-[#c0125a] focus:ring-[#c0125a]/25'}`}
      />
      {error && <p role="alert" className="mt-1.5 text-xs text-[#c2255c]">{error}</p>}
      <div className="mt-1.5 flex items-start justify-between gap-3 text-xs text-[#7d4555]">
        <p id="personal-message-help">Add a personal touch to make your celebration even more special.</p>
        <span className="shrink-0 tabular-nums" aria-live="polite">{value.length}/{PERSONAL_MESSAGE_MAX}</span>
      </div>
    </section>
  )
}
